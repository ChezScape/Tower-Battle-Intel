"use strict";

/**
 * BOOTSTRAP COMPATIBILITY LOADER v4.11z52w12
 * Root bootstrap now delegates to src/app/init.js.
 */

export {
    startTowerBattleIntel,
    bootstrap,
    getAppInitStatus,
    getStaticShell
} from "./src/app/init.js";

export { renderApp } from "./src/app/render.js";
export { getAppVersionInfo } from "./src/app/version.js";
