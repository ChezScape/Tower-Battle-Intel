"use strict";

/**
 * INSPECTION PANEL v4.10l
 * Delegated debug inspector. Buttons do not rely on per-render listeners.
 */

import { setHTML } from "../dom.js";
import { runSystemHealthScan, buildTimeInfo, buildUKFilenameTimestamp } from "../../diagnostics/systemHealthScan.js";
import { appConfig } from "../../../config/appConfig.js";

let activeDebugView = "overview";
let lastPayload = null;
let lastOutput = "";
let delegated = false;

const DEBUG_VIEWS = Object.freeze([
    ["overview", "Overview"],
    ["health", "Health Scan"],
    ["runs", "Runs"],
    ["history", "History"],
    ["compare", "Compare"],
    ["ai", "AI Coach"],
    ["trend", "Trend"],
    ["anomalies", "Anomalies"],
    ["inspection", "Pipeline"],
    ["storage", "Storage"],
    ["time", "Time"],
    ["export", "Export"]
]);

export function renderInspectionPanel(state = {}) {
    bindDebugDelegates();

    const root = getOrCreateDebugPanel();
    const debugEnabled = Boolean(state?.ui?.debug);

    if (!debugEnabled) {
        closeDebugPanel(root);
        return;
    }

    const payload = buildDebugPayload(state);
    const output = buildViewOutput(activeDebugView, payload);

    lastPayload = payload;
    lastOutput = output.text;

    root.classList.add("active");
    root.hidden = false;
    root.inert = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("debug-open");
    document.documentElement.classList.add("debug-open");

    setHTML(root, `
        <div class="debug-overlay" role="dialog" aria-modal="true" aria-label="Tower Battle Intel Debug">
            <div class="debug-modal">
                <div class="debug-header">
                    <div>
                        <div class="debug-title">Tower Battle Intel Debug</div>
                        <div class="debug-subtitle">Inspect, copy, download, and verify the current runtime state.</div>
                    </div>
                    <div class="debug-header-actions" aria-label="Debug actions">
                        <span class="debug-version-pill">TBI: ${escapeHTML(appConfig?.app?.version || "v")}</span>
                        <button id="debugClose" data-debug-close="true" class="debug-close" type="button">Close</button>
                    </div>
                </div>

                <div class="debug-tabs" role="tablist" aria-label="Debug sections">
                    ${DEBUG_VIEWS.map(([view, label]) => debugButton(view, label)).join("")}
                </div>

                <div class="debug-health-summary">
                    ${buildHealthSummaryHTML(payload.healthScan)}
                </div>

                <div class="debug-tools">
                    <button id="debugCopy" data-debug-copy-shown="true" type="button">Copy Shown</button>
                    <button id="debugCopyHealth" data-debug-copy-health="true" type="button">Copy Health Scan</button>
                    <button id="debugDownloadHealth" data-debug-download-health="true" type="button">Download Health Scan JSON</button>
                    <button id="debugCopyFull" data-debug-copy-full="true" type="button">Copy Full Debug JSON</button>
                    <button id="debugDownloadFull" data-debug-download-full="true" type="button">Download Full Debug JSON</button>
                </div>

                <div class="debug-section-title">${escapeHTML(output.title)}</div>
                <pre id="debugOutput" class="debug-json debug-output">${escapeHTML(output.text)}</pre>
            </div>
        </div>
    `);
}

function bindDebugDelegates() {
    if (delegated || typeof document === "undefined") return;
    delegated = true;
    document.addEventListener("click", handleDebugClick, true);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && document.getElementById("debugPanel")?.classList?.contains("active")) {
            event.preventDefault();
            closeDebugFromState();
        }
    }, true);
}

function handleDebugClick(event) {
    const target = event.target;
    if (!target?.closest) return;
    const panel = target.closest("#debugPanel");
    if (!panel || !panel.classList.contains("active")) return;

    const close = target.closest("#debugClose, [data-debug-close]");
    if (close) {
        event.preventDefault();
        event.stopPropagation();
        closeDebugFromState();
        return;
    }

    const view = target.closest("[data-debug-view]");
    if (view) {
        event.preventDefault();
        event.stopPropagation();
        activeDebugView = view.dataset.debugView || "overview";
        rerenderDebugOnly();
        return;
    }

    const copyShown = target.closest("#debugCopy, [data-debug-copy-shown]");
    if (copyShown) {
        event.preventDefault();
        event.stopPropagation();
        copyText(lastOutput);
        flashCopyStatus("Copied View");
        return;
    }

    const copyHealth = target.closest("#debugCopyHealth, [data-debug-copy-health]");
    if (copyHealth) {
        event.preventDefault();
        event.stopPropagation();
        copyText(JSON.stringify(lastPayload?.healthScan || {}, null, 2));
        flashCopyStatus("Copied Health");
        return;
    }

    const copyFull = target.closest("#debugCopyFull, [data-debug-copy-full]");
    if (copyFull) {
        event.preventDefault();
        event.stopPropagation();
        copyText(JSON.stringify(lastPayload?.fullExport || {}, null, 2));
        flashCopyStatus("Copied Full Debug");
        return;
    }

    const downloadHealth = target.closest("#debugDownloadHealth, [data-debug-download-health]");
    if (downloadHealth) {
        event.preventDefault();
        event.stopPropagation();
        downloadJSON(lastPayload?.healthScan || {}, buildDownloadFilename("health-scan"));
        return;
    }

    const downloadFull = target.closest("#debugDownloadFull, [data-debug-download-full]");
    if (downloadFull) {
        event.preventDefault();
        event.stopPropagation();
        downloadJSON(lastPayload?.fullExport || {}, buildDownloadFilename("debug-export"));
    }
}

