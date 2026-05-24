"use strict";

/**
 * NATIVE CONTROL GUARD v4.11q
 *
 * Purpose:
 * The dashboard has several capture-phase bridges. Those are good for custom
 * buttons, but they must never steal browser-native controls such as select
 * dropdowns, text fields, or details/summary collapsibles.
 *
 * This guard is bound first from bootstrap.js and stops later dashboard bridges
 * from seeing native-control events. It does not call preventDefault(), so the
 * browser keeps its normal dropdown, typing, and collapsible behaviour.
 */

const GUARD_FLAG = "__TowerBattleIntelNativeControlGuardBound";
const VERSION = "v4.11q";

let lastNativeGuardEvent = null;

const NATIVE_CONTROL_SELECTOR = [
    "select",
    "option",
    "textarea",
    "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='file'])",
    "[contenteditable='true']",
    "[contenteditable='']"
].join(", ");

const COLLAPSIBLE_SELECTOR = [
    "summary",
    "details > summary",
    "[data-native-collapsible-summary]"
].join(", ");

export function bindNativeControlGuard() {
    if (typeof document === "undefined") return false;

    if (window[GUARD_FLAG]) {
        installNativeControlGuardConsole();
        return true;
    }

    window[GUARD_FLAG] = true;

    // These are deliberately capture-phase and deliberately do not preventDefault.
    // The aim is to stop other app bridges, while preserving browser default behaviour.
    for (const type of ["pointerdown", "mousedown", "mouseup", "click", "dblclick", "touchstart", "touchend"]) {
        document.addEventListener(type, guardNativePointerEvent, true);
    }

    document.addEventListener("keydown", guardNativeKeyEvent, true);
    document.addEventListener("keyup", guardNativeKeyEvent, true);

    installNativeControlGuardConsole();
    console.log("[Tower Battle Intel] Native control guard bound", VERSION);
    return true;
}

function guardNativePointerEvent(event) {
    const target = event.target;
    if (!isElement(target)) return;

    const native = target.closest(NATIVE_CONTROL_SELECTOR);

    // Do NOT guard file inputs. NativeImportHardBridge owns those.
    if (native && native.matches("input[type='file']")) return;

    if (native) {
        stopBridgeOnly(event, "native-control", native);
        return;
    }

    const summary = target.closest(COLLAPSIBLE_SELECTOR);
    if (summary) {
        stopBridgeOnly(event, "native-collapsible", summary);
    }
}

function guardNativeKeyEvent(event) {
    const target = event.target;
    if (!isElement(target)) return;

    const native = target.closest(NATIVE_CONTROL_SELECTOR);
    if (native) {
        stopBridgeOnly(event, "native-control-key", native);
        return;
    }

    const summary = target.closest(COLLAPSIBLE_SELECTOR);
    if (summary && (event.key === "Enter" || event.key === " ")) {
        stopBridgeOnly(event, "native-collapsible-key", summary);
    }
}

function stopBridgeOnly(event, reason, element) {
    // This is the important line: block later app bridge handlers, but do not block browser default.
    event.stopImmediatePropagation();

    lastNativeGuardEvent = {
        reason,
        type: event.type,
        tag: element?.tagName || null,
        id: element?.id || null,
        className: typeof element?.className === "string" ? element.className : "",
        text: String(element?.textContent || "").trim().slice(0, 80),
        at: new Date().toISOString()
    };

    try {
        document.documentElement.dataset.nativeControlGuardLast = JSON.stringify(lastNativeGuardEvent);
    } catch {
        // ignore dataset failures
    }
}

function isElement(value) {
    return Boolean(value && value.nodeType === 1 && typeof value.closest === "function");
}

function status() {
    return {
        nativeControlGuardBound: Boolean(window[GUARD_FLAG]),
        nativeControlGuardVersion: VERSION,
        lastNativeGuardEvent
    };
}

function installNativeControlGuardConsole() {
    const existing = window.TowerBattleIntelNativeControlGuard || {};

    window.TowerBattleIntelNativeControlGuard = Object.freeze({
        ...existing,
        version: VERSION,
        status
    });
}
