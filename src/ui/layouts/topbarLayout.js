"use strict";

/**
 * TOPBAR LAYOUT
 * Main run comparison command bar
 *
 * A = baseline
 * B = comparison
 * Delta = B - A
 */

import {
    formatNumber,
    formatTime
} from "../utils/format.js";

import {
    formatDelta
} from "../utils/deltaFormat.js";

/* --------------------------------------------------
   BUILD TOPBAR
-------------------------------------------------- */

export function buildTopbar({
    runA = null,
    runB = null,
    compare = {}
} = {}) {

    const core =
        compare?.core || {};

    return `
        <div class="wa-topbar">

            ${block(
                "Baseline A Wave",
                runA?.core?.wave ?? "-"
            )}

            ${block(
                "Compare B Wave",
                runB?.core?.wave ?? "-"
            )}

            ${block(
                "Coin Delta B - A",
                formatDelta(core?.coins?.diff, {
                    compact: true
                }),
                "highlight"
            )}

            ${block(
                "Wave Delta B - A",
                formatDelta(core?.wave?.diff, {
                    compact: false,
                    precision: 0
                }),
                "highlight"
            )}

            ${block(
                "Baseline A Coins",
                formatNumber(runA?.core?.coins ?? 0)
            )}

            ${block(
                "Compare B Coins",
                formatNumber(runB?.core?.coins ?? 0)
            )}

            ${block(
                "Baseline A Time",
                formatTime(runA?.core?.time ?? 0)
            )}

            ${block(
                "Compare B Time",
                formatTime(runB?.core?.time ?? 0)
            )}

        </div>
    `;
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIAS
-------------------------------------------------- */

export function Topbar(runA, runB, core = {}) {

    return buildTopbar({
        runA,
        runB,
        compare: {
            core
        }
    });
}

/* --------------------------------------------------
   BLOCK
-------------------------------------------------- */

function block(label, value, extraClass = "") {

    return `
        <div class="wa-block ${escapeAttr(extraClass)}">

            <div class="wa-label">
                ${escapeHTML(label)}
            </div>

            <div class="wa-value">
                ${escapeHTML(value)}
            </div>

        </div>
    `;
}

/* --------------------------------------------------
   ESCAPE
-------------------------------------------------- */

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}