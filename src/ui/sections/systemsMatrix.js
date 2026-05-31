"use strict";

/**
 * SYSTEMS / GAME BRAIN KNOWLEDGE BASE v4.11z52w
 * Tabbed/searchable desktop knowledge library built from modular Game Brain catalogues.
 * Mobile remains a blank rebuild shell for now.
 */

import { buildBlankWorkspace } from "./workspaceResetView.js";
import { escapeHTML, escapeAttr } from "./sectionUtils.js";
import {
    getGameBrainKnowledgeBase,
    getGameBrainKnowledgeBaseStatus,
    getGameBrainKnowledgeModules
} from "../../game/index.js";

const SYSTEM_TABS = Object.freeze([
    { key: "overview", label: "Overview" },
    { key: "mechanics", label: "Mechanics" },
    { key: "battle-report", label: "Battle Report" },
    { key: "account-stats", label: "Account Stats" },
    { key: "visual-index", label: "Visual Index" },
    { key: "evidence", label: "Evidence" }
]);

const FEATURED_TERMS = Object.freeze([
    "Dissonance",
    "Overheat",
    "Enemy Skip Decay",
    "Tournament Overheat Conditions",
    "Bot+ Abilities",
    "Assist Modules",
    "Battle Date Sorting",
    "Battle History Copy Flow"
]);

const VISUAL_STARTERS = Object.freeze([
    {
        term: "Ray",
        type: "Enemy / death pressure",
        family: "Enemies / Killed By",
        section: "Visual Index",
        icon: "R",
        summary: "TBI-style placeholder for Ray killed-by context. Future art should be remade as an original schematic icon, not copied game artwork.",
        sourceConfidence: "report-label/context-planned",
        aliases: ["Ray", "Killed By Ray", "death pressure"]
    },
    {
        term: "Vampire",
        type: "Enemy / sustain pressure",
        family: "Enemies / Killed By",
        section: "Visual Index",
        icon: "V",
        summary: "TBI-style placeholder for Vampire/sustain-failure context seen in History/Game Brain tests.",
        sourceConfidence: "report-label/context-planned",
        aliases: ["Vampire", "sustain", "Killed By Vampire"]
    },
    {
        term: "The Tower",
        type: "Player system emblem",
        family: "Tower / Core",
        section: "Visual Index",
        icon: "T",
        summary: "Original TBI tower emblem placeholder for future Systems cards and account-stat views.",
        sourceConfidence: "tbi-original-art-plan",
        aliases: ["Tower", "player tower", "core"]
    },
    {
        term: "Overheat",
        type: "Mechanic symbol",
        family: "Mechanics / Heat",
        section: "Visual Index",
        icon: "OH",
        summary: "Heat/decay style symbol planned for Overheat and Enemy Skip Decay explanations.",
        sourceConfidence: "game-file-confirmed-description",
        aliases: ["Overheat", "Heat", "Enemy Skip Decay"]
    },
    {
        term: "Bot+",
        type: "Bot emblem",
        family: "Bots / Bot+",
        section: "Visual Index",
        icon: "B+",
        summary: "Original TBI bot badge placeholder for Bot Bot, Bot+ abilities, and Synchronicity cards.",
        sourceConfidence: "game-file-confirmed-description",
        aliases: ["Bot+", "Bot Bot", "Synchronicity"]
    },
    {
        term: "Assist Modules",
        type: "Module emblem",
        family: "Modules / Assist",
        section: "Visual Index",
        icon: "AM",
        summary: "Original TBI module badge placeholder for future Assist Module and account-stat knowledge cards.",
        sourceConfidence: "game-file-confirmed-metadata-name",
        aliases: ["Assist Modules", "Module", "assist module slots"]
    }
]);

