"use strict";

/**
 * DASHBOARD GAME BRAIN VERIFICATION STRIP v4.11z52k
 *
 * Slim desktop-only report-quality trust strip. The collapsed Dashboard view
 * confirms the parser/Game Brain read without competing with the Run A/Run B
 * cards. Native details exposes the full read-quality proof without extra JS.
 */

import { buildRunGameBrainSummary } from "../../game/gameBrainRuntimeFeedback.js";
import { escapeHTML, escapeAttr } from "./sectionUtils.js";

export function buildDashboardGameBrainStrip(state = {}) {
    const runs = buildDashboardRunSummaries(state);
    const overall = buildOverallVerification(runs);
    const summaryChips = buildSummaryChips(runs, overall);

    return `
        <section class="tbi-card tbi-dashboard-gamebrain-strip tone-${escapeAttr(overall.tone)}" data-dashboard-gamebrain-strip="true" aria-label="Dashboard Game Brain verification">
            <details class="tbi-dashboard-gamebrain-details" data-dashboard-gamebrain-details="true">
                <summary class="tbi-dashboard-gamebrain-summary" aria-label="Game Brain verification summary and details toggle">
                    <div class="tbi-dashboard-gamebrain-title">
                        <span>Game Brain</span>
                        <h3>Verification</h3>
                    </div>
                    <strong class="tbi-dashboard-gamebrain-status tone-${escapeAttr(overall.tone)}">${escapeHTML(overall.status)}</strong>
                    <div class="tbi-dashboard-gamebrain-chips" aria-label="Verification summary">
                        ${summaryChips.map(chip => buildSummaryChip(chip)).join("")}
                    </div>
                    <b class="tbi-dashboard-gamebrain-toggle" aria-hidden="true">
                        <span class="is-closed">Details</span>
                        <span class="is-open">Hide</span>
                    </b>
                </summary>
                <div class="tbi-dashboard-gamebrain-proof">
                    <div class="tbi-dashboard-gamebrain-proof-note">
                        <span>Source-labelled</span>
                        <b>No hidden formula claims</b>
                    </div>
                    <div class="tbi-dashboard-gamebrain-grid ${runs.length === 1 ? "single" : ""}">
                        ${runs.length ? runs.map(item => buildDashboardVerificationRun(item)).join("") : buildEmptyVerificationRun()}
                        ${buildComparisonVerification(overall)}
                    </div>
                </div>
            </details>
        </section>
    `;
}

function buildDashboardRunSummaries(state = {}) {
    const entries = [];

    if (state.runA) {
        entries.push({ label: "Run A", side: "a", run: state.runA });
    }

    if (state.runB) {
        entries.push({ label: "Run B", side: "b", run: state.runB });
    }

    if (!entries.length && state.currentRun) {
        entries.push({ label: "Current Run", side: "current", run: state.currentRun });
    }

    return entries.map(item => ({
        ...item,
        summary: buildRunGameBrainSummary(item.run)
    }));
}

function buildSummaryChips(runs = [], overall = {}) {
    const chips = [];

    if (!runs.length) {
        chips.push({ label: "Report read", value: "Waiting", tone: "quiet" });
    }

    for (const item of runs) {
        const check = buildRunVerification(item.summary || {});
        chips.push({
            label: item.label || "Run",
            value: check.summaryValue,
            tone: check.tone
        });
    }

    chips.push({
        label: "Comparison",
        value: overall.safeLabel,
        tone: overall.tone
    });

    return chips;
}

function buildSummaryChip(chip = {}) {
    return `
        <span class="tone-${escapeAttr(chip.tone || "info")}">
            <small>${escapeHTML(chip.label || "Check")}</small>
            <b>${escapeHTML(chip.value || "—")}</b>
        </span>
    `;
}

function buildDashboardVerificationRun(item = {}) {
    const check = buildRunVerification(item.summary || {});

    return `
        <article class="tbi-dashboard-gamebrain-run run-${escapeAttr(item.side || "current")} tone-${escapeAttr(check.tone)}">
            <div class="tbi-dashboard-gamebrain-run-top">
                <strong>${escapeHTML(item.label || "Run")} Read Quality</strong>
                <b class="tone-${escapeAttr(check.tone)}">${escapeHTML(check.status)}</b>
            </div>
            <div class="tbi-dashboard-gamebrain-facts">
                ${check.facts.map(fact => buildFact(fact)).join("")}
            </div>
        </article>
    `;
}

