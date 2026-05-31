import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildHistoryEditModal } from "../src/ui/sections/history/historyEditModal.js";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const workspaceEvents = read("src/ui/events/workspaceEvents.js");
const editModalSource = read("src/ui/sections/history/historyEditModal.js");

assert.ok(!fs.existsSync(path.join(root, "src/ui/layouts/historyEditModal.js")), "old active History edit modal layout must be deleted");
assert.ok(workspaceEvents.includes('import { buildHistoryEditModal } from "../sections/history/historyEditModal.js";'), "workspace events must import the History-owned edit modal");
assert.ok(workspaceEvents.includes("function handleEditModalControlClick"), "workspace events must have modal-first Edit control routing");
assert.ok(workspaceEvents.includes("if (handleEditModalControlClick(event, target, context)) return true"), "Edit modal routing must run before broad History controls");
assert.ok(workspaceEvents.includes("history-edit-field-focus"), "plain edit field clicks must be absorbed without a broad History render");
assert.ok(workspaceEvents.includes("history:edit-field-input"), "notes/tags typing must be isolated without a broad History render");
assert.ok(workspaceEvents.includes("closeEditModal(modal)"), "Edit modal close must clear the active modal mount");
assert.ok(workspaceEvents.includes("saveEditModal(context, modal)"), "Edit modal save must read from the active modal root");

assert.ok(editModalSource.includes('data-ui-action="history-edit-close"'), "Edit close should expose a specific Click Truth action");
assert.ok(editModalSource.includes('data-ui-action="history-edit-notes"'), "Edit notes should expose a specific Click Truth action");
assert.ok(editModalSource.includes('data-ui-action="history-edit-tags"'), "Edit tags should expose a specific Click Truth action");
assert.ok(editModalSource.includes('data-ui-action="history-edit-build-choice"'), "Edit build choices should expose a specific Click Truth action");
assert.ok(editModalSource.includes('data-ui-action="history-edit-save"'), "Edit save should expose a specific Click Truth action");

const sampleRun = {
    core: {
        battleDate: "May 07, 2026 17:09",
        tier: 11,
        wave: 7609
    },
    meta: {
        notes: "testing notes",
        tags: ["farm", "ray"],
        buildStyle: "hybrid"
    }
};

const html = buildHistoryEditModal({ run: sampleRun, index: 2, displayIndex: 4 });
assert.ok(html.includes('data-history-edit-modal="true"'), "rebuilt Edit modal must render its modal root");
assert.ok(html.includes('data-history-edit-index="2"'), "rebuilt Edit modal must retain original History index");
assert.ok(html.includes('data-history-edit-notes="true"'), "rebuilt Edit modal must render notes field");
assert.ok(html.includes('data-history-edit-tags="true"'), "rebuilt Edit modal must render tags field");
assert.ok(html.includes('testing notes'), "rebuilt Edit modal should preserve existing notes while opened");
assert.ok(html.includes('farm, ray'), "rebuilt Edit modal should preserve existing tags while opened");

console.log("v4.11z52w29 History Edit modal control repair test passed");
