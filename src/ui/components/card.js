"use strict";

/**
 * CARD COMPONENT
 * Used for:
 * - insights
 * - AI coach cards
 * - anomalies
 * - debug notices
 */

/* --------------------------------------------------
   SINGLE CARD
-------------------------------------------------- */

export function buildCard(item = {}) {

    const {
        type = "info",
        severity = "neutral",
        title = "Untitled",
        message = "",
        meta = ""
    } = normaliseCard(item);

    return `
        <div class="
            wa-card
            wa-card-${escapeAttr(type)}
            ${escapeAttr(severity)}
        ">

            <div class="wa-card-title">
                ${escapeHTML(title)}
            </div>

            <div class="wa-card-msg">
                ${escapeHTML(message)}
            </div>

            ${
                meta
                    ? `
                        <div class="wa-card-meta">
                            ${escapeHTML(meta)}
                        </div>
                    `
                    : ""
            }

        </div>
    `;
}

/* --------------------------------------------------
   MULTI CARD HELPER
-------------------------------------------------- */

export function buildCards(items = []) {

    if (!Array.isArray(items) || !items.length) {

        return `
            <div class="wa-card neutral">

                <div class="wa-card-title">
                    No Data
                </div>

                <div class="wa-card-msg">
                    Empty intelligence feed.
                </div>

            </div>
        `;
    }

    return items
        .map(buildCard)
        .join("");
}

/* --------------------------------------------------
   OLD COMPATIBILITY ALIAS
-------------------------------------------------- */

export const renderCard = buildCard;

/* --------------------------------------------------
   NORMALISE
-------------------------------------------------- */

function normaliseCard(item = {}) {

    if (typeof item === "string") {

        return {
            type: "info",
            severity: "neutral",
            title: "Message",
            message: item,
            meta: ""
        };
    }

    return {
        type:
            item.type || "info",

        severity:
            item.severity || "neutral",

        title:
            item.title || "Untitled",

        message:
            item.message || item.description || "",

        meta:
            item.meta || ""
    };
}

/* --------------------------------------------------
   ESCAPE HELPERS
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
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