export function buildSystemsMatrix(state = {}, options = {}) {
    if (options.mobile) {
        return buildBlankWorkspace({
            key: "systems",
            title: "Systems",
            intro: "Systems mobile remains protected until the mobile rebuild starts.",
            next: "Desktop Game Brain Knowledge Base is being rebuilt first."
        });
    }

    const status = getGameBrainKnowledgeBaseStatus();
    const modules = getGameBrainKnowledgeModules();
    const entries = getGameBrainKnowledgeBase();
    const featured = FEATURED_TERMS
        .map(term => entries.find(entry => String(entry.term).toLowerCase() === term.toLowerCase()))
        .filter(Boolean);
    const familySummary = [...(status.battleReportFamilySummary || [])]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const mechanics = selectEntries(entries, "mechanics").slice(0, 36);
    const battleReport = selectEntries(entries, "battle-report").slice(0, 60);
    const accountStats = selectEntries(entries, "account-stats").slice(0, 64);
    const evidence = selectEntries(entries, "evidence").slice(0, 24);

    return `
        <div class="tbi-view-stack tbi-systems-knowledge" data-systems-knowledge-base="true" data-systems-active-tab="overview">
            <section class="tbi-card tbi-systems-hero">
                <div class="tbi-systems-hero-copy">
                    <div class="tbi-reset-kicker">Systems / Game Brain</div>
                    <h2>Knowledge Base</h2>
                    <p>
                        Source-labelled game knowledge from parser schema, modular catalogues, and the v28.2.0 APK static audit.
                        Built so future game updates can add small modules without rewriting the whole brain.
                    </p>
                </div>
                <div class="tbi-systems-trust-card">
                    <span>Current brain</span>
                    <strong>${escapeHTML(status.catalogueVersion)}</strong>
                    <em>${escapeHTML(status.gameVersion)} audit-aware · ${escapeHTML(String(status.entryCount))} entries</em>
                </div>
            </section>

            <section class="tbi-card tbi-systems-control-panel" aria-label="Game Brain library controls">
                <label class="tbi-systems-search-box" data-search-control="systems">
                    <span>Search Game Brain</span>
                    <div class="tbi-search-control-row">
                        <input
                            type="search"
                            data-systems-knowledge-search="true"
                            placeholder="Search Ray, Overheat, Golden Combo, Battle Date, Bot+, coins per hour..."
                        >
                        <button
                            type="button"
                            class="tbi-search-clear"
                            data-global-search-clear="systems"
                            title="Clear Game Brain search"
                        >
                            Clear
                        </button>
                    </div>
                </label>
                <div class="tbi-systems-tab-row" role="tablist" aria-label="Systems knowledge sections">
                    ${SYSTEM_TABS.map(tab => renderTabButton(tab, tab.key === "overview")).join("")}
                </div>
                <div class="tbi-systems-search-status" data-systems-search-status="true">
                    Showing the overview. Use search to filter visible cards.
                </div>
            </section>

            <section class="tbi-systems-tab-panel active" data-systems-tab-panel="overview" aria-label="Systems overview">
                <div class="tbi-systems-status-grid" aria-label="Game Brain status">
                    ${statusTile("Modules", status.moduleCount)}
                    ${statusTile("Knowledge entries", status.entryCount)}
                    ${statusTile("Battle report fields", moduleCount(modules, "battleReportFields"))}
                    ${statusTile("Account stat names", moduleCount(modules, "accountStatsMetadata"))}
                </div>

                <section class="tbi-card tbi-systems-module-panel">
                    <div class="tbi-systems-section-head">
                        <div>
                            <span>Modular catalogues</span>
                            <h3>Update-friendly Game Brain modules</h3>
                        </div>
                        <small>New game versions can add a module without rewriting the whole brain.</small>
                    </div>
                    <div class="tbi-systems-module-grid">
                        ${modules.map(renderModuleCard).join("")}
                    </div>
                </section>

                <section class="tbi-card tbi-systems-knowledge-panel">
                    <div class="tbi-systems-section-head">
                        <div>
                            <span>Featured knowledge</span>
                            <h3>Useful v28.2 signals</h3>
                        </div>
                        <small>High-confidence terms TBI can explain safely.</small>
                    </div>
                    <div class="tbi-systems-knowledge-grid">
                        ${featured.map(entry => renderKnowledgeCard(entry, "overview")).join("")}
                    </div>
                </section>

                <section class="tbi-card tbi-systems-family-panel">
                    <div class="tbi-systems-section-head">
                        <div>
                            <span>Battle Report map</span>
                            <h3>Parser field families</h3>
                        </div>
                        <small>Used later by Compare to group rows cleanly.</small>
                    </div>
                    <div class="tbi-systems-family-grid">
                        ${familySummary.map(renderFamilyCard).join("")}
                    </div>
                </section>
            </section>

            ${renderEntryPanel("mechanics", "Mechanics", "Dissonance, Overheat, Bot+, modules, tournaments and other source-labelled mechanics.", mechanics)}
            ${renderEntryPanel("battle-report", "Battle Report Fields", "Parser-known BattleHistoryEntry fields used by Command Deck, History and future Compare.", battleReport)}
            ${renderEntryPanel("account-stats", "Account Stats", "TowerWrappedStats metadata captured for future account-stat planning.", accountStats)}
            ${renderVisualPanel()}
            ${renderEntryPanel("evidence", "Evidence / Safe Boundaries", "What the APK audit supports, and what TBI deliberately will not claim.", evidence)}

            <section class="tbi-card tbi-systems-boundary-panel" data-systems-tab-panel="evidence" data-systems-search-card="true" data-systems-search-text="safe boundaries hidden formulas live server values save-file extraction network interception automation cheats">
                <div class="tbi-systems-section-head">
                    <div>
                        <span>Safe boundaries</span>
                        <h3>What this brain will and will not claim</h3>
                    </div>
                </div>
                <div class="tbi-systems-boundary-grid">
                    <div>
                        <strong>Can use</strong>
                        <ul>${status.safePurpose.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                    </div>
                    <div>
                        <strong>Will not use</strong>
                        <ul>${status.notSafePurpose.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function selectEntries(entries = [], tab = "") {
    return entries.filter(entry => entryBelongsToTab(entry, tab));
}

function entryBelongsToTab(entry = {}, tab = "") {
    const text = searchText(entry);
    const module = String(entry.id || "").split(":")[0];

    switch (tab) {
        case "mechanics":
            return /mechanic|dissonance|overheat|bot|module|tournament|synchronicity|heat|golden combo/.test(text) && module !== "battle-report";
        case "battle-report":
            return module === "battle-report" || /battle report|battlehistoryentry|field|record|killed by/.test(text);
        case "account-stats":
            return /account stats|towerwrapped|future account stats|account-stat|lifetime|tournamenthighest|gamewaves/.test(text);
        case "evidence":
            return /apk evidence|boundary|saveload|cloud|clipboard|copy flow|safe|not safe|firebase|playfab/.test(text);
        default:
            return true;
    }
}

function searchText(entry = {}) {
    return [
        entry.term,
        entry.type,
        entry.family,
        entry.section,
        entry.summary,
        entry.sourceConfidence,
        entry.source,
        entry.caution,
        ...(entry.aliases || []),
        ...(entry.uses || [])
    ].join(" ").toLowerCase();
}

function moduleCount(modules = [], key = "") {
    return modules.find(module => module.key === key)?.count || 0;
}

function statusTile(label, value) {
    return `
        <article class="tbi-system-tile tbi-system-status-tile" data-systems-search-card="true" data-systems-search-text="${escapeAttr(`${label} ${value}`)}">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(String(value))}</strong>
        </article>
    `;
}

function renderTabButton(tab = {}, active = false) {
    return `
        <button
            type="button"
            class="tbi-systems-tab ${active ? "active" : ""}"
            data-systems-tab="${escapeAttr(tab.key)}"
            aria-pressed="${active ? "true" : "false"}"
        >${escapeHTML(tab.label)}</button>
    `;
}

function renderModuleCard(module = {}) {
    return `
        <article class="tbi-systems-module-card" data-knowledge-module="${escapeAttr(module.key)}" data-systems-search-card="true" data-systems-search-text="${escapeAttr(`${module.label} ${module.key} ${module.entries?.length || 0} entries modular catalogue update-friendly`)}">
            <span>${escapeHTML(module.label)}</span>
            <strong>${escapeHTML(String(module.entries?.length || 0))}</strong>
            <small>entries</small>
        </article>
    `;
}

function renderEntryPanel(tabKey = "", title = "", intro = "", entries = []) {
    return `
        <section class="tbi-systems-tab-panel" data-systems-tab-panel="${escapeAttr(tabKey)}" aria-label="${escapeAttr(title)}">
            <div class="tbi-card tbi-systems-knowledge-panel">
                <div class="tbi-systems-section-head">
                    <div>
                        <span>Knowledge section</span>
                        <h3>${escapeHTML(title)}</h3>
                    </div>
                    <small>${escapeHTML(intro)}</small>
                </div>
                <div class="tbi-systems-knowledge-grid">
                    ${entries.length ? entries.map(entry => renderKnowledgeCard(entry, tabKey)).join("") : renderEmptyCard(tabKey)}
                </div>
            </div>
        </section>
    `;
}

function renderVisualPanel() {
    return `
        <section class="tbi-systems-tab-panel" data-systems-tab-panel="visual-index" aria-label="Visual Index">
            <div class="tbi-card tbi-systems-knowledge-panel">
                <div class="tbi-systems-section-head">
                    <div>
                        <span>Visual index</span>
                        <h3>TBI-style icon starters</h3>
                    </div>
                    <small>Original schematic placeholders. They are not copied game art.</small>
                </div>
                <div class="tbi-systems-visual-grid">
                    ${VISUAL_STARTERS.map(renderVisualCard).join("")}
                </div>
            </div>
        </section>
    `;
}

function renderKnowledgeCard(entry = {}, tab = "overview") {
    const haystack = searchText(entry);
    return `
        <article class="tbi-systems-knowledge-card" data-systems-tab-owner="${escapeAttr(tab)}" data-systems-search-card="true" data-systems-search-text="${escapeAttr(haystack)}">
            <div>
                <span>${escapeHTML(entry.type || "Knowledge")}</span>
                <h4>${escapeHTML(entry.term || "Unknown")}</h4>
            </div>
            <p>${escapeHTML(entry.summary || "Source-labelled Game Brain entry.")}</p>
            <footer>
                <em>${escapeHTML(entry.family || "General")}</em>
                <strong>${escapeHTML(entry.sourceConfidence || "source-labelled")}</strong>
            </footer>
        </article>
    `;
}

function renderVisualCard(entry = {}) {
    const haystack = searchText(entry);
    return `
        <article class="tbi-systems-visual-card" data-systems-search-card="true" data-systems-search-text="${escapeAttr(haystack)}">
            <div class="tbi-systems-visual-emblem" aria-hidden="true">${escapeHTML(entry.icon || "◎")}</div>
            <div>
                <span>${escapeHTML(entry.type || "Visual plan")}</span>
                <h4>${escapeHTML(entry.term || "TBI icon")}</h4>
                <p>${escapeHTML(entry.summary || "Original TBI-style visual placeholder.")}</p>
            </div>
            <footer>${escapeHTML(entry.family || "Visual Index")}</footer>
        </article>
    `;
}

function renderFamilyCard(item = {}) {
    const haystack = `${item.family || ""} ${(item.examples || []).join(" ")} ${item.count || 0} fields`;
    return `
        <article class="tbi-systems-family-card" data-systems-search-card="true" data-systems-search-text="${escapeAttr(haystack)}">
            <strong>${escapeHTML(item.family || "Family")}</strong>
            <span>${escapeHTML(String(item.count || 0))} fields</span>
            <small>${escapeHTML((item.examples || []).slice(0, 3).join(" · "))}</small>
        </article>
    `;
}

function renderEmptyCard(tabKey = "") {
    return `
        <article class="tbi-systems-knowledge-card" data-systems-search-card="true" data-systems-search-text="${escapeAttr(tabKey)} empty future module">
            <div>
                <span>Future module</span>
                <h4>Nothing matched yet</h4>
            </div>
            <p>This section is ready for future Game Brain entries.</p>
            <footer><em>${escapeHTML(tabKey)}</em><strong>waiting</strong></footer>
        </article>
    `;
}

export default { buildSystemsMatrix };
