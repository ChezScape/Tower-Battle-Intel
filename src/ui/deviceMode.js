"use strict";

/**
 * DEVICE MODE DETECTOR
 * Keeps desktop and mobile layout styling separated safely.
 *
 * Adds:
 * - html/body data-device-mode="desktop|mobile"
 * - html/body class device-desktop or device-mobile
 * - html/body class pointer-coarse or pointer-fine
 */

const MOBILE_WIDTH = 760;
const TOUCH_DESKTOP_LIMIT = 1024;

let resizeTimer = null;

export function initDeviceMode() {

    applyDeviceMode();

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(
                applyDeviceMode,
                120
            );
        },
        {
            passive: true
        }
    );

    window.addEventListener(
        "orientationchange",
        () => {
            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(
                applyDeviceMode,
                180
            );
        },
        {
            passive: true
        }
    );
}

export function getDeviceMode() {

    const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        1024;

    const coarse =
        hasCoarsePointer();

    const mobileUA =
        /Android|iPhone|iPad|iPod|Mobile/i.test(
            navigator.userAgent || ""
        );

    if (
        width <= MOBILE_WIDTH ||
        mobileUA ||
        (coarse && width <= TOUCH_DESKTOP_LIMIT)
    ) {
        return "mobile";
    }

    return "desktop";
}

function applyDeviceMode() {

    const mode =
        getDeviceMode();

    const pointerClass =
        hasCoarsePointer()
            ? "pointer-coarse"
            : "pointer-fine";

    applyToElement(
        document.documentElement,
        mode,
        pointerClass
    );

    if (document.body) {
        applyToElement(
            document.body,
            mode,
            pointerClass
        );
    }
}

function applyToElement(element, mode, pointerClass) {

    if (!element) {
        return;
    }

    element.setAttribute(
        "data-device-mode",
        mode
    );

    element.classList.toggle(
        "device-mobile",
        mode === "mobile"
    );

    element.classList.toggle(
        "device-desktop",
        mode === "desktop"
    );

    element.classList.toggle(
        "pointer-coarse",
        pointerClass === "pointer-coarse"
    );

    element.classList.toggle(
        "pointer-fine",
        pointerClass === "pointer-fine"
    );
}

function hasCoarsePointer() {

    try {
        return Boolean(
            window.matchMedia &&
            window.matchMedia("(pointer: coarse)").matches
        );
    } catch {
        return false;
    }
}
