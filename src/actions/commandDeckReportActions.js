"use strict";

/**
 * COMMAND DECK REPORT ACTIONS v4.11z52w16
 *
 * Command Deck is the single visible report-intake owner. It plans raw archive
 * saves first, blocks duplicate raw reports by stable ID/fingerprint, then lets
 * the parser rebuild the History cache from new raw source text only.
 */

import {
    saveReportToHistory,
    refreshAnalysis
} from "../core/update.js";

import {
    getState,
    setState
} from "../core/state.js";

import {
    loadHistoryRun
} from "../core/history.js";

import {
    saveStorage
} from "../storage/localStore.js";

import {
    splitBattleReports
} from "../utils/reportSplitter.js";

import {
    parser as parseBattleReport
} from "../pipeline/parser.js";

import {
    buildCommandDeckRawIntakePlan,
    applyCommandDeckRawArchivePlan,
    joinCommandDeckRawReports,
    describeCommandDeckRawRecord
} from "./commandDeckRawIntake.js";

export function cacheCommandInputDraft(inputOrText = null) {

    const text = typeof inputOrText === "string"
        ? inputOrText
        : String(inputOrText?.value || "");

    setState({
        lastInput: text
    });

    if (typeof window !== "undefined") {
        window.TowerBattleIntelCommandInputDraft = text;
    }

    return text;
}

export function actionValidateReportFromInput(input = null) {

    const target = resolveReportInput(input);
    const text = getInputText(target);

    if (text.trim()) {
        cacheCommandInputDraft(text);
    }

    if (!text.trim()) {
        const feedback = buildSaveFeedback({
            status: "empty",
            loaded: false,
            title: "Validate Report",
            message: "No report checked. Paste a Battle Report first.",
            inputDraft: "",
            keepInput: false
        });
        showSaveReportFeedback(feedback);
        return feedback;
    }

    const plan = buildCommandDeckRawIntakePlan(text, getState());
    const candidateIds = plan.candidateIds;
    const parserFeedback = buildSaveParserFeedback({
        runs: [],
        rawText: text,
        addedIds: [],
        duplicateIds: plan.duplicateIds,
        candidateIds,
        rawIntakePlan: plan
    });

    const reportCount = parserFeedback?.reportCount || plan.reportCount || splitBattleReports(text).length || 1;
    const feedback = buildSaveFeedback({
        status: "checked",
        loaded: false,
        title: "Validate Report",
        candidateIds,
        parserFeedback,
        inputDraft: text,
        keepInput: true,
        message: reportCount === 1
            ? "Report checked. Nothing has been saved yet."
            : `${reportCount} reports checked. Nothing has been saved yet.`
    });

    showSaveReportFeedback(feedback);
    persist({ lastInput: text });
    return feedback;
}

export function actionSaveAndLoadDashboard(input = null) {

    const target = resolveReportInput(input);
    const feedback = actionSaveReportFromInput(target);

    if (feedback?.loaded && Array.isArray(feedback.addedIds) && feedback.addedIds.length) {
        const state = getState();
        const history = Array.isArray(state.history) ? state.history : [];
        const targetId = feedback.addedIds[feedback.addedIds.length - 1];
        const index = history.findIndex(run => getRunReportId(run) === targetId);

        if (index >= 0) {
            loadHistoryRun(index, "runA");
            refreshAnalysis({ reason: "command_save_load_dashboard", historyIndex: index, targetSlot: "runA" });
        }

        setCommandDashboardTab("overview");
        persist();
    }

    return feedback;
}

