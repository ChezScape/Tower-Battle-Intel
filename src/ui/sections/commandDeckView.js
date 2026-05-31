"use strict";

/**
 * COMMAND DECK BUILD STYLE NO-RENDER RETENTION v4.11z52w47
 *
 * Command Deck is now the app control room / report intake desk.
 * Dashboard stays protected; other workspaces remain blank reset shells.
 */

import { buildBlankWorkspace, buildMoreResetView } from "./workspaceResetView.js";
import { escapeHTML, escapeAttr, formatNumber } from "./sectionUtils.js";
import { normaliseRawArchive } from "../../storage/rawReportArchiveStore.js";

const BUILD_OPTIONS = Object.freeze([
    ["unknown", "Unknown"],
    ["health_ehp", "Health / EHP"],
    ["blender", "Blender"],
    ["devo", "Devo"],
    ["orb_devo", "Orb Devo"],
    ["glass_cannon", "Glass Cannon"],
    ["hybrid", "Hybrid"]
]);

export function buildCommandDeckView(state = {}) {
    const history = Array.isArray(state.history) ? state.history : [];
    const buildStyle = state.ui?.buildStyle || "unknown";
    const feedbackDraft = state.ui?.lastCommandFeedback?.keepInput
        ? String(state.ui?.lastCommandFeedback?.inputDraft || "")
        : "";
    const lastInput = typeof state.lastInput === "string" && state.lastInput
        ? state.lastInput
        : feedbackDraft;
    const latest = history.at(-1) || null;

    return `
        <div class="tbi-command-clean-view" data-command-clean-foundation="v4.11z52w47">
            <main class="tbi-command-clean-main">
                ${buildCommandHero(state)}
                ${buildReportIntake({ buildStyle, lastInput })}
                ${buildActionResultShell(state)}
                ${buildReportFlow(state, latest)}
            </main>

            <aside class="tbi-command-clean-side">
                ${buildCurrentSnapshot(state, latest)}
                ${buildHealthSnapshot(state)}
                ${buildCommandRules()}
            </aside>
        </div>
    `;
}

function buildCommandHero(state = {}) {
    return `
        <section class="tbi-card tbi-command-hero-card">
            <div class="tbi-command-kicker">Command Deck</div>
            <div class="tbi-command-hero-top">
                <div>
                    <h2>Report Intake & Control Room</h2>
                    <p>Paste Battle Reports, validate what TBI sees, save the raw source safely, then manage saved runs in History and load clean runs into Dashboard.</p>
                </div>
                <span class="tbi-command-mode-pill">Raw archive flow</span>
            </div>

            <div class="tbi-command-mission-grid" aria-label="Command Deck report flow">
                ${missionStep("1", "Paste", "Single or batch Battle Reports")}
                ${missionStep("2", "Validate", "Parser + Game Brain check")}
                ${missionStep("3", "Save", "Raw Source + History cache")}
                ${missionStep("4", "Manage", "History owns stats, edit, archive and Run A/B")}
            </div>
        </section>
    `;
}

function buildReportIntake({ buildStyle = "unknown", lastInput = "" } = {}) {
    return `
        <section class="tbi-card tbi-command-intake-card" aria-label="Battle Report intake">
            <div class="tbi-card-heading tbi-command-section-heading">
                <div>
                    <h3>Battle Report Intake</h3>
                    <p>Paste one report or a batch separated by lines such as <strong>---</strong>. The result card below stays in the page so it is not lost.</p>
                </div>
                <span class="tbi-command-source-pill">Local only</span>
            </div>

            <textarea
                class="tbi-command-report-input"
                data-command-report-input="true"
                spellcheck="false"
                placeholder="Paste Battle Report Here..."
                aria-label="Battle report input"
            >${escapeHTML(lastInput)}</textarea>

            <div class="tbi-command-intake-toolbar">
                <label class="tbi-command-build-select" for="commandBuildStyleSelect">
                    <span>Build style</span>
                    <select id="commandBuildStyleSelect" data-build-style-select="true" aria-label="Select build style">
                        ${BUILD_OPTIONS.map(([value, label]) => `
                            <option value="${escapeAttr(value)}" ${value === buildStyle ? "selected" : ""}>${escapeHTML(label)}</option>
                        `).join("")}
                    </select>
                </label>

                <div class="tbi-command-action-row" aria-label="Battle report actions">
                    ${commandButton("validate-report", "Validate", "Check only")}
                    ${commandButton("save-report", "Save Report", "Store in History", "primary")}
                    ${commandButton("save-load-dashboard", "Save + Dashboard", "Load latest")}
                    ${commandButton("clear-input", "Clear Input", "Keep history")}
                </div>
            </div>
        </section>
    `;
}

