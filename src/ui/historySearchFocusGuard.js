"use strict";

/**
 * HISTORY SEARCH FOCUS GUARD v4.11q
 *
 * The History search input was losing focus because the dashboard render path
 * replaced the search input while typing. This classic bridge is loaded before
 * app.js and owns only the History text-search input.
 *
 * It lets the browser type normally, blocks later app capture handlers for this
 * one input, then debounces the real filter action and restores focus/caret.
 */
(function () {
    const VERSION = "v4.11q";
    const FLAG = "__TowerBattleIntelHistorySearchFocusGuardBound";
    const SELECTOR = "[data-history-filter-query], input.history-search";

    if (typeof window === "undefined" || typeof document === "undefined") return;

    let bound = false;
    let lastValue = "";
    let lastCaret = 0;
    let lastInputAt = null;
    let lastCommitAt = null;
    let lastRestoreAt = null;
    let lastError = null;
    let commitTimer = null;
    let restoreTimer = null;
    let composing = false;

    if (!window[FLAG]) {
        window[FLAG] = true;
        bound = true;
        bind();
        console.log("[Tower Battle Intel] History search focus guard bound", VERSION);
    } else {
        bound = true;
    }

    installAPI();

    function bind() {
        document.addEventListener("beforeinput", handleBeforeInput, true);
        document.addEventListener("input", handleInput, true);
        document.addEventListener("search", handleInput, true);
        document.addEventListener("change", handleInput, true);
        document.addEventListener("compositionstart", handleCompositionStart, true);
        document.addEventListener("compositionend", handleCompositionEnd, true);
        document.addEventListener("focusin", handleFocusIn, true);
        document.addEventListener("keydown", handleKeydown, true);
    }

    function handleBeforeInput(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;

        remember(input);
        stopLaterBridges(event);
    }

    function handleInput(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;

        remember(input);
        stopLaterBridges(event);

        if (composing) return;

        queueCommit(input.value || "", getCaret(input));
        keepFocusAlive();
    }

    function handleCompositionStart(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;
        composing = true;
        remember(input);
        stopLaterBridges(event);
    }

    function handleCompositionEnd(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;
        composing = false;
        remember(input);
        stopLaterBridges(event);
        queueCommit(input.value || "", getCaret(input));
        keepFocusAlive();
    }

    function handleFocusIn(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;
        remember(input);
    }

    function handleKeydown(event) {
        const input = getSearchInputFromEvent(event);
        if (!input) return;

        remember(input);

        if (event.key === "Escape") {
            input.value = "";
            lastValue = "";
            lastCaret = 0;
            stopLaterBridges(event);
            queueCommit("", 0);
            keepFocusAlive();
            return;
        }

        // Let browser editing keys work naturally, but prevent app capture bridges
        // from interpreting the keypress as a dashboard action.
        stopLaterBridges(event);
    }

    function getSearchInputFromEvent(event) {
        const target = event?.target;
        if (!isElement(target)) return null;
        if (target.matches?.(SELECTOR)) return target;
        return target.closest?.(SELECTOR) || null;
    }

    function remember(input) {
        if (!input) return;
        lastValue = String(input.value || "");
        lastCaret = getCaret(input);
        lastInputAt = new Date().toISOString();
        document.documentElement.dataset.historySearchFocused = "true";
        document.documentElement.dataset.historySearchValue = lastValue;
    }

    function getCaret(input) {
        try {
            return Number.isFinite(input.selectionStart) ? input.selectionStart : String(input.value || "").length;
        } catch {
            return String(input?.value || "").length;
        }
    }

    function stopLaterBridges(event) {
        try { event.stopPropagation(); } catch { /* ignore */ }
        try { event.stopImmediatePropagation(); } catch { /* ignore */ }
    }

    function queueCommit(value, caret) {
        clearTimeout(commitTimer);
        commitTimer = window.setTimeout(() => commitSearch(value, caret), 420);
    }

    function commitSearch(value, caret) {
        const query = String(value || "");
        lastValue = query;
        lastCaret = Number.isFinite(caret) ? caret : query.length;
        lastCommitAt = new Date().toISOString();
        lastError = null;

        try {
            const actions = window.TowerBattleIntelActions;
            if (actions?.perform) {
                actions.perform("history-set-filters", { query });
            } else if (actions?.actionSetHistoryFilters) {
                actions.actionSetHistoryFilters({ query });
            } else {
                patchStateFallback(query);
            }
        } catch (error) {
            lastError = String(error?.message || error);
            patchStateFallback(query);
        }

        try {
            window.TowerBattleIntel?.render?.();
        } catch (error) {
            lastError = String(error?.message || error);
        }

        restoreSearchFocus(query, lastCaret);
        keepFocusAlive();
    }

    function patchStateFallback(query) {
        try {
            const state = window.TowerBattleIntelActions?.getState?.() || window.TowerBattleIntel?.state?.() || null;
            if (state) {
                state.ui = state.ui || {};
                state.ui.historyFilters = {
                    ...(state.ui.historyFilters || {}),
                    query
                };
            }
        } catch {
            // Ignore fallback mutation failures.
        }
    }

    function restoreSearchFocus(value = lastValue, caret = lastCaret) {
        window.requestAnimationFrame(() => {
            const input = findSearchInput();
            if (!input) return;

            try {
                input.value = String(value || "");
            } catch { /* ignore */ }

            try {
                input.focus({ preventScroll: true });
            } catch {
                try { input.focus(); } catch { /* ignore */ }
            }

            const safeCaret = Math.min(Number.isFinite(caret) ? caret : String(value || "").length, String(value || "").length);
            try { input.setSelectionRange(safeCaret, safeCaret); } catch { /* ignore */ }

            lastRestoreAt = new Date().toISOString();
        });
    }

    function keepFocusAlive() {
        clearTimeout(restoreTimer);
        const started = Date.now();

        const tick = () => {
            const input = findSearchInput();
            if (input && document.activeElement !== input) {
                restoreSearchFocus(lastValue, lastCaret);
            }

            if (Date.now() - started < 900) {
                restoreTimer = window.setTimeout(tick, 35);
            }
        };

        tick();
    }

    function findSearchInput() {
        return document.querySelector(SELECTOR);
    }

    function isElement(value) {
        return Boolean(value && value.nodeType === 1 && typeof value.matches === "function");
    }

    function installAPI() {
        const previous = window.TowerBattleIntelHistorySearchFocusGuard || {};
        window.TowerBattleIntelHistorySearchFocusGuard = {
            ...previous,
            status
        };
    }

    function status() {
        return {
            bound,
            version: VERSION,
            inputExists: Boolean(findSearchInput()),
            activeElementIsSearch: Boolean(document.activeElement?.matches?.(SELECTOR)),
            lastValue,
            lastCaret,
            lastInputAt,
            lastCommitAt,
            lastRestoreAt,
            lastError
        };
    }
}());