export function actionSaveReportFromInput(input = null) {

    const target = resolveReportInput(input);
    const text = getInputText(target);

    if (text.trim()) {
        cacheCommandInputDraft(text);
    }

    if (!text.trim()) {
        if (target) {
            target.placeholder = "Paste a battle report first...";
        }
        const feedback = buildSaveFeedback({
            status: "empty",
            loaded: false,
            message: "No report loaded. Paste a battle report first.",
            inputDraft: "",
            keepInput: false
        });
        showSaveReportFeedback(feedback);
        console.warn("[Tower Battle Intel] Save Report blocked: empty input");
        return feedback;
    }

    const beforeState = getState();
    const beforeHistory = Array.isArray(beforeState.history) ? beforeState.history : [];
    const beforeIds = new Set(beforeHistory.map(getRunReportId).filter(Boolean));
    const rawPlan = buildCommandDeckRawIntakePlan(text, beforeState);
    const candidateIds = rawPlan.candidateIds;
    const duplicateIds = rawPlan.duplicateIds;

    if (!rawPlan.validReportCount) {
        const feedback = buildSaveFeedback({
            status: "failed",
            loaded: false,
            message: "Report not loaded. I could not find a valid Battle Report source record in the input.",
            candidateIds,
            rawIntakePlan: rawPlan,
            inputDraft: text,
            keepInput: true
        });
        showSaveReportFeedback(feedback);
        console.warn("[Tower Battle Intel] Save Report failed: no valid raw reports");
        return feedback;
    }

    if (!rawPlan.newRecords.length) {
        const duplicateRecord = rawPlan.duplicateRecords[0] || null;
        const feedback = buildSaveFeedback({
            status: "duplicate",
            loaded: false,
            duplicateIds: duplicateIds.length ? duplicateIds : candidateIds,
            candidateIds,
            rawIntakePlan: rawPlan,
            parserFeedback: buildSaveParserFeedback({
                runs: [],
                rawText: text,
                addedIds: [],
                duplicateIds: duplicateIds.length ? duplicateIds : candidateIds,
                candidateIds,
                rawIntakePlan: rawPlan
            }),
            inputDraft: text,
            keepInput: true,
            historyCountBefore: beforeHistory.length,
            historyCountAfter: beforeHistory.length,
            message: duplicateRecord
                ? `Duplicate report not saved. Already exists as ${describeCommandDeckRawRecord(duplicateRecord)}. Report ID: ${duplicateRecord.reportId}.`
                : "Duplicate report not saved. It already exists in the raw archive or History."
        });
        showSaveReportFeedback(feedback);

        if (target) {
            target.placeholder = feedback.reportId
                ? `Duplicate report not saved: ${feedback.reportId}`
                : "Duplicate report was not saved.";
        }

        persist({ lastInput: text });
        return feedback;
    }

    const nextRawArchive = applyCommandDeckRawArchivePlan(rawPlan, beforeState);
    setState({ rawArchive: nextRawArchive });

    const newRawText = joinCommandDeckRawReports(rawPlan.newRecords);
    const result = saveReportToHistory(newRawText);

    // The parser/refresh path saves storage too, so re-assert the raw source
    // archive and copy manual marker metadata onto the parsed History cache
    // after parsing. This keeps batch saves from showing 31 parsed runs but
    // 0 raw source records in the active Command Deck/History panels.
    const postParseState = getState();
    const repairedRawArchive = applyCommandDeckRawArchivePlan(rawPlan, postParseState);
    const patchedHistory = syncHistoryRawMetadataFromPlan(postParseState.history, rawPlan);
    const patchedCurrentRun = syncRunRawMetadataFromPlan(postParseState.currentRun, rawPlan);
    const patchedRunA = syncRunRawMetadataFromPlan(postParseState.runA, rawPlan);
    const patchedRunB = syncRunRawMetadataFromPlan(postParseState.runB, rawPlan);

    setState({
        rawArchive: repairedRawArchive,
        history: patchedHistory,
        currentRun: patchedCurrentRun,
        runA: patchedRunA,
        runB: patchedRunB
    });

    const afterState = getState();
    const afterHistory = Array.isArray(afterState.history) ? afterState.history : [];
    const newIdSet = new Set(rawPlan.newIds);
    const addedRuns = afterHistory.filter(run => {
        const id = getRunReportId(run);
        return id && newIdSet.has(id) && !beforeIds.has(id);
    });
    const addedIds = addedRuns.map(getRunReportId).filter(Boolean);
    const notParsedIds = rawPlan.newIds.filter(id => !addedIds.includes(id));
    const allDuplicateIds = [...duplicateIds, ...notParsedIds]
        .filter((id, index, list) => id && list.indexOf(id) === index);

    if (!result && !addedIds.length) {
        const feedback = buildSaveFeedback({
            status: "failed",
            loaded: false,
            message: rawPlan.newRecords.length
                ? "Raw report source was archived, but I could not rebuild a History run from it yet."
                : "Report not loaded. I could not read a valid Battle Report from the input.",
            candidateIds,
            duplicateIds: allDuplicateIds,
            rawArchivedIds: rawPlan.newIds,
            rawIntakePlan: rawPlan,
            inputDraft: text,
            keepInput: true,
            historyCountBefore: beforeHistory.length,
            historyCountAfter: afterHistory.length
        });
        showSaveReportFeedback(feedback);
        console.warn("[Tower Battle Intel] Save Report failed after raw archive intake");
        persist({ lastInput: text });
        return feedback;
    }

    const feedback = buildSaveFeedback({
        status: addedIds.length ? "saved" : "duplicate",
        loaded: Boolean(addedIds.length),
        addedIds,
        duplicateIds: allDuplicateIds,
        candidateIds,
        rawArchivedIds: rawPlan.newIds,
        rawArchiveCount: afterState.rawArchive?.reportCount ?? repairedRawArchive.reportCount,
        rawIntakePlan: rawPlan,
        parserFeedback: buildSaveParserFeedback({
            runs: addedRuns,
            rawText: newRawText || text,
            addedIds,
            duplicateIds: allDuplicateIds,
            candidateIds,
            rawIntakePlan: rawPlan
        }),
        inputDraft: addedIds.length ? "" : text,
        keepInput: !addedIds.length,
        historyCountBefore: beforeHistory.length,
        historyCountAfter: afterHistory.length
    });

    showSaveReportFeedback(feedback);

    if (target && addedIds.length) {
        target.value = "";
        cacheCommandInputDraft("");
        target.placeholder = addedIds.length === 1
            ? `Saved ${addedIds[0]} to raw archive and Battle History. Paste another report here...`
            : `Saved ${addedIds.length} new reports to raw archive and Battle History. Paste another report here...`;
    }

    if (target && !addedIds.length) {
        target.placeholder = allDuplicateIds.length
            ? `Duplicate report not loaded: ${allDuplicateIds[0]}`
            : "Report was not added to Battle History.";
    }

    persist({ lastInput: addedIds.length ? "" : text });

    return feedback;
}