function buildActionResultShell(state = {}) {
    const feedback = state.ui?.lastCommandFeedback || null;
    const feedbackHTML = feedback
        ? buildCommandFeedbackHTML(feedback)
        : buildEmptyFeedbackHTML();

    return `
        <section class="tbi-card tbi-command-result-card" aria-label="Action result">
            <div class="tbi-card-heading tbi-command-section-heading">
                <div>
                    <h3>Action Result</h3>
                    <p>Validate, save, duplicate and Game Brain feedback stays here.</p>
                </div>
                <span class="tbi-command-source-pill">In-page feedback</span>
            </div>

            ${feedbackHTML}
        </section>
    `;
}

function buildEmptyFeedbackHTML() {
    return `
        <div id="saveReportFeedback" class="save-report-feedback command-result-placeholder" role="status" aria-live="polite">
            <div class="save-report-feedback-head">
                <strong>Ready for report intake</strong>
                <em>Waiting</em>
            </div>
            <span class="save-report-feedback-main">Paste a Battle Report, then validate or save it. This card stays visible with the result and Game Brain facts.</span>
            <div class="tbi-command-result-empty-grid">
                ${resultHint("Single report", "Checks one Battle Report")}
                ${resultHint("Batch report", "Counts loaded and duplicate reports")}
                ${resultHint("Game Brain", "Tier/Wave, Killed By, checkpoint")}
            </div>
        </div>
    `;
}

function buildCommandFeedbackHTML(feedback = {}) {
    const tone = feedback.status === "saved" || feedback.status === "checked"
        ? "good"
        : feedback.status === "duplicate"
            ? "warn"
            : "bad";
    const parser = feedback.parserFeedback || null;
    const facts = Array.isArray(parser?.quickFacts) ? parser.quickFacts.slice(0, 7) : [];
    const lines = Array.isArray(parser?.summaryLines) ? parser.summaryLines.slice(0, 3) : [];

    return `
        <div id="saveReportFeedback" class="save-report-feedback ${escapeAttr(tone)}" role="status" aria-live="polite">
            <div class="save-report-feedback-head">
                <strong>${escapeHTML(feedback.title || "Action result")}</strong>
                ${feedback.reportId ? `<em>${escapeHTML(feedback.reportId)}</em>` : ""}
            </div>
            <span class="save-report-feedback-main">${escapeHTML(feedback.message || "Action finished.")}</span>
            ${parser ? `
                <div class="save-report-gamebrain ${escapeAttr(parser.tone || "info")}" aria-label="Game Brain report summary">
                    <div class="save-report-gamebrain-title">Game Brain summary</div>
                    ${parser.headline ? `<p>${escapeHTML(parser.headline)}</p>` : ""}
                    ${facts.length ? `<div class="save-report-gamebrain-facts">${facts.map(item => `
                        <span class="save-report-gamebrain-fact ${escapeAttr(item.tone || "info")}">
                            <small>${escapeHTML(item.label)}</small>
                            <b>${escapeHTML(item.value)}</b>
                        </span>
                    `).join("")}</div>` : ""}
                    ${lines.length ? `<ul class="save-report-gamebrain-lines">${lines.map(line => `<li>${escapeHTML(line)}</li>`).join("")}</ul>` : ""}
                </div>
            ` : ""}
        </div>
    `;
}

