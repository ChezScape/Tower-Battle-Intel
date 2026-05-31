"use strict";

/**
 * APP INIT FOUNDATION v4.11z52w12
 * Clean startup owner for shell-phase Tower Battle Intel.
 */

import { getState, hydrateState } from "../core/state.js";
import { initDeviceMode } from "../ui/deviceMode.js";
import { bindUIEvents, getUIShellEventStatus } from "../ui/events/index.js";
import { inspectStorageExportSources, loadStorage, saveStorage, getLocalStoreStatus } from "../storage/localStore.js";
import { renderApp, getRenderStatus } from "./render.js";
import { getAppTabStatus } from "./tabs.js";
import { getAppVersionInfo, stampAppVersionRuntime } from "./version.js";

export const APP_INIT_FOUNDATION_VERSION = "v4.11z52w12";

const START_FLAG = "__TowerBattleIntelStarted";

let started = false;
let autosaveBound = false;
let exitSaveBound = false;
let startCount = 0;
let lastStart = null;
let storedLastInput = "";

export function startTowerBattleIntel() {
    if (started || window[START_FLAG]) {
        return getState();
    }

    window[START_FLAG] = true;
    started = true;
    startCount += 1;

    try {
        initDeviceMode();
        stampAppVersionRuntime();
        bindGlobalErrorGuards();

        const shell = getStaticShell();
        validateStaticShell(shell);
        hydrateFromStorage(shell.input);

        renderApp(null, { reason: "startup" });
        bindUIEvents(() => renderApp(null, { reason: "ui-event" }));

        bindInputAutosave(shell.input);
        bindExitAutosave(shell.input);
        exposeConsoleHelpers(shell.input);
        stampInitRuntime();

        const version = getAppVersionInfo();
        lastStart = {
            version: version.buildVersion,
            startedAt: new Date().toISOString(),
            shell: getShellStatus(shell)
        };

        console.log(`${version.name} ${version.buildVersion} started`);
        return getState();
    } catch (error) {
        started = false;
        window[START_FLAG] = false;
        console.error("Tower Battle Intel failed to start:", error);
        throw error;
    }
}

export const bootstrap = startTowerBattleIntel;

export function getAppInitStatus() {
    return {
        version: APP_INIT_FOUNDATION_VERSION,
        owner: "src/app/init.js",
        started,
        startCount,
        lastStart,
        render: getRenderStatus(),
        tabs: getAppTabStatus(),
        events: getUIShellEventStatus(),
        storage: getLocalStoreStatus()
    };
}

export function getStaticShell() {
    return {
        app: document.getElementById("app"),
        dashboard: document.getElementById("dashboard"),
        input: document.getElementById("input"),
        saveReport: document.getElementById("saveReport"),
        clearInput: document.getElementById("clearInput"),
        clearRuns: document.getElementById("clearRuns"),
        buildStyleSelect: document.getElementById("buildStyleSelect")
    };
}

function validateStaticShell(shell) {
    const required = ["app", "dashboard"];
    const missing = required.filter(key => !shell[key]);

    if (missing.length) {
        throw new Error(`Missing app shell element(s): ${missing.join(", ")}`);
    }
}

function hydrateFromStorage(input) {
    const saved = loadStorage();

    if (saved && typeof saved === "object") {
        hydrateState(saved);

        if (typeof saved.lastInput === "string") {
            storedLastInput = saved.lastInput;

            if (input) {
                input.value = saved.lastInput;
            }
        }
    }
}

function persistCurrentState(input) {
    if (input) {
        storedLastInput = input.value || "";
    }

    saveStorage({
        ...getState(),
        lastInput: storedLastInput
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
    if (exitSaveBound) {
        return;
    }

    exitSaveBound = true;

    window.addEventListener("beforeunload", () => {
        persistCurrentState(input);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            persistCurrentState(input);
        }
    });
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

function exposeConsoleHelpers(input) {
    const version = getAppVersionInfo();

    window.TowerBattleIntel = Object.freeze({
        version: version.buildVersion,
        coreVersion: version.coreVersion,
        buildVersion: version.buildVersion,
        state: () => getState(),
        render: () => {
            renderApp(null, { reason: "console" });
            return getState();
        },
        save: () => {
            persistCurrentState(input);
            return true;
        },
        clearInput: () => {
            if (input) {
                input.value = "";
            }
            persistCurrentState(input);
            return true;
        },
        shell: getStaticShell,
        status: getAppInitStatus,
        storage: () => ({
            status: getLocalStoreStatus(),
            exportSources: inspectStorageExportSources()
        })
    });

    window.TowerBattleIntelApp = Object.freeze({
        status: getAppInitStatus,
        render: () => renderApp(null, { reason: "console-app" }),
        tabs: getAppTabStatus
    });
}

function stampInitRuntime() {
    document.documentElement.dataset.appInitOwner = "src/app/init.js";
    document.documentElement.dataset.appInitVersion = APP_INIT_FOUNDATION_VERSION;
    document.documentElement.dataset.bootstrapReady = "true";
    document.body?.setAttribute("data-app-init-owner", "src/app/init.js");
}

function getShellStatus(shell = getStaticShell()) {
    return Object.fromEntries(
        Object.entries(shell).map(([key, value]) => [key, Boolean(value)])
    );
}

export default {
    APP_INIT_FOUNDATION_VERSION,
    startTowerBattleIntel,
    bootstrap,
    getAppInitStatus,
    getStaticShell
};
