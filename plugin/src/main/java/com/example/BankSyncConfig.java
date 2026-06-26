package com.example;

import net.runelite.client.config.Config;
import net.runelite.client.config.ConfigGroup;
import net.runelite.client.config.ConfigItem;

/**
 * Configuration surfaced in the RuneLite plugin panel.
 * Change the endpoint URL if your dev server runs on a non-standard port.
 */
@ConfigGroup("osrsBossHelper")
public interface BankSyncConfig extends Config {

    @ConfigItem(
        keyName = "endpointUrl",
        name = "Endpoint URL",
        description = "Where to POST your bank payload. For the hosted app use your Vercel URL + /api/bank; for local dev use http://localhost:3000/api/bank.",
        position = 1
    )
    default String endpointUrl() {
        return "http://localhost:3000/api/bank";
    }

    @ConfigItem(
        keyName = "accountToken",
        name = "Account token",
        description = "Plugin token from the boss-helper Settings page. Required for the hosted server — leave blank for local dev.",
        secret = true,
        position = 2
    )
    default String accountToken() {
        return "";
    }

    @ConfigItem(
        keyName = "syncOnBankChange",
        name = "Sync on bank change",
        description = "Automatically POST your bank whenever an item is added or removed.",
        position = 3
    )
    default boolean syncOnBankChange() {
        return true;
    }

    @ConfigItem(
        keyName = "minSyncIntervalMs",
        name = "Min sync interval (ms)",
        description = "Throttle: ignore bank-change events faster than this. Prevents spam on rapid deposit-all operations.",
        position = 4
    )
    default int minSyncIntervalMs() {
        return 2000;
    }

    // --- Recommended equipment (app → plugin) -------------------------------
    // The reverse channel: the web app posts the boss's recommended loadout to
    // /api/recommendation; the plugin polls it and shows that gear in the bank.

    @ConfigItem(
        keyName = "showRecommendedEquipment",
        name = "Show recommended equipment",
        description = "Poll the boss-helper app for the active boss's recommended gear and show it in your bank. Off by default.",
        position = 5
    )
    default boolean showRecommendedEquipment() {
        return false;
    }

    @ConfigItem(
        keyName = "recommendationUrl",
        name = "Recommendation URL",
        description = "Where to GET the current recommended loadout. Matches your Endpoint URL host + /api/recommendation.",
        position = 6
    )
    default String recommendationUrl() {
        return "http://localhost:3000/api/recommendation";
    }

    @ConfigItem(
        keyName = "filterBank",
        name = "Filter bank to recommended",
        description = "Hide bank items that aren't part of the recommended loadout while the bank is open.",
        position = 7
    )
    default boolean filterBank() {
        return false;
    }

    @ConfigItem(
        keyName = "appUrl",
        name = "App web page",
        description = "The boss-helper web app, opened by the sidebar button. Set to your Vercel URL for the hosted app.",
        position = 8
    )
    default String appUrl() {
        return "http://localhost:3000";
    }
}
