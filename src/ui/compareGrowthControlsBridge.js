"use strict";

/**
 * COMPARE GROWTH CONTROLS BRIDGE v4.11z2
 * Makes Growth Range and grouping controls work on localhost/static hosting.
 */

const BOUND_FLAG = "__TowerBattleIntelCompareGrowthControlsBridgeBound";

export function bindCompareGrowthControlsBridge() {
    if (window[BOUND_FLAG]) {
        return;
    }

    window[BOUND_FLAG] = true;

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeydown, true);

    window.TowerBattleIntelGrowthControls = Object.freeze({
        version: "v4.11z2",
        status
    });
}

function handleClick(event) {
    const target = event.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const rangeButton = target.closest("[data-growth-range-button]");

    if (rangeButton && !rangeButton.disabled) {
        capture(event);
        activateRange(rangeButton);
        return;
    }

    const modeButton = target.closest("[data-growth-mode-button]");

    if (modeButton && !modeButton.disabled) {
        capture(event);
        activateMode(modeButton);
    }
}

function handleKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const target = event.target;

    if (!target || typeof target.closest !== "function") {
        return;
    }

    const button = target.closest("[data-growth-range-button], [data-growth-mode-button]");

    if (!button || button.disabled) {
        return;
    }

    capture(event);

    if (button.matches("[data-growth-range-button]")) {
        activateRange(button);
    } else {
        activateMode(button);
    }
}

function activateRange(button) {
    const consoleEl = button.closest("[data-growth-range-console]");
    const key = button.dataset.growthRange || "90d";

    if (!consoleEl) {
        return;
    }

    consoleEl.dataset.activeGrowthRange = key;

    consoleEl.querySelectorAll("[data-growth-range-button]").forEach(item => {
        const active = item.dataset.growthRange === key;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
    });

    let activePanel = null;

    consoleEl.querySelectorAll("[data-growth-range-panel]").forEach(panel => {
        const active = panel.dataset.growthRangePanel === key;
        panel.classList.toggle("is-active", active);
        panel.toggleAttribute("hidden", !active);
        panel.setAttribute("aria-hidden", active ? "false" : "true");

        if (active) {
            activePanel = panel;
        }
    });

    flash(activePanel || consoleEl);
}

function activateMode(button) {
    const consoleEl = button.closest("[data-growth-range-console]");
    const mode = button.dataset.growthMode || "report";

    if (!consoleEl) {
        return;
    }

    consoleEl.dataset.activeGrowthMode = mode;

    consoleEl.querySelectorAll("[data-growth-mode-button]").forEach(item => {
        const active = item.dataset.growthMode === mode;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const activePanel = consoleEl.querySelector("[data-growth-range-panel].is-active")
        || consoleEl.querySelector("[data-growth-range-panel]:not([hidden])");

    const target = activePanel?.querySelector(`[data-growth-mode-target="${cssEscape(mode)}"]`)
        || activePanel
        || consoleEl;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    flash(target);
}

function flash(element) {
    if (!element || typeof element.classList === "undefined") {
        return;
    }

    element.classList.add("tbi-growth-focus-flash");
    window.clearTimeout(element.__tbiGrowthFocusTimer);
    element.__tbiGrowthFocusTimer = window.setTimeout(() => {
        element.classList.remove("tbi-growth-focus-flash");
    }, 900);
}

function capture(event) {
    event.preventDefault();
    event.stopPropagation();
}

function cssEscape(value = "") {
    if (window.CSS?.escape) {
        return window.CSS.escape(String(value));
    }

    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function status() {
    return {
        bound: Boolean(window[BOUND_FLAG]),
        consoles: document.querySelectorAll("[data-growth-range-console]").length,
        rangeButtons: document.querySelectorAll("[data-growth-range-button]").length,
        modeButtons: document.querySelectorAll("[data-growth-mode-button]").length,
        activeRange: document.querySelector("[data-growth-range-console]")?.dataset?.activeGrowthRange || null,
        activeMode: document.querySelector("[data-growth-range-console]")?.dataset?.activeGrowthMode || null
    };
}

export default {
    bindCompareGrowthControlsBridge
};
