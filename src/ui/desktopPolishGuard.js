"use strict";

/**
 * DESKTOP POLISH GUARD v4.11q
 *
 * Small runtime helper for the desktop-only polish pass.
 * It does not route actions and does not touch mobile behaviour.
 */
(function () {
    const VERSION = "v4.11q";
    const FLAG = "__TowerBattleIntelDesktopPolishGuardBound";
    const DESKTOP_MIN_WIDTH = 800;

    let lastAudit = null;

    if (typeof window === "undefined" || typeof document === "undefined") return;

    if (!window[FLAG]) {
        window[FLAG] = true;
        bind();
    }

    installAPI();

    function bind() {
        markDesktopPolish();
        document.addEventListener("DOMContentLoaded", markDesktopPolish, { once: true });
        window.addEventListener("resize", debounce(markDesktopPolish, 160), { passive: true });
        console.log("[Tower Battle Intel] Desktop polish guard bound", VERSION);
    }

    function markDesktopPolish() {
        const root = document.documentElement;
        const isDesktop = String(root.getAttribute("data-device-mode") || "desktop") === "desktop" && (window.innerWidth || 1024) >= DESKTOP_MIN_WIDTH;
        root.classList.toggle("desktop-polish", isDesktop);
        root.setAttribute("data-desktop-polish", isDesktop ? "true" : "false");
        auditOverflow();
    }

    function auditOverflow() {
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        const bodyWidth = document.body?.scrollWidth || width;
        lastAudit = {
            at: new Date().toISOString(),
            viewportWidth: width,
            bodyScrollWidth: bodyWidth,
            horizontalOverflow: bodyWidth > width + 2,
            deviceMode: document.documentElement.getAttribute("data-device-mode") || "unknown"
        };
        document.documentElement.dataset.desktopOverflow = lastAudit.horizontalOverflow ? "true" : "false";
        return lastAudit;
    }

    function debounce(fn, delay) {
        let timer = null;
        return () => {
            clearTimeout(timer);
            timer = window.setTimeout(fn, delay);
        };
    }

    function status() {
        return {
            desktopPolishGuardBound: Boolean(window[FLAG]),
            desktopPolishGuardVersion: VERSION,
            desktopPolishActive: document.documentElement.classList.contains("desktop-polish"),
            lastAudit: lastAudit || auditOverflow()
        };
    }

    function installAPI() {
        window.TowerBattleIntelDesktopPolishGuard = Object.freeze({ status, auditOverflow, markDesktopPolish });
    }
}());
