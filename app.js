"use strict";

/**
 * APP ENTRY v4.11u
 * Small, strict browser entry point.
 *
 * This file only owns startup safety:
 * - device mode first
 * - bootstrap once
 * - global startup/runtime error display
 */

import {
    bootstrap
} from "./bootstrap.js";

import {
    appConfig
} from "./config/appConfig.js";

import {
    initDeviceMode
} from "./src/ui/deviceMode.js";

const START_FLAG = "__TowerBattleIntelStarted";

/* --------------------------------------------------
   START APP
-------------------------------------------------- */

function startApp() {

    if (window[START_FLAG]) {
        console.warn("[Tower Battle Intel] Startup skipped: app is already running.");
        return;
    }

    window[START_FLAG] = true;

    try {
        initDeviceMode();
        stampRuntimeMetadata();
        bindGlobalErrorGuards();
        bootstrap();
        console.log(`${appConfig.app.name} ${appConfig.app.version} started`);
    } catch (error) {
        window[START_FLAG] = false;
        console.error("Tower Battle Intel failed to start:", error);
        showStartupError(error);
    }
}

/* --------------------------------------------------
   DOM READY
-------------------------------------------------- */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
    startApp();
}

/* --------------------------------------------------
   RUNTIME SAFETY
-------------------------------------------------- */

function stampRuntimeMetadata() {
    document.documentElement.dataset.appName = appConfig.app.name;
    document.documentElement.dataset.appVersion = appConfig.app.version;
    document.body?.setAttribute("data-app-version", appConfig.app.version);
}

function bindGlobalErrorGuards() {
    if (window.__TowerBattleIntelGlobalErrorsBound) {
        return;
    }

    window.__TowerBattleIntelGlobalErrorsBound = true;

    window.addEventListener("error", event => {
        console.error("[Tower Battle Intel] Runtime error:", event.error || event.message);
    });

    window.addEventListener("unhandledrejection", event => {
        console.error("[Tower Battle Intel] Unhandled promise rejection:", event.reason);
    });
}

/* --------------------------------------------------
   STARTUP ERROR DISPLAY
-------------------------------------------------- */

function showStartupError(error) {
    const root = document.getElementById("dashboard") || document.body;

    if (!root) {
        return;
    }

    const message = error?.stack || error?.message || "Unknown startup error";

    root.innerHTML = `
        <section class="startup-error-panel" role="alert">
            <div class="startup-error-kicker">Startup Error</div>
            <h1>Tower Battle Intel could not start</h1>
            <p>Refresh once. If it keeps happening, copy this error into the project chat.</p>
            <pre>${escapeHTML(message)}</pre>
        </section>
    `;
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
