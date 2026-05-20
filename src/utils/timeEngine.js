"use strict";

/**
 * TIME ENGINE
 * Central time parsing + formatting helpers.
 *
 * Handles Battle Report time strings like:
 * - "2d 0h 31m 51s"
 * - "10h 6m 35s"
 * - "606m 35s"
 */

/* --------------------------------------------------
   PARSE TIME STRING TO SECONDS
-------------------------------------------------- */

export function parseTimeToSeconds(input) {

    if (input == null) {
        return 0;
    }

    if (typeof input === "number") {
        return Number.isFinite(input)
            ? input
            : 0;
    }

    const str = String(input)
        .trim()
        .toLowerCase();

    if (!str) {
        return 0;
    }

    let total = 0;

    const days =
        matchUnit(str, "d");

    const hours =
        matchUnit(str, "h");

    const minutes =
        matchUnit(str, "m");

    const seconds =
        matchUnit(str, "s");

    total += days * 86400;
    total += hours * 3600;
    total += minutes * 60;
    total += seconds;

    return Number.isFinite(total)
        ? total
        : 0;
}

/* --------------------------------------------------
   SECONDS TO HOURS
-------------------------------------------------- */

export function secondsToHours(seconds) {

    const num =
        Number(seconds || 0);

    if (!Number.isFinite(num) || num <= 0) {
        return 0;
    }

    return num / 3600;
}

/* --------------------------------------------------
   HOURS TO SECONDS
-------------------------------------------------- */

export function hoursToSeconds(hours) {

    const num =
        Number(hours || 0);

    if (!Number.isFinite(num) || num <= 0) {
        return 0;
    }

    return num * 3600;
}

/* --------------------------------------------------
   FORMAT SECONDS
-------------------------------------------------- */

export function formatSeconds(seconds = 0) {

    let total =
        Math.floor(Number(seconds || 0));

    if (!Number.isFinite(total) || total <= 0) {
        return "0s";
    }

    const d =
        Math.floor(total / 86400);

    total %= 86400;

    const h =
        Math.floor(total / 3600);

    total %= 3600;

    const m =
        Math.floor(total / 60);

    const s =
        total % 60;

    const out = [];

    if (d) out.push(`${d}d`);
    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    if (s) out.push(`${s}s`);

    return out.join(" ");
}

/* --------------------------------------------------
   PICK BEST REPORT TIME
-------------------------------------------------- */

export function resolveBattleTime({
    realTime = "",
    gameTime = "",
    fallback = ""
} = {}) {

    const real =
        parseTimeToSeconds(realTime);

    if (real > 0) {
        return real;
    }

    const game =
        parseTimeToSeconds(gameTime);

    if (game > 0) {
        return game;
    }

    return parseTimeToSeconds(fallback);
}

/* --------------------------------------------------
   SAFE TIME MODEL
-------------------------------------------------- */

export function buildTimeModel({
    realTime = "",
    gameTime = "",
    fallback = ""
} = {}) {

    const realSeconds =
        parseTimeToSeconds(realTime);

    const gameSeconds =
        parseTimeToSeconds(gameTime);

    const selectedSeconds =
        realSeconds > 0
            ? realSeconds
            : gameSeconds > 0
            ? gameSeconds
            : parseTimeToSeconds(fallback);

    return {
        realSeconds,
        gameSeconds,
        selectedSeconds,

        realHours:
            secondsToHours(realSeconds),

        gameHours:
            secondsToHours(gameSeconds),

        selectedHours:
            secondsToHours(selectedSeconds),

        display:
            formatSeconds(selectedSeconds)
    };
}

/* --------------------------------------------------
   INTERNAL UNIT MATCHER
-------------------------------------------------- */

function matchUnit(str, unit) {

    const regex =
        new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*${unit}\\b`);

    const match =
        regex.exec(str);

    if (!match) {
        return 0;
    }

    const value =
        Number(match[1]);

    return Number.isFinite(value)
        ? value
        : 0;
}