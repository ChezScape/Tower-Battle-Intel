"use strict";

/**
 * ANOMALIES BLANK RESET v4.11z35
 * Intentionally cleared so Anomalies can be rebuilt cleanly.
 */

import { buildBlankWorkspace } from "./workspaceResetView.js";

export function buildAnomaliesView(state = {}) {
    return buildBlankWorkspace({
        key: "anomalies",
        title: "Anomalies",
        intro: "Anomalies has been cleared ready for a clean issue/alert rebuild.",
        next: "Rebuild anomaly rules after parser/history are stable."
    });
}

export default { buildAnomaliesView };
