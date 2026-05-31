"use strict";

/**
 * COACH BLANK RESET v4.11z35
 * Intentionally cleared so Coach can be rebuilt cleanly.
 */

import { buildBlankWorkspace } from "./workspaceResetView.js";

export function buildCoachView(state = {}, options = {}) {
    return buildBlankWorkspace({
        key: "coach",
        title: "Coach",
        intro: "Coach has been cleared ready for a clean Game Brain advice rebuild.",
        next: "Rebuild advice from parser/Game Brain facts."
    });
}

export default { buildCoachView };
