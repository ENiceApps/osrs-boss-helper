package com.osrsbosshelper;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.JPanel;
import java.awt.BorderLayout;
import net.runelite.client.ui.ColorScheme;
import net.runelite.client.ui.PluginPanel;

public class RenderPanel {
    public static void main(String[] a) throws Exception {
        try { UIManager.setLookAndFeel(new net.runelite.client.ui.laf.RuneLiteLAF()); }
        catch (Throwable t) { System.err.println("LAF: " + t); }
        SwingUtilities.invokeAndWait(() -> {
            try {
                BankSyncPanel p = new BankSyncPanel(() -> {}, () -> {});
                String sample = "{\"version\":2,\"rsn\":\"ENice\",\"gp\":12345678,\"skills\":{\"attack\":99,\"strength\":99,\"defence\":99,\"ranged\":99,\"magic\":99,\"hitpoints\":99,\"prayer\":85},\"items\":[{\"id\":4151,\"qty\":1},{\"id\":11802,\"qty\":1},{\"id\":12926,\"qty\":1},{\"id\":21012,\"qty\":1},{\"id\":13652,\"qty\":1},{\"id\":10828,\"qty\":1},{\"id\":11832,\"qty\":1},{\"id\":11834,\"qty\":1},{\"id\":11836,\"qty\":1}]}";
                p.show(sample, "Copied! Paste it on the Bank page.");
                JPanel wrap = new JPanel(new BorderLayout());
                wrap.setBackground(ColorScheme.DARK_GRAY_COLOR);
                wrap.add(p, BorderLayout.CENTER);
                int w = PluginPanel.PANEL_WIDTH + 2 * 10;
                wrap.setSize(w, 1000);
                wrap.doLayout(); layoutAll(wrap);
                int h = p.getPreferredSize().height + 20;
                wrap.setSize(w, h);
                wrap.doLayout(); layoutAll(wrap);
                int scale = 2;
                BufferedImage img = new BufferedImage(w * scale, h * scale, BufferedImage.TYPE_INT_RGB);
                Graphics2D g = img.createGraphics();
                g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                g.scale(scale, scale);
                wrap.print(g);
                g.dispose();
                ImageIO.write(img, "png", new File(a[0]));
                System.out.println("wrote " + a[0] + " " + w + "x" + h);
            } catch (Exception e) { throw new RuntimeException(e); }
        });
    }
    static void layoutAll(java.awt.Container c) {
        c.doLayout();
        for (java.awt.Component k : c.getComponents()) if (k instanceof java.awt.Container) layoutAll((java.awt.Container) k);
    }
}
