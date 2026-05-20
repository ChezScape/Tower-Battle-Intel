"use strict";

/**
 * INSPECTION PANEL
 * Clickable debug inspector.
 *
 * Includes:
 * - Health Scan tab
 * - Copy selected output
 * - Copy full debug JSON
 * - Download Health Scan JSON
 * - Download Full Debug JSON
 * - UK-time filenames
 * - Background scroll lock while debug is open
 * - Per-item health heatmap classes
 */

import {
    setHTML
} from "../dom.js";

import {
    runSystemHealthScan,
    buildTimeInfo,
    buildUKFilenameTimestamp
} from "../../diagnostics/systemHealthScan.js";

import {
    appConfig
} from "../../../config/appConfig.js";

let activeDebugView = "overview";
let lastDebugOutput = "";

/* --------------------------------------------------
   RENDER INSPECTION PANEL
-------------------------------------------------- */

export function renderInspectionPanel(state = {}) {

    const root =
        getOrCreateDebugPanel();

    const debugEnabled =
        Boolean(state?.ui?.debug);

    if (!debugEnabled) {
        closeDebugPanel(root);
        return;
    }

    root.classList.add("active");
    document.body.classList.add("debug-open");
    document.documentElement.classList.add("debug-open");

    if (isMobileMode()) {
        document.documentElement.classList.add("mobile-scroll-locked");
        document.body.classList.add("mobile-scroll-locked");
    }

    const payload =
        buildDebugPayload(state);

    const output =
        buildViewOutput(activeDebugView, payload);

    lastDebugOutput =
        output.text;

    setHTML(root, `
        <div
            class="debug-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Tower Battle Intel Debug"
        >
            <div class="debug-modal">

                <div class="debug-header">

                    <div>
                        <div class="debug-title">
                            Tower Battle Intel Debug
                        </div>

                        <div class="debug-subtitle">
                            Click a section below to inspect, copy, or download debug data.
                        </div>
                    </div>

                    <div
                        class="debug-header-actions"
                        aria-label="Debug panel actions"
                    >
                        <span
                            class="debug-version-pill"
                            aria-label="Application version"
                        >
                            TBI: ${escapeHTML(appConfig?.app?.version || "v")}
                        </span>

                        <button
                            id="debugClose"
                            class="debug-close"
                            type="button"
                        >
                            Close
                        </button>
                    </div>

                </div>

                <div class="debug-tabs">

                    ${debugButton("overview", "Overview")}
                    ${debugButton("health", "Health Scan")}
                    ${debugButton("runs", "Runs")}
                    ${debugButton("history", "History")}
                    ${debugButton("compare", "Compare")}
                    ${debugButton("ai", "AI Coach")}
                    ${debugButton("trend", "Trend")}
                    ${debugButton("anomalies", "Anomalies")}
                    ${debugButton("inspection", "Pipeline")}
                    ${debugButton("storage", "Storage")}
                    ${debugButton("time", "Time")}
                    ${debugButton("export", "Export")}

                </div>

                <div class="debug-health-summary">
                    ${buildHealthSummaryHTML(payload.healthScan)}
                </div>

                <div class="debug-tools">

                    <button
                        id="debugCopy"
                        type="button"
                    >
                        Copy Shown
                    </button>

                    <button
                        id="debugCopyHealth"
                        type="button"
                    >
                        Copy Health Scan
                    </button>

                    <button
                        id="debugDownloadHealth"
                        type="button"
                    >
                        Download Health Scan JSON
                    </button>

                    <button
                        id="debugCopyFull"
                        type="button"
                    >
                        Copy Full Debug JSON
                    </button>

                    <button
                        id="debugDownloadFull"
                        type="button"
                    >
                        Download Full Debug JSON
                    </button>

                </div>

                <div class="debug-section-title">
                    ${escapeHTML(output.title)}
                </div>

                <pre
                    id="debugOutput"
                    class="debug-json debug-output"
                >${escapeHTML(output.text)}</pre>

            </div>
        </div>
    `);

    bindDebugPanelEvents(state, payload);
}


