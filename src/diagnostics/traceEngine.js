"use strict";

import {
    capturePipelineTrace
} from "./pipelineInspector.js";

export function trace(stage, data) {

    capturePipelineTrace(stage, data);

    console.log(`[TRACE:${stage}]`, data);

    return data;
}

export function traceTime(stage, data) {

    const time =
        data?.core?.time ??
        data?.core?.timeSeconds ??
        0;

    trace(`time/${stage}`, {
        time
    });

    return data;
}