function buildComparisonVerification(overall = {}) {
    const facts = [
        { label: "Comparison safe", value: overall.safeLabel, tone: overall.tone },
        { label: "Attention needed", value: overall.attentionLabel, tone: overall.attentionTone },
        { label: "Source mode", value: "Official/schema", tone: "info" },
        { label: "Formula claims", value: "None hidden", tone: "good" }
    ];

    return `
        <article class="tbi-dashboard-gamebrain-run run-compare tone-${escapeAttr(overall.tone)}">
            <div class="tbi-dashboard-gamebrain-run-top">
                <strong>Verification Summary</strong>
                <b class="tone-${escapeAttr(overall.tone)}">${escapeHTML(overall.summaryLabel)}</b>
            </div>
            <div class="tbi-dashboard-gamebrain-facts">
                ${facts.map(fact => buildFact(fact)).join("")}
            </div>
        </article>
    `;
}

function buildEmptyVerificationRun() {
    return `
        <article class="tbi-dashboard-gamebrain-run run-empty tone-quiet">
            <div class="tbi-dashboard-gamebrain-run-top">
                <strong>Report Read Quality</strong>
                <b class="tone-quiet">Waiting</b>
            </div>
            <div class="tbi-dashboard-gamebrain-facts">
                ${[
                    { label: "Labels", value: "Not parsed", tone: "quiet" },
                    { label: "Schema detail", value: "Unavailable", tone: "quiet" },
                    { label: "Mapping polish", value: "Waiting", tone: "quiet" },
                    { label: "Warnings", value: "None", tone: "quiet" }
                ].map(fact => buildFact(fact)).join("")}
            </div>
        </article>
    `;
}

function buildRunVerification(summary = {}) {
    const coverage = summary.labelCoverage || {};
    const total = asNumber(coverage.totalLabels);
    const known = asNumber(coverage.knownOfficialLabels);
    const schemaMapped = asNumber(coverage.schemaMappedLabels);
    const parserKnown = asNumber(coverage.parserKnownLabels);
    const unknown = asNumber(coverage.unknownLabels);
    const warnings = asNumber(summary.warningCount);
    const available = Boolean(summary.available);
    const hasIssues = unknown > 0 || warnings > 0;
    const tone = !available || !known ? "quiet" : hasIssues ? "watch" : "good";
    const status = !available ? "Waiting" : hasIssues ? "Review" : "Clean";

    return {
        tone,
        status,
        summaryValue: !available ? "Waiting" : hasIssues ? "Review" : "Clean",
        unknown,
        warnings,
        facts: [
            {
                label: "Labels",
                value: total ? `${known}/${total} recognised` : known ? `${known} recognised` : "Not parsed",
                tone: known ? "good" : "quiet"
            },
            {
                label: "Schema detail",
                value: schemaMapped ? `${schemaMapped} attached` : "Pending",
                tone: schemaMapped ? "info" : "quiet"
            },
            {
                label: "Mapping polish",
                value: unknown ? `${unknown} to review` : known ? "Clean" : "Waiting",
                tone: unknown ? "watch" : known ? "good" : "quiet"
            },
            {
                label: "Warnings",
                value: warnings ? `${warnings}` : "None",
                tone: warnings ? "watch" : available ? "good" : "quiet"
            },
            {
                label: "Known extras",
                value: parserKnown ? `${parserKnown} safe` : "None",
                tone: parserKnown ? "info" : "quiet"
            }
        ]
    };
}

function buildOverallVerification(runs = []) {
    const loaded = runs.filter(item => item?.summary?.available);
    const checks = loaded.map(item => buildRunVerification(item.summary));
    const totalUnknown = checks.reduce((sum, check) => sum + check.unknown, 0);
    const totalWarnings = checks.reduce((sum, check) => sum + check.warnings, 0);
    const hasIssues = totalUnknown > 0 || totalWarnings > 0;
    const tone = !loaded.length ? "quiet" : hasIssues ? "watch" : "good";

    return {
        tone,
        status: !loaded.length ? "Waiting" : hasIssues ? "Review needed" : "Clean read",
        summaryLabel: !loaded.length ? "Waiting" : hasIssues ? "Check notes" : "Safe",
        safeLabel: !loaded.length ? "Waiting" : hasIssues ? "Review first" : "Safe",
        attentionLabel: !loaded.length
            ? "Load report"
            : hasIssues
                ? `${totalUnknown + totalWarnings} item${totalUnknown + totalWarnings === 1 ? "" : "s"}`
                : "None",
        attentionTone: !loaded.length ? "quiet" : hasIssues ? "watch" : "good"
    };
}

function buildFact(fact = {}) {
    return `
        <span class="tone-${escapeAttr(fact.tone || "info")}">
            <small>${escapeHTML(fact.label || "Check")}</small>
            <b>${escapeHTML(fact.value || "—")}</b>
        </span>
    `;
}

function asNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
}

export default {
    buildDashboardGameBrainStrip
};
