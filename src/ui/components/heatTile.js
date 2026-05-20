"use strict";

/**
 * HEAT TILE COMPONENT
 * Single clickable subsystem tile for heatmap layout.
 */

import {
    formatDelta
} from "../utils/deltaFormat.js";

/* --------------------------------------------------
   HEAT TILE
-------------------------------------------------- */

export function HeatTile({
    name = "",
    label = "",
    value = 0,
    severity = "neutral",
    active = false,
    opacity = 0.16
} = {}) {

    const safeName =
        escapeAttr(name);

    const displayLabel =
        label || formatLabel(name);

    return `
        <div
            class="wa-heat ${escapeAttr(severity)} ${active ? "active" : ""}"
            data-section="${safeName}"
            style="--heat-opacity:${safeOpacity(opacity)};"
        >

            <div class="wa-heat-name">
                ${escapeHTML(displayLabel)}
            </div>

            <div class="wa-heat-value">
                ${formatDelta(value, {
                    compact: true
                })}
            </div>

        </div>
    `;
}

/* --------------------------------------------------
   ALIAS
-------------------------------------------------- */

export const buildHeatTile = HeatTile;

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function formatLabel(value = "") {

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function safeOpacity(value) {

    const num =
        Number(value);

    if (!Number.isFinite(num)) {
        return "0.16";
    }

    return String(
        Math.max(
            0,
            Math.min(num, 1)
        )
    );
}

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
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