function syncHistoryRawMetadataFromPlan(history = [], rawPlan = {}) {
    const list = Array.isArray(history) ? history : [];
    return list.map(run => syncRunRawMetadataFromPlan(run, rawPlan));
}

function syncRunRawMetadataFromPlan(run = null, rawPlan = {}) {
    if (!run || typeof run !== "object") return run;

    const record = findRawPlanRecordForRun(run, rawPlan);
    if (!record) return run;

    const userMeta = record.userMeta || {};
    const manualMarkers = Array.isArray(userMeta.manualMarkers)
        ? userMeta.manualMarkers
        : Array.isArray(record.markers)
            ? record.markers
            : [];
    const runType = userMeta.runType || record.runType || (manualMarkers.includes("tournament") ? "tournament" : "normal");

    return {
        ...run,
        meta: {
            ...(run.meta || {}),
            reportId: run.meta?.reportId || record.reportId,
            fingerprint: run.meta?.fingerprint || record.fingerprint,
            runType,
            sourceMarker: userMeta.sourceMarker || manualMarkers[0] || run.meta?.sourceMarker || "",
            manualMarkers: manualMarkers.length ? manualMarkers : (Array.isArray(run.meta?.manualMarkers) ? run.meta.manualMarkers : [])
        },
        raw: {
            ...(run.raw || {}),
            reportText: run.raw?.reportText || record.rawText || ""
        }
    };
}

function findRawPlanRecordForRun(run = null, rawPlan = {}) {
    if (!run || !rawPlan) return null;

    const records = [
        ...(Array.isArray(rawPlan.newRecords) ? rawPlan.newRecords : []),
        ...(Array.isArray(rawPlan.duplicateRecords) ? rawPlan.duplicateRecords : []),
        ...(Array.isArray(rawPlan.candidateRecords) ? rawPlan.candidateRecords : [])
    ].filter(Boolean);

    const runId = getRunReportId(run);
    const runFingerprint = run?.meta?.fingerprint || run?.fingerprint || "";

    return records.find(record => Boolean(
        (runId && record.reportId && String(runId) === String(record.reportId))
        || (runFingerprint && record.fingerprint && String(runFingerprint) === String(record.fingerprint))
    )) || null;
}


function getCandidateReportIds(text = "") {
    return buildCommandDeckRawIntakePlan(text, getState()).candidateIds;
}

function getRunReportId(run = null) {
    return run?.meta?.reportId || run?.meta?.id || run?.id || null;
}

