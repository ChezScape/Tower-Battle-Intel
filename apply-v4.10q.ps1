$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10q File Input Direct Bind Fix..."

$root = Get-Location
$patchRoot = $PSScriptRoot

if (!(Test-Path (Join-Path $root "bootstrap.js"))) {
    throw "bootstrap.js not found. Run this from the project root."
}

function Copy-IfDifferent($from, $to) {
    if (!(Test-Path $from)) {
        throw "Missing patch file: $from"
    }

    $fromFull = [System.IO.Path]::GetFullPath($from)
    $toFull = [System.IO.Path]::GetFullPath($to)

    if ($fromFull -ieq $toFull) {
        Write-Host "Already in place: $to"
        return
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $to) | Out-Null
    Copy-Item $from $to -Force
    Write-Host "Copied: $to"
}

Copy-IfDifferent (Join-Path $patchRoot "src\ui\nativeImportHardBridge.js") (Join-Path $root "src\ui\nativeImportHardBridge.js")
Copy-IfDifferent (Join-Path $patchRoot "src\ui\actionAuditBridge.js") (Join-Path $root "src\ui\actionAuditBridge.js")
Copy-IfDifferent (Join-Path $patchRoot "tests\file-input-direct-bind-fix.test.mjs") (Join-Path $root "tests\file-input-direct-bind-fix.test.mjs")

$bootstrapPath = Join-Path $root "bootstrap.js"
$bootstrap = Get-Content $bootstrapPath -Raw

if ($bootstrap -notmatch "nativeImportHardBridge\.js") {
    $needle = "bindLiveInteractionBridge(() => render());"
    $insert = @"
bindLiveInteractionBridge(() => render());

    import(""./src/ui/nativeImportHardBridge.js"")
        .then((module) => module.bindNativeImportHardBridge?.())
        .catch((error) => console.warn(""[Tower Battle Intel] Native import hard bridge failed to load"", error));
"@
    if ($bootstrap.Contains($needle)) {
        $bootstrap = $bootstrap.Replace($needle, $insert.TrimEnd())
    }
    elseif ($bootstrap.Contains("render();")) {
        $bootstrap = $bootstrap.Replace("render();", @"
render();

    import(""./src/ui/nativeImportHardBridge.js"")
        .then((module) => module.bindNativeImportHardBridge?.())
        .catch((error) => console.warn(""[Tower Battle Intel] Native import hard bridge failed to load"", error));
"@.TrimEnd())
    }
    else {
        throw "Could not find bindLiveInteractionBridge or render line in bootstrap.js"
    }
}

if ($bootstrap -notmatch "actionAuditBridge\.js") {
    $needle = "bindCoreEvents();"
    $insert = @"
bindCoreEvents();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@
    if ($bootstrap.Contains($needle)) {
        $bootstrap = $bootstrap.Replace($needle, $insert.TrimEnd())
    }
    else {
        throw "Could not find bindCoreEvents(); in bootstrap.js"
    }
}

Set-Content $bootstrapPath $bootstrap -Encoding UTF8

$configPath = Join-Path $root "config\appConfig.js"
$config = Get-Content $configPath -Raw
$config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10q"')
Set-Content $configPath $config -Encoding UTF8

Write-Host "v4.10q applied."
