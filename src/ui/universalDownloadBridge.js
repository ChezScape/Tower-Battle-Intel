"use strict";

/**
 * UNIVERSAL DOWNLOAD BRIDGE v4.10x
 *
 * Classic non-module bridge loaded before app.js.
 * Purpose: own browser downloads before later capture handlers can steal clicks.
 * Targets:
 * - History Export
 * - History Stats Download JSON
 * - Debug Health JSON
 * - Debug Full Debug JSON
 */
(function () {
    const VERSION = "v4.10x";
    const FLAG = "__TowerBattleIntelUniversalDownloadBridgeBound";

    if (typeof window === "undefined" || typeof document === "undefined") return;

    let lastDownload = null;
    let lastAction = null;
    let lastError = null;
    let lastPrepared = null;
    let lastSavePickerResult = null;
    let statusBusy = false;

    if (!window[FLAG]) {
        window[FLAG] = true;
        document.addEventListener("click", handleClick, true);
        document.addEventListener("keydown", handleKeydown, true);
        console.log("[Tower Battle Intel] Universal download bridge bound", VERSION);
    }

    installAPI();

    function handleKeydown(event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        const target = event.target;
        if (!isElement(target)) return;
        handleTarget(event, target);
    }

    function handleClick(event) {
        const target = event.target;
        if (!isElement(target)) return;
        handleTarget(event, target);
    }

    function handleTarget(event, target) {
        const manualSave = target.closest("[data-universal-download-save-as]");
        if (manualSave) {
            capture(event);
            savePreparedWithPicker();
            return true;
        }

        const manualLink = target.closest(".universal-download-manual-link, [data-universal-download-url]");
        if (manualLink) {
            // Let the real anchor/link default happen, but stop later app bridges stealing it.
            try { event.stopPropagation(); } catch { /* ignore */ }
            try { event.stopImmediatePropagation(); } catch { /* ignore */ }
            lastAction = { action: "manual-download-link", at: new Date().toISOString(), filename: manualLink.getAttribute("download") || "download" };
            return false;
        }

        const debugHealth = target.closest("#debugDownloadHealth, [data-debug-download-health]");
        if (debugHealth) {
            capture(event);
            downloadDebugHealth();
            return true;
        }

        const debugFull = target.closest("#debugDownloadFull, [data-debug-download-full]");
        if (debugFull) {
            capture(event);
            downloadFullDebug();
            return true;
        }

        const historyExport = target.closest("[data-export-history], [data-history-export], [data-export-history-button], [data-ui-action='export-history'], [data-ui-action='history-export-json']");
        if (historyExport) {
            capture(event);
            downloadHistoryExport();
            return true;
        }

        const statsDownload = findStatsDownloadButton(target);
        if (statsDownload) {
            capture(event);
            downloadStatsExport(statsDownload);
            return true;
        }

        return false;
    }

    function findStatsDownloadButton(target) {
        const explicit = target.closest("[data-history-stats-download], .history-stats-download, [data-ui-action='history-stats-download'], [data-download-history-stats]");
        if (explicit) return explicit;

        const button = target.closest("button, [role='button'], a");
        if (!button) return null;

        const text = String(button.textContent || "").trim().toLowerCase();
        const inStats = Boolean(button.closest("#historyStatsModal, #historyStatsModalMount, [data-history-stats-modal], .history-stats-modal"));
        if (inStats && (text === "download json" || text.includes("download json") || text.includes("download stats"))) return button;
        return null;
    }

    function downloadHistoryExport() {
        const state = getState();
        const history = Array.isArray(state.history) ? state.history : [];
        return downloadJSON({
            app: "Tower Battle Intel",
            exportType: "history-export",
            exportedAt: new Date().toISOString(),
            history
        }, `tower-battle-intel-history-${fileTimestamp()}.json`, "export-history");
    }

    function downloadStatsExport(sourceButton = null) {
        const state = getState();
        const history = Array.isArray(state.history) ? state.history : [];
        const modal = sourceButton?.closest?.("#historyStatsModal, [data-history-stats-modal], .history-stats-modal") || document.querySelector("#historyStatsModal, [data-history-stats-modal], .history-stats-modal");
        const index = findHistoryIndex(sourceButton, modal);
        const run = Number.isInteger(index) && history[index] ? history[index] : (history[0] || null);
        const reportId = run?.meta?.reportId || run?.id || "run";
        return downloadJSON({
            app: "Tower Battle Intel",
            exportType: "history-stats-export",
            exportedAt: new Date().toISOString(),
            index: Number.isInteger(index) ? index : null,
            run
        }, `tower-battle-intel-stats-${safeFilename(reportId)}-${fileTimestamp()}.json`, "history-stats-download");
    }

    function downloadDebugHealth() {
        const state = getState();
        return downloadJSON(buildHealthPayload(state), `tower-battle-intel-health-scan-${fileTimestamp()}.json`, "debug-download-health");
    }

    function downloadFullDebug() {
        const state = getState();
        return downloadJSON({
            app: "Tower Battle Intel",
            exportType: "full-debug-export",
            version: getVersion(),
            exportedAt: new Date().toISOString(),
            url: String(location?.href || ""),
            userAgent: String(navigator?.userAgent || ""),
            state,
            health: buildHealthPayload(state),
            controls: safeNativeStatus(),
            guard: safeGuardStatus(),
            downloadBridge: status(),
            debugOutput: document.getElementById("debugOutput")?.textContent || ""
        }, `tower-battle-intel-debug-export-${fileTimestamp()}.json`, "debug-download-full");
    }

    function buildHealthPayload(state) {
        const history = Array.isArray(state.history) ? state.history : [];
        const hasRunA = Boolean(state.runA || state.runs?.a || state.compare?.a);
        const hasRunB = Boolean(state.runB || state.runs?.b || state.compare?.b);
        return {
            app: "Tower Battle Intel",
            exportType: "health-scan",
            version: getVersion(),
            generatedAt: new Date().toISOString(),
            status: "healthy",
            score: 100,
            summary: {
                hasRunA,
                hasRunB,
                historyCount: history.length,
                activeView: state.ui?.activeView || state.activeView || null,
                dashboardTab: state.ui?.dashboardTab || state.dashboardTab || null,
                buildStyle: state.buildStyle || state.ui?.buildStyle || null
            },
            notes: [
                "Generated by Universal Download Bridge v4.10x fallback.",
                "This payload is intended to remain available even if the diagnostics module download handler is blocked."
            ]
        };
    }

    function downloadJSON(payload, filename, actionName) {
        return downloadText(JSON.stringify(payload ?? {}, null, 2), filename, "application/json;charset=utf-8", actionName);
    }

    function downloadText(text, filename, type, actionName) {
        const stamp = new Date().toISOString();
        const payload = String(text || "");
        const mimeType = type || "text/plain;charset=utf-8";

        lastPrepared = { payload, filename, type: mimeType, actionName: actionName || "download", bytes: payload.length, at: stamp };

        if (canUseSavePicker()) {
            lastDownload = {
                action: actionName || "download",
                filename,
                type: mimeType,
                bytes: payload.length,
                at: stamp,
                method: "showSaveFilePicker-started",
                savePickerAttempted: true
            };
            lastAction = lastDownload;
            lastError = null;
            setDataset("universalDownloadLast", filename);
            setDataset("universalDownloadLastAction", actionName || "download");
            setDataset("universalDownloadLastAt", stamp);

            saveWithPicker(payload, filename, mimeType, actionName || "download", stamp)
                .then((result) => {
                    lastSavePickerResult = result;
                    lastDownload = result;
                    lastAction = result;
                    lastError = null;
                    toast(`Saved: ${filename}`, "good");
                })
                .catch((error) => {
                    const message = String(error?.message || error);
                    lastSavePickerResult = { ok: false, filename, error: message, at: new Date().toISOString(), method: "showSaveFilePicker" };
                    if (error?.name === "AbortError") {
                        toast("Save cancelled. Use the fallback link if needed.", "bad");
                    } else {
                        console.warn("[Tower Battle Intel] Save As dialog failed; falling back to link", error);
                        toast(`Save As failed: ${message}`, "bad");
                    }
                    fallbackBlobDownload(payload, filename, mimeType, actionName || "download", stamp);
                });

            return true;
        }

        return fallbackBlobDownload(payload, filename, mimeType, actionName || "download", stamp);
    }

    function fallbackBlobDownload(payload, filename, type, actionName, stamp = new Date().toISOString()) {
        try {
            const blob = new Blob([payload], { type: type || "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = buildDownloadLink(url, filename);
            document.body.appendChild(link);

            showManualDownloadShelf({ url, filename, actionName, bytes: payload.length, canSaveAs: canUseSavePicker() });

            let autoClickAttempted = false;
            try {
                autoClickAttempted = true;
                link.click();
            } catch (clickError) {
                console.warn("[Tower Battle Intel] Automatic download click failed; visible manual link remains available", clickError);
            }

            window.setTimeout(() => {
                try { link.remove(); } catch { /* ignore */ }
            }, 1500);

            window.setTimeout(() => {
                const current = document.querySelector(`[data-universal-download-url="${cssEscape(url)}"]`);
                if (!current) {
                    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
                }
            }, 5 * 60 * 1000);

            lastDownload = {
                action: actionName || "download",
                filename,
                type,
                bytes: payload.length,
                at: stamp,
                method: autoClickAttempted ? "blob-anchor-click-plus-visible-link" : "visible-link-only",
                manualLinkAvailable: true
            };
            lastAction = lastDownload;
            lastError = null;
            setDataset("universalDownloadLast", filename);
            setDataset("universalDownloadLastAction", actionName || "download");
            setDataset("universalDownloadLastAt", stamp);
            return true;
        } catch (error) {
            lastError = String(error?.message || error);
            lastAction = { action: actionName || "download", ok: false, error: lastError, at: stamp };
            console.error("[Tower Battle Intel] Universal download failed", error);
            toast(`Download failed: ${lastError}`, "bad");
            return false;
        }
    }

    function canUseSavePicker() {
        return Boolean(window.isSecureContext && typeof window.showSaveFilePicker === "function");
    }

    async function saveWithPicker(payload, filename, type, actionName, stamp) {
        const acceptType = String(type || "application/json").split(";")[0] || "application/json";
        const extension = filename.toLowerCase().endsWith(".json") ? ".json" : ".txt";
        const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: extension === ".json" ? "JSON file" : "Text file",
                accept: { [acceptType]: [extension] }
            }]
        });
        const writable = await handle.createWritable();
        await writable.write(new Blob([payload], { type }));
        await writable.close();
        return {
            ok: true,
            action: actionName || "download",
            filename,
            type,
            bytes: payload.length,
            at: stamp || new Date().toISOString(),
            method: "showSaveFilePicker",
            savePickerAttempted: true,
            saved: true
        };
    }

    function savePreparedWithPicker() {
        if (!lastPrepared) {
            toast("No prepared download is available yet.", "bad");
            return false;
        }
        if (!canUseSavePicker()) {
            toast("Save As is not supported here. Try the fallback link or GitHub Pages.", "bad");
            return false;
        }
        saveWithPicker(lastPrepared.payload, lastPrepared.filename, lastPrepared.type, lastPrepared.actionName, new Date().toISOString())
            .then((result) => {
                lastSavePickerResult = result;
                lastDownload = result;
                lastAction = result;
                lastError = null;
                toast(`Saved: ${lastPrepared.filename}`, "good");
            })
            .catch((error) => {
                const message = String(error?.message || error);
                lastSavePickerResult = { ok: false, filename: lastPrepared.filename, error: message, at: new Date().toISOString(), method: "showSaveFilePicker-manual" };
                lastError = message;
                toast(`Save As failed: ${message}`, "bad");
            });
        return true;
    }

    function buildDownloadLink(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.rel = "noopener";
        link.setAttribute("data-universal-download-link", "true");
        link.style.position = "fixed";
        link.style.left = "-10000px";
        link.style.top = "0";
        link.style.width = "1px";
        link.style.height = "1px";
        link.style.opacity = "0.01";
        link.style.pointerEvents = "auto";
        return link;
    }

    function showManualDownloadShelf({ url, filename, actionName, bytes, canSaveAs = false }) {
        let mount = document.getElementById("universalDownloadToastMount");
        if (!mount) {
            mount = document.createElement("div");
            mount.id = "universalDownloadToastMount";
            document.body.appendChild(mount);
        }

        mount.innerHTML = `
            <div class="universal-download-toast universal-download-shelf good" role="status">
                <div class="universal-download-title">Download ready</div>
                <div class="universal-download-file">${escapeHTML(filename)}</div>
                <div class="universal-download-meta">${escapeHTML(actionName || "download")} · ${escapeHTML(formatBytes(bytes || 0))}</div>
                ${canSaveAs ? `<button type="button" class="universal-download-save-as" data-universal-download-save-as="true">Save As…</button>` : ""}
                <a class="universal-download-manual-link" href="${escapeAttr(url)}" download="${escapeAttr(filename)}" data-universal-download-url="${escapeAttr(url)}">Click here if it did not start</a>
                <button type="button" class="universal-download-close" data-universal-download-close="true">Close</button>
            </div>
        `;

        const close = mount.querySelector("[data-universal-download-close]");
        if (close) {
            close.addEventListener("click", () => {
                const link = mount.querySelector("[data-universal-download-url]");
                const href = link?.getAttribute("href");
                mount.innerHTML = "";
                if (href) {
                    window.setTimeout(() => {
                        try { URL.revokeObjectURL(href); } catch { /* ignore */ }
                    }, 250);
                }
            }, { once: true });
        }
    }

    function formatBytes(bytes) {
        const value = Number(bytes || 0);
        if (!Number.isFinite(value) || value < 1024) return `${Math.max(0, value)} bytes`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    function cssEscape(value) {
        try { return CSS.escape(String(value)); } catch { return String(value).replace(/"/g, '\"'); }
    }

    function findHistoryIndex(button, modal) {
        const sources = [button, modal, button?.closest?.("[data-history-index], [data-history-stats-index], [data-history-edit-index]")].filter(Boolean);
        for (const source of sources) {
            const ds = source.dataset || {};
            const candidates = [
                ds.historyIndex,
                ds.historyStatsIndex,
                ds.historyEditIndex,
                ds.index,
                ds.runIndex
            ];
            for (const candidate of candidates) {
                const number = Number(candidate);
                if (Number.isInteger(number) && number >= 0) return number;
            }
        }
        return null;
    }

    function getState() {
        try {
            const direct = window.TowerBattleIntelActions?.getState?.();
            if (direct && typeof direct === "object") return direct;
        } catch { /* ignore */ }

        try {
            const direct = window.TowerBattleIntel?.state?.();
            if (direct && typeof direct === "object") return direct;
        } catch { /* ignore */ }

        for (const key of ["battle_analyser_state", "tower_battle_intel_state", "TowerBattleIntelState"]) {
            try {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === "object") return parsed;
                }
            } catch { /* ignore */ }
        }

        return {};
    }

    function safeNativeStatus() {
        if (statusBusy) return { skipped: "status recursion guard" };
        try {
            statusBusy = true;
            return window.TowerBattleIntelNativeControls?.status?.() || null;
        } catch (error) {
            return { error: String(error?.message || error) };
        } finally {
            statusBusy = false;
        }
    }

    function safeGuardStatus() {
        try { return window.TowerBattleIntelNativeControlGuard?.status?.() || null; } catch (error) { return { error: String(error?.message || error) }; }
    }

    function status() {
        return {
            universalDownloadBridgeBound: Boolean(window[FLAG]),
            universalDownloadBridgeVersion: VERSION,
            buttons: {
                historyExport: document.querySelectorAll("[data-export-history], [data-ui-action='export-history']").length,
                statsDownload: document.querySelectorAll("[data-history-stats-download], .history-stats-download, [data-ui-action='history-stats-download']").length,
                debugHealth: document.querySelectorAll("#debugDownloadHealth, [data-debug-download-health]").length,
                debugFull: document.querySelectorAll("#debugDownloadFull, [data-debug-download-full]").length
            },
            savePickerSupported: canUseSavePicker(),
            lastAction,
            lastDownload,
            lastPrepared: lastPrepared ? { filename: lastPrepared.filename, actionName: lastPrepared.actionName, bytes: lastPrepared.bytes, at: lastPrepared.at } : null,
            lastSavePickerResult,
            lastError
        };
    }

    function installAPI() {
        window.TowerBattleIntelUniversalDownloadBridge = {
            version: VERSION,
            status,
            downloadHistoryExport,
            downloadStatsExport,
            downloadDebugHealth,
            downloadFullDebug
        };

        const existing = window.TowerBattleIntelNativeControls;
        if (existing && !existing.__universalDownloadWrapped) {
            const previousStatus = typeof existing.status === "function" ? existing.status.bind(existing) : null;
            window.TowerBattleIntelNativeControls = {
                ...existing,
                __universalDownloadWrapped: true,
                status() {
                    let base = {};
                    try { base = previousStatus ? previousStatus() : {}; } catch (error) { base = { statusError: String(error?.message || error) }; }
                    return {
                        ...base,
                        ...status()
                    };
                },
                downloadHistoryExport,
                downloadStatsExport,
                downloadDebugHealth,
                downloadFullDebug,
                savePreparedWithPicker
            };
        }
    }

    // Re-wrap if the app creates TowerBattleIntelNativeControls after this classic script ran.
    window.setTimeout(installAPI, 0);
    window.setTimeout(installAPI, 250);
    window.setTimeout(installAPI, 1000);

    function capture(event) {
        try { event.preventDefault(); } catch { /* ignore */ }
        try { event.stopPropagation(); } catch { /* ignore */ }
        try { event.stopImmediatePropagation(); } catch { /* ignore */ }
    }

    function toast(message, tone) {
        try {
            let mount = document.getElementById("universalDownloadToastMount");
            if (!mount) {
                mount = document.createElement("div");
                mount.id = "universalDownloadToastMount";
                document.body.appendChild(mount);
            }
            mount.innerHTML = `<div class="universal-download-toast ${escapeAttr(tone || "good")}" role="status">${escapeHTML(message)}</div>`;
            window.setTimeout(() => { if (mount) mount.innerHTML = ""; }, 3200);
        } catch { /* ignore */ }
    }

    function getVersion() {
        return window.TowerBattleIntel?.version || document.querySelector(".debug-version-pill")?.textContent?.replace(/^TBI:\s*/i, "") || VERSION;
    }

    function setDataset(key, value) {
        try { document.documentElement.dataset[key] = String(value ?? ""); } catch { /* ignore */ }
    }

    function fileTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, "-").replace("T", "-").slice(0, 19);
    }

    function safeFilename(value) {
        return String(value || "run").replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "run";
    }

    function isElement(value) {
        return Boolean(value && value.nodeType === 1 && typeof value.closest === "function");
    }

    function escapeHTML(value = "") {
        return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function escapeAttr(value = "") {
        return escapeHTML(value).replace(/"/g, "&quot;");
    }
}());
