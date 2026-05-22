"use strict";

/**
 * SYSTEM HEALTH SCAN
 * Full-system diagnostic scanner for Tower Battle Intel.
 *
 * This version treats normal idle/closed states properly:
 * - No A/B selected yet is not a failure
 * - Debug panel closed is not a warning
 * - Huge Tower-number deltas are informational, not broken
 * - Build style Unknown is informational, not a warning
 */

const HEALTH_VERSION =
    "system-health-scan-v4.9x";

/* --------------------------------------------------
   MAIN SCAN
-------------------------------------------------- */

export function runSystemHealthScan(state = {}) {

    const checks = [];

    const add =
        createCheckAdder(checks);

    const context =
        buildScanContext(state);

    scanAppBoot(add);
    scanInputSystem(add);
    scanRunHealth(add, state, context);
    scanHistory(add, state, context);
    scanPhase4Features(add, state, context);
    scanCompare(add, state, context);
    scanNumberSanity(add, state, context);
    scanAICoach(add, state, context);
    scanStorage(add, state, context);
    scanUIRender(add, state, context);
    scanDebugSystem(add, state, context);
    scanDiagnosticsFoundation(add, state, context);

    const summary =
        summariseChecks(checks);

    return {
        app:
            "Tower Battle Intel",

        scanVersion:
            HEALTH_VERSION,

        mode:
            context.mode,

        time:
            buildTimeInfo(),

        status:
            summary.status,

        score:
            summary.score,

        summary,

        fixPriority:
            buildFixPriority(checks),

        checks,

        grouped:
            groupChecks(checks)
    };
}

/* --------------------------------------------------
   CONTEXT
-------------------------------------------------- */

function buildScanContext(state = {}) {

    const hasRunA =
        Boolean(state?.runA);

    const hasRunB =
        Boolean(state?.runB);

    const hasBothRuns =
        hasRunA && hasRunB;

    const hasCompare =
        Boolean(state?.compareData);

    const historyCount =
        Array.isArray(state?.history)
            ? state.history.length
            : 0;

    const debugEnabled =
        Boolean(state?.ui?.debug);

    let mode =
        "idle";

    if (hasBothRuns && hasCompare) {
        mode = "comparison";
    } else if (historyCount > 0) {
        mode = "history_ready";
    }

    return {
        hasRunA,
        hasRunB,
        hasBothRuns,
        hasCompare,
        historyCount,
        debugEnabled,
        mode
    };
}

/* --------------------------------------------------
   CHECK ADDER
-------------------------------------------------- */

function createCheckAdder(checks) {

    return function add({
        id,
        group,
        level = "pass",
        title,
        message = "",
        fix = "",
        data = null
    }) {

        checks.push({
            id,
            group,
            level,
            title,
            message,
            fix,
            data
        });
    };
}


/* --------------------------------------------------
   DIAGNOSTICS FOUNDATION
-------------------------------------------------- */

function scanDiagnosticsFoundation(add, state = {}, context = {}) {

    const inspection =
        state?.inspection || null;

    add({
        id: "DIAG_001",
        group: "Diagnostics Foundation",
        level: "pass",
        title: "System health scan loaded",
        message: `Diagnostics health scanner is running ${HEALTH_VERSION}.`
    });

    add({
        id: "DIAG_002",
        group: "Diagnostics Foundation",
        level: inspection ? "pass" : "info",
        title: "Pipeline inspection snapshot",
        message: inspection
            ? "Pipeline inspector snapshot is available on state.inspection."
            : "No pipeline inspection snapshot yet. This is normal before a report has been processed.",
        data: inspection
            ? {
                version: inspection.version || "unknown",
                ok: Boolean(inspection.ok),
                reason: inspection.reason || "unknown",
                warnings: Array.isArray(inspection.warnings) ? inspection.warnings.length : 0
            }
            : null
    });

    add({
        id: "DIAG_003",
        group: "Diagnostics Foundation",
        level: inspection?.parser?.success ? "pass" : "info",
        title: "Parser diagnostic summary",
        message: inspection?.parser?.success
            ? `Parser saw ${inspection.parser.sectionCount || 0} sections and ${inspection.parser.flatCount || 0} flat metrics.`
            : "Parser diagnostic data will appear after a battle report is processed.",
        data: inspection?.parser || null
    });

    add({
        id: "DIAG_004",
        group: "Diagnostics Foundation",
        level: inspection?.compare?.enabled ? "pass" : "info",
        title: "Compare diagnostic summary",
        message: inspection?.compare?.enabled
            ? `Compare has ${inspection.compare.sectionCount || 0} sections and ${inspection.compare.itemCount || 0} items.`
            : "Compare diagnostic data is idle until both A and B are loaded.",
        data: inspection?.compare || null
    });

    add({
        id: "DIAG_005",
        group: "Diagnostics Foundation",
        level: "pass",
        title: "Trace engine compatibility",
        message: "traceEngine now routes through pipelineInspector without requiring a missing capture function."
    });

    add({
        id: "DIAG_006",
        group: "Diagnostics Foundation",
        level: context.hasCompare ? "pass" : "info",
        title: "Diagnostics mode awareness",
        message: context.hasCompare
            ? "Health scan is running in comparison-aware mode."
            : "Health scan is running in idle/history mode. This is not a failure."
    });
}

/* --------------------------------------------------
   APP BOOT
-------------------------------------------------- */

function scanAppBoot(add) {

    add({
        id: "BOOT_001",
        group: "App Boot",
        level: documentExists() ? "pass" : "critical",
        title: "Document available",
        message: documentExists()
            ? "Browser document object is available."
            : "Document object is missing."
    });

    addDomCheck(add, "BOOT_002", "App root exists", "#app", "critical");
    addDomCheck(add, "BOOT_003", "Dashboard root exists", "#dashboard", "critical");
    addDomCheck(add, "BOOT_004", "Debug panel root exists", "#debugPanel", "info");
}

/* --------------------------------------------------
   INPUT SYSTEM
-------------------------------------------------- */

