import assert from "node:assert/strict";

import {
    getWaveTierMilestoneStatus,
    explainWaveTierMilestone,
    getNearestBaseMilestones,
    getTournamentHeatContext,
    BASE_WAVE_CHECKPOINTS,
    HEAT_INCREASE_WAVES
} from "../src/game/waveTierMilestoneCatalogue.js";

const status = getWaveTierMilestoneStatus();
assert.equal(status.ok, true);
assert.equal(status.gameVersion, "28.1.0");
assert.ok(BASE_WAVE_CHECKPOINTS.includes(100));
assert.ok(HEAT_INCREASE_WAVES.includes(1000));

const normal = explainWaveTierMilestone({ tier: 11, wave: 7609 });
assert.equal(normal.ok, true);
assert.equal(normal.tier, 11);
assert.equal(normal.wave, 7609);
assert.equal(normal.previousCheckpoint, 7000);
assert.equal(normal.nextCheckpoint, 8000);
assert.equal(normal.remainingToNextCheckpoint, 391);
assert.equal(normal.tournamentHeat, null);

const tournament = explainWaveTierMilestone({ Tier: "8", Wave: "350", IsTournament: true });
assert.equal(tournament.ok, true);
assert.equal(tournament.tournamentHeat.previousHeatWave, 350);
assert.equal(tournament.tournamentHeat.nextHeatWave, 400);

const beyond = getNearestBaseMilestones(10420);
assert.equal(beyond.next, 11000);

const blank = explainWaveTierMilestone({});
assert.equal(blank.ok, false);
assert.equal(blank.nextCheckpoint, 20);

console.log("v4.11z31 wave/tier milestone catalogue test passed");
