"use strict";

/**
 * DOM ENGINE v4.11z52w47
 * Safe selectors, mounting helpers and tiny DOM utilities.
 */

export function qs(selector, parent = getDocument()) {
    return parent?.querySelector?.(selector) || null;
}

export function qsa(selector, parent = getDocument()) {
    return Array.from(parent?.querySelectorAll?.(selector) || []);
}

export function byId(id) {
    return getDocument()?.getElementById?.(id) || null;
}

export function setHTML(target, html = "") {
    const el = resolve(target);
    if (el) el.innerHTML = String(html ?? "");
    return el;
}

export function setText(target, text = "") {
    const el = resolve(target);
    if (el) el.textContent = String(text ?? "");
    return el;
}

export function clearElement(target) {
    const el = resolve(target);
    if (!el || el.isConnected === false) return el;

    try {
        if (typeof el.replaceChildren === "function") {
            el.replaceChildren();
        } else {
            el.innerHTML = "";
        }
    } catch (error) {
        if (!isStaleDomClearError(error)) throw error;
        if (el.isConnected !== false) {
            try {
                el.textContent = "";
            } catch {
                // Stale browser timing during focus/blur after render. Safe to ignore.
            }
        }
    }

    return el;
}

function isStaleDomClearError(error = null) {
    const message = String(error?.message || error || "");
    return /replaceChildren|no longer a child|blur event handler|node to be removed/i.test(message);
}

export function clear(target) {
    return clearElement(target);
}

export function addClass(target, className) {
    const el = resolve(target);
    if (el && className) el.classList.add(className);
    return el;
}

export function removeClass(target, className) {
    const el = resolve(target);
    if (el && className) el.classList.remove(className);
    return el;
}

export function toggleClass(target, className, force = undefined) {
    const el = resolve(target);
    if (el && className) el.classList.toggle(className, force);
    return el;
}

export function setHidden(target, hidden = true) {
    const el = resolve(target);
    if (el) el.hidden = Boolean(hidden);
    return el;
}

export function setAttr(target, name, value = "") {
    const el = resolve(target);
    if (el && name) el.setAttribute(name, String(value));
    return el;
}

export function removeAttr(target, name) {
    const el = resolve(target);
    if (el && name) el.removeAttribute(name);
    return el;
}

export function on(target, type, handler, options = undefined) {
    const el = resolve(target);
    if (!el || typeof handler !== "function") return () => {};
    el.addEventListener(type, handler, options);
    return () => el.removeEventListener(type, handler, options);
}

export function resolve(target) {
    if (!target) return null;
    if (typeof target === "string") return qs(target);
    if (target.nodeType === 1 || target.nodeType === 9 || target === window) return target;
    return null;
}

export function getDocument() {
    return typeof document !== "undefined" ? document : null;
}

export default {
    qs,
    qsa,
    byId,
    setHTML,
    setText,
    clearElement,
    clear,
    addClass,
    removeClass,
    toggleClass,
    setHidden,
    setAttr,
    removeAttr,
    on,
    resolve
};