function isMobileMode() {

    return (
        typeof document !== "undefined" &&
        document.documentElement?.getAttribute("data-device-mode") === "mobile"
    );
}

/* --------------------------------------------------
   CLOSE PANEL
-------------------------------------------------- */

function closeDebugPanel(root = null) {

    const panel =
        root || document.getElementById("debugPanel");

    if (panel) {
        panel.classList.remove("active");
        setHTML(panel, "");
    }

    document.body.classList.remove("debug-open");
    document.documentElement.classList.remove("debug-open");

    if (!document.body.classList.contains("mobile-report-open")) {
        document.documentElement.classList.remove("mobile-scroll-locked");
        document.body.classList.remove("mobile-scroll-locked");
    }
}

/* --------------------------------------------------
   DEBUG BUTTON
-------------------------------------------------- */

function debugButton(view, label) {

    const active =
        activeDebugView === view
            ? "active"
            : "";

    return `
        <button
            type="button"
            class="debug-tab ${escapeAttr(active)}"
            data-debug-view="${escapeAttr(view)}"
        >
            ${escapeHTML(label)}
        </button>
    `;
}

/* --------------------------------------------------
   HEALTH SUMMARY HTML
-------------------------------------------------- */

function buildHealthSummaryHTML(scan = {}) {

    const summary =
        scan?.summary || {};

    const status =
        scan?.status || summary.status || "unknown";

    const safeStatus =
        safeClassName(status);

    const statusLabel =
        formatStatus(status);

    const score =
        Number.isFinite(Number(scan?.score ?? summary.score))
            ? Number(scan?.score ?? summary.score)
            : 0;

    const critical =
        Number(summary.critical || 0);

    const failed =
        Number(summary.failed || 0);

    const warnings =
        Number(summary.warnings || 0);

    const info =
        Number(summary.info || 0);

    const passed =
        Number(summary.passed || 0);

    return `
        <div class="debug-health-pill ${escapeAttr(safeStatus)}">

            <span class="${escapeAttr(healthToneForStatus(status))}">
                Health: <strong>${escapeHTML(statusLabel)}</strong>
            </span>

            <span class="${escapeAttr(healthToneForScore(score))}">
                Score: <strong>${escapeHTML(score)} / 100</strong>
            </span>

            <span class="${escapeAttr(healthToneForBadCount(critical))}">
                Critical: <strong>${escapeHTML(critical)}</strong>
            </span>

            <span class="${escapeAttr(healthToneForBadCount(failed))}">
                Failed: <strong>${escapeHTML(failed)}</strong>
            </span>

            <span class="${escapeAttr(healthToneForWarningCount(warnings))}">
                Warnings: <strong>${escapeHTML(warnings)}</strong>
            </span>

            <span class="health-tone-info">
                Info: <strong>${escapeHTML(info)}</strong>
            </span>

            <span class="${escapeAttr(healthToneForPassedCount(passed))}">
                Passed: <strong>${escapeHTML(passed)}</strong>
            </span>

        </div>
    `;
}

