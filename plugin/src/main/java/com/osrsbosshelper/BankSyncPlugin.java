package com.osrsbosshelper;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import net.runelite.api.ChatMessageType;
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
 *   - We throttle to one write per {@code MIN_SYNC_INTERVAL_MS} (2s) so a
 *     "deposit all" doesn't trigger 28 writes. Changes landing inside the
 *     window schedule ONE trailing write at the window's end, so the last
 *     change of a burst always reaches disk (a leading-edge-only throttle
 *     would drop it and leave bank.json stale until the next change).
 *   - Game state is read on the client thread; the file is serialized and
 *     written on a background executor (disk IO must not run on the client
 *     thread) and is swapped in atomically (temp file + move) so the web app
 *     never reads a half-written file.
 *   - On enable we also write once immediately, so the file (and the in-game
 *     confirmation) reflect the current state right away rather than only after
 *     the next bank change. That first write happens AFTER the previous file has
 *     been read back into the bank cache, so it can never clobber it.
 *   - Bank cache: the file remembers each account's last known bank in its
 *     `accounts` section. On enable we read those back in; every write either
 *     refreshes the logged-in account's snapshot (bank container available) or
 *     carries it forward verbatim (container null, e.g. logged in but not yet
 *     banked). Snapshots are per account, so an alt neither inherits nor erases
 *     the main's bank. This is what makes the bank survive closing the game.
 *
 * Limitations / known gotchas:
 *   - InventoryID.BANK is only populated AFTER the player opens their bank at
 *     least once per session. Before that the game simply has no bank data, so
 *     we carry forward the bank section of the LAST file we wrote (see the bank
 *     cache below) instead of overwriting it with an empty list. Open your bank
 *     once to refresh it.
 *   - Some accounts split GP between coin pouch + bank coin slot; we sum both.
 *   - Bank + worn equipment + inventory are merged into a single "owned items"
 *     list so the optimizer can use anything the player has access to. Non-gear
 *     inventory items (potions, food, runes) are ignored by the gear optimizer
 *     but ARE used by the boost-potion and mechanic checks. Coins are excluded
 *     here and tracked separately as GP.
 */
@Slf4j
@PluginDescriptor(
    name = "Boss Helper Bank Sync",
    description = "Writes your bank + skills + GP to a local file for the OSRS Boss Helper web app (no network)",
    tags = {"bank", "dps", "gear", "boss", "helper"}
)
public class BankSyncPlugin extends Plugin {

    private static final int COINS_ITEM_ID = 995;
    // v2 added the per-container sections (bank/equipment/inventory) + the bank
    // cache timestamps. `items` is still written as the merged pool so older
    // readers of the file keep working unchanged.
    private static final long BANK_FILE_VERSION = 2;
    private static final String OUTPUT_DIR = "osrs-boss-helper";
    private static final String OUTPUT_FILE = "bank.json";
    // The web app the sidebar button opens. Hardcoded (not a config) so the panel
    // stays simple — the app lives at one canonical URL.
    private static final String APP_URL = "https://osrsbosshelper.com";
    // Minimum gap between writes so a "deposit all" burst doesn't rewrite the file
    // many times in a row. Hardcoded — 2s is the right balance for everyone.
    private static final long MIN_SYNC_INTERVAL_MS = 2000;

    @Inject private Client client;
    @Inject private ClientThread clientThread;
    @Inject private BankSyncConfig config;
    @Inject private Gson gson;
    @Inject private ClientToolbar clientToolbar;
    // RuneLite's shared scheduled executor — used only for the trailing-edge
    // throttle write below (the task itself hops back onto the client thread).
    @Inject private ScheduledExecutorService executor;

    // Written from the client thread (leading edge) and the scheduled-executor
    // thread (trailing edge), hence volatile.
    private volatile long lastSyncMs = 0;
    private volatile ScheduledFuture<?> pendingSync;
    // First successful write of the session posts an in-game confirmation; this
    // guards it so an active banking session doesn't spam the chat box.
    private volatile boolean announcedSave = false;
    private NavigationButton navButton;
    // Disk writes happen here, off the client thread.
    private ExecutorService fileWriter;

