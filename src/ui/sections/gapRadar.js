"use strict";

import { buildRadarChart } from "../components/radarChart.js";
import { sectionTotal, clamp } from "./sectionUtils.js";

export function buildGapPanel(state = {}) {
    const radar = buildRadarScores(state);

    return `
        <section class="tbi-card tbi-gap-panel">
            <div class="tbi-card-heading centered-heading">
                <h3>The Gap In Numbers</h3>
            </div>
            <div class="tbi-radar-wrap">
                ${buildRadarChart(radar)}
            </div>
            <div class="tbi-radar-legend">
                <span class="run-a-line"></span> A
                <span class="run-b-line"></span> B
            </div>
        </section>
    `;
}

function buildRadarScores(state) {
    const sections = state.sections || {};

    return {
        damage: scorePair(sectionTotal(sections.damage), "higher"),
        economy: scorePair(sectionTotal(sections.coins) + numberDiff(state.stats?.coinsPerHour), "higher"),
        survivability: scorePair(
            sectionTotal(sections.damage_blocked) + sectionTotal(sections.health_regenerated) - sectionTotal(sections.damage_taken),
            "higher"
        ),
        utility: scorePair(sectionTotal(sections.utility) + sectionTotal(sections.counts), "higher")
    };
}

function scorePair(diff = 0, direction = "higher") {
    const value = Number(diff || 0);
    const sign = direction === "lower" ? -value : value;
    const magnitude = Math.min(42, Math.log10(Math.abs(value) + 10) * 7);
    const base = 58;

    if (Math.abs(value) < 0.000001) {
        return { a: 56, b: 56 };
    }

    if (sign >= 0) {
        return {
            a: clamp(base - magnitude * 0.35, 24, 90),
            b: clamp(base + magnitude, 28, 96)
        };
    }

    return {
        a: clamp(base + magnitude, 28, 96),
        b: clamp(base - magnitude * 0.35, 24, 90)
    };
}

function numberDiff(data = {}) {
    return Number(data?.diff || 0);
}
