"use strict";

/**
 * TAB EVENTS v4.11z52w47
 * Owns only explicit tab/navigation buttons. Body/html runtime data-dashboard-tab stamps must never catch workspace button clicks.
 * Compatibility marker: TAB EVENTS v4.11z52w12
 */

import { getState } from "../../core/state.js";
import { activateAppTab, normaliseAppTab } from "../../app/tabs.js";
import { closestEnabled, consumeEvent, UI_EVENT_FOUNDATION_VERSION } from "./shellEventUtils.js";

let tabClicks = 0;

export function handleTabClick(event, context = {}) {
    const tab = findTabTrigger(event?.target);

    if (!tab) {
        return false;
    }

    consumeEvent(event);
    activateTab(tab.dataset.dashboardTab || "overview", context.renderApp);
    return true;
}

function findTabTrigger(target) {
    // The app stamps data-dashboard-tab on <html>/<body> as runtime state.
    // A broad closest("[data-dashboard-tab]") made every in-page button bubble up
    // to <body>, so Command/History actions were incorrectly handled by tabEvents.
    // Only real interactive triggers may activate tabs/routes.
    const trigger = closestEnabled(
        target,
        "button[data-dashboard-tab], a[data-dashboard-tab], [role='button'][data-dashboard-tab], [role='tab'][data-dashboard-tab]"
    );

    if (!trigger) return null;

    const tag = String(trigger.tagName || "").toLowerCase();
    if (tag === "body" || tag === "html") return null;

    return trigger;
}

export function activateTab(tab = "overview", renderCallback = null) {
    const nextTab = normaliseAppTab(tab);

    activateAppTab(nextTab, { source: "ui-tab-event" });
    tabClicks += 1;

    if (typeof renderCallback === "function") {
        renderCallback();
    }

    return getState();
}

export function getTabEventStatus() {
    return {
        module: "tabEvents",
        version: "v4.11z52w47",
        foundationVersion: UI_EVENT_FOUNDATION_VERSION,
        active: true,
        owns: ["explicit tab buttons with data-dashboard-tab"],
        clicks: tabClicks
    };
}
