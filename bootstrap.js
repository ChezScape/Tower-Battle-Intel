"use strict";

/**
 * BOOTSTRAP
 * Root startup flow for Tower Battle Intel.
 *
 * Responsibilities:
 * - load saved state
 * - hydrate runtime state
 * - bind core button / debug events
 * - render dashboard
 * - expose safe console helpers
 * - save state before leaving page
 */

import {
    getState,
    hydrateState
} from "./src/core/state.js";

import {
    bindCoreEvents
} from "./src/core/events.js";

import {
    render
} from "./src/ui/render.js";

import {
    loadStorage,
    saveStorage
} from "./src/storage/localStore.js";

/* --------------------------------------------------
   BOOTSTRAP
-------------------------------------------------- */

export function bootstrap() {

    console.log(
        "BOOTSTRAP LOADED"
    );

    const input =
        document.getElementById("input");

    /* --------------------------------------------------
       REQUIRED ELEMENT CHECK
    -------------------------------------------------- */

    if (!input) {

        console.error(
            "[Tower Battle Intel] Missing #input element."
        );

        return;
    }

    /* --------------------------------------------------
       LOAD SAVED STATE
    -------------------------------------------------- */

    const saved =
        loadStorage();

    if (
        saved &&
        typeof saved === "object"
    ) {

        hydrateState(saved);

        if (saved.lastInput) {
            input.value =
                saved.lastInput;
        }
    }

    /* --------------------------------------------------
       BIND EVENTS
    -------------------------------------------------- */

    bindCoreEvents();

    /* --------------------------------------------------
       INITIAL RENDER
    -------------------------------------------------- */

    render();

    /* --------------------------------------------------
       SAVE INPUT WHILE TYPING
       Light safety, so pasted report is not lost.
    -------------------------------------------------- */

    input.addEventListener("input", () => {

        saveStorage({
            ...getState(),
            lastInput:
                input.value || ""
        });
    });

    /* --------------------------------------------------
       SAVE ON EXIT
    -------------------------------------------------- */

    window.addEventListener("beforeunload", () => {

        saveStorage({
            ...getState(),
            lastInput:
                input.value || ""
        });
    });

    /* --------------------------------------------------
       CONSOLE HELPERS
    -------------------------------------------------- */

    exposeConsoleHelpers(input);
}

/* --------------------------------------------------
   CONSOLE HELPERS
-------------------------------------------------- */

function exposeConsoleHelpers(input) {

    window.TowerBattleIntel = {

        state() {

            return getState();
        },

        render() {

            render();

            return getState();
        },

        save() {

            saveStorage({
                ...getState(),
                lastInput:
                    input?.value || ""
            });

            return true;
        },

        clearInput() {

            if (input) {
                input.value = "";
            }

            saveStorage({
                ...getState(),
                lastInput: ""
            });

            return true;
        },

        version: "Tower Battle Intel"
    };

    console.log(
        "[Tower Battle Intel] Console helpers ready:",
        "TowerBattleIntel.state()",
        "TowerBattleIntel.render()",
        "TowerBattleIntel.save()"
    );
}