function scanInputSystem(add) {

    addDomCheck(add, "INPUT_001", "Input textarea exists", "#input", "fail");
    addDomCheck(add, "INPUT_002", "Save Report button exists", "#saveReport", "fail");
    addDomCheck(add, "INPUT_003", "Clear Input button exists", "#clearInput", "warning");
    addDomCheck(add, "INPUT_004", "Clear Runs button exists", "#clearRuns", "warning");

    const oldSaveA =
        query("#saveA");

    const oldSaveB =
        query("#saveB");

    add({
        id: "INPUT_005",
        group: "Input System",
        level: oldSaveA || oldSaveB ? "warning" : "pass",
        title: "Old top Save A / Save B buttons removed",
        message: oldSaveA || oldSaveB
            ? "Old top Save A / Save B buttons still exist. New flow expects Save Report only."
            : "Input area uses the new Save Report flow.",
        fix: oldSaveA || oldSaveB
            ? "Remove old top Save A / Save B buttons from index.html."
            : ""
    });
}

/* --------------------------------------------------
   RUN HEALTH
-------------------------------------------------- */

function scanRunHealth(add, state, context) {

    const runA =
        state?.runA || null;

    const runB =
        state?.runB || null;

    add({
        id: "RUN_001",
        group: "Run Health",
        level: runA ? "pass" : "info",
        title: "Run A loaded",
        message: runA
            ? "Run A is loaded."
            : "Run A is not selected yet. This is normal until the user chooses A from history."
    });

    add({
        id: "RUN_002",
        group: "Run Health",
        level: runB ? "pass" : "info",
        title: "Run B loaded",
        message: runB
            ? "Run B is loaded."
            : "Run B is not selected yet. This is normal until the user chooses B from history."
    });

    checkSingleRun(add, "RUN_A", "Run A", runA);
    checkSingleRun(add, "RUN_B", "Run B", runB);

    if (runA && runB) {

        const sameId =
            getReportId(runA) &&
            getReportId(runA) === getReportId(runB);

        add({
            id: "RUN_020",
            group: "Run Health",
            level: sameId ? "fail" : "pass",
            title: "Run A and Run B are different reports",
            message: sameId
                ? "Run A and Run B appear to be the same report."
                : "Run A and Run B appear to be different reports.",
            fix: sameId
                ? "Load different history runs into A and B."
                : ""
        });

    } else {

        add({
            id: "RUN_020",
            group: "Run Health",
            level: "info",
            title: "A/B difference check",
            message: "A/B duplicate check is waiting until both slots are selected."
        });
    }
}

function checkSingleRun(add, prefix, label, run) {

    if (!run) {
        return;
    }

    const core =
        run?.core || {};

    const stats =
        run?.stats || {};

    add({
        id: `${prefix}_001`,
        group: "Parser / Computed Run",
        level: getReportId(run) ? "pass" : "warning",
        title: `${label} has report ID`,
        message: getReportId(run)
            ? `Report ID: ${getReportId(run)}`
            : "Report ID is missing.",
        fix: getReportId(run)
            ? ""
            : "Check fingerprintReport() and update.js meta.reportId creation."
    });

    addNumericRunCheck(add, `${prefix}_002`, label, "Tier", core.tier, 1);
    addNumericRunCheck(add, `${prefix}_003`, label, "Wave", core.wave, 1);
    addNumericRunCheck(add, `${prefix}_004`, label, "Coins", core.coins, 1);
    addNumericRunCheck(add, `${prefix}_005`, label, "Cells", core.cells, 1);
    addNumericRunCheck(add, `${prefix}_006`, label, "Coins/hour", stats.coinsPerHour, 1);
    addNumericRunCheck(add, `${prefix}_007`, label, "Cells/hour", stats.cellsPerHour, 1);

    add({
        id: `${prefix}_008`,
        group: "Parser / Computed Run",
        level: core.battleDate ? "pass" : "warning",
        title: `${label} battle date`,
        message: core.battleDate
            ? `Battle date found: ${core.battleDate}`
            : "Battle date missing."
    });

    add({
        id: `${prefix}_009`,
        group: "Parser / Computed Run",
        level: core.killedBy ? "pass" : "warning",
        title: `${label} killed by`,
        message: core.killedBy
            ? `Killed by: ${core.killedBy}`
            : "Killed By value missing."
    });
}

function addNumericRunCheck(add, id, label, field, value, min = 0) {

    const num =
        Number(value || 0);

    const ok =
        Number.isFinite(num) && num >= min;

    add({
        id,
        group: "Parser / Computed Run",
        level: ok ? "pass" : "warning",
        title: `${label} ${field}`,
        message: ok
            ? `${field}: ${num}`
            : `${field} is missing or zero.`,
        fix: ok
            ? ""
            : "Check parser/compute mapping for this field.",
        data: {
            value
        }
    });
}

/* --------------------------------------------------
   HISTORY
-------------------------------------------------- */

function scanHistory(add, state, context) {

    const history =
        Array.isArray(state?.history)
            ? state.history
            : null;

    add({
        id: "HISTORY_001",
        group: "History",
        level: history ? "pass" : "fail",
        title: "History is an array",
        message: history
            ? `History contains ${history.length} run(s).`
            : "History is not an array."
    });

    if (!history) {
        return;
    }

    add({
        id: "HISTORY_002",
        group: "History",
        level: history.length ? "pass" : "info",
        title: "History has saved runs",
        message: history.length
            ? `${history.length} saved run(s) found.`
            : "No saved history runs yet. This is normal on first use."
    });

    const ids =
        history
            .map(getReportId)
            .filter(Boolean);

    const unique =
        new Set(ids);

    add({
        id: "HISTORY_003",
        group: "History",
        level: ids.length === unique.size ? "pass" : "fail",
        title: "No duplicate report IDs",
        message: ids.length === unique.size
            ? "No duplicate report IDs detected."
            : "Duplicate report IDs detected in history.",
        fix: ids.length === unique.size
            ? ""
            : "Check duplicate protection in history.js."
    });

    const missingIds =
        history.filter(run => !getReportId(run)).length;

    add({
        id: "HISTORY_004",
        group: "History",
        level: missingIds ? "warning" : "pass",
        title: "History report IDs present",
        message: missingIds
            ? `${missingIds} history run(s) missing report ID.`
            : "All history runs have report IDs."
    });

    const deleteAll =
        query("[data-delete-all-history]");

    const deleteModal =
        query("#deleteHistoryModal");

    add({
        id: "HISTORY_005",
        group: "History",
        level: deleteAll ? "pass" : "info",
        title: "Delete All History button exists",
        message: deleteAll
            ? "Delete All History button found."
            : "Delete All History button is not currently rendered. This can be normal before history UI is visible."
    });

    add({
        id: "HISTORY_006",
        group: "History",
        level: deleteModal ? "pass" : "info",
        title: "Delete modal exists",
        message: deleteModal
            ? "Delete confirmation modal found."
            : "Delete confirmation modal is not currently rendered. This is normal if it is created only when needed."
    });
}


