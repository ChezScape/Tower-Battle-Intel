"use strict";

/**
 * PLATFORM ISOLATION GUARD v4.11q
 *
 * Desktop-first platform lock for the v4.11 cleanup line.
 *
 * This guard keeps the current desktop mockup as the protected baseline and
 * prevents mobile-only controls from leaking into desktop while mobile is
 * repaired separately.
 */
(function () {
    const VERSION = "v4.11q";
    const DESKTOP_MIN_WIDTH = 800;
    const TOUCH_MOBILE_LIMIT = 1024;
    const STYLESHEET_ID = "towerBattleIntelStylesheet";

    let bound = false;
    let lastMode = null;

    function getViewportWidth() {
        return window.innerWidth || document.documentElement?.clientWidth || 1024;
    }

    function hasCoarsePointer() {
        try { return Boolean(window.matchMedia?.("(pointer: coarse)")?.matches); }
        catch { return false; }
    }

    function hasMobileUserAgent() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    }

    function resolveMode() {
        const width = getViewportWidth();
        const coarse = hasCoarsePointer();

        if (width < DESKTOP_MIN_WIDTH || hasMobileUserAgent() || (coarse && width <= TOUCH_MOBILE_LIMIT)) {
            return "mobile";
        }

        return "desktop";
    }

    function applyMode(mode = resolveMode()) {
        lastMode = mode;
        const root = document.documentElement;
        const body = document.body;
        const coarse = hasCoarsePointer();
        const href = mode === "mobile" ? "./mobile.css" : "./desktop.css";

        root.setAttribute("data-device-mode", mode);
        root.setAttribute("data-platform-mode", mode);
        root.setAttribute("data-desktop-min-width", String(DESKTOP_MIN_WIDTH));
        root.classList.toggle("device-desktop", mode === "desktop");
        root.classList.toggle("device-mobile", mode === "mobile");
        root.classList.toggle("pointer-coarse", coarse);
        root.classList.toggle("pointer-fine", !coarse);
        root.classList.toggle("desktop-locked", mode === "desktop");
        root.classList.toggle("mobile-locked", mode === "mobile");

        if (body) {
            body.setAttribute("data-device-mode", mode);
            body.setAttribute("data-platform-mode", mode);
            body.classList.toggle("device-desktop", mode === "desktop");
            body.classList.toggle("device-mobile", mode === "mobile");
            body.classList.toggle("desktop-locked", mode === "desktop");
            body.classList.toggle("mobile-locked", mode === "mobile");
        }

        syncStylesheet(href);
        syncDeviceOnly(mode);
        window.TowerBattleIntelDeviceMode = mode;
        window.TowerBattleIntelPlatformMode = mode;
        return mode;
    }

    function syncStylesheet(href) {
        let link = document.getElementById(STYLESHEET_ID);
        if (!link) {
            link = document.createElement("link");
            link.id = STYLESHEET_ID;
            link.rel = "stylesheet";
            document.head?.appendChild(link);
        }
        if (!String(link.getAttribute("href") || "").endsWith(href.replace("./", ""))) {
            link.setAttribute("href", href);
        }
    }

    function syncDeviceOnly(mode) {
        document.querySelectorAll("[data-device-only]").forEach(element => {
            const visible = element.getAttribute("data-device-only") === mode;
            element.hidden = !visible;
            element.setAttribute("aria-hidden", visible ? "false" : "true");
        });
    }

    function bind() {
        if (bound || typeof document === "undefined") return status();
        bound = true;
        applyMode();

        let resizeTimer = null;
        const schedule = delay => {
            clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => applyMode(), delay);
        };

        window.addEventListener("resize", () => schedule(140), { passive: true });
        window.addEventListener("orientationchange", () => schedule(220), { passive: true });
        document.addEventListener("DOMContentLoaded", () => applyMode(), { once: true });

        window.TowerBattleIntelPlatformIsolationGuard = Object.freeze({ status, applyMode, resolveMode });
        console.log(`[Tower Battle Intel] Platform isolation guard bound ${VERSION}`);
        return status();
    }

    function status() {
        return {
            platformIsolationGuardBound: bound,
            platformIsolationGuardVersion: VERSION,
            mode: lastMode || resolveMode(),
            width: getViewportWidth(),
            desktopMinWidth: DESKTOP_MIN_WIDTH,
            stylesheet: document.getElementById(STYLESHEET_ID)?.getAttribute("href") || null,
            mobileOnlyVisible: Array.from(document.querySelectorAll("[data-device-only='mobile']")).filter(el => !el.hidden).length,
            desktopOnlyVisible: Array.from(document.querySelectorAll("[data-device-only='desktop']")).filter(el => !el.hidden).length
        };
    }

    bind();
}());