async function rerenderDebugOnly() {
    try {
        const stateModule = await import("../../core/state.js");
        renderInspectionPanel(stateModule.getState());
    } catch {
        // ignore; the live bridge also has fallback handlers.
    }
}

async function closeDebugFromState() {
    try {
        const stateModule = await import("../../core/state.js");
        const renderModule = await import("../render.js");
        const current = stateModule.getState();
        stateModule.setState({ ui: { ...(current.ui || {}), debug: false } });
        renderModule.render();
    } catch {
        closeDebugPanel();
    }
}

function closeDebugPanel(root = null) {
    const panel = root || document.getElementById("debugPanel");
    if (panel) {
        panel.classList.remove("active");
        panel.hidden = true;
        panel.inert = true;
        panel.setAttribute("aria-hidden", "true");
        setHTML(panel, "");
    }
    document.body.classList.remove("debug-open");
    document.documentElement.classList.remove("debug-open");
}

function debugButton(view, label) {
    const active = activeDebugView === view;
    return `<button type="button" class="debug-tab ${active ? "active" : ""}" data-debug-view="${escapeAttr(view)}" role="tab" aria-selected="${active ? "true" : "false"}">${escapeHTML(label)}</button>`;
}

function buildHealthSummaryHTML(scan = {}) {
    const summary = scan?.summary || {};
    const status = scan?.status || summary.status || "unknown";
    const score = Number.isFinite(Number(scan?.score ?? summary.score)) ? Number(scan?.score ?? summary.score) : 0;
    const counts = {
        critical: Number(summary.critical || 0),
        failed: Number(summary.failed || 0),
        warnings: Number(summary.warnings || 0),
        info: Number(summary.info || 0),
        passed: Number(summary.passed || 0)
    };

    return `
        <div class="debug-health-pill ${escapeAttr(safeClassName(status))}">
            <span class="${escapeAttr(healthToneForStatus(status))}">Health: <strong>${escapeHTML(formatStatus(status))}</strong></span>
            <span class="${escapeAttr(healthToneForScore(score))}">Score: <strong>${escapeHTML(score)} / 100</strong></span>
            <span class="${escapeAttr(counts.critical ? "health-tone-bad" : "health-tone-good")}">Critical: <strong>${escapeHTML(counts.critical)}</strong></span>
            <span class="${escapeAttr(counts.failed ? "health-tone-bad" : "health-tone-good")}">Failed: <strong>${escapeHTML(counts.failed)}</strong></span>
            <span class="${escapeAttr(counts.warnings ? "health-tone-warn" : "health-tone-good")}">Warnings: <strong>${escapeHTML(counts.warnings)}</strong></span>
            <span class="health-tone-info">Info: <strong>${escapeHTML(counts.info)}</strong></span>
            <span class="${escapeAttr(counts.passed ? "health-tone-good" : "health-tone-info")}">Passed: <strong>${escapeHTML(counts.passed)}</strong></span>
        </div>`;
}

function buildDebugPayload(state = {}) {
    const time = buildTimeInfo();
    const healthScan = runSystemHealthScan(state);
    const payload = {
        overview: {
            debugEnabled: Boolean(state?.ui?.debug),
            activeView: state?.ui?.activeView || state?.ui?.dashboardTab || "dashboard",
            dashboardTab: state?.ui?.dashboardTab || "overview",
            buildStyle: state?.ui?.buildStyle || "unknown",
            selectedSection: state?.ui?.selectedSection || null,
            hasRunA: Boolean(state?.runA),
            hasRunB: Boolean(state?.runB),
            historyCount: Array.isArray(state?.history) ? state.history.length : 0,
            hasCompare: Boolean(state?.compareData),
            aiCount: Array.isArray(state?.ai) ? state.ai.length : 0,
            anomalyCount: Array.isArray(state?.anomalies) ? state.anomalies.length : 0,
            healthStatus: healthScan?.status || "unknown",
            healthScore: healthScan?.score ?? 0
        },
        time,
        healthScan,
        runs: { runA: summariseRun(state?.runA), runB: summariseRun(state?.runB), currentRun: summariseRun(state?.currentRun) },
        history: { count: Array.isArray(state?.history) ? state.history.length : 0, runs: Array.isArray(state?.history) ? state.history.map((run, index) => ({ index, ...summariseRun(run) })) : [] },
        compare: summariseCompare(state?.compareData),
        ai: Array.isArray(state?.ai) ? state.ai : [],
        trend: state?.trend || null,
        anomalies: Array.isArray(state?.anomalies) ? state.anomalies : [],
        inspection: state?.inspection || null,
        storage: readStorageSnapshot(),
        ui: state?.ui || {}
    };
    payload.fullExport = { app: "Tower Battle Intel", exportType: "full-debug-export", exportedAt: new Date().toISOString(), time, url: typeof location !== "undefined" ? location.href : "", userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "node", ...payload };
    return payload;
}

