"use strict";

/**
 * DEVICE MODE v4.10f
 * Owns desktop/mobile detection and stylesheet switching.
 *
 * Rules:
 * - desktop is kept down to 800px wide
 * - under 800px becomes mobile
 * - coarse touch can use mobile up to 1024px
 * - if index.html loaded the wrong stylesheet, this file corrects it
 */

const MOBILE_WIDTH = 799;
const TOUCH_MOBILE_LIMIT = 1024;
const STYLESHEET_ID = "towerBattleIntelStylesheet";

let resizeTimer = null;
let currentMode = null;
let deviceModeBound = false;

export function initDeviceMode() {
    applyDeviceMode({ force: true });

    if (deviceModeBound || typeof window === "undefined") {
        return getDeviceMode();
    }

    deviceModeBound = true;

    const schedule = delay => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => applyDeviceMode(), delay);
    };

    window.addEventListener("resize", () => schedule(120), { passive: true });
    window.addEventListener("orientationchange", () => schedule(180), { passive: true });

    return currentMode || getDeviceMode();
}

export function getDeviceMode() {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return "desktop";
    }

    const width = getViewportWidth();
    const coarse = hasCoarsePointer();
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");

    if (width <= MOBILE_WIDTH || mobileUA || (coarse && width <= TOUCH_MOBILE_LIMIT)) {
        return "mobile";
    }

    return "desktop";
}

export function isMobileDeviceMode() {
    return getAppliedDeviceMode() === "mobile";
}

export function getAppliedDeviceMode() {
    if (typeof document === "undefined") {
        return "desktop";
    }

    return document.documentElement?.dataset?.deviceMode || currentMode || getDeviceMode();
}

export function applyDeviceMode({ force = false } = {}) {
    if (typeof document === "undefined") {
        return "desktop";
    }

    const mode = getDeviceMode();
    const pointerClass = hasCoarsePointer() ? "pointer-coarse" : "pointer-fine";

    if (!force && currentMode === mode) {
        applyToElement(document.documentElement, mode, pointerClass);
        if (document.body) applyToElement(document.body, mode, pointerClass);
        return mode;
    }

    currentMode = mode;

    applyToElement(document.documentElement, mode, pointerClass);
    if (document.body) applyToElement(document.body, mode, pointerClass);
    syncResponsiveStylesheet(mode);

    window.TowerBattleIntelDeviceMode = mode;

    return mode;
}

export function syncResponsiveStylesheet(mode = getDeviceMode()) {
    if (typeof document === "undefined") {
        return null;
    }

    let link = document.getElementById(STYLESHEET_ID);

    if (!link) {
        link = document.createElement("link");
        link.id = STYLESHEET_ID;
        link.rel = "stylesheet";
        document.head?.appendChild(link);
    }

    const href = mode === "mobile" ? "./mobile.css" : "./desktop.css";

    if (!String(link.getAttribute("href") || "").endsWith(href.replace("./", ""))) {
        link.setAttribute("href", href);
    }

    return link;
}

function applyToElement(element, mode, pointerClass) {
    if (!element) return;

    element.setAttribute("data-device-mode", mode);
    element.classList.toggle("device-mobile", mode === "mobile");
    element.classList.toggle("device-desktop", mode === "desktop");
    element.classList.toggle("pointer-coarse", pointerClass === "pointer-coarse");
    element.classList.toggle("pointer-fine", pointerClass === "pointer-fine");
}

function getViewportWidth() {
    return window.innerWidth || document.documentElement?.clientWidth || 1024;
}

function hasCoarsePointer() {
    try {
        return Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);
    } catch {
        return false;
    }
}