function buildSaveFeedback(details = {}) {
    const addedIds = Array.isArray(details.addedIds) ? details.addedIds.filter(Boolean) : [];
    const duplicateIds = Array.isArray(details.duplicateIds) ? details.duplicateIds.filter(Boolean) : [];
    const candidateIds = Array.isArray(details.candidateIds) ? details.candidateIds.filter(Boolean) : [];
    const status = details.status || (addedIds.length ? "saved" : duplicateIds.length ? "duplicate" : "failed");
    const loaded = Boolean(details.loaded ?? addedIds.length);

    let title = details.title || "Save Report";
    let message = details.message || "";

    if (!message && status === "checked") {
        title = details.title || "Validate Report";
        message = details.message || "Report checked. Nothing has been saved yet.";

        const parserLine = formatSaveParserFeedbackLine(details.parserFeedback);
        if (parserLine) {
            message += ` ${parserLine}`;
        }
    }

    if (!message && status === "saved") {
        title = addedIds.length === 1 ? "Report saved" : "Reports saved";
        message = addedIds.length === 1
            ? `Loaded report ${addedIds[0]} into Battle History.`
            : `Loaded ${addedIds.length} reports into Battle History: ${addedIds.join(", ")}.`;

        if (duplicateIds.length) {
            message += ` Duplicate not loaded: ${duplicateIds.join(", ")}.`;
        }

        if (Array.isArray(details.rawArchivedIds) && details.rawArchivedIds.length) {
            message += details.rawArchivedIds.length === 1
                ? ` Raw source archived first: ${details.rawArchivedIds[0]}.`
                : ` Raw sources archived first: ${details.rawArchivedIds.length}.`;
        }

        const parserLine = formatSaveParserFeedbackLine(details.parserFeedback);
        if (parserLine) {
            message += ` ${parserLine}`;
        }
    }

    if (!message && status === "duplicate") {
        title = "Duplicate not loaded";
        const ids = duplicateIds.length ? duplicateIds : candidateIds;
        message = ids.length
            ? `Duplicate report not loaded: ${ids.join(", ")}.`
            : "Duplicate report not loaded.";

        const parserLine = formatSaveParserFeedbackLine(details.parserFeedback);
        if (parserLine) {
            message += ` ${parserLine}`;
        }
    }

    if (!message && status === "failed") {
        title = "Report not loaded";
        message = "Report not loaded. I could not read a valid Battle Report from the input.";
    }

    if (!message && status === "empty") {
        title = "Nothing to save";
        message = "No report loaded. Paste a battle report first.";
    }

    if (message && ["checked", "saved", "duplicate"].includes(status) && !message.includes("Game Brain:")) {
        const parserLine = formatSaveParserFeedbackLine(details.parserFeedback);
        if (parserLine) {
            message += ` ${parserLine}`;
        }
    }

    return {
        action: "save-report",
        status,
        loaded,
        title,
        message,
        reportId: addedIds[0] || duplicateIds[0] || candidateIds[0] || null,
        addedIds,
        duplicateIds,
        candidateIds,
        historyCountBefore: details.historyCountBefore ?? null,
        historyCountAfter: details.historyCountAfter ?? null,
        parserFeedback: details.parserFeedback || null,
        rawArchivedIds: Array.isArray(details.rawArchivedIds) ? details.rawArchivedIds.filter(Boolean) : [],
        rawArchiveCount: details.rawArchiveCount ?? details.rawIntakePlan?.rawArchive?.reportCount ?? null,
        rawIntakeVersion: details.rawIntakePlan?.version || null,
        inputDraft: typeof details.inputDraft === "string" ? details.inputDraft : "",
        keepInput: Boolean(details.keepInput),
        createdAt: new Date().toISOString()
    };
}