function buildViewOutput(view, payload) {
    switch (view) {
        case "health": return output("Health Scan", payload.healthScan);
        case "runs": return output("Runs", payload.runs);
        case "history": return output("History", payload.history);
        case "compare": return output("Compare", payload.compare);
        case "ai": return output("AI Coach", payload.ai);
        case "trend": return output("Trend", payload.trend);
        case "anomalies": return output("Anomalies", payload.anomalies);
        case "inspection": return output("Pipeline / Inspection", payload.inspection);
        case "storage": return output("Storage Snapshot", payload.storage);
        case "time": return output("Time", payload.time);
        case "export": return output("Full Export", payload.fullExport);
        default: return output("Overview", payload.overview);
    }
}

function output(title, data) { return { title, text: JSON.stringify(data ?? null, null, 2) }; }

function getOrCreateDebugPanel() {
    let root = document.getElementById("debugPanel");
    if (!root) {
        root = document.createElement("section");
        root.id = "debugPanel";
        root.setAttribute("aria-hidden", "true");
        document.body.appendChild(root);
    }
    return root;
}

function summariseRun(run = null) {
    if (!run) return null;
    const core = run.core || {};
    const stats = run.stats || {};
    return {
        reportId: run.meta?.reportId || run.reportId || null,
        battleDate: core.battleDate || null,
        tier: core.tier ?? null,
        wave: core.wave ?? null,
        killedBy: core.killedBy || null,
        coins: core.coins ?? null,
        cells: core.cells ?? null,
        coinsPerHour: stats.coinsPerHour ?? core.coinsPerHour ?? null,
        cellsPerHour: stats.cellsPerHour ?? core.cellsPerHour ?? null,
        sections: Object.keys(run.sections || {}),
        archived: Boolean(run.meta?.archived),
        buildStyle: run.meta?.buildStyle || "unknown"
    };
}

function summariseCompare(compareData = null) {
    if (!compareData) return null;
    return { hasCore: Boolean(compareData.core), hasStats: Boolean(compareData.stats), sections: Object.keys(compareData.sections || {}), summary: compareData.summary || null };
}

function readStorageSnapshot() {
    if (typeof localStorage === "undefined") return { available: false, reason: "localStorage unavailable" };
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
        return { available: true, keyCount: keys.length, keys };
    } catch (error) {
        return { available: false, error: String(error?.message || error) };
    }
}

async function copyText(text = "") {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(String(text));
            return true;
        }
    } catch { /* fallback below */ }
    const textarea = document.createElement("textarea");
    textarea.value = String(text || "");
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); } finally { textarea.remove(); }
    return true;
}

function flashCopyStatus(message = "Copied") {
    const section = document.querySelector(".debug-section-title");
    if (!section) return;
    const original = section.textContent;
    section.textContent = message;
    setTimeout(() => { section.textContent = original; }, 900);
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 250);
}

function buildDownloadFilename(type = "debug-export") { return `tower-battle-intel-${type}-${buildUKFilenameTimestamp()}.json`; }
function formatStatus(status = "unknown") { return String(status || "unknown").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()); }
function healthToneForStatus(status = "unknown") { const value = String(status || "unknown").trim().toLowerCase(); if (value === "healthy") return "health-tone-good"; if (value.includes("warning") || value.includes("caution")) return "health-tone-warn"; if (value.includes("failed") || value.includes("critical") || value.includes("unhealthy") || value.includes("error")) return "health-tone-bad"; return "health-tone-info"; }
function healthToneForScore(score = 0) { const value = Number(score || 0); if (!Number.isFinite(value)) return "health-tone-info"; if (value >= 95) return "health-tone-good"; if (value >= 75) return "health-tone-warn"; return "health-tone-bad"; }
function safeClassName(value = "") { return String(value || "unknown").toLowerCase().replace(/[^a-z0-9_-]+/g, "-"); }
function escapeHTML(value = "") { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escapeAttr(value = "") { return escapeHTML(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