    // --- Bank cache -----------------------------------------------------------
    // Last known bank contents PER ACCOUNT, keyed by lowercased RSN. Seeded on
    // enable from the previous bank.json and refreshed on every write where the
    // bank container is live.
    //
    // Per-account, not a single slot, because the file is rewritten for whoever
    // is logged in: a single slot would write an empty bank section the moment
    // you logged into an alt, and the main's remembered bank would be gone from
    // disk by the next RuneLite restart.
    //
    // The map and the snapshots in it are replaced wholesale, never mutated,
    // because they are read on the client thread and written on the file-writer
    // thread.
    private volatile Map<String, CachedBank> bankCaches = Collections.emptyMap();
    // Set once the previous file has been read back (or found missing). Until
    // then a write with no live bank container would clobber the cache, so we
    // hold it — see collectAndWrite.
    private volatile boolean cacheLoaded = false;
    // Guards the one-off "restored your last bank" chat line, like announcedSave.
    private volatile boolean announcedCache = false;

    /** One account's last known bank. Immutable once constructed. */
    private static final class CachedBank {
        /** The display name as the game gave it — the map key is lowercased. */
        final String rsn;
        final Map<Integer, Integer> items;
        /** Coins in the bank (GP is tracked outside the item pool). */
        final int gp;
        /** When this snapshot was read from the game, in epoch ms. */
        final long at;

        CachedBank(String rsn, Map<Integer, Integer> items, int gp, long at) {
            this.rsn = rsn;
            this.items = items;
            this.gp = gp;
            this.at = at;
        }
    }

    /** Map key for an account name, so "Zezima" and "zezima" are one account. */
    private static String accountKey(String rsn) {
        return rsn.toLowerCase(Locale.ROOT);
    }

    @Provides
    BankSyncConfig provideConfig(ConfigManager cm) {
        return cm.getConfig(BankSyncConfig.class);
    }

    @Override
    protected void startUp() {
        log.info("Boss Helper Bank Sync enabled. Writing to {}/{}", OUTPUT_DIR, OUTPUT_FILE);
        fileWriter = Executors.newSingleThreadExecutor();
        announcedSave = false;
        announcedCache = false;

        // Sidebar link to the web app. Purely a convenience button — it opens the
        // app in a browser and never touches the in-game bank or any interface.
        navButton = NavigationButton.builder()
            .tooltip("Open OSRS Boss Helper")
            .icon(createIcon())
            .priority(10)
            .onClick(() -> LinkBrowser.browse(APP_URL))
            .build();
        clientToolbar.addNavigation(navButton);

        // Read the previous file back into the bank cache BEFORE the first write,
        // then write once on enable (when opted in and logged in) so the file — and
        // the in-game confirmation — appear immediately, instead of only after the
        // next bank/inventory change. Makes re-enabling the plugin show the message.
        // Ordering matters: the write must not run before the cache is seeded, or
        // enabling the plugin away from a bank would wipe the bank section.
        fileWriter.execute(() -> {
            loadBankCache();
            clientThread.invoke(() -> {
                if (config.syncOnBankChange()) collectAndWrite();
            });
        });
    }

