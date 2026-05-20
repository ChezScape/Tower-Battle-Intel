"use strict";

export { parser } from "./parser.js";
export { compare } from "./compare.js";
export { optimiser } from "./optimiser.js";
export { insightEngine } from "./insightEngine.js";
export { aiCoach } from "./aiCoach.js";
export { analyser } from "./analyser.js";
export { progressionAI } from "./progressionAI.js";
export { validateAndRepair } from "./schemaEngine.js";

/**
 * OPTIONAL: unified pipeline entry (recommended)
 * Keeps your actions.js clean and future-proof
 */

import { parser } from "./parser.js";
import { compute } from "../core/compute.js";
import { compare } from "./compare.js";
import { insightEngine } from "./insightEngine.js";
import { aiCoach } from "./aiCoach.js";
import { progressionAI } from "./progressionAI.js";
import { validateAndRepair } from "./schemaEngine.js";

/**
 * PIPELINE RUNNER (LIGHT VERSION)
 * - No diagnostics overhead
 * - Used by actions layer
 */
export function runPipeline(rawText, history = []) {

    const parsed = parser(rawText);
    const validated = validateAndRepair(parsed);
    const computed = compute(validated);

    const previous = history.at(-1) || null;

    const diff = previous
        ? compare(previous, computed)
        : null;

    const insights = previous
        ? insightEngine(computed, previous, diff)
        : [];

    const ai = previous
        ? aiCoach(computed, previous, diff, insights)
        : [];

    const progression = progressionAI(history, computed);

    return {
        data: computed,
        analysis: diff,
        insights,
        coach: ai,
        progression
    };
}
