"use strict";

/**
 * APP ENTRY v4.11z52w12
 * Browser entry point only. Runtime startup is owned by src/app/init.js.
 */

import { startTowerBattleIntel } from "./src/app/init.js";

function startWhenReady() {
    try {
        startTowerBattleIntel();
    } catch (error) {
        console.error("Tower Battle Intel failed to start:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady, { once: true });
} else {
    startWhenReady();
}
