"use strict";

/**
 * APP ENTRY
 * Starts Tower Battle Intel once the DOM is ready.
 */

import {
    bootstrap
} from "./bootstrap.js";

import {
    initDeviceMode
} from "./src/ui/deviceMode.js";

/* --------------------------------------------------
   START APP
-------------------------------------------------- */

function startApp() {

    try {

        initDeviceMode();

        bootstrap();

        console.log(
            "Tower Battle Intel started"
        );

    } catch (error) {

        console.error(
            "Tower Battle Intel failed to start:",
            error
        );

        showStartupError(error);
    }
}

/* --------------------------------------------------
   DOM READY
-------------------------------------------------- */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startApp,
        {
            once: true
        }
    );

} else {

    startApp();
}

/* --------------------------------------------------
   STARTUP ERROR DISPLAY
-------------------------------------------------- */

function showStartupError(error) {

    const root =
        document.getElementById("dashboard") ||
        document.body;

    if (!root) {
        return;
    }

    const message =
        error?.message || "Unknown startup error";

    root.innerHTML = `
        <div class="wa-panel">

            <div class="wa-title">
                Startup Error
            </div>

            <div class="wa-sub">
                Tower Battle Intel could not start.
            </div>

            <pre style="
                margin-top:12px;
                white-space:pre-wrap;
                color:#ff6482;
                font-family:Consolas, monospace;
                font-size:12px;
            ">${escapeHTML(message)}</pre>

        </div>
    `;
}

/* --------------------------------------------------
   SAFE ESCAPE
-------------------------------------------------- */

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
