# Plugin panel screenshot

Renders `BankSyncPanel` offscreen with RuneLite's look and feel, so
`plugin/docs/panel.png` (shown on the Plugin Hub page) can be redone without
launching the client. Re-run it whenever the panel's text or buttons change.

From `plugin/` (Git Bash):

```bash
./gradlew -q --init-script ../scripts/plugin-panel-shot/print-classpath.gradle classes printCp | sed 's/^CP=//' > /tmp/cp.txt
CP="$(cat /tmp/cp.txt);$(pwd -W)/build/classes/java/main;$(pwd -W)/build/resources/main"
javac -d /tmp/shot -cp "$CP" ../scripts/plugin-panel-shot/com/osrsbosshelper/RenderPanel.java
java -cp "$CP;/tmp/shot" com.osrsbosshelper.RenderPanel docs/panel.png
```

Don't pass `-Djava.awt.headless=true`: the panel touches the clipboard. No
window is opened either way. Output is a 2x PNG. The sample bank shown in the
text box is hardcoded in `RenderPanel.java`.