function buildSaveParserFeedback(input = {}) {
    const options = Array.isArray(input)
        ? { runs: input }
        : (input && typeof input === "object" ? input : {});

    const runs = Array.isArray(options.runs) ? options.runs.filter(Boolean) : [];
    const rawReports = typeof options.rawText === "string"
        ? splitBattleReports(options.rawText).slice(0, 50)
        : [];

    const parsedFeedbacks = rawReports
        .map(reportText => {
            try {
                return parseBattleReport(reportText)?.meta?.gameBrainFeedback || null;
            } catch (error) {
                console.warn("[Tower Battle Intel] Save Report Game Brain parse failed", error);
                return null;
            }
        })
        .filter(Boolean);

    const runFeedbacks = runs
        .map(run => run?.meta?.gameBrainFeedback || null)
        .filter(Boolean);

    const feedbacks = parsedFeedbacks.length ? parsedFeedbacks : runFeedbacks;
    const firstRun = runs[0] || null;
    const firstFeedback = feedbacks[0] || firstRun?.meta?.gameBrainFeedback || null;

    if (!firstFeedback) return null;

    const readable = firstFeedback.readableSummary || {};
    const coverage = aggregateLabelCoverage(feedbacks);
    const addedIds = Array.isArray(options.addedIds) ? options.addedIds.filter(Boolean) : [];
    const duplicateIds = Array.isArray(options.duplicateIds) ? options.duplicateIds.filter(Boolean) : [];
    const candidateIds = Array.isArray(options.candidateIds) ? options.candidateIds.filter(Boolean) : [];
    const reportCount = rawReports.length || feedbacks.length || runs.length || candidateIds.length || 1;

    return {
        reportId: firstRun?.meta?.reportId || candidateIds[0] || null,
        reportCount,
        addedCount: addedIds.length,
        duplicateCount: duplicateIds.length,
        candidateCount: candidateIds.length,
        labelCoverage: coverage,
        headline: readable.headline || null,
        tone: readable.tone || "info",
        summaryLines: buildSaveSummaryLines({ readable, firstFeedback, reportCount, addedIds, duplicateIds }),
        quickFacts: buildSaveQuickFacts({
            readable,
            coverage,
            firstFeedback,
            firstRun,
            reportCount,
            addedIds,
            duplicateIds
        }),
        nextCheckpoint: firstFeedback.milestone?.nextCheckpoint ?? null,
        remainingToNextCheckpoint: firstFeedback.milestone?.remainingToNextCheckpoint ?? null,
        killedByLabel: firstFeedback.killedBy?.label || firstRun?.core?.killedBy || null,
        killedByFamily: firstFeedback.killedBy?.family || null,
        killedByMeaning: firstFeedback.killedBy?.meaning || null,
        warningCount: feedbacks.reduce((sum, item) => sum + (Array.isArray(item.warnings) ? item.warnings.length : 0), 0),
        warnings: feedbacks.flatMap(item => Array.isArray(item.warnings) ? item.warnings : []).slice(0, 5)
    };
}

function aggregateLabelCoverage(feedbacks = []) {
    const list = Array.isArray(feedbacks) ? feedbacks.filter(Boolean) : [];
    const totalLabels = list.reduce((sum, item) => sum + Number(item?.labelCoverage?.totalLabels || 0), 0);
    const knownOfficialLabels = list.reduce((sum, item) => sum + Number(item?.labelCoverage?.knownOfficialLabels || 0), 0);
    const unknownLabels = list.reduce((sum, item) => sum + Number(item?.labelCoverage?.unknownLabels || 0), 0);
    const coveragePercent = totalLabels > 0
        ? Math.round((knownOfficialLabels / totalLabels) * 100)
        : 0;

    return {
        totalLabels,
        knownOfficialLabels,
        unknownLabels,
        coveragePercent
    };
}

function buildSaveSummaryLines({ readable = {}, firstFeedback = {}, reportCount = 1, addedIds = [], duplicateIds = [] } = {}) {
    const lines = [];

    if (reportCount > 1) {
        lines.push(`Batch checked: ${reportCount} Battle Reports. Loaded ${addedIds.length}; duplicate/not added ${duplicateIds.length}.`);
    }

    if (Array.isArray(readable.summaryLines)) {
        lines.push(...readable.summaryLines);
    }

    if (!lines.length && firstFeedback?.milestone?.ok) {
        lines.push(firstFeedback.milestone.message || "Wave checkpoint context is available.");
    }

    return lines.slice(0, 4);
}

function buildSaveQuickFacts({ readable = {}, coverage = {}, firstFeedback = {}, firstRun = null, reportCount = 1, addedIds = [], duplicateIds = [] } = {}) {
    const facts = [];

    facts.push({
        label: reportCount === 1 ? "Report checked" : "Reports checked",
        value: String(reportCount),
        tone: reportCount ? "info" : "quiet"
    });

    if (addedIds.length || duplicateIds.length) {
        facts.push({
            label: "Loaded / duplicate",
            value: `${addedIds.length} / ${duplicateIds.length}`,
            tone: addedIds.length ? "good" : "watch"
        });
    }

    if (Number(coverage.totalLabels || 0) > 0) {
        facts.push({
            label: "Recognised labels",
            value: `${coverage.knownOfficialLabels || 0} matched`,
            tone: Number(coverage.knownOfficialLabels || 0) ? "good" : "quiet"
        });

        facts.push({
            label: "Report labels checked",
            value: String(coverage.totalLabels || 0),
            tone: Number(coverage.totalLabels || 0) ? "info" : "quiet"
        });

        facts.push({
            label: "Mapping polish",
            value: Number(coverage.unknownLabels || 0) ? `${coverage.unknownLabels} safe labels` : "None needed",
            tone: Number(coverage.unknownLabels || 0) ? "watch" : "good"
        });
    }

    const tier = firstRun?.core?.tier ?? firstFeedback?.core?.tier ?? firstFeedback?.milestone?.tier ?? null;
    const wave = firstRun?.core?.wave ?? firstFeedback?.core?.wave ?? firstFeedback?.milestone?.wave ?? null;
    if (tier || wave) {
        facts.push({
            label: "Tier / Wave",
            value: `T${tier || "?"} / Wave ${formatRawWaveForCommand(wave)}`,
            tone: "info"
        });
    }

    if (firstFeedback?.milestone?.nextCheckpoint) {
        facts.push({
            label: "Next checkpoint",
            value: `Wave ${firstFeedback.milestone.nextCheckpoint}`,
            tone: "info"
        });
    }

    const killedBy = firstFeedback?.killedBy?.label || firstRun?.core?.killedBy || null;
    if (killedBy) {
        facts.push({
            label: "Killed By",
            value: killedBy,
            tone: "info"
        });
    }

    if (Array.isArray(readable.quickFacts)) {
        for (const fact of readable.quickFacts) {
            if (!fact?.label || facts.some(existing => existing.label === fact.label)) continue;
            facts.push(fact);
        }
    }

    return facts.slice(0, 8);
}