function formatStatus(status = "unknown") {

    return String(status || "unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

/* --------------------------------------------------
   HEALTH HEATMAP TONES
-------------------------------------------------- */

function healthToneForStatus(status = "unknown") {

    const value =
        String(status || "unknown")
            .trim()
            .toLowerCase();

    if (value === "healthy") {
        return "health-tone-good";
    }

    if (
        value.includes("warning") ||
        value.includes("caution")
    ) {
        return "health-tone-warn";
    }

    if (
        value.includes("failed") ||
        value.includes("critical") ||
        value.includes("unhealthy") ||
        value.includes("error")
    ) {
        return "health-tone-bad";
    }

    return "health-tone-info";
}

function healthToneForScore(score = 0) {

    const value =
        Number(score || 0);

    if (!Number.isFinite(value)) {
        return "health-tone-info";
    }

    if (value >= 95) {
        return "health-tone-good";
    }

    if (value >= 75) {
        return "health-tone-warn";
    }

    return "health-tone-bad";
}

function healthToneForBadCount(count = 0) {

    return Number(count || 0) > 0
        ? "health-tone-bad"
        : "health-tone-good";
}

function healthToneForWarningCount(count = 0) {

    return Number(count || 0) > 0
        ? "health-tone-warn"
        : "health-tone-good";
}

function healthToneForPassedCount(count = 0) {

    return Number(count || 0) > 0
        ? "health-tone-good"
        : "health-tone-info";
}

/* --------------------------------------------------
   BIND EVENTS
-------------------------------------------------- */

function bindDebugPanelEvents(state, payload) {

    const close =
        document.getElementById("debugClose");

    close?.addEventListener("click", async () => {

        document.body.classList.remove("debug-open");
        document.documentElement.classList.remove("debug-open");

        if (!document.body.classList.contains("mobile-report-open")) {
            document.documentElement.classList.remove("mobile-scroll-locked");
            document.body.classList.remove("mobile-scroll-locked");
        }

        const stateModule =
            await import("../../core/state.js");

        const renderModule =
            await import("../render.js");

        const current =
            stateModule.getState();

        stateModule.setState({
            ui: {
                ...(current.ui || {}),
                debug: false
            }
        });

        renderModule.render();
    });

    const tabs =
        document.querySelectorAll("[data-debug-view]");

    tabs.forEach(button => {

        button.addEventListener("click", () => {

            activeDebugView =
                button.dataset.debugView || "overview";

            renderInspectionPanel(state);
        });
    });

    const copyShown =
        document.getElementById("debugCopy");

    copyShown?.addEventListener("click", () => {
        copyText(lastDebugOutput, "Copied View");
    });

    const copyHealth =
        document.getElementById("debugCopyHealth");

    copyHealth?.addEventListener("click", () => {
        copyText(
            JSON.stringify(payload.healthScan, null, 2),
            "Copied Health"
        );
    });

    const downloadHealth =
        document.getElementById("debugDownloadHealth");

    downloadHealth?.addEventListener("click", () => {
        downloadJSON(
            payload.healthScan,
            buildDownloadFilename("health-scan")
        );
    });

    const copyFull =
        document.getElementById("debugCopyFull");

    copyFull?.addEventListener("click", () => {
        copyText(
            JSON.stringify(payload.fullExport, null, 2),
            "Copied Full"
        );
    });

    const downloadFull =
        document.getElementById("debugDownloadFull");

    downloadFull?.addEventListener("click", () => {
        downloadJSON(
            payload.fullExport,
            buildDownloadFilename("debug-export")
        );
    });
}

/* --------------------------------------------------
   BUILD PAYLOAD
-------------------------------------------------- */

function buildDebugPayload(state = {}) {

    const time =
        buildTimeInfo();

    const healthScan =
        runSystemHealthScan(state);

    const storage =
        readStorageSnapshot();

    const payload = {
        overview: {
            debugEnabled:
                Boolean(state?.ui?.debug),

            activeView:
                state?.ui?.activeView || "dashboard",

            buildStyle:
                state?.ui?.buildStyle || "unknown",

            selectedSection:
                state?.ui?.selectedSection || null,

            hasRunA:
                Boolean(state?.runA),

            hasRunB:
                Boolean(state?.runB),

            historyCount:
                Array.isArray(state?.history)
                    ? state.history.length
                    : 0,

            hasCompare:
                Boolean(state?.compareData),

            aiCount:
                Array.isArray(state?.ai)
                    ? state.ai.length
                    : 0,

            anomalyCount:
                Array.isArray(state?.anomalies)
                    ? state.anomalies.length
                    : 0,

            healthStatus:
                healthScan?.status || "unknown",

            healthScore:
                healthScan?.score ?? 0
        },

        time,

        healthScan,

        runs: {
            runA:
                summariseRun(state?.runA),

            runB:
                summariseRun(state?.runB),

            currentRun:
                summariseRun(state?.currentRun)
        },

        history: {
            count:
                Array.isArray(state?.history)
                    ? state.history.length
                    : 0,

            runs:
                Array.isArray(state?.history)
                    ? state.history.map((run, index) => ({
                        index,
                        ...summariseRun(run)
                    }))
                    : []
        },

        compare:
            summariseCompare(state?.compareData),

        ai:
            Array.isArray(state?.ai)
                ? state.ai
                : [],

        trend:
            state?.trend || null,

        anomalies:
            Array.isArray(state?.anomalies)
                ? state.anomalies
                : [],

        inspection:
            state?.inspection || null,

        storage,

        ui:
            state?.ui || {}
    };

    payload.fullExport = {
        app:
            "Tower Battle Intel",

        exportType:
            "full-debug-export",

        exportedAt:
            time.exportedAtUTC,

        time,

        url:
            typeof location !== "undefined"
                ? location.href
                : "",

        userAgent:
            typeof navigator !== "undefined"
                ? navigator.userAgent
                : "",

        overview:
            payload.overview,

        healthScan:
            payload.healthScan,

        runs:
            payload.runs,

        history:
            payload.history,

        compare:
            state?.compareData || null,

        ai:
            Array.isArray(state?.ai)
                ? state.ai
                : [],

        trend:
            state?.trend || null,

        anomalies:
            Array.isArray(state?.anomalies)
                ? state.anomalies
                : [],

        inspection:
            state?.inspection || null,

        ui:
            state?.ui || {},

        storage,

        fullState:
            state
    };

    return payload;
}

/* --------------------------------------------------
   VIEW OUTPUT
-------------------------------------------------- */

function buildViewOutput(view, payload) {

    switch (view) {

        case "health":
            return output(
                "System Health Scan",
                payload.healthScan
            );

        case "runs":
            return output(
                "Loaded Runs",
                payload.runs
            );

        case "history":
            return output(
                "Battle History",
                payload.history
            );

        case "compare":
            return output(
                "Compare Data",
                payload.compare
            );

        case "ai":
            return output(
                "AI Coach Output",
                payload.ai
            );

        case "trend":
            return output(
                "Trend Data",
                payload.trend
            );

        case "anomalies":
            return output(
                "Anomalies",
                payload.anomalies
            );

        case "inspection":
            return output(
                "Pipeline Inspection",
                payload.inspection
            );

        case "storage":
            return output(
                "Local Storage Snapshot",
                payload.storage
            );

        case "time":
            return output(
                "Time / Environment",
                payload.time
            );

        case "export":
            return output(
                "Full Debug Export",
                payload.fullExport
            );

        case "overview":
        default:
            return output(
                "Debug Overview",
                payload.overview
            );
    }
}

function output(title, data) {

    return {
        title,
        text:
            JSON.stringify(
                data ?? null,
                null,
                2
            )
    };
}

/* --------------------------------------------------
   CREATE PANEL IF MISSING
-------------------------------------------------- */

function getOrCreateDebugPanel() {

    let root =
        document.getElementById("debugPanel");

    if (root) {
        return root;
    }

    root =
        document.createElement("div");

    root.id =
        "debugPanel";

    document.body.appendChild(root);

    console.warn(
        "[Tower Battle Intel] #debugPanel was missing, created automatically."
    );

    return root;
}

/* --------------------------------------------------
   SUMMARISERS
-------------------------------------------------- */

function summariseRun(run = null) {

    if (!run) {
        return null;
    }

    const core =
        run?.core || {};

    const stats =
        run?.stats || {};

    const sectionCore =
        run?.sections?.core || {};

    return {
        battleDate:
            core.battleDate ?? "",

        tier:
            core.tier ?? 0,

        wave:
            core.wave ?? 0,

        coins:
            core.coins ?? 0,

        cells:
            core.cells ?? 0,

        coinsPerHour:
            stats.coinsPerHour ??
            core.coinsPerHour ??
            sectionCore.coins_per_hour ??
            sectionCore.coinsPerHour ??
            0,

        cellsPerHour:
            stats.cellsPerHour ??
            core.cellsPerHour ??
            sectionCore.cells_per_hour ??
            sectionCore.cellsPerHour ??
            0,

        coinsPerWave:
            stats.coinsPerWave ?? 0,

        cellsPerWave:
            stats.cellsPerWave ?? 0,

        efficiency:
            stats.efficiency ?? 0,

        time:
            core.time ?? 0,

        killedBy:
            core.killedBy ?? "",

        sectionCount:
            Object.keys(run?.sections || {}).length,

        statCount:
            Object.keys(stats || {}).length,

        reportId:
            run?.meta?.reportId ?? null,

        confidence:
            run?.meta?.confidence ?? 0
    };
}

function summariseCompare(compareData = null) {

    if (!compareData) {
        return null;
    }

    return {
        hasCore:
            Boolean(compareData?.core),

        hasStats:
            Boolean(compareData?.stats),

        sectionCount:
            Object.keys(compareData?.sections || {}).length,

        summary:
            compareData?.summary || null,

        core:
            compareData?.core || null,

        stats:
            compareData?.stats || null
    };
}

/* --------------------------------------------------
   STORAGE SNAPSHOT
-------------------------------------------------- */

function readStorageSnapshot() {

    if (typeof localStorage === "undefined") {
        return {
            available: false
        };
    }

    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }

    const towerKeys =
        keys.filter(key =>
            String(key || "")
                .toLowerCase()
                .includes("tower")
        );

    const values = {};

    for (const key of towerKeys) {

        try {

            const raw =
                localStorage.getItem(key);

            values[key] =
                tryParseJSON(raw);

        } catch (error) {

            values[key] = {
                error:
                    error?.message || "Failed to read"
            };
        }
    }

    return {
        available: true,
        keyCount: keys.length,
        towerKeys,
        values
    };
}

function tryParseJSON(value) {

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

/* --------------------------------------------------
   COPY
-------------------------------------------------- */

async function copyText(text = "", statusMessage = "Copied") {

    const value =
        String(text || "");

    try {

        if (
            typeof navigator !== "undefined" &&
            navigator?.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {
            await navigator.clipboard.writeText(value);
            flashCopyStatus(statusMessage);
            return true;
        }

    } catch {
        // fallback below
    }

    fallbackCopy(value);

    flashCopyStatus(statusMessage);
    return true;
}

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value =
        text;

    textarea.setAttribute(
        "readonly",
        "true"
    );

    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    document.body.appendChild(textarea);

    textarea.select();

    try {
        document.execCommand("copy");
    } catch {
        // ignore
    }

    document.body.removeChild(textarea);
}

function flashCopyStatus(message = "Copied") {

    const button =
        document.getElementById("debugCopy");

    if (!button) {
        return;
    }

    const old =
        button.textContent;

    button.textContent =
        message;

    setTimeout(() => {
        button.textContent = old || "Copy Shown";
    }, 900);
}

/* --------------------------------------------------
   DOWNLOAD JSON
-------------------------------------------------- */

function downloadJSON(data, filename) {

    const json =
        JSON.stringify(
            data ?? {},
            null,
            2
        );

    const blob =
        new Blob(
            [json],
            {
                type: "application/json;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 250);
}

function buildDownloadFilename(type = "debug-export") {

    const safeType =
        String(type || "debug-export")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/_/g, "-")
            .replace(/[^a-z0-9-]/g, "");

    const stamp =
        buildUKFilenameTimestamp();

    return `tower-battle-intel-${safeType}-${stamp}.json`;
}

/* --------------------------------------------------
   ESCAPE / SAFE STRINGS
-------------------------------------------------- */

function safeClassName(value = "") {

    return String(value || "unknown")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]/g, "") || "unknown";
}

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}