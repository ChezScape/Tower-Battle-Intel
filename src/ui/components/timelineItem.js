"use strict";

/**
 * TIMELINE ITEM COMPONENT
 * Renders one battle history entry.
 */

import {
    formatNumber,
    formatTime
} from "../utils/format.js";

/* --------------------------------------------------
   TIMELINE ITEM
-------------------------------------------------- */

export function TimelineItem({
    index = 0,
    wave = "?",
    coins = 0,
    cells = 0,
    time = 0,
    killedBy = "",
    battleDate = "",
    active = false
} = {}) {

    return `
        <div class="wa-timeline-item ${active ? "active" : ""}">

            <div class="wa-dot"></div>

            <div class="wa-timeline-content">

                <div class="wa-time">
                    Run ${escapeHTML(index)}
                    ${
                        battleDate
                            ? `<span class="wa-date"> — ${escapeHTML(battleDate)}</span>`
                            : ""
                    }
                </div>

                <div class="wa-stats">
                    Wave: ${escapeHTML(wave)}
                    | Coins: ${formatNumber(coins)}
                    | Cells: ${formatNumber(cells)}
                    ${
                        time
                            ? ` | Time: ${formatTime(time)}`
                            : ""
                    }
                    ${
                        killedBy
                            ? ` | Killed By: ${escapeHTML(killedBy)}`
                            : ""
                    }
                </div>

            </div>

        </div>
    `;
}

/* --------------------------------------------------
   ALIAS
-------------------------------------------------- */

export const buildTimelineItem = TimelineItem;

/* --------------------------------------------------
   ESCAPE
-------------------------------------------------- */

function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
