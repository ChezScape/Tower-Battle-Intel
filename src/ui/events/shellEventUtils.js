"use strict";

/**
 * UI SHELL EVENT UTILS v4.11z52w14
 * Shared helpers for the modular shell event layer.
 */

export const UI_EVENT_FOUNDATION_VERSION = "v4.11z52w14";

export function consumeEvent(event) {
    if (!event) {
        return;
    }

    event.preventDefault?.();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
}

export function closestEnabled(target, selector = "") {
    const element = target?.closest?.(selector) || null;
    return element && !element.disabled ? element : null;
}

export function normaliseActionText(element, fallback = "Parked action") {
    const explicit = element?.dataset?.uiShellAction
        || element?.dataset?.uiAction
        || element?.dataset?.dashboardAction
        || element?.dataset?.mobileCommand
        || element?.id
        || fallback;
    const text = element?.textContent?.trim?.().replace(/\s+/g, " ");
    return text || explicit;
}
