package com.osrsbosshelper;

import com.google.gson.Gson;
import com.google.inject.Provides;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;
import net.runelite.api.InventoryID;
import net.runelite.api.Item;
import net.runelite.api.ItemContainer;
import net.runelite.api.Skill;
import net.runelite.api.events.ItemContainerChanged;
import net.runelite.client.RuneLite;
import net.runelite.client.callback.ClientThread;
import net.runelite.client.config.ConfigManager;
import net.runelite.client.eventbus.Subscribe;
import net.runelite.client.plugins.Plugin;
import net.runelite.client.plugins.PluginDescriptor;
import net.runelite.client.ui.ClientToolbar;
import net.runelite.client.ui.NavigationButton;
import net.runelite.client.util.LinkBrowser;

/**
 * Writes the player's bank + worn equipment + inventory + skills + GP to a local
 * JSON file that the OSRS Boss Helper web app reads in the browser. This plugin
 * only READS game state — it never modifies the bank or any other interface — and
 * it makes NO network requests: nothing leaves this machine. The file lives at
 * {@code <RuneLite dir>/osrs-boss-helper/bank.json}.
 *
 * Architecture:
 *   - @Subscribe on ItemContainerChanged fires whenever bank/inventory/
 *     equipment updates in-game.
 *   - We throttle to one write per {@code minSyncIntervalMs} (default 2s) so a
 *     "deposit all" doesn't trigger 28 writes.
 *   - Game state is read on the client thread; the file is serialized and
 *     written on a background executor (disk IO must not run on the client
 *     thread) and is swapped in atomically (temp file + move) so the web app
 *     never reads a half-written file.
 *
 * Limitations / known gotchas:
 *   - InventoryID.BANK is only populated AFTER the player opens their bank at
 *     least once per session. Before that, bank contents are unknown and we
 *     write an empty list. Open your bank once after login.
 *   - Some accounts split GP between coin pouch + bank coin slot; we sum both.
 *   - Bank + worn equipment + inventory are merged into a single "owned items"
 *     list so the optimizer can use anything the player has access to. Non-gear
 *     inventory items (potions, food, runes) are ignored by the gear optimizer
 *     but ARE used by the boost-potion and mechanic checks. Coins are excluded
 *     here and tracked separately as GP.
 */
@Slf4j
@PluginDescriptor(
    name = "OSRS Boss Helper Sync",
    description = "Writes your bank + skills + GP to a local file for the OSRS Boss Helper web app (no network)",
    tags = {"bank", "dps", "gear", "boss", "helper"}
)
public class BankSyncPlugin extends Plugin {

    private static final int COINS_ITEM_ID = 995;
    private static final long BANK_FILE_VERSION = 1;
    private static final String OUTPUT_DIR = "osrs-boss-helper";
    private static final String OUTPUT_FILE = "bank.json";

    @Inject private Client client;
    @Inject private ClientThread clientThread;
    @Inject private BankSyncConfig config;
    @Inject private Gson gson;
    @Inject private ClientToolbar clientToolbar;

    private long lastSyncMs = 0;
    private NavigationButton navButton;
    // Disk writes happen here, off the client thread.
    private ExecutorService fileWriter;

    @Provides
    BankSyncConfig provideConfig(ConfigManager cm) {
        return cm.getConfig(BankSyncConfig.class);
    }

    @Override
    protected void startUp() {
        log.info("OSRS Boss Helper Sync enabled. Writing to {}/{}", OUTPUT_DIR, OUTPUT_FILE);
        fileWriter = Executors.newSingleThreadExecutor();

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
        log.info("OSRS Boss Helper Sync disabled.");

        if (navButton != null) {
            clientToolbar.removeNavigation(navButton);
            navButton = null;
        }
        if (fileWriter != null) {
            fileWriter.shutdownNow();
            fileWriter = null;
        }
    }

    /**
     * The main trigger. Fires when the bank, inventory, or equipment container
     * updates. Gated by the (opt-in) "Write bank file on change" toggle and
     * throttled so a deposit-all doesn't write repeatedly.
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

        // Read game state on the client thread (RuneLite's API is single-threaded).
        clientThread.invoke(this::collectAndWrite);
    }

    private void collectAndWrite() {
        if (client.getLocalPlayer() == null) return;

        Map<Integer, Integer> itemQty = new HashMap<>();
        // Owned-items pool = bank + worn equipment + inventory.
        ItemContainer bank = client.getItemContainer(InventoryID.BANK);
        addContainerItems(bank, itemQty);
        ItemContainer equipment = client.getItemContainer(InventoryID.EQUIPMENT);
        addContainerItems(equipment, itemQty);
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

        // Skills — base (unboosted) levels.
        Map<String, Integer> skills = new HashMap<>();
        skills.put("attack", client.getRealSkillLevel(Skill.ATTACK));
        skills.put("strength", client.getRealSkillLevel(Skill.STRENGTH));
        skills.put("defence", client.getRealSkillLevel(Skill.DEFENCE));
        skills.put("ranged", client.getRealSkillLevel(Skill.RANGED));
        skills.put("magic", client.getRealSkillLevel(Skill.MAGIC));
        skills.put("hitpoints", client.getRealSkillLevel(Skill.HITPOINTS));
        skills.put("prayer", client.getRealSkillLevel(Skill.PRAYER));

        List<Map<String, Integer>> itemPayload = new ArrayList<>();
        for (Map.Entry<Integer, Integer> e : itemQty.entrySet()) {
            Map<String, Integer> m = new HashMap<>();
            m.put("id", e.getKey());
            m.put("qty", e.getValue());
            itemPayload.add(m);
        }

        // LinkedHashMap so the JSON keys come out in a readable, stable order.
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("version", BANK_FILE_VERSION);
        String name = client.getLocalPlayer().getName();
        payload.put("rsn", name == null ? "" : name);
        payload.put("gp", gp);
        payload.put("skills", skills);
        payload.put("items", itemPayload);
        payload.put("updatedAt", System.currentTimeMillis());

        // Serialize + write off the client thread.
        final String json = gson.toJson(payload);
        final int itemCount = itemPayload.size();
        if (fileWriter != null && !fileWriter.isShutdown()) {
            fileWriter.execute(() -> writeBankFile(json, itemCount));
        }
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

    /** Write bank.json atomically: to a temp file, then move it into place so a
     *  reader never observes a partial file. Runs on the file-writer thread. */
    private void writeBankFile(String json, int itemCount) {
        try {
            Path dir = RuneLite.RUNELITE_DIR.toPath().resolve(OUTPUT_DIR);
            Files.createDirectories(dir);
            Path tmp = dir.resolve(OUTPUT_FILE + ".tmp");
            Path dest = dir.resolve(OUTPUT_FILE);
            Files.write(tmp, json.getBytes(StandardCharsets.UTF_8));
            try {
                Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (IOException atomicUnsupported) {
                // Some filesystems don't support ATOMIC_MOVE — fall back.
                Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            log.debug("Wrote {} items to {}", itemCount, dest);
        } catch (IOException e) {
            log.warn("Failed to write bank file: {}", e.getMessage());
        }
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
