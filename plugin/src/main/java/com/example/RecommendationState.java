package com.example;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.inject.Singleton;

/**
 * Holds the latest recommended-equipment set pulled from the boss-helper web
 * app (GET /api/recommendation). Written by the polling thread (OkHttp callback)
 * and read by the client thread (bank layout), so state is published through
 * volatile references to immutable snapshots — readers always see a consistent
 * view.
 */
@Singleton
public class RecommendationState {

    /** Ordered slot name → recommended item ids (best pick first, then alternatives). */
    private volatile Map<String, List<Integer>> slots = Collections.emptyMap();
    /** Flattened id set across all slots, for quick membership checks. */
    private volatile Set<Integer> ids = Collections.emptySet();
    /** Display label of the active recommendation, e.g. "Vorkath — Budget Magic". */
    private volatile String label = "";

    void update(Map<String, List<Integer>> newSlots, Set<Integer> newIds, String newLabel) {
        slots = newSlots == null ? Collections.emptyMap() : new LinkedHashMap<>(newSlots);
        ids = newIds == null ? Collections.emptySet() : newIds;
        label = newLabel == null ? "" : newLabel;
    }

    void clear() {
        slots = Collections.emptyMap();
        ids = Collections.emptySet();
        label = "";
    }

    /** Ordered slot → ids map (insertion order = bank section order). */
    Map<String, List<Integer>> slots() {
        return slots;
    }

    boolean isRecommended(int itemId) {
        return ids.contains(itemId);
    }

    boolean hasRecommendation() {
        return !ids.isEmpty();
    }

    String label() {
        return label;
    }
}
