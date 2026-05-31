"use strict";

/**
 * HISTORY VIEW REBUILD v4.11z52w47
 *
 * Proper History workspace rebuild:
 * - real desktop shell mount
 * - raw-archive-led report management layout
 * - modular History-owned view files
 * - old parked shell bypassed
 */

import {
    buildHistoryStateModel,
    HISTORY_VIEW_REBUILD_VERSION,
    HISTORY_RAW_ARCHIVE_CONTROLS_VERSION,
    escapeAttr
} from "./historyShared.js";
import { buildHistoryHeader } from "./historyHeader.js";
import { buildHistoryToolbar } from "./historyToolbar.js";
import { buildHistoryRunList } from "./historyRunList.js";
import { buildHistoryInspector } from "./historyInspector.js";
import { buildHistoryModalMounts } from "./historyModalMounts.js";

export function buildHistoryView(state = {}) {
    const model = buildHistoryStateModel(state);

    return `
        <div
            class="tbi-view-stack tbi-history-clean-view tbi-history2"
            data-history-view-rebuild="${escapeAttr(HISTORY_VIEW_REBUILD_VERSION)}"
            data-history-clean-library="${escapeAttr(HISTORY_VIEW_REBUILD_VERSION)}"
            data-history-raw-archive-controls="${escapeAttr(HISTORY_RAW_ARCHIVE_CONTROLS_VERSION)}"
            data-history-search-mode="${escapeAttr(model.filters.mode)}"
            data-history-total-saved="${escapeAttr(model.history.length)}"
            data-history-filtered-count="${escapeAttr(model.visibleEntries.length)}"
        >
            ${buildHistoryHeader(model)}
            ${buildHistoryToolbar(model)}
            <section class="tbi-history2-workspace" aria-label="History workspace">
                ${buildHistoryRunList(model)}
                ${buildHistoryInspector(model)}
            </section>
            ${buildHistoryModalMounts()}
        </div>
    `;
}

export default { buildHistoryView };
