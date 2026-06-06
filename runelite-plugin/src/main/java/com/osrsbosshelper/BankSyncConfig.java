package com.osrsbosshelper;

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
        description = "Where to POST your bank payload. Default targets a local Next.js dev server.",
        position = 1
    )
    default String endpointUrl() {
        return "http://localhost:3000/api/bank";
    }

    @ConfigItem(
        keyName = "syncOnBankChange",
        name = "Sync on bank change",
        description = "Automatically POST your bank whenever an item is added or removed.",
        position = 2
    )
    default boolean syncOnBankChange() {
        return true;
    }

    @ConfigItem(
        keyName = "minSyncIntervalMs",
        name = "Min sync interval (ms)",
        description = "Throttle: ignore bank-change events faster than this. Prevents spam on rapid deposit-all operations.",
        position = 3
    )
    default int minSyncIntervalMs() {
        return 2000;
    }
}
