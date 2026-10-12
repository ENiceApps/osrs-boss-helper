package com.osrsbosshelper;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import net.runelite.client.ui.ColorScheme;
import net.runelite.client.ui.FontManager;
import net.runelite.client.ui.PluginPanel;

/**
 * Sidebar panel. Its main job is the no-file way into the web app: "Copy my
 * bank" puts the same data bank.json holds on the clipboard, and shows it in a
 * text box too so it can be selected and copied by hand if the clipboard
 * misbehaves. Also has a button that opens the web app, which is what the
 * sidebar icon used to do on its own.
 *
 * Swing thread only. The plugin reads game state on the client thread and hands
 * the result over with {@link #show}.
 */
class BankSyncPanel extends PluginPanel {

    private final JTextArea output = new JTextArea(8, 0);
    private final JLabel status = new JLabel();

    BankSyncPanel(Runnable onCopy, Runnable onOpenSite) {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JPanel top = new JPanel();
        top.setLayout(new BoxLayout(top, BoxLayout.Y_AXIS));

        JLabel title = new JLabel("Boss Helper Bank Sync");
        title.setFont(FontManager.getRunescapeBoldFont());
        title.setForeground(ColorScheme.BRAND_ORANGE);
        top.add(leftAligned(title));
        top.add(Box.createVerticalStrut(6));

        top.add(leftAligned(new JLabel(html(
            "Open your bank in-game, hit Copy, then paste it on the Bank page "
                + "at osrsbosshelper.com. No file needed!"))));
        top.add(Box.createVerticalStrut(8));

        JButton copy = new JButton("Copy my bank");
        copy.addActionListener(e -> onCopy.run());
        top.add(fullWidth(copy));
        top.add(Box.createVerticalStrut(6));

        status.setForeground(ColorScheme.LIGHT_GRAY_COLOR);
        top.add(leftAligned(status));
        top.add(Box.createVerticalStrut(6));

        output.setEditable(false);
        output.setLineWrap(true);
        output.setFont(FontManager.getRunescapeSmallFont());
        output.setBackground(ColorScheme.DARKER_GRAY_COLOR);
        output.setForeground(ColorScheme.LIGHT_GRAY_COLOR);
        JScrollPane scroll = new JScrollPane(output);
        scroll.setPreferredSize(new Dimension(0, 140));
        top.add(fullWidth(scroll));
        top.add(Box.createVerticalStrut(10));

        JButton open = new JButton("Open OSRS Boss Helper");
        open.addActionListener(e -> onOpenSite.run());
        top.add(fullWidth(open));

        add(top, BorderLayout.NORTH);
    }

    /**
     * Show a copy result. {@code text} null means nothing was copied (logged
     * out, still loading), so the box and the clipboard are left alone.
     */
    void show(String text, String message) {
        if (text != null) {
            output.setText(text);
            output.setCaretPosition(0);
            try {
                Toolkit.getDefaultToolkit().getSystemClipboard()
                    .setContents(new StringSelection(text), null);
            } catch (IllegalStateException clipboardBusy) {
                // Another app has the clipboard open. The text is still in the
                // box, so the player can select it and copy by hand.
                message = "Couldn't reach your clipboard. Click in the box, press Ctrl+A then Ctrl+C.";
            }
        }
        status.setText(html(message));
    }

    private static String html(String text) {
        // An <html> JLabel only wraps when it's given a width; this one fits the
        // fixed sidebar width minus the panel's border.
        return "<html><div style='width:" + (PANEL_WIDTH - 40) + "px'>"
            + text.replace("&", "&amp;").replace("<", "&lt;") + "</div></html>";
    }

    private static <T extends javax.swing.JComponent> T leftAligned(T c) {
        c.setAlignmentX(LEFT_ALIGNMENT);
        return c;
    }

    private static <T extends javax.swing.JComponent> T fullWidth(T c) {
        c.setAlignmentX(LEFT_ALIGNMENT);
        c.setMaximumSize(new Dimension(Integer.MAX_VALUE, c.getPreferredSize().height));
        return c;
    }
}
