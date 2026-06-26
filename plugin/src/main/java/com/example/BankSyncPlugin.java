package com.example;

import com.google.gson.Gson;
import com.google.inject.Provides;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;
import net.runelite.api.InventoryID;
import net.runelite.api.Item;
import net.runelite.api.ItemContainer;
import net.runelite.api.Skill;
import net.runelite.api.events.ItemContainerChanged;
import net.runelite.client.callback.ClientThread;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;
import net.runelite.client.ui.ClientToolbar;
import net.runelite.client.ui.NavigationButton;
import net.runelite.client.util.LinkBrowser;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Posts the player's bank + worn equipment + skills + GP to the boss-helper web
 * app whenever the bank or inventory changes. This plugin only READS game state
 * and forwards it — it never modifies the bank or any other interface.
 *
 * Architecture:
 *   - @Subscribe on ItemContainerChanged fires whenever bank/inventory/
 *     equipment updates in-game.
 *   - We throttle to one POST per `minSyncIntervalMs` (default 2s) so a
 *     "deposit all" doesn't fire 28 requests.
 *   - The payload is small JSON (~5 KB even for a full main bank).
 *
 * Limitations / known gotchas:
 *   - InventoryID.BANK is only populated AFTER the player opens their
 *     bank at least once per session. Before that, bank contents are
 *     unknown and we send an empty array. Open your bank once after
 *     login.
 *   - Some accounts split GP between coin pouch + bank coin slot;
 *     we sum both.
 *   - Bank + worn equipment + inventory are all merged into a single "owned
 *     items" list so the optimizer can use anything the player has access to.
 *     Non-gear inventory items (potions, food, runes) are harmlessly ignored
 *     by the gear optimizer but ARE used by the boost-potion and mechanic
 *     checks (e.g. a Super combat potion in your inventory now counts).
 *     Coins are excluded here and tracked separately as GP.
 */
@Slf4j
@PluginDescriptor(
    name = "OSRS Boss Helper Sync",
    description = "Sends bank + skills + GP to the boss-helper web app (local or hosted)",
    tags = {"bank", "dps", "helper"}
)
public class BankSyncPlugin extends Plugin {

    private static final MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json");
    private static final int COINS_ITEM_ID = 995;

    @Inject private Client client;
    @Inject private ClientThread clientThread;
    @Inject private BankSyncConfig config;
    @Inject private OkHttpClient httpClient;
    @Inject private Gson gson;
    @Inject private ClientToolbar clientToolbar;

    private long lastSyncMs = 0;
    private NavigationButton navButton;

    @Provides
    BankSyncConfig provideConfig(ConfigManager cm) {
        return cm.getConfig(BankSyncConfig.class);
    }

    @Override
    protected void startUp() {
        log.info("OSRS Boss Helper Sync plugin enabled. Endpoint: {}", config.endpointUrl());

        // Sidebar link to the web app. Purely a convenience button — it opens the
        // app in a browser and never touches the in-game bank or any interface.
        navButton = NavigationButton.builder()
            .tooltip("Open OSRS Boss Helper")
            .icon(createIcon())
            .priority(10)
            .onClick(() -> LinkBrowser.browse(config.appUrl()))
            .build();
        clientToolbar.addNavigation(navButton);
    }

    @Override
    protected void shutDown() {
        log.info("OSRS Boss Helper Sync plugin disabled.");

        if (navButton != null) {
            clientToolbar.removeNavigation(navButton);
            navButton = null;
        }
    }

    /**
     * The main trigger. Fires when the bank, inventory, or equipment
     * container updates. We only care about bank + equipment changes
     * for the optimizer; inventory changes are filtered out unless they
     * touch coins (which affect GP).
     */
    @Subscribe
    public void onItemContainerChanged(ItemContainerChanged event) {
        if (!config.syncOnBankChange()) return;

        int id = event.getContainerId();
        boolean relevant = id == InventoryID.BANK.getId()
            || id == InventoryID.EQUIPMENT.getId()
            || id == InventoryID.INVENTORY.getId();
        if (!relevant) return;

        long now = System.currentTimeMillis();
        if (now - lastSyncMs < config.minSyncIntervalMs()) return;
        lastSyncMs = now;

        // Read on the client thread (RuneLite's API is single-threaded).
        clientThread.invoke(this::syncBank);
    }

