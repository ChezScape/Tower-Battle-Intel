"use strict";

/**
 * UI MOUNT ENGINE
 * Handles safe HTML mounting
 */

import {
    byId,
    setHTML
} from "./dom.js";

/* --------------------------------------------------
   MOUNT HTML
-------------------------------------------------- */

export function mountHTML(target, html = "") {

    if (!target) {
        return;
    }

    if (typeof target === "string") {

        const root = byId(target);

        if (!root) {
            console.warn(`Mount failed: ${target}`);
            return;
        }

        setHTML(root, html);

        return;
    }

    setHTML(target, html);
}

/* --------------------------------------------------
   ALIASES
-------------------------------------------------- */

export function mount(id, html = "") {

    mountHTML(id, html);
}

export function appendMount(id, html = "") {

    const root = byId(id);

    if (!root) {
        return;
    }

    root.insertAdjacentHTML(
        "beforeend",
        html
    );
}
