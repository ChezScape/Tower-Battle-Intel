"use strict";

/**
 * UI MOUNT ENGINE v4.11c
 */

import { byId, setHTML, resolve } from "./dom.js";

export function mountHTML(target, html = "") {
    const root = typeof target === "string"
        ? byId(target.replace(/^#/, "")) || resolve(target)
        : resolve(target);

    if (!root) {
        console.warn(`[Tower Battle Intel] Mount failed: ${String(target)}`);
        return null;
    }

    setHTML(root, html);
    return root;
}

export function mount(id, html = "") {
    return mountHTML(id, html);
}

export function appendMount(id, html = "") {
    const root = byId(String(id).replace(/^#/, ""));
    if (!root) return null;
    root.insertAdjacentHTML("beforeend", String(html ?? ""));
    return root;
}

export default {
    mountHTML,
    mount,
    appendMount
};
