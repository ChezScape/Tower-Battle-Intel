import assert from "node:assert/strict";
import fs from "node:fs";

import { resetState, getState } from "../src/core/state.js";
import { resetUIState, getUIState } from "../src/ui/uistate.js";
import { buildDesktopWorkspace } from "../src/ui/views/desktopView.js";
import {
    actionCacheCommandInputDraft,
    actionRememberCommandFeedback,
    getCommandDeckActionStatus
} from "../src/actions/commandDeckActions.js";

resetState();
resetUIState();

assert.equal(getState().ui.dashboardTab, "command");
assert.equal(getUIState().dashboardTab, "command");

const desktop = buildDesktopWorkspace("command", getState());
assert.match(desktop, /tbi-command-clean-view/);
assert.match(desktop, /data-ui-action="save-report"/);
assert.match(desktop, /data-ui-action="import-history"/);

actionCacheCommandInputDraft("Battle Report\nWave\t7609");
assert.equal(getState().lastInput, "Battle Report\nWave\t7609");

actionRememberCommandFeedback({
    title: "Import History",
    message: "Imported 1 saved run into History.",
    status: "saved",
    keepInput: true,
    inputDraft: "draft text"
});

assert.equal(getState().ui.lastCommandFeedback.title, "Import History");
assert.equal(getState().ui.lastCommandFeedback.status, "saved");
assert.equal(getState().lastInput, "draft text");

const status = getCommandDeckActionStatus();
assert.equal(status.activeInShell, true);

const rulebook = fs.readFileSync(new URL("../docs/ARCHITECTURE_OWNERSHIP_RULES.md", import.meta.url), "utf8");
assert.match(rulebook, /Command Deck is the natural starting point/i);
assert.match(rulebook, /Dashboard is a read-only intelligence view/i);
assert.match(rulebook, /src\/ui\/events\/workspaceEvents\.js/);

console.log("v4.11z52w14-command-deck-rewire.test.mjs passed");
