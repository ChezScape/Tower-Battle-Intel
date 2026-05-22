$ErrorActionPreference = "Stop"

Write-Host "Applying Tower Battle Intel v4.10n Action Audit Bridge..."

$root = Get-Location
$bridgeSource = Join-Path $PSScriptRoot "src\ui\actionAuditBridge.js"
$bridgeDest = Join-Path $root "src\ui\actionAuditBridge.js"

if (!(Test-Path $bridgeSource)) {
    throw "Patch file missing: $bridgeSource"
}

New-Item -ItemType Directory -Force -Path (Split-Path $bridgeDest) | Out-Null
Copy-Item $bridgeSource $bridgeDest -Force

$bootstrapPath = Join-Path $root "bootstrap.js"
if (!(Test-Path $bootstrapPath)) {
    throw "bootstrap.js not found. Run this from the project root."
}

$bootstrap = Get-Content $bootstrapPath -Raw

if ($bootstrap -notmatch "actionAuditBridge") {
    $needle = "bindCoreEvents();"
    $insert = @"
bindCoreEvents();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@

    if ($bootstrap.Contains($needle)) {
        $bootstrap = $bootstrap.Replace($needle, $insert.TrimEnd())
    } else {
        $needle = "render();"
        $insert = @"
render();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@
        if ($bootstrap.Contains($needle)) {
            $bootstrap = $bootstrap.Replace($needle, $insert.TrimEnd())
        } else {
            throw "Could not find bindCoreEvents(); or render(); in bootstrap.js to patch safely."
        }
    }

    Set-Content $bootstrapPath $bootstrap -Encoding UTF8
}

$configPath = Join-Path $root "config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10n"')
    Set-Content $configPath $config -Encoding UTF8
}

$indexPath = Join-Path $root "index.html"
if (Test-Path $indexPath) {
    $index = Get-Content $indexPath -Raw
    $index = [regex]::Replace($index, 'data-app-version="v4\.10[a-z]"', 'data-app-version="v4.10n"')
    if ($index -notmatch "v4.10n Action Audit Bridge") {
        $index = $index.Replace("</head>", "    <!-- v4.10n Action Audit Bridge loaded by bootstrap.js -->`r`n</head>")
    }
    Set-Content $indexPath $index -Encoding UTF8
}

$cssBlock = @'

/* --------------------------------------------------
   v4.10n Action Audit Bridge UI
-------------------------------------------------- */
#actionAuditToastMount {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 1000005;
    pointer-events: none;
}

.action-audit-toast {
    max-width: min(420px, calc(100vw - 36px));
    padding: 12px 14px;
    border: 1px solid rgba(29,231,255,.38);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(5,18,34,.98), rgba(1,7,17,.98));
    color: #eaf8ff;
    font-weight: 900;
    box-shadow: 0 18px 48px rgba(0,0,0,.46);
}

.action-audit-toast.bad {
    border-color: rgba(255,64,90,.48);
    color: #ffd8de;
}

.action-audit-confirm {
    position: fixed;
    inset: 0;
    z-index: 1000004;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(0,0,0,.72);
    backdrop-filter: blur(6px);
}

.action-audit-confirm-card {
    width: min(420px, calc(100vw - 36px));
    border: 1px solid rgba(255,211,41,.34);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(5,18,34,.98), rgba(1,7,17,.99));
    color: #eaf8ff;
    padding: 18px;
    box-shadow: 0 24px 80px rgba(0,0,0,.62);
}

.action-audit-confirm-card h3 {
    margin: 0 0 8px;
    color: #fff;
}

.action-audit-confirm-card p {
    margin: 0 0 14px;
    color: #a7c2d8;
}

.action-audit-confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
'@

foreach ($cssName in @("desktop.css", "mobile.css")) {
    $cssPath = Join-Path $root $cssName
    if (Test-Path $cssPath) {
        $css = Get-Content $cssPath -Raw
        if ($css -notmatch "v4.10n Action Audit Bridge UI") {
            Add-Content $cssPath $cssBlock
        }
    }
}

$testSource = Join-Path $PSScriptRoot "tests\action-audit-bridge.test.mjs"
$testDest = Join-Path $root "tests\action-audit-bridge.test.mjs"
New-Item -ItemType Directory -Force -Path (Split-Path $testDest) | Out-Null
Copy-Item $testSource $testDest -Force

Write-Host "Applied v4.10n. Now run:"
Write-Host "node .\tests\action-audit-bridge.test.mjs"
Write-Host "Then hard refresh localhost and run TowerBattleIntelNativeControls.status()."