function formatSaveParserFeedbackLine(feedback = null) {
    if (!feedback) return "";

    const coverage = feedback.labelCoverage || {};
    const parts = [];

    if (Number(coverage.totalLabels || 0) > 0) {
        parts.push(`${coverage.knownOfficialLabels || 0} report labels recognised`);
        parts.push(`${coverage.totalLabels || 0} section-aware labels checked`);
        if (Number(coverage.schemaMappedLabels || 0) > 0) {
            parts.push(`${coverage.schemaMappedLabels} labels have official/schema detail`);
        }
        if (Number(coverage.unknownLabels || 0) > 0) {
            parts.push(`${coverage.unknownLabels} labels need mapping polish`);
        } else {
            parts.push("no mapping polish needed");
        }
    }

    if (feedback.nextCheckpoint) {
        const remaining = Number(feedback.remainingToNextCheckpoint || 0);
        parts.push(remaining > 0
            ? `next checkpoint Wave ${feedback.nextCheckpoint} (${remaining} waves away)`
            : `at checkpoint Wave ${feedback.nextCheckpoint}`);
    }

    if (feedback.killedByLabel) {
        parts.push(`Killed By ${feedback.killedByLabel}${feedback.killedByFamily ? ` / ${feedback.killedByFamily}` : ""}`);
    }

    return parts.length ? `Game Brain: ${parts.join("; ")}.` : "";
}

function showSaveReportFeedback(feedback = {}) {
    try {
        const keepDraft = Boolean(feedback.keepInput && typeof feedback.inputDraft === "string");
        setState({
            ...(keepDraft ? { lastInput: feedback.inputDraft } : {}),
            ui: {
                lastCommandFeedback: feedback
            }
        });
    } catch {
        // state feedback cache is best-effort; DOM feedback still continues
    }

    const doc = getDocument();
    if (!doc) return feedback;

    const status = feedback.status || "info";
    const tone = status === "saved" || status === "checked" ? "good" : status === "duplicate" ? "warn" : "bad";
    const text = feedback.message || "Save Report finished.";
    const title = feedback.title || "Save Report";

    const inline = ensureSaveFeedbackInline(doc);
    if (inline) {
        inline.className = `save-report-feedback ${tone}`;
        inline.setAttribute("role", "status");
        inline.setAttribute("aria-live", "polite");
        inline.innerHTML = `
            <div class="save-report-feedback-head">
                <strong>${escapeHTML(title)}</strong>
                ${feedback.reportId ? `<em>${escapeHTML(feedback.reportId)}</em>` : ""}
            </div>
            <span class="save-report-feedback-main">${escapeHTML(text)}</span>
            ${buildSaveFeedbackDetailsHTML(feedback)}
        `;
    }

    const commandDeckVisible = Boolean(doc.querySelector(".tbi-command-clean-view"));
    const toast = commandDeckVisible ? null : ensureSaveFeedbackToast(doc);
    if (toast) {
        toast.innerHTML = buildSaveFeedbackToastHTML(feedback, tone, title, text);
        clearTimeout(showSaveReportFeedback.toastTimer);
        showSaveReportFeedback.toastTimer = setTimeout(() => {
            if (toast) toast.innerHTML = "";
        }, 9000);
    }

    if (commandDeckVisible) {
        const existingToast = doc.getElementById("saveReportToastMount");
        if (existingToast) existingToast.innerHTML = "";
    }

    try {
        doc.documentElement.dataset.lastSaveReportStatus = status;
        doc.documentElement.dataset.lastSaveReportId = feedback.reportId || "";
        doc.documentElement.dataset.lastSaveReportAt = feedback.createdAt || new Date().toISOString();
    } catch {
        // ignore dataset failures
    }

    if (typeof window !== "undefined") {
        window.TowerBattleIntelLastSaveReport = feedback;
    }

    return feedback;
}

