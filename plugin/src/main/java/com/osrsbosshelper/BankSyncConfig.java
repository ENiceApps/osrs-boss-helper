package com.osrsbosshelper;

import net.runelite.client.config.Config;
import net.runelite.client.config.ConfigGroup;
import net.runelite.client.config.ConfigItem;

/**
 * Configuration surfaced in the RuneLite plugin panel. The plugin writes a local
 * file only — it makes no network requests — so there is no endpoint, token, or
 * third-party-server warning to configure.
 */
@ConfigGroup("osrsBossHelper")
public interface BankSyncConfig extends Config {

    // Opt-in toggle. No third-party-server warning is needed because the plugin
    // only writes a local file (nothing is sent over the network). Do NOT rename
    // this key or the @ConfigGroup without a migration — it resets users' settings.
    @ConfigItem(
        keyName = "syncOnBankChange",
        name = "Write bank file on change",
        description = "Write your bank, inventory, worn gear, skills, and GP to a local file whenever they change, for the OSRS Boss Helper web app to read. Nothing is sent over the network.",
        position = 1
    )
    default boolean syncOnBankChange() {
        return false;
    }

    @ConfigItem(
        keyName = "minSyncIntervalMs",
        name = "Min write interval (ms)",
        description = "Throttle: ignore bank-change events faster than this. Prevents repeated writes on rapid deposit-all operations.",
        position = 2
    )
    default int minSyncIntervalMs() {
        return 2000;
    }

    @ConfigItem(
        keyName = "appUrl",
        name = "App web page",
        description = "The OSRS Boss Helper web app, opened by the sidebar button.",
        position = 3
    )
    default String appUrl() {
        return "https://osrs-boss-helper-2026.vercel.app";
    }
}
