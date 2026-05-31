"use strict";

/**
 * APP VERSION FOUNDATION v4.11z52w12
 * One small owner for runtime version metadata.
 */

import { appConfig } from "../../config/appConfig.js";

export function getAppVersionInfo() {
    const coreVersion = appConfig.app.version;
    const buildVersion = appConfig.app.displayVersion || appConfig.app.buildVersion || coreVersion;

    return Object.freeze({
        name: appConfig.app.name,
        coreVersion,
        buildVersion,
        displayVersion: buildVersion,
        environment: appConfig.app.environment || "production"
    });
}

export function stampAppVersionRuntime(targetDocument = globalThis.document) {
    if (!targetDocument) {
        return getAppVersionInfo();
    }

    const info = getAppVersionInfo();
    const html = targetDocument.documentElement;
    const body = targetDocument.body;

    html.dataset.appName = info.name;
    html.dataset.appVersion = info.coreVersion;
    html.dataset.appBuildVersion = info.buildVersion;
    html.dataset.appRuntimeOwner = "src/app/version.js";

    body?.setAttribute("data-app-version", info.coreVersion);
    body?.setAttribute("data-app-build-version", info.buildVersion);

    return info;
}

export default {
    getAppVersionInfo,
    stampAppVersionRuntime
};