function buildReportFlow(state = {}, latest = null) {
    const feedback = state.ui?.lastCommandFeedback || null;
    const savedRecently = feedback?.status === "saved" && latest;
    const title = savedRecently ? "After Save" : "Report Flow";
    const description = savedRecently
        ? `Latest saved: ${runLabel(latest)}. Use History to inspect, edit, archive, or assign Run A / Run B.`
        : "Use this deck to validate and save reports. History owns saved-run management; Settings will own global data management later.";

    return `
        <section class="tbi-card tbi-command-next-card" aria-label="Report flow">
            <div class="tbi-card-heading tbi-command-section-heading">
                <div>
                    <h3>${escapeHTML(title)}</h3>
                    <p>${escapeHTML(description)}</p>
                </div>
                <span class="tbi-command-source-pill">No Compare route</span>
            </div>

            <div class="tbi-command-next-grid">
                ${routeButton("open-history", savedRecently ? "View in History" : "Open History", savedRecently ? "Stats, edit, archive, Run A/B" : "Saved report library")}
                ${routeButton("open-dashboard", "Open Dashboard", "View loaded Run A / Run B")}
                ${routeButton("clear-input", savedRecently ? "Paste Another" : "Clear Input", savedRecently ? "Ready for next report" : "Clear the intake box")}
                ${routeButton("export-history", "Export Backup", "History + Raw Sources JSON")}
                ${routeButton("import-history", "Import Backup", "Load History JSON")}
            </div>
        </section>
    `;
}

function buildCurrentSnapshot(state = {}, latest = null) {
    const history = Array.isArray(state.history) ? state.history : [];
    const rawSourceCount = getRawSourceCount(state);
    const archivedCount = history.filter(run => Boolean(run?.meta?.archived || run?.archived)).length;

    return `
        <section class="tbi-card tbi-command-side-card tbi-command-current-card">
            <div class="tbi-command-kicker">Current Loadout</div>
            <h3>Report State</h3>
            <div class="tbi-command-side-stat-grid tbi-command-report-state-grid">
                ${sideStat("Run A", runLabel(state.runA), state.runA ? "run-a" : "neutral", state.runA ? "Active slot" : "Empty slot")}
                ${sideStat("Run B", runLabel(state.runB), state.runB ? "run-b" : "neutral", state.runB ? "Active slot" : "Empty slot")}
                ${sideStat("Library", `${history.length} saved · ${archivedCount} archived`, history.length ? "good" : "neutral")}
                ${sideStat("Raw Report Sources", `${rawSourceCount} source records`, rawSourceCount ? "good" : "neutral")}
                ${sideStat("Latest Saved", latest ? runLabel(latest) : "None")}
                ${sideStat("Build Style", formatBuildStyle(state.ui?.buildStyle || "unknown"))}
            </div>
        </section>
    `;
}

function buildHealthSnapshot(state = {}) {
    const history = Array.isArray(state.history) ? state.history : [];
    const rawSourceCount = getRawSourceCount(state);

    return `
        <section class="tbi-card tbi-command-side-card tbi-command-health-card">
            <div class="tbi-command-kicker">Intake Health</div>
            <h3>Report Intake Health</h3>
            <div class="tbi-command-readiness-list">
                ${readinessRow("Parser", "Ready", "good")}
                ${readinessRow("Raw Archive", rawSourceCount ? `${rawSourceCount} source records` : "Active / no source records", rawSourceCount ? "good" : "info")}
                ${readinessRow("History Cache", `${history.length} parsed reports`, history.length ? "good" : "info")}
                ${readinessRow("Duplicate Check", "Active", "good")}
                ${readinessRow("Storage", "Local browser", "info")}
                ${readinessRow("Import / Export", "Ready", "good")}
            </div>
        </section>
    `;
}