function buildSaveFeedbackDetailsHTML(feedback = {}) {
    const parser = feedback.parserFeedback || null;
    if (!parser) return "";

    const facts = Array.isArray(parser.quickFacts) && parser.quickFacts.length
        ? parser.quickFacts
        : buildFallbackSaveFacts(parser);

    const factHTML = facts.length
        ? `<div class="save-report-gamebrain-facts">${facts.map(item => `
            <span class="save-report-gamebrain-fact ${escapeAttr(normaliseTone(item.tone))}">
                <small>${escapeHTML(item.label)}</small>
                <b>${escapeHTML(item.value)}</b>
            </span>
        `).join("")}</div>`
        : "";

    const lines = Array.isArray(parser.summaryLines)
        ? parser.summaryLines.slice(0, 3)
        : [];

    const lineHTML = lines.length
        ? `<ul class="save-report-gamebrain-lines">${lines.map(line => `<li>${escapeHTML(line)}</li>`).join("")}</ul>`
        : "";

    return `
        <div class="save-report-gamebrain ${escapeAttr(normaliseTone(parser.tone))}" aria-label="Game Brain report summary">
            <div class="save-report-gamebrain-title">Game Brain summary</div>
            ${parser.headline ? `<p>${escapeHTML(parser.headline)}</p>` : ""}
            ${factHTML}
            ${lineHTML}
        </div>
    `;
}

function buildSaveFeedbackToastHTML(feedback = {}, tone = "info", title = "Save Report", text = "") {
    const parser = feedback.parserFeedback || null;
    const facts = Array.isArray(parser?.quickFacts) && parser.quickFacts.length
        ? parser.quickFacts
        : buildFallbackSaveFacts(parser || {});
    const compactFacts = Array.isArray(facts) && facts.length
        ? `<div class="save-report-toast-facts">${facts.slice(0, 4).map(item => `<span>${escapeHTML(item.label)}: <b>${escapeHTML(item.value)}</b></span>`).join("")}</div>`
        : "";

    return `
        <div class="save-report-toast ${escapeAttr(tone)}" role="status" aria-live="polite">
            <strong>${escapeHTML(title)}</strong>
            <span>${escapeHTML(text)}</span>
            ${compactFacts}
        </div>
    `;
}

function buildFallbackSaveFacts(parser = {}) {
    const coverage = parser.labelCoverage || {};
    const facts = [];

    if (Number(coverage.totalLabels || 0) > 0) {
        facts.push({
            label: "Recognised labels",
            value: `${coverage.knownOfficialLabels || 0} matched`,
            tone: Number(coverage.knownOfficialLabels || 0) ? "good" : "quiet"
        });
    }

    if (parser.nextCheckpoint) {
        facts.push({
            label: "Next checkpoint",
            value: `Wave ${parser.nextCheckpoint}`,
            tone: "info"
        });
    }

    if (parser.killedByLabel) {
        facts.push({
            label: "Killed By",
            value: parser.killedByLabel,
            tone: "info"
        });
    }

    return facts;
}

function normaliseTone(value = "info") {
    const tone = String(value || "info").toLowerCase();
    if (["good", "watch", "warn", "bad", "quiet", "info"].includes(tone)) return tone;
    return "info";
}

function ensureSaveFeedbackInline(doc) {
    let node = doc.getElementById("saveReportFeedback");
    if (node) return node;

    node = doc.createElement("div");
    node.id = "saveReportFeedback";
    node.className = "save-report-feedback";
    node.hidden = false;

    const actions = doc.querySelector(".input-actions");
    if (actions?.parentNode) {
        actions.insertAdjacentElement("afterend", node);
        return node;
    }

    const input = doc.getElementById("input");
    if (input?.parentNode) {
        input.insertAdjacentElement("afterend", node);
        return node;
    }

    return null;
}

