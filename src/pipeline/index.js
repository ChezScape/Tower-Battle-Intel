"use strict";

/**
 * PIPELINE INDEX v4.10d
 */

export { parser } from "./parser.js";
export { compare } from "./compare.js";
export { analyser, analyse } from "./analyser.js";
export { insightEngine } from "./insightEngine.js";
export { aiCoach, buildAICoach, coach } from "./aiCoach.js";
export { optimiser } from "./optimiser.js";
export { progressionAI } from "./progressionAI.js";
export { validateAndRepair, createEmpty } from "./schemaEngine.js";
export * from "./normalize.js";

import { parser } from "./parser.js";
import { compare } from "./compare.js";
import { analyser } from "./analyser.js";
import { insightEngine } from "./insightEngine.js";
import { aiCoach } from "./aiCoach.js";
import { optimiser } from "./optimiser.js";
import { progressionAI } from "./progressionAI.js";
import { compute } from "../core/compute.js";

export function runPipeline(rawText, history = [], options = {}) {
    const parsed = parser(rawText);
    const current = compute(parsed);
    const previous = Array.isArray(history) ? history.at(-1) || null : null;
    const diff = previous ? compare(previous, current) : null;
    const insights = diff ? insightEngine(current, previous, diff, options.trend || {}) : [];
    const analysis = diff ? analyser(current, previous, diff) : [];
    const ai = aiCoach(current, previous, diff, insights, options.trend || {}, {
        history,
        buildStyle: options.buildStyle || "unknown"
    });

    return {
        parsed,
        current,
        previous,
        compare: diff,
        insights,
        analysis,
        ai,
        optimiser: optimiser(previous, current, diff),
        progression: progressionAI(history, current),
        meta: {
            pipelineVersion: "pipeline-v4.10d"
        }
    };
}

export default {
    parser,
    compare,
    analyser,
    insightEngine,
    aiCoach,
    optimiser,
    progressionAI,
    runPipeline
};