function buildCommandRules() {
    return `
        <section class="tbi-card tbi-command-side-card tbi-command-rules-card">
            <div class="tbi-command-kicker">Command Rules</div>
            <h3>What belongs here</h3>
            <ul class="tbi-command-rule-list">
                <li>Paste, validate and save reports here.</li>
                <li>Raw Battle Report text is the source of truth for new saves.</li>
                <li>Use History for stats, edit, archive, delete, and Run A / Run B.</li>
                <li>Use Settings later for global data management and dangerous resets.</li>
            </ul>
        </section>
    `;
}

export function buildSettingsView(state = {}) {
    return buildBlankWorkspace({
        key: "settings",
        title: "Settings",
        intro: "Settings has been cleared ready for a clean settings rebuild.",
        next: "Rebuild Settings after Command Deck and History are stable."
    });
}

export function buildMoreView(state = {}) {
    return buildMoreResetView();
}

function missionStep(number, title, detail) {
    return `
        <div class="tbi-command-mission-step">
            <span>${escapeHTML(number)}</span>
            <strong>${escapeHTML(title)}</strong>
            <em>${escapeHTML(detail)}</em>
        </div>
    `;
}

function commandButton(action, label, detail, extraClass = "") {
    return `
        <button type="button" class="tbi-command-action-button ${escapeAttr(extraClass)}" data-ui-action="${escapeAttr(action)}">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(detail)}</span>
        </button>
    `;
}

function routeButton(action, label, detail) {
    return `
        <button type="button" class="tbi-command-route-button" data-ui-action="${escapeAttr(action)}">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(detail)}</span>
        </button>
    `;
}

function sideStat(label, value, tone = "neutral", detail = "") {
    const key = String(label || "stat")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "stat";

    return `
        <div class="tbi-command-side-stat ${escapeAttr(tone)}" data-command-side-stat="${escapeAttr(key)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
            ${detail ? `<em>${escapeHTML(detail)}</em>` : ""}
        </div>
    `;
}

function readinessRow(label, value, tone = "info") {
    return `
        <div class="tbi-command-readiness-row ${escapeAttr(tone)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function resultHint(label, value) {
    return `
        <span>
            <small>${escapeHTML(label)}</small>
            <b>${escapeHTML(value)}</b>
        </span>
    `;
}

function getRawSourceCount(state = {}) {
    const rawArchive = state.rawArchive || state.rawReportArchive || null;
    const rawBackedHistoryCount = getRawBackedHistoryCount(state.history);

    if (!rawArchive) {
        return rawBackedHistoryCount;
    }

    let count = 0;

    if (Array.isArray(rawArchive)) {
        count = rawArchive.length;
    } else if (Array.isArray(rawArchive?.reports)) {
        count = Number(rawArchive.reportCount || rawArchive.reports.length || 0);
    } else if (Array.isArray(rawArchive?.records)) {
        count = Number(rawArchive.reportCount || rawArchive.records.length || 0);
    } else {
        const normalised = normaliseRawArchive(rawArchive);
        count = Number(normalised.reportCount || normalised.reports?.length || rawArchive?.reportCount || 0) || 0;
    }

    return Math.max(count, rawBackedHistoryCount);
}

function getRawBackedHistoryCount(history = []) {
    return (Array.isArray(history) ? history : []).filter(run => Boolean(
        run?.raw?.reportText
        || run?.rawText
        || run?.rawReportText
        || run?.meta?.rawText
        || run?.meta?.reportText
    )).length;
}

function runLabel(run = null) {
    if (!run) return "Empty";

    const tier = run.core?.tier || run.tier || "?";
    const wave = run.core?.wave || run.wave || "?";
    const killedBy = run.core?.killedBy || run.killedBy || "";
    const waveText = formatRawWaveNumber(wave);

    return killedBy
        ? `T${tier} / Wave ${waveText} · ${killedBy}`
        : `T${tier} / Wave ${waveText}`;
}

function formatRawWaveNumber(value = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return String(value || "?");
    }

    return String(Math.round(number));
}

function formatBuildStyle(value = "unknown") {
    const match = BUILD_OPTIONS.find(([key]) => key === value);
    return match ? match[1] : "Unknown";
}

export default {
    buildCommandDeckView,
    buildSettingsView,
    buildMoreView
};