function ensureSaveFeedbackToast(doc) {
    let node = doc.getElementById("saveReportToastMount");
    if (node) return node;

    node = doc.createElement("div");
    node.id = "saveReportToastMount";
    node.className = "save-report-toast-mount";
    doc.body?.appendChild(node);
    return node;
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function actionClearInput(input = null) {

    const target = resolveReportInput(input);

    clearAllCommandReportInputs();

    if (target) {
        target.value = "";
        target.placeholder = "Paste Battle Report Here...";
    }

    const feedback = {
        action: "clear-input",
        status: "cleared",
        loaded: false,
        title: "Input cleared",
        message: "Battle Report input cleared. History and saved runs were kept.",
        reportId: null,
        addedIds: [],
        duplicateIds: [],
        candidateIds: [],
        parserFeedback: null,
        inputDraft: "",
        keepInput: false,
        createdAt: new Date().toISOString()
    };

    cacheCommandInputDraft("");

    setState({
        lastInput: "",
        ui: {
            lastCommandFeedback: feedback
        }
    });

    persist({ lastInput: "" });

    if (typeof window !== "undefined") {
        window.TowerBattleIntelLastSaveReport = feedback;
    }

    return feedback;
}

function clearAllCommandReportInputs() {
    const doc = getDocument();
    if (!doc || typeof doc.querySelectorAll !== "function") return;

    const selectors = [
        ".tbi-command-clean-view textarea[data-command-report-input='true']",
        "textarea.tbi-command-report-input",
        "textarea[data-command-report-input='true']",
        "#input"
    ];

    selectors.forEach(selector => {
        try {
            doc.querySelectorAll(selector).forEach(node => {
                if (node && typeof node.value !== "undefined") {
                    node.value = "";
                    node.placeholder = "Paste Battle Report Here...";
                }
            });
        } catch {
            // ignore selector failures in unusual DOM states
        }
    });
}


/* --------------------------------------------------
   REPORT INPUT RESOLUTION
-------------------------------------------------- */

function getDocument() {
    return typeof document !== "undefined" ? document : null;
}

export function resolveReportInput(input = null) {
    const doc = getDocument();

    if (input && typeof input.value !== "undefined" && String(input.value || "").trim()) {
        return input;
    }

    const commandInput = findCommandReportInput(doc);

    if (commandInput && String(commandInput.value || "").trim()) {
        return commandInput;
    }

    if (commandInput) {
        return commandInput;
    }

    if (input && typeof input.value !== "undefined") {
        return input;
    }

    return doc?.getElementById("input") || null;
}

export function getInputText(input = null) {
    const direct = String(input?.value || "");

    if (direct.trim()) {
        return direct;
    }

    const fallback = findCommandReportInput(getDocument(), { preferText: true });
    const fallbackText = String(fallback?.value || "");

    if (fallbackText.trim()) {
        return fallbackText;
    }

    const stateDraft = String(getState()?.lastInput || "");
    if (stateDraft.trim()) {
        return stateDraft;
    }

    if (typeof window !== "undefined") {
        const windowDraft = String(window.TowerBattleIntelCommandInputDraft || "");
        if (windowDraft.trim()) {
            return windowDraft;
        }
    }

    return direct;
}

function findCommandReportInput(doc = null, options = {}) {
    if (!doc || typeof doc.querySelectorAll !== "function") return null;

    const selectors = [
        ".tbi-command-clean-view textarea[data-command-report-input='true']",
        "textarea.tbi-command-report-input",
        "textarea[data-command-report-input='true']",
        "[data-command-report-input='true']"
    ];

    const nodes = [];

    selectors.forEach(selector => {
        try {
            doc.querySelectorAll(selector).forEach(node => {
                if (node && typeof node.value !== "undefined" && !nodes.includes(node)) {
                    nodes.push(node);
                }
            });
        } catch {
            // ignore selector failures in unusual DOM states
        }
    });

    if (!nodes.length) return null;

    const withText = nodes.find(node => String(node.value || "").trim());
    if (withText && options.preferText !== false) return withText;

    const visible = nodes.find(isVisibleReportInput);
    return visible || nodes[0] || null;
}

function isVisibleReportInput(node = null) {
    if (!node) return false;
    if (node.disabled || node.hidden) return false;
    if (node.offsetParent !== null) return true;

    try {
        const style = getComputedStyle(node);
        return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    } catch {
        return false;
    }
}



function setCommandDashboardTab(tab = "overview") {
    setState({
        ui: {
            dashboardTab: tab || "overview"
        }
    });
}

function persist(extra = null) {
    if (extra && typeof extra === "object") {
        setState(extra);
    }

    saveStorage(getState());
}

function formatRawWaveForCommand(value = "?") {
    const number = Number(value);
    return Number.isFinite(number) ? String(Math.round(number)) : String(value || "?");
}
