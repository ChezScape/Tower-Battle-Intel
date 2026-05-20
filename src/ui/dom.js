"use strict";

/**
 * DOM ENGINE
 * Central DOM selectors + safe helpers
 */

/* --------------------------------------------------
   SELECTORS
-------------------------------------------------- */

export function qs(selector, parent = document) {

    return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {

    return Array.from(
        parent.querySelectorAll(selector)
    );
}

export function byId(id) {

    return document.getElementById(id);
}

/* --------------------------------------------------
   HTML / TEXT
-------------------------------------------------- */

export function setHTML(target, html = "") {

    const el = resolve(target);

    if (!el) {
        return;
    }

    el.innerHTML = html;
}

export function setText(target, text = "") {

    const el = resolve(target);

    if (!el) {
        return;
    }

    el.textContent = text;
}

/* --------------------------------------------------
   CLEAR
-------------------------------------------------- */

export function clearElement(target) {

    const el = resolve(target);

    if (!el) {
        return;
    }

    el.innerHTML = "";
}

/**
 * Backwards-compatible alias
 */
export function clear(target) {

    clearElement(target);
}

/* --------------------------------------------------
   CLASS HELPERS
-------------------------------------------------- */

export function addClass(target, className) {

    const el = resolve(target);

    if (!el || !className) {
        return;
    }

    el.classList.add(className);
}

export function removeClass(target, className) {

    const el = resolve(target);

    if (!el || !className) {
        return;
    }

    el.classList.remove(className);
}

export function toggleClass(target, className, force = undefined) {

    const el = resolve(target);

    if (!el || !className) {
        return;
    }

    el.classList.toggle(className, force);
}

/* --------------------------------------------------
   RESOLVE TARGET
-------------------------------------------------- */

function resolve(target) {

    if (!target) {
        return null;
    }

    if (typeof target !== "string") {
        return target;
    }

    if (
        target.startsWith("#") ||
        target.startsWith(".") ||
        target.includes("[")
    ) {
        return qs(target);
    }

    return byId(target);
}