    @Override
    protected void shutDown() {
        log.info("Boss Helper Bank Sync disabled.");

        if (navButton != null) {
            clientToolbar.removeNavigation(navButton);
            navButton = null;
        }
        // Cancel any pending trailing write — the executor is RuneLite's shared
        // one, so cancel the task rather than touching the executor itself.
        if (pendingSync != null) {
            pendingSync.cancel(false);
            pendingSync = null;
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
        long sinceLast = now - lastSyncMs;
        if (sinceLast >= MIN_SYNC_INTERVAL_MS) {
            lastSyncMs = now;
            // Read game state on the client thread (RuneLite's API is single-threaded).
            clientThread.invoke(this::collectAndWrite);
            return;
        }

        // Inside the throttle window: schedule ONE write for the window's end so
        // the burst's final state still reaches disk. A single pending write is
        // enough — when it fires it reads whatever the game state is then.
        if (pendingSync == null || pendingSync.isDone()) {
            pendingSync = executor.schedule(() -> {
                if (!config.syncOnBankChange()) return;
                lastSyncMs = System.currentTimeMillis();
                clientThread.invoke(this::collectAndWrite);
            }, MIN_SYNC_INTERVAL_MS - sinceLast, TimeUnit.MILLISECONDS);
        }
    }

    private void collectAndWrite() {
        if (client.getLocalPlayer() == null) return;

        final String name = client.getLocalPlayer().getName();
        final String rsn = name == null ? "" : name;

        // The bank container only exists once the player has opened their bank this
        // session, so it is the one source we can't count on. When it's live we
        // refresh this account's snapshot from it; when it's null we reuse the
        // snapshot, so the file keeps the bank it already had instead of losing it
        // until the next bank visit.
        ItemContainer bank = client.getItemContainer(InventoryID.BANK);
        final Map<Integer, Integer> bankItems;
        final int bankGp;
        final long bankAt;
        final boolean bankFromCache;
        if (bank != null) {
            bankItems = readContainer(bank);
            bankGp = countCoins(bank);
            bankAt = System.currentTimeMillis();
            bankFromCache = false;
            Map<String, CachedBank> next = new HashMap<>(bankCaches);
            next.put(accountKey(rsn), new CachedBank(rsn, bankItems, bankGp, bankAt));
            bankCaches = next;
        } else {
            // A container change can land in the moment between enabling the plugin
            // and the previous file being read back. Writing now would persist an
            // empty bank over a good one, so skip this write — the next change (or
            // the deferred first write in startUp) covers it.
            if (!cacheLoaded) return;
            CachedBank known = bankCaches.get(accountKey(rsn));
            bankItems = known == null ? Collections.emptyMap() : known.items;
            bankGp = known == null ? 0 : known.gp;
            bankAt = known == null ? 0 : known.at;
            bankFromCache = !bankItems.isEmpty();
        }

        ItemContainer equipment = client.getItemContainer(InventoryID.EQUIPMENT);
        ItemContainer inv = client.getItemContainer(InventoryID.INVENTORY);
        Map<Integer, Integer> equipItems = readContainer(equipment);
        Map<Integer, Integer> invItems = readContainer(inv);

        // Owned-items pool = bank + worn equipment + inventory. The containers hold
        // disjoint items in-game, so summing quantities is correct for stackables.
        Map<Integer, Integer> merged = new HashMap<>(bankItems);
        for (Map.Entry<Integer, Integer> e : equipItems.entrySet()) {
            merged.merge(e.getKey(), e.getValue(), Integer::sum);
        }
        for (Map.Entry<Integer, Integer> e : invItems.entrySet()) {
            merged.merge(e.getKey(), e.getValue(), Integer::sum);
        }

        // GP: coins carried plus coins banked (from the cached bank when the real
        // one isn't loaded, for the same reason the cached items are used).
        final int gp = bankGp + countCoins(inv);

        // Skills — base (unboosted) levels.
        Map<String, Integer> skills = new HashMap<>();
        skills.put("attack", client.getRealSkillLevel(Skill.ATTACK));
        skills.put("strength", client.getRealSkillLevel(Skill.STRENGTH));
        skills.put("defence", client.getRealSkillLevel(Skill.DEFENCE));
        skills.put("ranged", client.getRealSkillLevel(Skill.RANGED));
        skills.put("magic", client.getRealSkillLevel(Skill.MAGIC));
        skills.put("hitpoints", client.getRealSkillLevel(Skill.HITPOINTS));
        skills.put("prayer", client.getRealSkillLevel(Skill.PRAYER));

        // LinkedHashMap so the JSON keys come out in a readable, stable order.
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("version", BANK_FILE_VERSION);
        payload.put("rsn", rsn);
        payload.put("gp", gp);
        payload.put("skills", skills);
        // The merged pool stays first-class: it is what the web app reads today, so
        // a v2 file still works with every version of the app already out there.
        payload.put("items", toItemList(merged));
        // The per-container sections are what make that merge possible next session
        // — `bank` is the cache that survives closing the game.
        payload.put("bank", toItemList(bankItems));
        payload.put("equipment", toItemList(equipItems));
        payload.put("inventory", toItemList(invItems));
        payload.put("bankGp", bankGp);
        // When the bank was last actually read from the game (0 = never seen), and
        // whether THIS file's bank section came from the cache rather than a live
        // read. Together they let the app say how stale the bank is.
        payload.put("bankUpdatedAt", bankAt);
        payload.put("bankCached", bankFromCache);
        // Every account's remembered bank, so logging into an alt doesn't wipe the
        // main's out of the file. The top-level fields above stay the current
        // account's — that's what the web app reads.
        payload.put("accounts", accountsPayload());
        payload.put("updatedAt", System.currentTimeMillis());

        // Serialize + write off the client thread.
        final String json = gson.toJson(payload);
        final int itemCount = merged.size();
        if (fileWriter != null && !fileWriter.isShutdown()) {
            fileWriter.execute(() -> writeBankFile(json, itemCount, bankFromCache));
        }
    }

    /** Item id → quantity for one container, excluding coins (tracked separately as
     *  GP) and bank placeholders (reported as quantity 0 — not actually owned).
     *  Returns an empty map for a container the game hasn't populated. */
    private Map<Integer, Integer> readContainer(ItemContainer container) {
        if (container == null) return Collections.emptyMap();
        Map<Integer, Integer> acc = new HashMap<>();
        for (Item i : container.getItems()) {
            int id = i.getId();
            if (id <= 0) continue; // empty slots are -1
            if (id == COINS_ITEM_ID) continue; // GP tracked separately
            if (i.getQuantity() <= 0) continue; // bank placeholders are qty 0 — not owned
            acc.merge(id, i.getQuantity(), Integer::sum);
        }
        return acc;
    }

    /** Total coins in a container (0 if it isn't loaded). */
    private int countCoins(ItemContainer container) {
        if (container == null) return 0;
        int gp = 0;
        for (Item i : container.getItems()) {
            if (i.getId() == COINS_ITEM_ID) gp += i.getQuantity();
        }
        return gp;
    }

    /** Item map → the [{id, qty}] shape the bank file uses. */
    private static List<Map<String, Integer>> toItemList(Map<Integer, Integer> items) {
        List<Map<String, Integer>> out = new ArrayList<>(items.size());
        for (Map.Entry<Integer, Integer> e : items.entrySet()) {
            Map<String, Integer> m = new HashMap<>();
            m.put("id", e.getKey());
            m.put("qty", e.getValue());
            out.add(m);
        }
        return out;
    }

    /**
     * Seed the bank caches from the bank.json written last time, so every account
     * that has banked before is known before the player opens a bank this session
     * (or ever again, if they never do). Runs on the file-writer thread during
     * startUp — it's disk IO, and the first write waits on it.
     *
     * Reads the `accounts` section, falling back to the top-level `bank` section
     * for a file written before accounts existed. A v1 file seeds nothing: it
     * wrote a single merged `items` list with no way to tell bank items from
     * worn/carried ones, and treating that blob as the bank would double-count
     * everything currently equipped. Upgrading from v1 therefore costs one bank
     * visit, after which the cache is populated for good.
     */
    private void loadBankCache() {
        try {
            Path dest = RuneLite.RUNELITE_DIR.toPath().resolve(OUTPUT_DIR).resolve(OUTPUT_FILE);
            if (Files.exists(dest)) {
                String json = new String(Files.readAllBytes(dest), StandardCharsets.UTF_8);
                JsonObject o = gson.fromJson(json, JsonObject.class);
                Map<String, CachedBank> restored = new HashMap<>();
                if (o != null && o.has("accounts") && o.get("accounts").isJsonObject()) {
                    for (Map.Entry<String, JsonElement> e : o.getAsJsonObject("accounts").entrySet()) {
                        CachedBank cached = readAccount(e.getKey(), e.getValue());
                        if (cached != null) restored.put(accountKey(cached.rsn), cached);
                    }
                } else if (o != null && o.has("bank")) {
                    // Pre-`accounts` v2 file: one bank, belonging to the top-level rsn.
                    String rsn = o.has("rsn") ? o.get("rsn").getAsString() : "";
                    CachedBank cached = readAccount(rsn, o);
                    if (cached != null) restored.put(accountKey(cached.rsn), cached);
                }
                if (!restored.isEmpty()) {
                    bankCaches = restored;
                    log.debug("Restored cached banks for {} account(s)", restored.size());
                }
            }
        } catch (IOException | RuntimeException e) {
            // A missing, truncated or hand-edited file must not stop syncing: start
            // with an empty cache and repopulate on the next bank open.
            log.warn("Couldn't read the previous bank file: {}", e.getMessage());
        } finally {
            // Set even on failure — otherwise every write would be held forever.
            cacheLoaded = true;
        }
    }

    /**
     * One account's snapshot out of the file. Accepts both shapes it can appear
     * in: an entry under `accounts` ({@code {rsn, bank, bankGp, bankUpdatedAt}})
     * and the top-level object of a pre-`accounts` file, which carries the same
     * four fields. Returns null when there's no usable bank in it — an account
     * with an empty remembered bank is the same as not remembering it.
     */
    private CachedBank readAccount(String fallbackRsn, JsonElement element) {
        if (element == null || !element.isJsonObject()) return null;
        JsonObject o = element.getAsJsonObject();
        if (!o.has("bank") || !o.get("bank").isJsonArray()) return null;

        Map<Integer, Integer> items = new HashMap<>();
        for (JsonElement el : o.getAsJsonArray("bank")) {
            if (el == null || !el.isJsonObject()) continue;
            JsonObject it = el.getAsJsonObject();
            if (!it.has("id") || !it.has("qty")) continue;
            int id = it.get("id").getAsInt();
            int qty = it.get("qty").getAsInt();
            if (id <= 0 || qty <= 0) continue;
            items.merge(id, qty, Integer::sum);
        }
        if (items.isEmpty()) return null;

        String rsn = o.has("rsn") ? o.get("rsn").getAsString() : fallbackRsn;
        if (rsn == null || rsn.isEmpty()) return null;
        int gp = o.has("bankGp") ? o.get("bankGp").getAsInt() : 0;
        long at = o.has("bankUpdatedAt") ? o.get("bankUpdatedAt").getAsLong() : 0;
        return new CachedBank(rsn, items, gp, at);
    }

    /** The `accounts` section: every remembered bank, keyed by account name, so
     *  playing an alt doesn't erase the main's from the file. */
    private Map<String, Object> accountsPayload() {
        Map<String, Object> out = new LinkedHashMap<>();
        for (CachedBank c : bankCaches.values()) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rsn", c.rsn);
            entry.put("bank", toItemList(c.items));
            entry.put("bankGp", c.gp);
            entry.put("bankUpdatedAt", c.at);
            out.put(c.rsn, entry);
        }
        return out;
    }

