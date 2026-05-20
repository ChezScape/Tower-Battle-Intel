"use strict";

/**
 * ANOMALY ENGINE
 * Detects suspicious, broken, or unusual battle telemetry.
 *
 * Output shape is UI-card compatible:
 * {
 *   type,
 *   severity,
 *   title,
 *   message
 * }
 */

/* --------------------------------------------------
   MAIN ENTRY
-------------------------------------------------- */

export function detectAnomalies({
    current = null,
    previous = null,
    compareData = null,
    trend = null,
    history = []
} = {}) {

    const anomalies = [];

    if (!current) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Missing Current Run",
            message: "No current run was available for anomaly analysis."
        });

        return anomalies;
    }

    checkCoreIntegrity(current, anomalies);
    checkStatsIntegrity(current, anomalies);
    checkSectionIntegrity(current, anomalies);

    if (compareData) {
        checkCompareAnomalies(compareData, anomalies);
    }

    if (trend) {
        checkTrendAnomalies(current, trend, anomalies);
    }

    if (Array.isArray(history)) {
        checkHistoryAnomalies(history, anomalies);
    }

    return anomalies;
}

/* --------------------------------------------------
   CORE CHECKS
-------------------------------------------------- */

function checkCoreIntegrity(run, anomalies) {

    const core = run?.core || {};

    if (!isValidPositive(core.wave)) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Invalid Wave",
            message: "Wave value is missing or zero. Parser or compute may have failed."
        });
    }

    if (!isValidNumber(core.coins)) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Invalid Coins",
            message: "Coins value is not a valid number."
        });
    }

    if (!isValidNumber(core.cells)) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Invalid Cells",
            message: "Cells value is not a valid number."
        });
    }

    if (!isValidPositive(core.time)) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Missing Time",
            message: "Run time is missing or zero, so per-hour metrics may be unreliable."
        });
    }

    if (core.coins === 0 && core.wave > 1000) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Suspicious Economy Parse",
            message: "Wave is high but coins are zero. Number suffix parsing may be broken."
        });
    }

    if (core.cells === 0 && core.wave > 1000) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Suspicious Cell Parse",
            message: "Wave is high but cells are zero. Cell value parsing may need checking."
        });
    }
}

/* --------------------------------------------------
   STATS CHECKS
-------------------------------------------------- */

function checkStatsIntegrity(run, anomalies) {

    const stats = run?.stats || {};

    for (const [key, value] of Object.entries(stats)) {

        if (!Number.isFinite(Number(value))) {

            anomalies.push({
                type: "anomaly",
                severity: "bad",
                title: "Invalid Stat",
                message: `${key} is not a valid number.`
            });
        }
    }

    if ((stats.coinsPerHour || 0) === 0 && run?.core?.coins > 0) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Coins Per Hour Missing",
            message: "Coins exist, but coins per hour is zero."
        });
    }

    if ((stats.cellsPerHour || 0) === 0 && run?.core?.cells > 0) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Cells Per Hour Missing",
            message: "Cells exist, but cells per hour is zero."
        });
    }
}

/* --------------------------------------------------
   SECTION CHECKS
-------------------------------------------------- */

function checkSectionIntegrity(run, anomalies) {

    const sections = run?.sections || {};

    const count =
        Object.keys(sections).length;

    if (!count) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "No Battle Sections",
            message: "No report sections survived into the computed run. Full battle diff cannot work."
        });

        return;
    }

    const importantSections = [
        "damage",
        "utility",
        "coins",
        "currencies",
        "total_enemies",
        "enemies_destroyed_by"
    ];

    for (const section of importantSections) {

        if (!sections[section]) {

            anomalies.push({
                type: "anomaly",
                severity: "neutral",
                title: "Missing Section",
                message: `${section} section is missing from this run.`
            });
        }
    }
}

/* --------------------------------------------------
   COMPARE CHECKS
-------------------------------------------------- */

function checkCompareAnomalies(compareData, anomalies) {

    const core =
        compareData?.core || {};

    const sections =
        compareData?.sections || {};

    const waveDiff =
        core.wave?.diff ?? 0;

    const coinPct =
        core.coins?.pct ?? 0;

    const cellPct =
        core.cells?.pct ?? 0;

    if (waveDiff > 0 && coinPct < -25) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Progression / Economy Split",
            message: "Wave increased, but coins dropped heavily. This run reached deeper but farmed worse."
        });
    }

    if (waveDiff < 0 && coinPct > 25) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Economy / Progression Split",
            message: "Coins increased while wave dropped. Farming improved but survivability/progression fell."
        });
    }

    if (cellPct < -20) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Cell Output Drop",
            message: `Cells dropped by ${Math.abs(cellPct).toFixed(1)}%.`
        });
    }

    if (!Object.keys(sections).length) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "No Section Diff",
            message: "Compare engine has no section diff data."
        });
    }
}

/* --------------------------------------------------
   TREND CHECKS
-------------------------------------------------- */

function checkTrendAnomalies(current, trend, anomalies) {

    const coins =
        Number(current?.core?.coins || 0);

    const wave =
        Number(current?.core?.wave || 0);

    if (trend.avgCoins && coins < trend.avgCoins * 0.75) {

        anomalies.push({
            type: "anomaly",
            severity: "bad",
            title: "Below Coin Baseline",
            message: "This run is more than 25% below your average coin output."
        });
    }

    if (trend.avgWave && wave < trend.avgWave * 0.9) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Below Wave Baseline",
            message: "This run ended noticeably below your usual wave range."
        });
    }

    if (trend.stabilityScore != null && trend.stabilityScore < 35) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Unstable Trend",
            message: "Recent runs are highly variable. More data may be needed before strong conclusions."
        });
    }
}

/* --------------------------------------------------
   HISTORY CHECKS
-------------------------------------------------- */

function checkHistoryAnomalies(history, anomalies) {

    if (history.length > 100) {

        anomalies.push({
            type: "anomaly",
            severity: "neutral",
            title: "Large History",
            message: "History contains over 100 runs. Consider trimming if performance drops."
        });
    }
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function isValidNumber(value) {

    return Number.isFinite(Number(value));
}

function isValidPositive(value) {

    const num = Number(value);

    return Number.isFinite(num) && num > 0;
}