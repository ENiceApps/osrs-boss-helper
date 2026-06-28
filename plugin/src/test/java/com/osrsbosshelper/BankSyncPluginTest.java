package com.osrsbosshelper;

import net.runelite.client.RuneLite;
import net.runelite.client.externalplugins.ExternalPluginManager;

/**
 * Dev launcher: starts a RuneLite client with this plugin side-loaded so you can
 * test it in-game. Run via `./gradlew run` (wired up as the build's main class).
 * Not an automated test — plugin behaviour can only be verified by a human in
 * the actual client.
 */
public class BankSyncPluginTest
{
	public static void main(String[] args) throws Exception
	{
		ExternalPluginManager.loadBuiltin(BankSyncPlugin.class);
		RuneLite.main(args);
	}
}
