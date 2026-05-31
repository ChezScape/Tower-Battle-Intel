# The Tower v28.1.0 — Wave / Tier / Milestone Static Audit

Safe static pass over readable XAPK strings and Unity/IL2CPP metadata. This is for Tower Battle Intel Game Brain wording, milestone hints, and debug checks. It is not a hidden-formula extraction.

## Useful confirmed concepts

- **Wave** — Primary in-run progression measure. Each wave spawns a set amount of enemies and progressively scales Enemy Health & Damage.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings lines 36346-36357

- **Tier** — Global difficulty level. Higher tiers scale enemy difficulty faster, grant higher coin multipliers, and unlock exclusive milestone rewards.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings lines 36317-36344

- **Milestones** — Specific wave targets within each tier; reaching them unlocks one-time permanent rewards, Relics, and new game features.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings lines 36257-36274

- **Labs unlock by Tier milestones** — Labs unlock research by completing Tier milestones.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings line 32832

- **Highest Wave** — Battle/end-game and history metric used as progression record.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings lines 1531-1539 and 33391

- **Max Wave** — Battle history/report list metric for the best wave in a context.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings line 31211

- **Dissonance boost uses selected Workshop and highest wave reached for that tier** — Dissonance logic has per-tier wave records and bonuses linked to highest wave reached.  
  Source confidence: `game-file-confirmed-label + game-file-observed`. Source: asset strings line 35004; metadata DissonanceBoost / WaveReached symbols

- **Wave Info panel calculates enemy values** — The app has a Wave Info panel with chance, health, damage, speed, and mass text plus CalculateEnemyValues.  
  Source confidence: `game-file-observed`. Source: metadata lines 17561-17580

- **Difficulty tier calculations** — Runtime has DifficultyTierCalcs plus GetWaveBaseDamage and GetWaveBaseHealth methods.  
  Source confidence: `game-file-observed`. Source: metadata lines 7382-7401

- **Wave milestone analytics exist** — Runtime has CheckAndPostWave100PerTier and CheckAndPostWaveMilestonesPerTier with wave20, wave40, wave60, tier2Unlock, tier3Unlock event clues.  
  Source confidence: `game-file-observed-medium-high`. Source: metadata lines 2412-2423

- **Tournament Heat increase waves** — Tournament Heat level increases at explicit wave breakpoints previously extracted from game strings/data.  
  Source confidence: `game-file-confirmed-label`. Source: prior static audit/XAPK strings

- **Overheat at very high waves** — Overheat conditions add extra challenge at very high waves and can be reviewed as active/upcoming in Heat panel.  
  Source confidence: `game-file-confirmed-label`. Source: asset strings lines 33054-33056


## Observed thresholds / templates useful for TBI

- **wave_20_40_60_analytics** — `[20, 40, 60]`  
  Observed analytics/event keys for early wave milestone posting; useful as light Game Brain early-run checkpoints, not reward milestone table. Confidence: `game-file-observed-medium-high`.

- **wave_100_per_tier** — `[100]`  
  Observed CheckAndPostWave100PerTier. Useful as a standard first serious per-tier milestone/checkpoint. Confidence: `game-file-observed-medium-high`.

- **heat_increase_waves** — `[20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000]`  
  Use as tournament heat milestone overlay when report is tagged Tournament. Confidence: `game-file-confirmed-label`.

- **damage_health_decay_interval** — `['every 10 waves']`  
  Damage Decay and Health Decay battle conditions reduce tower damage/health levels every 10 waves. Useful for warning if a tagged battle condition exists. Confidence: `game-file-confirmed-label`.

- **intro_sprint_jump** — `['10 waves at a time', 'first {0} waves', 'capped at Highest Wave', 'boss every wave', 'no coins during Intro Sprint']`  
  Intro Sprint changes early wave progression and should be noted when interpreting low/no-coin early waves. Confidence: `game-file-confirmed-label`.

- **wave_skip_reward** — `['1.1x previous Wave Cash & Coins']`  
  Wave Skip rewards cash and coins based on previous wave; useful for explaining Largest Wave Skip / wave skip economy. Confidence: `game-file-confirmed-label`.

- **recovery_package_wave_chance** — `['chance each wave']`  
  Recovery Package spawn chance is per-wave; useful for survival/recovery interpretation. Confidence: `game-file-confirmed-label`.

- **event_mission_any_tier_wave** — `['Reach wave {0} on any tier']`  
  Game has generic wave-target mission wording; useful for aliasing manual goals. Confidence: `game-file-confirmed-label`.

- **event_mission_max_tier_no_cards** — `['Reach wave {0} on your max tier without any card equipped']`  
  Game tracks max-tier wave challenge logic. Useful for future manual challenge tagging. Confidence: `game-file-confirmed-label`.


## Recommended Game Brain milestone model

Safe purpose: Give TBI readable wave milestone context and next-checkpoint hints from parsed Tier/Wave without claiming hidden formulas.


Base checkpoints: `20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000`


Milestone categories:

- **1-99 — Early setup / unlock pressure**: Use for fresh tiers, low progression, and early analytics wave markers.

- **100-499 — First sustained tier push**: Wave 100+ is a meaningful per-tier checkpoint from app analytics clues; 150/200/250/300/350/400/450 align with Heat-style checkpoint cadence.

- **500-999 — Mid-run pressure band**: Use 500/600/700/800/900 as clean progress anchors; Heat overlay also uses these bands.

- **1000-4999 — Long push band**: Use 1000 then 500-wave increments for next-goal guidance; do not claim official rewards unless milestone reward data is added later.

- **5000+ — Deep run / farming endurance band**: Use 1000-wave blocks, rate stability, and death cause trends; overlay Overheat/high-wave warnings where relevant.


Algorithm: Given parsed Wave, choose the next greater checkpoint from baseCheckpoints. If Wave exceeds known list, round up to the next 1000-wave boundary. If report is Tournament-tagged, also show next Heat breakpoint from heat_increase_waves until 1000.


## TBI uses

- **Dashboard**: Show parsed Tier/Wave plus next milestone chip, e.g. Next checkpoint: Wave 8000; Last checkpoint: Wave 7000.

- **History**: Group run records by tier and wave bands so Andrew can see progression milestones by tier.

- **Compare**: Compare Run A/B not just by final wave but by crossing checkpoints and efficiency per milestone band.

- **Command Deck**: Explain whether death happened before/after a clean milestone and recommend the next push target.

- **Debug Panel**: Report whether wave/tier catalogue is loaded and whether parsed reports have valid Tier/Wave fields.

- **Tournament analysis**: Overlay Heat increase waves if Andrew manually tags a run as Tournament.


## Not confirmed yet

- Exact official reward milestone table per tier was not extracted as a clean readable table.

- Exact enemy health/damage scaling formulas were not extracted; only method names and UI meaning were observed.

- Exact tier unlock thresholds beyond observed tier2Unlock/tier3Unlock symbols were not confirmed by static strings alone.

- Live server tournament settings may change and should not be hard-coded from a static APK without confidence labels.


## Raw string hits

See `tower_v28_1_0_wave_tier_metric_string_hits.csv` for 1558 candidate hits.
