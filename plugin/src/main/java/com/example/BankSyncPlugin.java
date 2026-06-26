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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.Client;
import net.runelite.api.FontID;
import net.runelite.api.InventoryID;
import net.runelite.api.Item;
import net.runelite.api.ItemContainer;
import net.runelite.api.ScriptID;
import net.runelite.api.Skill;
import net.runelite.api.SpriteID;
import net.runelite.api.events.ItemContainerChanged;
import net.runelite.api.events.ScriptPostFired;
import net.runelite.api.gameval.InterfaceID;
import net.runelite.api.widgets.Widget;
import net.runelite.api.widgets.WidgetType;
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
 * Posts the player's bank + worn equipment + skills + GP to the local
 * boss-helper web app whenever the bank or inventory changes.
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

    // Bank slot-grouped layout constants (ported from the OSRS Wiki / t8or
    // recommended-equipment bank tab — these match the live bank grid geometry).
    private static final int ITEMS_PER_ROW = 8;
    private static final int ITEM_VERTICAL_SPACING = 36;
    private static final int ITEM_HORIZONTAL_SPACING = 48;
    private static final int ITEM_ROW_START = 51;
    private static final int LINE_VERTICAL_SPACING = 5;
    private static final int LINE_HEIGHT = 2;
    private static final int TEXT_HEIGHT = 15;
    private static final int SECTION_HEADER_COLOR = new Color(228, 216, 162).getRGB();
    private static final int EMPTY_BANK_SLOT_ID = 6512;

    @Inject private Client client;
    @Inject private ClientThread clientThread;
    @Inject private BankSyncConfig config;
    @Inject private OkHttpClient httpClient;
    @Inject private Gson gson;
    @Inject private ClientToolbar clientToolbar;
    @Inject private RecommendationState recommendationState;

    private long lastSyncMs = 0;

    /** Owned scheduler for polling the recommendation endpoint (shut down on disable). */
    private ScheduledExecutorService recommendationPoller;
    private ScheduledFuture<?> recommendationTask;
    private NavigationButton navButton;

    /** Header/line widgets we injected into the bank, so we can clear them each rebuild. */
    private final List<Widget> addedWidgets = new ArrayList<>();

    @Provides
    BankSyncConfig provideConfig(ConfigManager cm) {
        return cm.getConfig(BankSyncConfig.class);
    }

    @Override
    protected void startUp() {
        log.info("OSRS Boss Helper Sync plugin enabled. Endpoint: {}", config.endpointUrl());

        // Sidebar link to the web app.
        navButton = NavigationButton.builder()
            .tooltip("Open OSRS Boss Helper")
            .icon(createIcon())
            .priority(10)
            .onClick(() -> LinkBrowser.browse(config.appUrl()))
            .build();
        clientToolbar.addNavigation(navButton);

        // Poll the recommendation endpoint on our own scheduler. The runnable
        // is a no-op while the feature is disabled, so we don't react to config
        // changes — it just starts forwarding once the user enables it.
        recommendationPoller = Executors.newSingleThreadScheduledExecutor();
        recommendationTask = recommendationPoller.scheduleWithFixedDelay(
            this::pollRecommendation, 0, 3, TimeUnit.SECONDS);
    }

    @Override
    protected void shutDown() {
        log.info("OSRS Boss Helper Sync plugin disabled.");

        if (recommendationTask != null) {
            recommendationTask.cancel(true);
            recommendationTask = null;
        }
        if (recommendationPoller != null) {
            recommendationPoller.shutdownNow();
            recommendationPoller = null;
        }
        if (navButton != null) {
            clientToolbar.removeNavigation(navButton);
            navButton = null;
        }
        recommendationState.clear();
        clientThread.invoke(this::clearAddedWidgets);
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

    // --- Recommended equipment (app → plugin) -------------------------------

    /**
     * Fetch the latest recommended loadout from the web app and publish its item
     * ids to {@link RecommendationState}. Runs on our scheduler; the actual HTTP
     * call is async via OkHttp's enqueue so the scheduler thread never blocks.
     */
    private void pollRecommendation() {
        if (!config.showRecommendedEquipment()) {
            recommendationState.clear();
            return;
        }
        Request req = new Request.Builder().url(config.recommendationUrl()).get().build();
        httpClient.newCall(req).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                log.debug("Recommendation poll failed: {}", e.getMessage());
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                try (Response r = response) {
                    if (!r.isSuccessful() || r.body() == null) {
                        return;
                    }
                    RecommendationResponse parsed =
                        gson.fromJson(r.body().charStream(), RecommendationResponse.class);
                    if (parsed == null || parsed.latest == null || parsed.latest.slots == null) {
                        recommendationState.clear();
                        return;
                    }
                    Set<Integer> ids = new HashSet<>();
                    for (List<Integer> slotIds : parsed.latest.slots.values()) {
                        if (slotIds == null) continue;
                        for (Integer id : slotIds) {
                            if (id != null && id > 0) ids.add(id);
                        }
                    }
                    recommendationState.update(parsed.latest.slots, ids, parsed.latest.label);
                } catch (RuntimeException e) {
                    log.debug("Recommendation parse failed: {}", e.getMessage());
                }
            }
        });
    }

    /**
     * When "Filter bank" is on, regroup the bank into per-slot sections of the
     * recommended items (best pick + alternatives), each under a header, and hide
     * everything else — the same layout the OSRS Wiki recommended-equipment bank
     * tab uses. Runs after the bank finishes building (BANKMAIN_FINISHBUILDING),
     * deferred to tick-end so our widget moves aren't overwritten by the build.
     *
     * We never permanently change the bank: the layout is recomputed from the
     * fresh widgets on every rebuild, and the moment the filter is off we just
     * clear our injected headers and leave the natural build untouched (so tag
     * tabs / search behave normally again).
     */
    @Subscribe
    public void onScriptPostFired(ScriptPostFired event) {
        if (event.getScriptId() != ScriptID.BANKMAIN_FINISHBUILDING) return;

        // Always clear last pass's injected header/line widgets so they can't stack.
        clearAddedWidgets();

        boolean active = config.showRecommendedEquipment()
            && config.filterBank()
            && recommendationState.hasRecommendation();
        if (!active) return; // leave the natural bank layout (tabs/search) alone

        Widget container = client.getWidget(InterfaceID.Bankmain.ITEMS);
        if (container == null) return;
        Widget[] children = container.getDynamicChildren();
        if (children == null) return;

        // Defer the relayout to tick-end: doing it inside the build callback gets
        // partially overwritten by the finishing build script.
        clientThread.invokeAtTickEnd(() -> layoutBySlot(container, children));
    }

    private void clearAddedWidgets() {
        if (addedWidgets.isEmpty()) return;
        for (Widget w : addedWidgets) {
            w.setHidden(true);
        }
        addedWidgets.clear();
    }

    /** Regroup the bank's item widgets into recommended per-slot sections. */
    private void layoutBySlot(Widget container, Widget[] children) {
        // Hide the bank's own tab labels/separators and every item to start from
        // a clean slate; we re-show only the items we place.
        for (Widget w : children) {
            String text = w.getText();
            if (w.getSpriteId() == SpriteID.RESIZEABLE_MODE_SIDE_PANEL_BACKGROUND
                || (text != null && text.contains("Tab"))) {
                w.setHidden(true);
            } else if (w.getItemId() > 0 && w.getItemId() != EMPTY_BANK_SLOT_ID) {
                w.setHidden(true);
            }
        }

        int height = 0;
        Set<Integer> placed = new HashSet<>();
        for (Map.Entry<String, List<Integer>> entry : recommendationState.slots().entrySet()) {
            List<Widget> slotWidgets = new ArrayList<>();
            for (Integer id : entry.getValue()) {
                if (id == null || placed.contains(id)) continue;
                Widget w = findItemWidget(children, id);
                if (w != null) {
                    slotWidgets.add(w);
                    placed.add(id);
                }
            }
            if (slotWidgets.isEmpty()) continue; // own none of this slot's options

            height = addSectionHeader(container, prettySlot(entry.getKey()), height);
            int n = 0;
            for (Widget w : slotWidgets) {
                placeItem(w, n, height);
                w.setHidden(false);
                n++;
            }
            int rows = (n + ITEMS_PER_ROW - 1) / ITEMS_PER_ROW;
            height += rows * ITEM_VERTICAL_SPACING;
        }

        // "Other items" section: everything else the player owns, in bank order,
        // so the full bank stays browsable below the recommended setup.
        height = addOtherItemsSection(container, children, placed, height);

        int containerHeight = container.getHeight();
        container.setScrollHeight(Math.max(height, containerHeight));
        int scrollY = container.getScrollY();
        clientThread.invokeLater(() ->
            client.runScript(ScriptID.UPDATE_SCROLLBAR,
                InterfaceID.Bankmain.SCROLLBAR,
                InterfaceID.Bankmain.ITEMS,
                scrollY));
    }

    /**
     * Lay every remaining owned item (anything not already placed in a slot
     * section) into an "Other items" section, preserving bank order and
     * de-duplicating by item id. Returns the running Y below the section.
     */
    private int addOtherItemsSection(Widget container, Widget[] children, Set<Integer> placed, int top) {
        List<Widget> others = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (Widget w : children) {
            int id = w.getItemId();
            if (id <= 0 || id == EMPTY_BANK_SLOT_ID) continue;
            if (w.getOpacity() == 150) continue;   // placeholder
            if (placed.contains(id)) continue;      // already shown in a slot section
            if (!seen.add(id)) continue;            // dedupe
            others.add(w);
        }
        if (others.isEmpty()) return top;

        int height = addSectionHeader(container, "Other items", top);
        int n = 0;
        for (Widget w : others) {
            placeItem(w, n, height);
            w.setHidden(false);
            n++;
        }
        int rows = (n + ITEMS_PER_ROW - 1) / ITEMS_PER_ROW;
        return height + rows * ITEM_VERTICAL_SPACING;
    }

    /** First real (non-placeholder) bank widget holding this item id. */
    private static Widget findItemWidget(Widget[] children, int itemId) {
        for (Widget w : children) {
            // Placeholders render at opacity 150 — skip them so we move the real item.
            if (w.getItemId() == itemId && w.getOpacity() != 150) return w;
        }
        return null;
    }

    /** Move an item widget to its grid cell within the current section. */
    private void placeItem(Widget widget, int indexInSection, int sectionTop) {
        int x = (indexInSection % ITEMS_PER_ROW) * ITEM_HORIZONTAL_SPACING + ITEM_ROW_START;
        int y = sectionTop + (indexInSection / ITEMS_PER_ROW) * ITEM_VERTICAL_SPACING;
        if (widget.getOriginalX() != x) {
            widget.setOriginalX(x);
        }
        if (widget.getOriginalY() != y) {
            widget.setOriginalY(y);
        }
        widget.revalidate();
    }

    /** Inject a divider line + slot title, returning the Y below the header. */
    private int addSectionHeader(Widget container, String title, int top) {
        addedWidgets.add(createGraphic(container,
            SpriteID.RESIZEABLE_MODE_SIDE_PANEL_BACKGROUND,
            ITEMS_PER_ROW * ITEM_HORIZONTAL_SPACING, LINE_HEIGHT, ITEM_ROW_START, top));
        addedWidgets.add(createText(container, title, SECTION_HEADER_COLOR,
            ITEMS_PER_ROW * ITEM_HORIZONTAL_SPACING, TEXT_HEIGHT,
            ITEM_ROW_START, top + LINE_VERTICAL_SPACING));
        return top + LINE_VERTICAL_SPACING + TEXT_HEIGHT;
    }

    private Widget createText(Widget container, String text, int color, int width, int height, int x, int y) {
        Widget widget = container.createChild(-1, WidgetType.TEXT);
        widget.setOriginalWidth(width);
        widget.setOriginalHeight(height);
        widget.setOriginalX(x);
        widget.setOriginalY(y);
        widget.setText(text);
        widget.setFontId(FontID.PLAIN_11);
        widget.setTextColor(color);
        widget.setTextShadowed(true);
        widget.revalidate();
        return widget;
    }

    private Widget createGraphic(Widget container, int spriteId, int width, int height, int x, int y) {
        Widget widget = container.createChild(-1, WidgetType.GRAPHIC);
        widget.setOriginalWidth(width);
        widget.setOriginalHeight(height);
        widget.setOriginalX(x);
        widget.setOriginalY(y);
        widget.setSpriteId(spriteId);
        widget.revalidate();
        return widget;
    }

    /** "weapon" → "Weapon". */
    private static String prettySlot(String slot) {
        if (slot == null || slot.isEmpty()) return "";
        return Character.toUpperCase(slot.charAt(0)) + slot.substring(1);
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

    /** Shape of GET /api/recommendation: { "latest": { label, bossSlug, slots } }. */
    private static final class RecommendationResponse {
        RecommendationLatest latest;
    }

    private static final class RecommendationLatest {
        String label;
        String bossSlug;
        Map<String, List<Integer>> slots;
    }
}