    /** Write bank.json atomically: to a temp file, then move it into place so a
     *  reader never observes a partial file. Runs on the file-writer thread. */
    private void writeBankFile(String json, int itemCount, boolean bankFromCache) {
        try {
            Path dir = RuneLite.RUNELITE_DIR.toPath().resolve(OUTPUT_DIR);
            Files.createDirectories(dir);
            Path tmp = dir.resolve(OUTPUT_FILE + ".tmp");
            Path dest = dir.resolve(OUTPUT_FILE);
            // Checked BEFORE the move: decides whether the chat confirmation is
            // the full first-time setup message or the short "updated" one.
            boolean firstCreate = !Files.exists(dest);
            Files.write(tmp, json.getBytes(StandardCharsets.UTF_8));
            try {
                Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (IOException atomicUnsupported) {
                // Some filesystems don't support ATOMIC_MOVE — fall back.
                Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            log.debug("Wrote {} items to {}", itemCount, dest);
            announceSaveOnce(dest, firstCreate, bankFromCache);
        } catch (IOException e) {
            log.warn("Failed to write bank file: {}", e.getMessage());
        }
    }

    /**
     * On the first successful write since the plugin was enabled, drop a
     * confirmation into the in-game chat box. Which message depends on whether the
     * write CREATED bank.json:
     *   - first-ever creation → the full setup walkthrough (file saved, exactly
     *     where it lives, and what to do with it) — the player has never seen the
     *     file before, so they need the path;
     *   - file already existed → a single short "updated" line, so toggling the
     *     plugin (or relogging) doesn't replay the whole walkthrough every time.
     * Shown once per enable (guarded by {@code announcedSave}, reset in startUp)
     * so an active banking run doesn't spam a line every throttled write. A third
     * line is appended when the bank section came from the cache rather than a
     * live read, so "updated" never implies a bank nobody has opened this session.
     *
     * These lines are added to the LOCAL chat buffer only — nothing is sent to the
     * server. Chat must be touched on the client thread, so we hop back onto it via
     * {@code clientThread.invoke} (this method runs on the file-writer thread).
     */
    private void announceSaveOnce(Path dest, boolean firstCreate, boolean bankFromCache) {
        if (announcedSave) return;
        announcedSave = true;

        final String path = dest.toString();
        clientThread.invoke(() -> {
            // Coloured BLUE: the gold/orange brand colour blends into the (often
            // yellow-ish) chat background, so blue reads far better.
            if (firstCreate) {
                // The full path is included so the player knows exactly where to
                // find the file they're about to connect/upload.
                client.addChatMessage(ChatMessageType.GAMEMESSAGE, "",
                    "<col=0066cc>[Boss Helper] Bank file created.</col>", null);
                client.addChatMessage(ChatMessageType.GAMEMESSAGE, "",
                    "<col=0066cc>[Boss Helper] Location: " + path + "</col>", null);
                client.addChatMessage(ChatMessageType.GAMEMESSAGE, "",
                    "<col=0066cc>[Boss Helper] Open osrsbosshelper.com, then Connect or Upload this file.</col>", null);
            } else {
                client.addChatMessage(ChatMessageType.GAMEMESSAGE, "",
                    "<col=0066cc>[Boss Helper] Bank file updated.</col>", null);
            }
            // Says plainly that the bank in the file is remembered, not freshly
            // read \u2014 otherwise "updated" would imply the app is looking at a
            // bank nobody has opened yet this session.
            if (bankFromCache && !announcedCache) {
                announcedCache = true;
                client.addChatMessage(ChatMessageType.GAMEMESSAGE, "",
                    "<col=0066cc>[Boss Helper] Using your bank from last time \u2014 open your bank to refresh it.</col>", null);
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
