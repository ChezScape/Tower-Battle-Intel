"use strict";

/**
 * GROWTH LINE FOCUS BRIDGE v4.11z6
 * Lets the combined Growth graphs focus one metric line at a time from:
 * - legend chips
 * - SVG lines/dots
 * - calculation rows
 */

const BOUND_FLAG = "__TowerBattleIntelGrowthLineFocusBridgeBound";
const VERSION = "v4.11z6";
const FOCUS_SELECTOR = "[data-growth-metric-focus], [data-growth-line-key], [data-growth-dot-key], [data-growth-line-clear]";

export function bindGrowthLineFocusBridge() {
    if (typeof window === "undefined" || window[BOUND_FLAG]) {
        return;
    }

    window[BOUND_FLAG] = true;

    document.addEventListener("click", handleFocusClick, true);
    document.addEventListener("keydown", handleFocusKeydown, true);

    window.TowerBattleIntelGrowthLineFocus = Object.freeze({
        version: VERSION,
        clearAll
    });
}

function handleFocusClick(event) {
    const target = event.target?.closest?.(FOCUS_SELECTOR);

    if (!target) {
        return;
    }

    const card = target.closest?.("[data-growth-family-card]");

    if (!card) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (target.matches("[data-growth-line-clear]")) {
        clearCardFocus(card);
        return;
    }

    const key = getMetricKey(target);

    if (!key) {
        return;
    }

    if (card.dataset.focusedMetric === key) {
        clearCardFocus(card);
        return;
    }

    focusMetric(card, key);
}

function handleFocusKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const target = event.target?.closest?.("[data-growth-metric-focus], [data-growth-line-clear]");

    if (!target) {
        return;
    }

    handleFocusClick(event);
}

function getMetricKey(target) {
    return target.dataset.growthMetricFocus
        || target.dataset.growthLineKey
        || target.dataset.growthDotKey
        || "";
}

function focusMetric(card, key) {
    card.dataset.focusedMetric = key;
    card.classList.add("is-line-focused");

    const label = card.querySelector(`[data-growth-metric-focus="${cssEscape(key)}"]`)?.dataset?.growthMetricLabel
        || card.querySelector(`[data-growth-line-key="${cssEscape(key)}"]`)?.dataset?.growthLineLabel
        || key;

    card.dataset.focusedLabel = label;

    card.querySelectorAll("[data-growth-metric-focus], [data-growth-line-key], [data-growth-dot-key]").forEach((node) => {
        const nodeKey = getMetricKey(node);
        const active = nodeKey === key;

        node.classList.toggle("is-focused", active);
        node.classList.toggle("is-dimmed", !active);

        if (node.matches("[data-growth-metric-focus]")) {
            node.setAttribute("aria-pressed", active ? "true" : "false");
        }
    });

    card.querySelectorAll("[data-growth-line-clear]").forEach((node) => {
        node.classList.remove("is-focused", "is-dimmed");
        node.setAttribute("aria-pressed", "false");
    });
}

function clearCardFocus(card) {
    delete card.dataset.focusedMetric;
    delete card.dataset.focusedLabel;
    card.classList.remove("is-line-focused");

    card.querySelectorAll("[data-growth-metric-focus], [data-growth-line-key], [data-growth-dot-key], [data-growth-line-clear]").forEach((node) => {
        node.classList.remove("is-focused", "is-dimmed");

        if (node.matches("[data-growth-metric-focus], [data-growth-line-clear]")) {
            node.setAttribute("aria-pressed", "false");
        }
    });
}

function clearAll() {
    document.querySelectorAll("[data-growth-family-card]").forEach(clearCardFocus);
}

function cssEscape(value) {
    if (window.CSS?.escape) {
        return window.CSS.escape(value);
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

bindGrowthLineFocusBridge();

export default {
    bindGrowthLineFocusBridge
};
