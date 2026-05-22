"use strict";

/**
 * CONFIRM MODAL
 * Shared warning modal used by dangerous History Trace actions.
 */

export function buildConfirmModal({
    id = "historyConfirmModal"
} = {}) {

    return `
        <div
            class="confirm-modal"
            id="${escapeAttr(id)}"
            aria-hidden="true"
            hidden
            inert
        >

            <div class="confirm-card">

                <div
                    class="confirm-step"
                    data-confirm-step="type"
                >

                    <div
                        class="confirm-title danger-text"
                        data-confirm-title
                    >
                        Confirm Action
                    </div>

                    <div
                        class="confirm-message"
                        data-confirm-message
                    >
                        This action needs confirmation.
                    </div>

                    <div class="confirm-warning">
                        Type <strong data-confirm-required-phrase>DELETE</strong> to continue.
                    </div>

                    <input
                        id="historyConfirmInput"
                        class="confirm-input"
                        type="text"
                        autocomplete="off"
                        data-confirm-input="true"
                        placeholder="Type DELETE"
                    >

                    <div class="confirm-actions">

                        <button
                            type="button"
                            data-confirm-cancel="true"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="danger"
                            data-confirm-continue="true"
                            disabled
                        >
                            Continue
                        </button>

                    </div>

                </div>

                <div
                    class="confirm-step hidden"
                    data-confirm-step="final"
                >

                    <div
                        class="confirm-title danger-text"
                        data-confirm-final-title
                    >
                        Final Warning
                    </div>

                    <div class="confirm-big-warning">
                        This cannot be recovered.
                    </div>

                    <div
                        class="confirm-message"
                        data-confirm-final-message
                    >
                        This action cannot be undone.
                    </div>

                    <div class="confirm-actions">

                        <button
                            type="button"
                            data-confirm-cancel="true"
                        >
                            No, Cancel
                        </button>

                        <button
                            type="button"
                            class="danger"
                            data-confirm-accept="true"
                        >
                            Confirm
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}

function escapeAttr(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
