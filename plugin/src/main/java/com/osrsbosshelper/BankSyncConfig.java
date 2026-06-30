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
        name = "Save my bank & gear for the web app",
        description = "Saves your bank, inventory, worn gear, skills, and GP to a local file for the OSRS Boss Helper web app to read. Updates automatically as you play; nothing is sent over the network.",
        position = 1
    )
    default boolean syncOnBankChange() {
        return false;
    }
}
