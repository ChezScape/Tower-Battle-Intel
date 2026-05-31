"use strict";

/**
 * APP RENDER FOUNDATION v4.11z52w12
 * Owns render/mount order only. Event binding is owned by src/app/init.js.
 */

import { getState } from "../core/state.js";
import { applyDeviceMode, getAppliedDeviceMode } from "../ui/deviceMode.js";
import { renderDashboard } from "../ui/dashboard.js";
import { getActiveAppTab, stampAppTabRuntime } from "./tabs.js";

export const APP_RENDER_FOUNDATION_VERSION = "v4.11z52w12";

let renderDepth = 0;
let renderCount = 0;
let lastRender = null;

export function renderApp(incomingState = null, options = {}) {
    const state = incomingState || getState();

    renderDepth += 1;

    try {
        applyDeviceMode();
        const activeTab = getActiveAppTab(state);
        stampAppTabRuntime(activeTab);
        const root = renderDashboard(state, {
            activeTab,
            owner: "src/app/render.js",
            reason: options.reason || "render"
        });

        renderCount += 1;
        lastRender = {
            count: renderCount,
            activeTab,
            deviceMode: getAppliedDeviceMode(),
            reason: options.reason || "render",
            renderedAt: new Date().toISOString(),
            rootFound: Boolean(root)
        };

        stampRenderRuntime(lastRender);
        return state;
    } finally {
        renderDepth = Math.max(0, renderDepth - 1);
    }
}

export function isRendering() {
    return renderDepth > 0;
}

export function getRenderStatus() {
    return {
        version: APP_RENDER_FOUNDATION_VERSION,
        owner: "src/app/render.js",
        renderDepth,
        renderCount,
        lastRender,
        eventBindingOwner: "src/app/init.js"
    };
}

function stampRenderRuntime(snapshot = lastRender) {
    if (typeof document === "undefined" || !snapshot) {
        return;
    }

    document.documentElement.dataset.appRenderOwner = "src/app/render.js";
    document.documentElement.dataset.appRenderVersion = APP_RENDER_FOUNDATION_VERSION;
    document.documentElement.dataset.appRenderCount = String(snapshot.count || 0);
    document.body?.setAttribute("data-app-render-owner", "src/app/render.js");
}

export default {
    APP_RENDER_FOUNDATION_VERSION,
    renderApp,
    isRendering,
    getRenderStatus
};
