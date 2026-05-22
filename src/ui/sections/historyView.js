"use strict";

import { buildHistory } from "../layouts/historyLayout.js";

export function buildHistoryView(state = {}) {
    return buildHistory({
        history: state.history,
        runA: state.runA,
        runB: state.runB,
        ui: state.ui || {}
    });
}