    private void syncBank() {
        if (client.getLocalPlayer() == null) return;

        Map<Integer, Integer> itemQty = new HashMap<>();
        // Owned-items pool = bank + worn equipment + inventory. The optimizer
        // builds loadouts from gear in this pool; the boost-potion / mechanic
        // checks look for consumables (potions, antidotes, runes) here too.
        ItemContainer bank = client.getItemContainer(InventoryID.BANK);
        addContainerItems(bank, itemQty);
        // Worn equipment — optimizer treats these as "owned" too
        ItemContainer equipment = client.getItemContainer(InventoryID.EQUIPMENT);
        addContainerItems(equipment, itemQty);
        // Inventory — potions/food/runes the player is carrying, plus any gear.
        ItemContainer inv = client.getItemContainer(InventoryID.INVENTORY);
        addContainerItems(inv, itemQty);

        // GP: sum coin stacks in inventory + bank (coins are excluded from the
        // item pool by addContainerItems, so count them directly here).
        int gp = 0;
        if (inv != null) {
            for (Item i : inv.getItems()) {
                if (i.getId() == COINS_ITEM_ID) gp += i.getQuantity();
            }
        }
        if (bank != null) {
            for (Item i : bank.getItems()) {
                if (i.getId() == COINS_ITEM_ID) gp += i.getQuantity();
            }
        }

        // Skills — base levels, not boosted
        Map<String, Integer> skills = new HashMap<>();
        skills.put("attack", client.getRealSkillLevel(Skill.ATTACK));
        skills.put("strength", client.getRealSkillLevel(Skill.STRENGTH));
        skills.put("defence", client.getRealSkillLevel(Skill.DEFENCE));
        skills.put("ranged", client.getRealSkillLevel(Skill.RANGED));
        skills.put("magic", client.getRealSkillLevel(Skill.MAGIC));
        skills.put("hitpoints", client.getRealSkillLevel(Skill.HITPOINTS));
        skills.put("prayer", client.getRealSkillLevel(Skill.PRAYER));

        // Build payload
        List<Map<String, Integer>> itemPayload = new ArrayList<>();
        for (Map.Entry<Integer, Integer> e : itemQty.entrySet()) {
            Map<String, Integer> m = new HashMap<>();
            m.put("id", e.getKey());
            m.put("qty", e.getValue());
            itemPayload.add(m);
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("items", itemPayload);
        payload.put("skills", skills);
        payload.put("gp", gp);
        String name = client.getLocalPlayer().getName();
        if (name != null) payload.put("playerName", name);

        String json = gson.toJson(payload);
        postPayload(json, itemPayload.size());
    }

    private void addContainerItems(ItemContainer container, Map<Integer, Integer> acc) {
        if (container == null) return;
        for (Item i : container.getItems()) {
            int id = i.getId();
            if (id <= 0) continue; // empty slots are -1
            if (id == COINS_ITEM_ID) continue; // GP tracked separately
            acc.merge(id, i.getQuantity(), Integer::sum);
        }
    }

    private void postPayload(String json, int itemCount) {
        Request.Builder reqBuilder = new Request.Builder()
            .url(config.endpointUrl())
            .post(RequestBody.create(JSON_MEDIA_TYPE, json));
        String token = config.accountToken();
        if (token != null && !token.isEmpty()) {
            reqBuilder.addHeader("Authorization", "Bearer " + token);
        }
        Request req = reqBuilder.build();
        httpClient.newCall(req).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                log.warn("Bank sync POST failed: {}", e.getMessage());
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                try (Response r = response) {
                    if (r.isSuccessful()) {
                        log.info("BankSyncPlugin: posted {} items", itemCount);
                    } else {
                        log.warn("BankSyncPlugin: server returned {} — {}",
                            r.code(), r.body() == null ? "" : r.body().string());
                    }
                }
            }
        });
    }

    /** Simple in-code sidebar icon so we don't ship a binary asset. */
    private static BufferedImage createIcon() {
        BufferedImage img = new BufferedImage(24, 24, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setColor(new Color(0xEC, 0x9A, 0x29));
        g.fillRoundRect(1, 1, 22, 22, 6, 6);
        g.setColor(Color.BLACK);
        g.setFont(new Font("SansSerif", Font.BOLD, 12));
        g.drawString("BH", 4, 17);
        g.dispose();
        return img;
    }
}
