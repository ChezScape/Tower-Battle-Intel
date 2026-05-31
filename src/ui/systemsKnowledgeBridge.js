"use strict";

/**
 * SYSTEMS KNOWLEDGE BRIDGE v4.11z52w
 * Small DOM-only bridge for Systems Knowledge Base tabs. Search input is owned here, using the same simple DOM-filter behaviour as the older stable builds.
 * It does not alter app state and does not touch mobile.
 */

const VERSION = "v4.11z52w";
let bound = false;

export function bindSystemsKnowledgeBridge() {
    if (typeof document === "undefined" || bound) return status();
    bound = true;
    document.addEventListener("click", handleClick, true);
    document.addEventListener("input", handleInput, true);
    document.addEventListener("search", handleInput, true);
    installAPI();
    return status();
}

function handleClick(event) {
    const clear = event.target?.closest?.("[data-global-search-clear='systems']");
    if (clear) {
        event.preventDefault();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
        const root = getRoot();
        const input = root?.querySelector?.("[data-systems-knowledge-search]");
        if (input) input.value = "";
        applySearch("");
        return;
    }

    const button = event.target?.closest?.("[data-systems-tab]");
    if (!button || button.disabled) return;

    event.preventDefault();
    setActiveTab(button.dataset.systemsTab || "overview");
}


function handleInput(event) {
    const input = event.target?.closest?.("[data-systems-knowledge-search]");
    if (!input) return;

    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
    applySearch(input.value || "");
}

function getRoot() {
    return document.querySelector("[data-systems-knowledge-base]");
}

function setActiveTab(tab = "overview") {
    const root = getRoot();
    if (!root) return;

    const safeTab = String(tab || "overview");
    root.dataset.systemsActiveTab = safeTab;

    root.querySelectorAll("[data-systems-tab]").forEach(button => {
        const active = button.dataset.systemsTab === safeTab;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    root.querySelectorAll("[data-systems-tab-panel]").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.systemsTabPanel === safeTab);
    });

    const input = root.querySelector("[data-systems-knowledge-search]");
    applySearch(input?.value || "");
}

function applySearch(query = "") {
    const root = getRoot();
    if (!root) return;

    const needle = normalise(query);
    let shown = 0;
    let total = 0;

    const activeTab = root.dataset.systemsActiveTab || "overview";
    const activePanel = root.querySelector(`[data-systems-tab-panel="${cssEscape(activeTab)}"]`);
    const cards = activePanel ? activePanel.querySelectorAll("[data-systems-search-card]") : [];

    cards.forEach(card => {
        total += 1;
        const haystack = normalise(card.dataset.systemsSearchText || card.textContent || "");
        const match = !needle || haystack.includes(needle);
        card.classList.toggle("is-hidden-by-systems-search", !match);
        if (match) shown += 1;
    });

    root.classList.toggle("tbi-systems-search-empty", Boolean(needle && shown === 0));

    const statusNode = root.querySelector("[data-systems-search-status]");
    if (statusNode) {
        statusNode.textContent = needle
            ? `${shown} of ${total} visible in ${labelTab(activeTab)} for “${String(query).trim()}”.`
            : `Showing ${labelTab(activeTab)}. Use search to filter visible cards.`;
    }
}

function normalise(value = "") {
    return String(value || "").toLowerCase().replace(/[^a-z0-9+]+/g, " ").trim();
}

function labelTab(tab = "") {
    const labels = {
        overview: "Overview",
        mechanics: "Mechanics",
        "battle-report": "Battle Report",
        "account-stats": "Account Stats",
        "visual-index": "Visual Index",
        evidence: "Evidence"
    };
    return labels[tab] || "Systems";
}

function cssEscape(value = "") {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(String(value || ""));
    }
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function installAPI() {
    if (typeof window === "undefined") return;
    window.TowerBattleIntelSystemsKnowledge = Object.freeze({
        status,
        setActiveTab,
        applySearch
    });
}

function status() {
    const root = getRoot();
    return {
        bound,
        version: VERSION,
        rootExists: Boolean(root),
        activeTab: root?.dataset?.systemsActiveTab || null,
        tabCount: root ? root.querySelectorAll("[data-systems-tab]").length : 0,
        searchableCards: root ? root.querySelectorAll("[data-systems-search-card]").length : 0
    };
}

export default { bindSystemsKnowledgeBridge };
