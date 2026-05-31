"use strict";

/**
 * UI EVENT MODULE LOADER v4.11z52w29
 * Public compatibility entry for the modular shell event foundation.
 *
 * Compatibility markers for old shell tests:
 * UI SHELL EVENTS v4.11z52w29
 * Delegates activateTab and markParkedAction to src/ui/events/ modules.
 * Console marker: TowerBattleIntelUIShell.
 * Active workspace handler: src/ui/events/workspaceEvents.js.
 */

import {
    bindUIEvents,
    getUIShellEventStatus
} from "./events/index.js";

export {
    bindUIEvents,
    getUIShellEventStatus
};

export default {
    bindUIEvents,
    getUIShellEventStatus
};
