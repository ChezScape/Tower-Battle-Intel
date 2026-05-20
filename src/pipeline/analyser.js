"use strict";

/**
 * ANALYSER v10 (FULL BATTLE LOG AWARE)
 * Now consumes hierarchical compare engine output:
 *
 * compare = {
 *   core,
 *   stats,
 *   sections
 * }
 */

export function analyser(current, previous, compare = null) {

    if (!current || !compare) return [];

    const out = [];

    const core = compare.core || {};
    const stats = compare.stats || {};
    const sections = compare.sections || {};

    // -----------------------------
    // CORE ECONOMY SIGNAL
    // -----------------------------
    const coinsDiff = core.coins?.diff ?? 0;
    const coinsPct = core.coins?.pct ?? 0;

    if (coinsPct > 30) {
        out.push({
            severity: "good",
            title: "Explosive Economy Growth",
            message: `Coins increased massively (+${coinsPct.toFixed(1)}%).`
        });

    } else if (coinsPct < -20) {
        out.push({
            severity: "bad",
            title: "Economy Collapse",
            message: `Coins dropped sharply (${coinsPct.toFixed(1)}%).`
        });
    }

    // -----------------------------
    // WAVE PROGRESSION
    // -----------------------------
    const waveDiff = core.wave?.diff ?? 0;

    if (waveDiff > 200) {
        out.push({
            severity: "good",
            title: "Wave Breakthrough",
            message: "Significant progression increase detected."
        });

    } else if (waveDiff < -100) {
        out.push({
            severity: "bad",
            title: "Wave Regression",
            message: "Progression has declined."
        });
    }

    // -----------------------------
    // EFFICIENCY ENGINE
    // -----------------------------
    const effDiff = stats.efficiency?.diff ?? 0;

    if (effDiff > 0.2) {
        out.push({
            severity: "good",
            title: "Efficiency Improved",
            message: "Better output per resource unit."
        });

    } else if (effDiff < -0.2) {
        out.push({
            severity: "bad",
            title: "Efficiency Loss",
            message: "Run efficiency has dropped."
        });
    }

    // -----------------------------
    // SECTION INTELLIGENCE
    // (Damage / Utility / Coins / etc)
    // -----------------------------
    if (sections) {

        const damage = sections.damage || {};
        const coins = sections.coins || {};
        const utility = sections.utility || {};

        const dmgKeys = Object.values(damage);
        const coinKeys = Object.values(coins);
        const utilKeys = Object.values(utility);

        const changedDamage = dmgKeys.filter(v => v?.changed).length;
        const changedCoins = coinKeys.filter(v => v?.changed).length;
        const changedUtility = utilKeys.filter(v => v?.changed).length;

        if (changedDamage > 5) {
            out.push({
                severity: "neutral",
                title: "Combat Variance High",
                message: "Multiple damage systems changed between runs."
            });
        }

        if (changedCoins > 3) {
            out.push({
                severity: "good",
                title: "Coin Source Shift",
                message: "Economy distribution changed significantly."
            });
        }

        if (changedUtility > 4) {
            out.push({
                severity: "neutral",
                title: "Utility Build Variation",
                message: "Utility systems behave differently between runs."
            });
        }
    }

    // -----------------------------
    // SUMMARY SIGNAL
    // -----------------------------
    const totalScore =
        (coinsPct * 0.5) +
        (waveDiff * 0.02) +
        (effDiff * 100);

    if (totalScore > 50) {
        out.push({
            severity: "good",
            title: "Strong Overall Run",
            message: "All systems show positive synergy."
        });

    } else if (totalScore < -30) {
        out.push({
            severity: "bad",
            title: "Weak Overall Run",
            message: "Multiple systems underperforming together."
        });
    }

    return out;
}
