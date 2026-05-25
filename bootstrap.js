"use strict";

import {
    bindNativeControlGuard
} from "./src/ui/nativeControlGuard.js";
/**
 * BOOTSTRAP v4.11u
 * Root startup flow for Tower Battle Intel.
 *
 * Owns only application startup:
 * - validate static shell
 * - load state
 * - first render
 * - bind static controls after render, so rendered header debug-hold exists
 * - autosave last input
 * - expose console helpers
 */

import {
    appConfig
} from "./config/appConfig.js";

import {
    getState,
    hydrateState
} from "./src/core/state.js";

import {
    bindCoreEvents
} from "./src/core/events.js";

import {
    bindStaticControlBridge
} from "./src/ui/staticControlBridge.js";

import {
    render
} from "./src/ui/render.js";

import {
    bindLiveInteractionBridge
} from "./src/ui/liveInteractionBridge.js";

import {
    loadStorage,
    saveStorage
} from "./src/storage/localStore.js";

let bootstrapComplete = false;
let autosaveBound = false;

/* --------------------------------------------------
   BOOTSTRAP
-------------------------------------------------- */

export function bootstrap() {

    bindNativeControlGuard();

    if (bootstrapComplete) {
        console.warn("[Tower Battle Intel] Bootstrap skipped: already complete.");
        return getState();
    }

    console.log(`BOOTSTRAP LOADED ${appConfig.app.version}`);

    const shell = getStaticShell();
    validateStaticShell(shell);
    bindStaticControlBridge(() => render());
    hydrateFromStorage(shell.input);

    // Render before binding core events. This allows core debug-hold binding
    // to see the rebuilt dashboard header as well as the static shell.
        render();

    import("./src/ui/nativeImportHardBridge.js")
        .then((module) => module.bindNativeImportHardBridge?.())
        .catch((error) => console.warn("[Tower Battle Intel] Native import hard bridge failed to load", error));
    import("./src/ui/finalControlPolishBridge.js")
        .then((module) => module.bindFinalControlPolishBridge?.(() => render()))
        .catch((error) => console.warn("[Tower Battle Intel] Final control polish bridge failed to load", error));
    import("./src/ui/metricTableDiffToggleBridge.js")
        .then((module) => module.bindMetricTableDiffToggleBridge?.())
        .catch((error) => console.warn("[Tower Battle Intel] Metric table diff toggle bridge failed to load", error));
    import("./src/ui/compareGrowthControlsBridge.js")
        .then((module) => module.bindCompareGrowthControlsBridge?.())
        .catch((error) => console.warn("[Tower Battle Intel] Compare growth controls bridge failed to load", error));
    import("./src/ui/growthLineFocusBridge.js")
        .then((module) => module.bindGrowthLineFocusBridge?.())
        .catch((error) => console.warn("[Tower Battle Intel] Growth line focus bridge failed to load", error));
    bindCoreEvents();

    import("./src/ui/actionAuditBridge.js")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn("[Tower Battle Intel] Action audit bridge failed to load", error));
    bindLiveInteractionBridge(() => render());
    bindInputAutosave(shell.input);
    bindExitAutosave(shell.input);
    exposeConsoleHelpers(shell.input);

    bootstrapComplete = true;
    document.documentElement.dataset.bootstrapReady = "true";

    return getState();
}

/* --------------------------------------------------
   STATIC SHELL
-------------------------------------------------- */

function getStaticShell() {
    return {
        app: document.getElementById("app"),
        dashboard: document.getElementById("dashboard"),
        input: document.getElementById("input"),
        debugPanel: document.getElementById("debugPanel"),
        saveReport: document.getElementById("saveReport"),
        clearInput: document.getElementById("clearInput"),
        clearRuns: document.getElementById("clearRuns"),
        buildStyleSelect: document.getElementById("buildStyleSelect")
    };
}

function validateStaticShell(shell) {
    const missing = Object.entries(shell)
        .filter(([key, value]) => key !== "buildStyleSelect" && !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`Missing static shell element(s): ${missing.join(", ")}`);
    }
}

/* --------------------------------------------------
   STORAGE HYDRATION
-------------------------------------------------- */

function hydrateFromStorage(input) {
    const saved = loadStorage();

    if (saved && typeof saved === "object") {
        hydrateState(saved);

        if (typeof saved.lastInput === "string" && input) {
            input.value = saved.lastInput;
        }
    }
}

function persistCurrentState(input) {
    saveStorage({
        ...getState(),
        lastInput: input?.value || ""
    });
}

function bindInputAutosave(input) {
    if (!input || autosaveBound) {
        return;
    }

    autosaveBound = true;

    let timer = null;

    input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => persistCurrentState(input), 220);
    });
}

function bindExitAutosave(input) {
    if (window.__TowerBattleIntelExitSaveBound) {
        return;
    }

    window.__TowerBattleIntelExitSaveBound = true;

    window.addEventListener("beforeunload", () => {
        persistCurrentState(input);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            persistCurrentState(input);
        }
    });
}

/* --------------------------------------------------
   CONSOLE HELPERS
-------------------------------------------------- */

function exposeConsoleHelpers(input) {
    window.TowerBattleIntel = Object.freeze({
        version: appConfig.app.version,

        state() {
            return getState();
        },

        render() {
            render();
            return getState();
        },

        save() {
            persistCurrentState(input);
            return true;
        },

        clearInput() {
            if (input) {
                input.value = "";
            }

            persistCurrentState(input);
            return true;
        },

        shell() {
            return getStaticShell();
        }
    });

    console.log(
        "[Tower Battle Intel] Console helpers ready:",
        "TowerBattleIntel.state()",
        "TowerBattleIntel.render()",
        "TowerBattleIntel.save()",
        "TowerBattleIntel.shell()"
    );
}





