"use strict";

/**
 * TIME ENGINE v4.10b
 * Central report time parsing + formatting.
 */

export function parseTimeToSeconds(input) {
    if (input == null) return 0;

    if (typeof input === "number") {
        return Number.isFinite(input) ? input : 0;
    }

    const str = String(input).trim().toLowerCase();
    if (!str) return 0;

    const colon = parseColonTime(str);
    if (colon > 0) return colon;

    const weeks = matchUnit(str, "w");
    const days = matchUnit(str, "d");
    const hours = matchUnit(str, "h");
    const minutes = matchUnit(str, "m");
    const seconds = matchUnit(str, "s");

    const total =
        weeks * 604800 +
        days * 86400 +
        hours * 3600 +
        minutes * 60 +
        seconds;

    return Number.isFinite(total) ? total : 0;
}

export function secondsToHours(seconds) {
    const num = Number(seconds || 0);
    return Number.isFinite(num) && num > 0 ? num / 3600 : 0;
}

export function hoursToSeconds(hours) {
    const num = Number(hours || 0);
    return Number.isFinite(num) && num > 0 ? num * 3600 : 0;
}

export function formatSeconds(seconds = 0) {
    let total = Math.floor(Number(seconds || 0));

    if (!Number.isFinite(total) || total <= 0) {
        return "0s";
    }

    const d = Math.floor(total / 86400);
    total %= 86400;
    const h = Math.floor(total / 3600);
    total %= 3600;
    const m = Math.floor(total / 60);
    const s = total % 60;

    const out = [];
    if (d) out.push(`${d}d`);
    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    if (s || !out.length) out.push(`${s}s`);

    return out.join(" ");
}

export function formatDuration(seconds = 0) {
    return formatSeconds(seconds);
}

export function resolveBattleTime({ realTime = "", gameTime = "", fallback = "" } = {}) {
    const real = parseTimeToSeconds(realTime);
    if (real > 0) return real;

    const game = parseTimeToSeconds(gameTime);
    if (game > 0) return game;

    return parseTimeToSeconds(fallback);
}

export function buildTimeModel({ realTime = "", gameTime = "", fallback = "" } = {}) {
    const realSeconds = parseTimeToSeconds(realTime);
    const gameSeconds = parseTimeToSeconds(gameTime);
    const selectedSeconds = realSeconds > 0
        ? realSeconds
        : gameSeconds > 0
        ? gameSeconds
        : parseTimeToSeconds(fallback);

    return {
        realSeconds,
        gameSeconds,
        selectedSeconds,
        realHours: secondsToHours(realSeconds),
        gameHours: secondsToHours(gameSeconds),
        selectedHours: secondsToHours(selectedSeconds),
        display: formatSeconds(selectedSeconds)
    };
}

function matchUnit(str, unit) {
    const regex = new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*${unit}\\b`, "i");
    const match = regex.exec(str);

    if (!match) return 0;

    const value = Number(match[1]);
    return Number.isFinite(value) ? value : 0;
}

function parseColonTime(str = "") {
    if (!/^\d{1,3}:\d{1,2}(?::\d{1,2})?$/.test(str)) {
        return 0;
    }

    const parts = str.split(":").map(Number);

    if (parts.some(part => !Number.isFinite(part))) {
        return 0;
    }

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export default {
    parseTimeToSeconds,
    secondsToHours,
    hoursToSeconds,
    formatSeconds,
    formatDuration,
    resolveBattleTime,
    buildTimeModel
};