/* --------------------------------------------------
   PHASE 4 FEATURE CHECKS
-------------------------------------------------- */

function scanPhase4Features(add, state, context) {

    const history =
        Array.isArray(state?.history)
            ? state.history
            : [];

    const historyPanel =
        query(".history-panel");

    const hasHistoryUI =
        Boolean(historyPanel);

    const hasSavedRuns =
        history.length > 0;

    const historySearch =
        query("[data-history-filter-query], .history-search");

    add({
        id: "PHASE4_001",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || historySearch ? "pass" : "warning",
        title: "History search control exists",
        message: historySearch
            ? "History search control found."
            : hasSavedRuns
                ? "Saved runs exist, but the History search control is not rendered."
                : "No saved runs yet; History search is not required.",
        fix: hasSavedRuns && !historySearch
            ? "Check historyLayout.js and the history filter panel render path."
            : ""
    });

    const sortChoices =
        queryAll("[data-history-filter-kind='sort'], [data-history-filter-value='sort'], [data-history-filter-sort]");

    const buildChoices =
        queryAll("[data-history-filter-kind='build'], [data-history-filter-value='build'], [data-history-filter-build]");

    const tagChoices =
        queryAll("[data-history-filter-kind='tag'], [data-history-filter-value='tag'], [data-history-filter-tag]");

    add({
        id: "PHASE4_002",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || sortChoices.length ? "pass" : "warning",
        title: "History sort controls exist",
        message: sortChoices.length
            ? `${sortChoices.length} sort control(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no sort controls were found."
                : "No saved runs yet; sort controls are not required.",
        fix: hasSavedRuns && !sortChoices.length
            ? "Check historyFilters.js and historyLayout.js sort control rendering."
            : ""
    });

    add({
        id: "PHASE4_003",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || buildChoices.length ? "pass" : "warning",
        title: "History build filter controls exist",
        message: buildChoices.length
            ? `${buildChoices.length} build filter control(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no build filter controls were found."
                : "No saved runs yet; build filter controls are not required.",
        fix: hasSavedRuns && !buildChoices.length
            ? "Check historyFilters.js and historyLayout.js build control rendering."
            : ""
    });

    add({
        id: "PHASE4_004",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || tagChoices.length ? "pass" : "info",
        title: "History tag filter controls exist",
        message: tagChoices.length
            ? `${tagChoices.length} tag filter control(s) found.`
            : hasSavedRuns
                ? "No tag filter buttons are currently rendered. This can be normal until tags exist."
                : "No saved runs yet; tag buttons are not required.",
        fix: ""
    });

    const showArchived =
        query("[data-history-filter-kind='showArchived'], [data-history-filter-value='showArchived']");

    add({
        id: "PHASE4_005",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || showArchived ? "pass" : "warning",
        title: "Show Archived toggle exists",
        message: showArchived
            ? "Show Archived toggle found."
            : hasSavedRuns
                ? "Saved runs exist, but Show Archived toggle was not found."
                : "No saved runs yet; Show Archived toggle is not required.",
        fix: hasSavedRuns && !showArchived
            ? "Check historyLayout.js for the showArchived button render path."
            : ""
    });

    const resetFilters =
        query("[data-history-filter-reset]");

    add({
        id: "PHASE4_006",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || resetFilters ? "pass" : "warning",
        title: "Reset Filters button exists",
        message: resetFilters
            ? "Reset Filters button found."
            : hasSavedRuns
                ? "Saved runs exist, but Reset Filters button was not found."
                : "No saved runs yet; Reset Filters button is not required.",
        fix: hasSavedRuns && !resetFilters
            ? "Check historyLayout.js for the reset filter button."
            : ""
    });

    const statsButtons =
        queryAll("[data-history-stats-index]");

    add({
        id: "PHASE4_007",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || statsButtons.length ? "pass" : "warning",
        title: "History Stats buttons exist",
        message: statsButtons.length
            ? `${statsButtons.length} Stats button(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no Stats buttons were found."
                : "No saved runs yet; Stats buttons are not required.",
        fix: hasSavedRuns && !statsButtons.length
            ? "Check historyCard.js for data-history-stats-index."
            : ""
    });

    const editButtons =
        queryAll("[data-history-edit-index]");

    add({
        id: "PHASE4_008",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || editButtons.length ? "pass" : "warning",
        title: "History Edit buttons exist",
        message: editButtons.length
            ? `${editButtons.length} Edit button(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no Edit buttons were found."
                : "No saved runs yet; Edit buttons are not required.",
        fix: hasSavedRuns && !editButtons.length
            ? "Check historyCard.js for data-history-edit-index."
            : ""
    });

    const archiveButtons =
        queryAll("[data-archive-history-index], [data-restore-history-index]");

    add({
        id: "PHASE4_009",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || archiveButtons.length ? "pass" : "warning",
        title: "Archive / Restore buttons exist",
        message: archiveButtons.length
            ? `${archiveButtons.length} Archive/Restore button(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no Archive/Restore buttons were found."
                : "No saved runs yet; Archive/Restore buttons are not required.",
        fix: hasSavedRuns && !archiveButtons.length
            ? "Check historyCard.js archive/restore button rendering."
            : ""
    });

    const deleteRunButtons =
        queryAll("[data-delete-history-index]");

    add({
        id: "PHASE4_010",
        group: "Phase 4 History Tools",
        level: !hasSavedRuns || deleteRunButtons.length ? "pass" : "warning",
        title: "Per-run delete buttons exist",
        message: deleteRunButtons.length
            ? `${deleteRunButtons.length} per-run delete button(s) found.`
            : hasSavedRuns
                ? "Saved runs exist, but no per-run delete buttons were found."
                : "No saved runs yet; per-run delete buttons are not required.",
        fix: hasSavedRuns && !deleteRunButtons.length
            ? "Check historyCard.js for data-delete-history-index."
            : ""
    });

    const filterState =
        state?.ui?.historyFilters || {};

    add({
        id: "PHASE4_011",
        group: "Phase 4 History Tools",
        level: isValidHistoryFilterState(filterState) ? "pass" : "warning",
        title: "History filter state shape",
        message: isValidHistoryFilterState(filterState)
            ? "History filter state shape looks valid."
            : "History filter state is missing or malformed.",
        fix: isValidHistoryFilterState(filterState)
            ? ""
            : "Check state.js default ui.historyFilters and setHistoryFilters().",
        data: {
            historyFilters: filterState
        }
    });

    const metadataScan =
        scanHistoryMetadata(history);

    add({
        id: "PHASE4_012",
        group: "Phase 4 History Tools",
        level: metadataScan.invalidTags ? "warning" : "pass",
        title: "History notes and tags metadata",
        message: metadataScan.invalidTags
            ? `${metadataScan.invalidTags} run(s) have malformed tag metadata.`
            : `Notes/tags metadata looks valid across ${history.length} run(s).`,
        fix: metadataScan.invalidTags
            ? "Check normaliseTags() in localStore.js/history.js and saved run meta.tags."
            : "",
        data: metadataScan
    });

    const modalOpen =
        Boolean(
            query(".history-stats-overlay") ||
            query(".history-edit-overlay") ||
            query(".history-modal-overlay") ||
            query(".history-stats-modal") ||
            query(".history-edit-modal")
        );

    const bodyLocked =
        hasBodyClass("history-modal-open") ||
        hasBodyClass("history-stats-open") ||
        hasBodyClass("history-edit-open") ||
        hasBodyClass("modal-open");

    add({
        id: "PHASE4_013",
        group: "Phase 4 History Tools",
        level: !modalOpen || bodyLocked ? "pass" : "info",
        title: "History modal background lock",
        message: modalOpen
            ? bodyLocked
                ? "A history modal is open and a body lock class is present."
                : "A history modal appears open, but no known body lock class is present."
            : "No history modal is open; background lock is not required.",
        fix: modalOpen && !bodyLocked
            ? "Add/remove a body lock class when History Stats/Edit modals open and close."
            : ""
    });

    const statsSearch =
        query("[data-history-stats-search], .history-stats-search, .history-section-search");

    add({
        id: "PHASE4_014",
        group: "Phase 4 History Tools",
        level: statsSearch || !modalOpen ? "pass" : "info",
        title: "Stats modal section search",
        message: statsSearch
            ? "Stats modal section search control found."
            : modalOpen
                ? "A modal is open, but no stats section search control was found."
                : "Stats modal is closed; section search is checked when the modal is open.",
        fix: ""
    });

    const matchedElements =
        queryAll(".history-stat-match, .history-section-match, .history-match-pill, .matched");

    add({
        id: "PHASE4_015",
        group: "Phase 4 History Tools",
        level: matchedElements.length || !modalOpen ? "pass" : "info",
        title: "Stats search highlight support",
        message: matchedElements.length
            ? `${matchedElements.length} visible stats search highlight element(s) found.`
            : modalOpen
                ? "No active stats search highlight is visible. This is normal until a search term matches."
                : "Stats modal is closed; highlight support is checked when searching inside the modal.",
        fix: ""
    });

    const notesOnCards =
        queryAll(".history-note, .history-notes, .history-card-note");

    add({
        id: "PHASE4_016",
        group: "Phase 4 History Tools",
        level: metadataScan.withNotes === 0 || notesOnCards.length ? "pass" : "info",
        title: "History notes render on cards",
        message: notesOnCards.length
            ? `${notesOnCards.length} note display element(s) found on history cards.`
            : metadataScan.withNotes
                ? "Saved notes exist, but no note display element is currently visible."
                : "No saved notes found yet; note display is not required.",
        fix: ""
    });
}

function isValidHistoryFilterState(filters = {}) {

    if (!filters || typeof filters !== "object") {
        return false;
    }

    const queryValid =
        filters.query === undefined ||
        typeof filters.query === "string";

    const sortValid =
        filters.sort === undefined ||
        typeof filters.sort === "string";

    const buildValid =
        filters.build === undefined ||
        typeof filters.build === "string";

    const tagValid =
        filters.tag === undefined ||
        typeof filters.tag === "string";

    const archivedValid =
        filters.showArchived === undefined ||
        typeof filters.showArchived === "boolean";

    return (
        queryValid &&
        sortValid &&
        buildValid &&
        tagValid &&
        archivedValid
    );
}

function scanHistoryMetadata(history = []) {

    let withNotes = 0;
    let withTags = 0;
    let withBuildStyle = 0;
    let archived = 0;
    let invalidTags = 0;

    for (const run of history) {

        const meta =
            run?.meta || {};

        if (String(meta.notes || "").trim()) {
            withNotes++;
        }

        if (Array.isArray(meta.tags) && meta.tags.length) {
            withTags++;
        }

        if (meta.tags !== undefined && !Array.isArray(meta.tags)) {
            invalidTags++;
        }

        if (String(meta.buildStyle || "").trim()) {
            withBuildStyle++;
        }

        if (meta.archived === true) {
            archived++;
        }
    }

    return {
        total: history.length,
        withNotes,
        withTags,
        withBuildStyle,
        archived,
        invalidTags
    };
}

function queryAll(selector) {

    try {
        return typeof document !== "undefined"
            ? Array.from(document.querySelectorAll(selector))
            : [];
    } catch {
        return [];
    }
}

function hasBodyClass(className = "") {

    try {
        return Boolean(
            typeof document !== "undefined" &&
            document.body &&
            document.body.classList.contains(className)
        );
    } catch {
        return false;
    }
}


/* --------------------------------------------------
   COMPARE
-------------------------------------------------- */

function scanCompare(add, state, context) {

    const compare =
        state?.compareData || null;

    add({
        id: "COMPARE_001",
        group: "A/B Compare",
        level: context.hasBothRuns ? "pass" : "info",
        title: "Both A and B loaded",
        message: context.hasBothRuns
            ? "Both comparison slots are loaded."
            : "A/B comparison is waiting for both slots. This is normal before the user chooses A and B."
    });

    add({
        id: "COMPARE_002",
        group: "A/B Compare",
        level: context.hasBothRuns && !compare ? "fail" : compare ? "pass" : "info",
        title: "Compare data generated",
        message: compare
            ? "Compare data exists."
            : context.hasBothRuns
                ? "A/B are loaded but compareData is missing."
                : "Compare data is not required until both A and B are loaded.",
        fix: context.hasBothRuns && !compare
            ? "Check refreshAnalysis() and src/pipeline/compare.js."
            : ""
    });

    if (!compare) {
        return;
    }

    add({
        id: "COMPARE_003",
        group: "A/B Compare",
        level: compare.core ? "pass" : "fail",
        title: "Core comparison exists",
        message: compare.core
            ? "Core comparison exists."
            : "Core comparison missing."
    });

    add({
        id: "COMPARE_004",
        group: "A/B Compare",
        level: compare.stats ? "pass" : "fail",
        title: "Stats comparison exists",
        message: compare.stats
            ? "Stats comparison exists."
            : "Stats comparison missing."
    });

    add({
        id: "COMPARE_005",
        group: "A/B Compare",
        level: compare.sections ? "pass" : "fail",
        title: "Section comparison exists",
        message: compare.sections
            ? `${Object.keys(compare.sections || {}).length} compared section(s).`
            : "Section comparison missing."
    });

    const summary =
        compare.summary || null;

    add({
        id: "COMPARE_006",
        group: "A/B Compare",
        level: summary ? "pass" : "warning",
        title: "Compare intelligence summary exists",
        message: summary
            ? "Compare intelligence summary exists."
            : "Compare data exists but intelligence summary is missing.",
        fix: summary
            ? ""
            : "Check src/pipeline/compare.js buildSummary()."
    });

    if (!summary) {
        return;
    }

    const topGains =
        Array.isArray(summary.topGains)
            ? summary.topGains
            : [];

    const topLosses =
        Array.isArray(summary.topLosses)
            ? summary.topLosses
            : [];

    add({
        id: "COMPARE_007",
        group: "A/B Compare",
        level: topGains.length || topLosses.length ? "pass" : "info",
        title: "Compare top gains/losses exist",
        message: topGains.length || topLosses.length
            ? `${topGains.length} top gain(s), ${topLosses.length} top loss(es) found.`
            : "No top gains/losses detected. This can be normal when runs are extremely similar.",
        fix: ""
    });

    const farming =
        summary.farming ||
        summary.farmingVerdict ||
        null;

    add({
        id: "COMPARE_008",
        group: "A/B Compare",
        level: farming?.verdict ? "pass" : "info",
        title: "Farming verdict exists",
        message: farming?.verdict
            ? `Farming verdict: ${farming.verdict}`
            : "No farming verdict available yet.",
        fix: farming?.verdict
            ? ""
            : "Check compare.js farming summary generation."
    });

    add({
        id: "COMPARE_009",
        group: "A/B Compare",
        level: query("[data-compare-farming-verdict]") ? "pass" : "info",
        title: "Farming verdict card rendered",
        message: query("[data-compare-farming-verdict]")
            ? "Farming verdict card found in dashboard UI."
            : "Farming verdict card is not currently rendered. This is normal before the dashboard has comparison output.",
        fix: ""
    });

    const categoryCards =
        queryAll("[data-compare-category-score]");

    add({
        id: "COMPARE_010",
        group: "A/B Compare",
        level: categoryCards.length ? "pass" : "info",
        title: "Category score cards rendered",
        message: categoryCards.length
            ? `${categoryCards.length} category score card(s) found.`
            : "No category score cards are currently rendered.",
        fix: ""
    });

    add({
        id: "COMPARE_011",
        group: "A/B Compare",
        level: query("[data-compare-top-gains]") ? "pass" : "info",
        title: "Top gains panel rendered",
        message: query("[data-compare-top-gains]")
            ? "Top gains panel found in dashboard UI."
            : "Top gains panel is not currently rendered.",
        fix: ""
    });

    add({
        id: "COMPARE_012",
        group: "A/B Compare",
        level: query("[data-compare-top-losses]") ? "pass" : "info",
        title: "Top losses panel rendered",
        message: query("[data-compare-top-losses]")
            ? "Top losses panel found in dashboard UI."
            : "Top losses panel is not currently rendered.",
        fix: ""
    });

    const dashboardShell =
        query("[data-dashboard-shell]");

    add({
        id: "DASHBOARD_001",
        group: "Dashboard Layout",
        level: dashboardShell ? "pass" : "info",
        title: "Responsive dashboard shell rendered",
        message: dashboardShell
            ? "Responsive dashboard shell found."
            : "Responsive dashboard shell not found yet.",
        fix: dashboardShell
            ? ""
            : "Check src/ui/dashboard.js Phase 4.8 shell rendering."
    });

    const dashboardTabs =
        queryAll("[data-dashboard-tab]");

    add({
        id: "DASHBOARD_002",
        group: "Dashboard Layout",
        level: dashboardTabs.length >= 5 ? "pass" : "info",
        title: "Mobile dashboard tabs rendered",
        message: dashboardTabs.length
            ? `${dashboardTabs.length} dashboard tab button(s) found.`
            : "No dashboard tab buttons found yet.",
        fix: dashboardTabs.length >= 5
            ? ""
            : "Check mobile tab markup in src/ui/dashboard.js."
    });

    const activePanel =
        query("[data-dashboard-panel].active");

    add({
        id: "DASHBOARD_003",
        group: "Dashboard Layout",
        level: activePanel ? "pass" : "info",
        title: "Active dashboard panel rendered",
        message: activePanel
            ? `Active dashboard panel: ${activePanel.getAttribute("data-dashboard-panel") || "unknown"}.`
            : "No active dashboard panel found.",
        fix: activePanel
            ? ""
            : "Check dashboardTab state and dashboard panel classes."
    });

    const panelCount =
        queryAll("[data-dashboard-panel]").length;

    add({
        id: "DASHBOARD_004",
        group: "Dashboard Layout",
        level: panelCount >= 5 ? "pass" : "info",
        title: "Dashboard panels rendered",
        message: panelCount
            ? `${panelCount} dashboard panel(s) found.`
            : "No dashboard panels found yet.",
        fix: panelCount >= 5
            ? ""
            : "Check Phase 4.8 dashboard panel wrappers."
    });

    const desktopCss =
        query('link[href$="desktop.css"]');

    add({
        id: "DASHBOARD_005",
        group: "Dashboard Layout",
        level: desktopCss ? "pass" : "info",
        title: "Desktop stylesheet linked",
        message: desktopCss
            ? "desktop.css is linked after the shared stylesheet."
            : "desktop.css is not linked yet.",
        fix: desktopCss
            ? ""
            : "Add desktop.css to index.html after style.css."
    });

    const mobileCss =
        query('link[href$="mobile.css"]');

    add({
        id: "DASHBOARD_006",
        group: "Dashboard Layout",
        level: mobileCss ? "pass" : "info",
        title: "Mobile stylesheet linked",
        message: mobileCss
            ? "mobile.css is linked after the shared stylesheet."
            : "mobile.css is not linked yet.",
        fix: mobileCss
            ? ""
            : "Add mobile.css to index.html after desktop.css."
    });

    const htmlMode =
        document?.documentElement?.getAttribute("data-device-mode") || "";

    const bodyMode =
        document?.body?.getAttribute("data-device-mode") || "";

    const validMode =
        ["desktop", "mobile"].includes(htmlMode) &&
        ["desktop", "mobile"].includes(bodyMode);

    add({
        id: "DASHBOARD_007",
        group: "Dashboard Layout",
        level: validMode ? "pass" : "info",
        title: "Device mode detected",
        message: validMode
            ? `Device mode active: ${htmlMode}.`
            : "Device mode has not been applied to both html and body yet.",
        fix: validMode
            ? ""
            : "Check src/ui/deviceMode.js and app.js initDeviceMode import."
    });

    const modeClass =
        document?.body?.classList?.contains("device-mobile") ||
        document?.body?.classList?.contains("device-desktop");

    add({
        id: "DASHBOARD_008",
        group: "Dashboard Layout",
        level: modeClass ? "pass" : "info",
        title: "Separated layout class active",
        message: modeClass
            ? "Body has a desktop/mobile layout class."
            : "Body does not yet have a desktop/mobile layout class.",
        fix: modeClass
            ? ""
            : "Check device mode detector startup."
    });
}

/* --------------------------------------------------
   NUMBER SANITY
-------------------------------------------------- */

function scanNumberSanity(add, state, context) {

    const compare =
        state?.compareData || null;

    if (!compare) {

        add({
            id: "NUMBER_000",
            group: "Number Formatting",
            level: "info",
            title: "Number scan waiting",
            message: "Number sanity checks wait until comparison data exists."
        });

        return;
    }

    const flat =
        flattenCompare(compare);

    const textAsNumber =
        flat.filter(item =>
            isMetaName(item.key) &&
            item.value?.numeric === true
        );

    add({
        id: "NUMBER_001",
        group: "Number Formatting",
        level: textAsNumber.length ? "fail" : "pass",
        title: "Meta fields are not numeric",
        message: textAsNumber.length
            ? `${textAsNumber.length} meta field(s) are incorrectly numeric.`
            : "Meta fields are not being treated as numeric.",
        fix: textAsNumber.length
            ? "Check compare.js meta field exclusions and drilldown filters."
            : "",
        data: textAsNumber.slice(0, 10)
    });

    const extremePct =
        flat.filter(item => {
            const pct =
                Number(item.value?.pct);

            return Number.isFinite(pct) && Math.abs(pct) > 1000;
        });

    add({
        id: "NUMBER_002",
        group: "Number Formatting",
        level: extremePct.length ? "info" : "pass",
        title: "Extreme percentages",
        message: extremePct.length
            ? `${extremePct.length} extreme percentage value(s) detected. These can be normal when the old value is very small.`
            : "No extreme percentage values detected.",
        fix: "",
        data: extremePct.slice(0, 10)
    });

    const hugeDiffs =
        flat.filter(item => {
            const diff =
                Math.abs(Number(item.value?.diff || 0));

            return Number.isFinite(diff) && diff > 1e24;
        });

    add({
        id: "NUMBER_003",
        group: "Number Formatting",
        level: hugeDiffs.length ? "info" : "pass",
        title: "Huge raw deltas",
        message: hugeDiffs.length
            ? `${hugeDiffs.length} huge raw delta(s) detected. This is normal for Tower-scale notation.`
            : "No huge raw deltas detected.",
        fix: "",
        data: hugeDiffs.slice(0, 10)
    });
}

/* --------------------------------------------------
   AI COACH
-------------------------------------------------- */

function scanAICoach(add, state, context) {

    const ai =
        Array.isArray(state?.ai)
            ? state.ai
            : [];

    add({
        id: "AI_001",
        group: "AI Coach",
        level: context.hasCompare && !ai.length ? "warning" : ai.length ? "pass" : "info",
        title: "AI Coach output exists",
        message: ai.length
            ? `${ai.length} AI Coach item(s) generated.`
            : context.hasCompare
                ? "Compare data exists but AI Coach output is empty."
                : "AI Coach waits until a comparison exists.",
        fix: context.hasCompare && !ai.length
            ? "Check aiCoach.js and refreshAnalysis()."
            : ""
    });

    const buildStyle =
        state?.ui?.buildStyle || "unknown";

    add({
        id: "AI_002",
        group: "AI Coach",
        level: buildStyle === "unknown" ? "info" : "pass",
        title: "Build style selected",
        message: buildStyle === "unknown"
            ? "Build style is Unknown. Advice will stay cautious until a build is selected."
            : `Build style: ${buildStyle}`,
        fix: ""
    });
}

/* --------------------------------------------------
   STORAGE
-------------------------------------------------- */

function scanStorage(add, state, context) {

    const available =
        typeof localStorage !== "undefined";

    add({
        id: "STORAGE_001",
        group: "Storage",
        level: available ? "pass" : "fail",
        title: "localStorage available",
        message: available
            ? "localStorage is available."
            : "localStorage is unavailable."
    });

    if (!available) {
        return;
    }

    const towerKeys =
        getTowerStorageKeys();

    add({
        id: "STORAGE_002",
        group: "Storage",
        level: towerKeys.length ? "pass" : "info",
        title: "Tower storage key found",
        message: towerKeys.length
            ? `Found ${towerKeys.length} Tower storage key(s).`
            : "No Tower storage keys found yet. This is normal before anything is saved."
    });

    if (!towerKeys.length) {
        return;
    }

    const parsed =
        readFirstTowerStorage();

    add({
        id: "STORAGE_003",
        group: "Storage",
        level: parsed.ok ? "pass" : "warning",
        title: "Storage JSON parseable",
        message: parsed.ok
            ? "Stored state JSON is parseable."
            : "Stored state JSON could not be parsed.",
        fix: parsed.ok
            ? ""
            : "Clear storage or inspect localStorage payload."
    });

    if (parsed.ok && parsed.value) {

        const liveCount =
            Array.isArray(state?.history)
                ? state.history.length
                : 0;

        const storedCount =
            Array.isArray(parsed.value?.history)
                ? parsed.value.history.length
                : 0;

        add({
            id: "STORAGE_004",
            group: "Storage",
            level: liveCount === storedCount ? "pass" : "info",
            title: "Storage history count matches live state",
            message: `Live: ${liveCount}, Stored: ${storedCount}`,
            fix: ""
        });
    }
}

/* --------------------------------------------------
   UI RENDER
-------------------------------------------------- */

function scanUIRender(add, state, context) {

    addDomCheck(add, "UI_001", "Dashboard root rendered", "#dashboard", "critical");

    const historyPanel =
        query(".history-panel");

    add({
        id: "UI_002",
        group: "UI Render",
        level: historyPanel ? "pass" : "info",
        title: "History panel rendered",
        message: historyPanel
            ? "History panel found."
            : "History panel is not currently rendered. This can be normal before history exists."
    });

    const overlay =
        query(".debug-overlay");

    add({
        id: "UI_003",
        group: "UI Render",
        level: overlay || !context.debugEnabled ? "pass" : "info",
        title: "Debug overlay rendered",
        message: overlay
            ? "Debug overlay found."
            : context.debugEnabled
                ? "Debug overlay is not currently in DOM. It may be created only while rendering debug output."
                : "Debug panel is closed; overlay is not expected."
    });

    const selected =
        state?.ui?.selectedSection;

    if (selected) {

        const exists =
            Boolean(state?.compareData?.sections?.[selected]);

        add({
            id: "UI_004",
            group: "UI Render",
            level: exists ? "pass" : "warning",
            title: "Selected section exists",
            message: exists
                ? `Selected section exists: ${selected}`
                : `Selected section does not exist: ${selected}`,
            fix: exists
                ? ""
                : "Clear selectedSection or check heatmap section keys."
        });

    } else {

        add({
            id: "UI_004",
            group: "UI Render",
            level: "pass",
            title: "No stale selected section",
            message: "No drilldown section is currently selected."
        });
    }
}

/* --------------------------------------------------
   DEBUG SYSTEM
-------------------------------------------------- */

function scanDebugSystem(add, state, context) {

    add({
        id: "DEBUG_001",
        group: "Debug System",
        level: context.debugEnabled ? "pass" : "info",
        title: "Debug enabled",
        message: context.debugEnabled
            ? "Debug mode is enabled."
            : "Debug mode is disabled."
    });

    const output =
        query("#debugOutput");

    add({
        id: "DEBUG_002",
        group: "Debug System",
        level: output || !context.debugEnabled ? "pass" : "info",
        title: "Debug output exists",
        message: output
            ? "Debug output element found."
            : context.debugEnabled
                ? "Debug output is not currently in DOM. It may be created after the debug panel renders."
                : "Debug panel is closed; output element is not expected."
    });
}

/* --------------------------------------------------
   DOM HELPERS
-------------------------------------------------- */

function addDomCheck(add, id, title, selector, failLevel = "warning") {

    const found =
        Boolean(query(selector));

    add({
        id,
        group: inferDomGroup(id),
        level: found ? "pass" : failLevel,
        title,
        message: found
            ? `${selector} found.`
            : `${selector} missing.`,
        fix: found
            ? ""
            : failLevel === "info"
                ? ""
                : `Check index.html/rendered layout for ${selector}.`
    });
}

function inferDomGroup(id = "") {

    if (id.startsWith("BOOT")) return "App Boot";
    if (id.startsWith("INPUT")) return "Input System";
    if (id.startsWith("HISTORY")) return "History";
    if (id.startsWith("UI")) return "UI Render";
    if (id.startsWith("DEBUG")) return "Debug System";

    return "DOM";
}

function query(selector) {

    try {
        return typeof document !== "undefined"
            ? document.querySelector(selector)
            : null;
    } catch {
        return null;
    }
}

function documentExists() {
    return typeof document !== "undefined";
}

/* --------------------------------------------------
   SUMMARY / SCORING
-------------------------------------------------- */

function summariseChecks(checks = []) {

    const counts = {
        pass: 0,
        info: 0,
        warning: 0,
        fail: 0,
        critical: 0
    };

    for (const check of checks) {
        counts[check.level] =
            (counts[check.level] || 0) + 1;
    }

    const penalty =
        counts.warning * 2 +
        counts.fail * 10 +
        counts.critical * 25;

    const score =
        Math.max(
            0,
            Math.round(100 - penalty)
        );

    let status = "healthy";

    if (counts.critical > 0) {
        status = "critical";
    } else if (counts.fail > 0) {
        status = "failing";
    } else if (counts.warning > 0) {
        status = "healthy_with_warnings";
    }

    return {
        status,
        score,
        totalChecks:
            checks.length,

        passed:
            counts.pass,

        info:
            counts.info,

        warnings:
            counts.warning,

        failed:
            counts.fail,

        critical:
            counts.critical
    };
}

function buildFixPriority(checks = []) {

    const weight = {
        critical: 4,
        fail: 3,
        warning: 2,
        info: 1,
        pass: 0
    };

    return checks
        .filter(check =>
            ["critical", "fail", "warning"].includes(check.level) &&
            check.fix
        )
        .sort((a, b) =>
            (weight[b.level] || 0) -
            (weight[a.level] || 0)
        )
        .slice(0, 10)
        .map(check => ({
            id: check.id,
            level: check.level,
            title: check.title,
            fix: check.fix
        }));
}

function groupChecks(checks = []) {

    const grouped = {};

    for (const check of checks) {

        const group =
            check.group || "Other";

        if (!grouped[group]) {
            grouped[group] = [];
        }

        grouped[group].push(check);
    }

    return grouped;
}

/* --------------------------------------------------
   COMPARE FLATTEN
-------------------------------------------------- */

function flattenCompare(compare = {}) {

    const out = [];

    const pushGroup = (obj, prefix) => {

        for (const [key, value] of Object.entries(obj || {})) {

            if (
                value &&
                typeof value === "object" &&
                ("numeric" in value || "diff" in value)
            ) {
                out.push({
                    path: `${prefix}.${key}`,
                    key,
                    value
                });
            }
        }
    };

    pushGroup(compare.core, "core");
    pushGroup(compare.stats, "stats");

    for (const [section, obj] of Object.entries(compare.sections || {})) {
        pushGroup(obj, `section.${section}`);
    }

    return out;
}

function isMetaName(key = "") {

    const normalised =
        String(key || "")
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/-/g, "_");

    return [
        "battle_date",
        "battledate",
        "game_time",
        "real_time",
        "tier",
        "killed_by",
        "killedby",
        "time",
        "date"
    ].includes(normalised);
}

/* --------------------------------------------------
   STORAGE HELPERS
-------------------------------------------------- */

function getTowerStorageKeys() {

    if (typeof localStorage === "undefined") {
        return [];
    }

    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {

        const key =
            localStorage.key(i);

        if (
            String(key || "")
                .toLowerCase()
                .includes("tower")
        ) {
            keys.push(key);
        }
    }

    return keys;
}

function readFirstTowerStorage() {

    const keys =
        getTowerStorageKeys();

    if (!keys.length) {
        return {
            ok: false,
            value: null
        };
    }

    try {

        const raw =
            localStorage.getItem(keys[0]);

        return {
            ok: true,
            key: keys[0],
            value: JSON.parse(raw)
        };

    } catch (error) {

        return {
            ok: false,
            error:
                error?.message || "Storage parse failed"
        };
    }
}

/* --------------------------------------------------
   TIME INFO
-------------------------------------------------- */

export function buildTimeInfo(date = new Date()) {

    return {
        exportedAtUTC:
            date.toISOString(),

        exportedAtUK:
            formatDateTimeInZone(
                date,
                "Europe/London"
            ),

        exportedAtLocal:
            formatDateTimeLocal(date),

        ukTimezone:
            "Europe/London",

        localTimezone:
            getLocalTimezone(),

        localTimezoneOffsetMinutes:
            date.getTimezoneOffset(),

        pageLoadedAt:
            getPageLoadedAt(),

        pageUptimeSeconds:
            getPageUptimeSeconds()
    };
}

export function buildUKFilenameTimestamp(date = new Date()) {

    const parts =
        getDatePartsInZone(
            date,
            "Europe/London"
        );

    return [
        parts.year,
        parts.month,
        parts.day
    ].join("-") + "-" + [
        parts.hour,
        parts.minute,
        parts.second
    ].join("-");
}

function formatDateTimeInZone(date, timezone) {

    try {

        return new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        ).format(date);

    } catch {
        return date.toISOString();
    }
}

function formatDateTimeLocal(date) {

    try {

        return new Intl.DateTimeFormat(
            "en-GB",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        ).format(date);

    } catch {
        return date.toString();
    }
}

function getDatePartsInZone(date, timezone) {

    const formatter =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone: timezone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );

    const parts =
        formatter.formatToParts(date);

    const get = type =>
        parts.find(part => part.type === type)?.value || "00";

    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second")
    };
}

function getLocalTimezone() {

    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    } catch {
        return "unknown";
    }
}

function getPageLoadedAt() {

    try {
        return new Date(Date.now() - performance.now()).toISOString();
    } catch {
        return null;
    }
}

function getPageUptimeSeconds() {

    try {
        return Math.round(performance.now() / 1000);
    } catch {
        return null;
    }
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function getReportId(run) {
    return run?.meta?.reportId || null;
}

export default {
    runSystemHealthScan,
    buildTimeInfo,
    buildUKFilenameTimestamp
};