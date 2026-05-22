"use strict";

/**
 * TRACE ENGINE
 * Safe trace helpers used by diagnostics and future action auditing.
 *
 * Important: trace() keeps compatibility with the old behaviour by returning
 * the original data payload, not the trace entry.
 */

import {
    capturePipelineTrace,
    getPipelineTraceLog,
    clearPipelineTraceLog
} from "./pipelineInspector.js";

export function trace(stage = "unknown", data = {}, meta = {}) {
    const entry = capturePipelineTrace(stage, data, {
        ...meta,
        source: meta.source || "traceEngine"
    });

    if (shouldLogToConsole()) {
        console.log(`[TBI TRACE:${entry.stage}]`, entry.data);
    }

    return data;
}

export function traceTime(stage = "unknown", data = {}, meta = {}) {
    return trace(stage, {
        ...safeObject(data),
        time: nowMs()
    }, meta);
}

export function traceStep(stage = "unknown", data = {}, meta = {}) {
    return trace(`step/${stage}`, data, meta);
}

export function getTraceLog(options = {}) {
    return getPipelineTraceLog(options);
}

export function clearTraceLog() {
    return clearPipelineTraceLog();
}

function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return Math.round(performance.now() * 1000) / 1000;
    }

    return Date.now();
}

function shouldLogToConsole() {
    try {
        return Boolean(globalThis?.TBI_TRACE_VERBOSE || globalThis?.__TBI_TRACE_VERBOSE);
    } catch {
        return false;
    }
}

function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : { value };
}

export default {
    trace,
    traceTime,
    traceStep,
    getTraceLog,
    clearTraceLog
};
