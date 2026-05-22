$ErrorActionPreference = "Stop"

Write-Host "Applying Tower Battle Intel v4.10p Import Change Commit Fix..."

if (!(Test-Path ".\bootstrap.js")) {
    throw "bootstrap.js not found. Run this from the project root."
}

if (!(Test-Path ".\src\ui")) {
    New-Item -ItemType Directory -Path ".\src\ui" -Force | Out-Null
}

$sourceNative = Join-Path $PSScriptRoot "src\ui\nativeImportHardBridge.js"
$destNative = ".\src\ui\nativeImportHardBridge.js"
$sourceAudit = Join-Path $PSScriptRoot "src\ui\actionAuditBridge.js"
$destAudit = ".\src\ui\actionAuditBridge.js"

if (!(Test-Path $sourceNative)) { throw "Patch source missing: src\ui\nativeImportHardBridge.js" }
if (!(Test-Path $sourceAudit)) { throw "Patch source missing: src\ui\actionAuditBridge.js" }

if ((Resolve-Path $sourceNative).Path -ne (Resolve-Path $destNative -ErrorAction SilentlyContinue).Path) {
    Copy-Item $sourceNative $destNative -Force
}
if ((Resolve-Path $sourceAudit).Path -ne (Resolve-Path $destAudit -ErrorAction SilentlyContinue).Path) {
    Copy-Item $sourceAudit $destAudit -Force
}

$bootstrapPath = ".\bootstrap.js"
$bootstrap = Get-Content $bootstrapPath -Raw

if ($bootstrap -notmatch "nativeImportHardBridge\.js") {
    if ($bootstrap.Contains("bindLiveInteractionBridge(() => render());")) {
        $bootstrap = $bootstrap.Replace("bindLiveInteractionBridge(() => render());", @"
bindLiveInteractionBridge(() => render());

    import(""./src/ui/nativeImportHardBridge.js"")
        .then((module) => module.bindNativeImportHardBridge?.())
        .catch((error) => console.warn(""[Tower Battle Intel] Native import hard bridge failed to load"", error));
"@.TrimEnd())
    } elseif ($bootstrap.Contains("render();")) {
        $bootstrap = $bootstrap.Replace("render();", @"
render();

    import(""./src/ui/nativeImportHardBridge.js"")
        .then((module) => module.bindNativeImportHardBridge?.())
        .catch((error) => console.warn(""[Tower Battle Intel] Native import hard bridge failed to load"", error));
"@.TrimEnd())
    } else {
        throw "Could not patch bootstrap.js for nativeImportHardBridge.js"
    }
}

if ($bootstrap -notmatch "actionAuditBridge\.js") {
    if ($bootstrap.Contains("bindCoreEvents();")) {
        $bootstrap = $bootstrap.Replace("bindCoreEvents();", @"
bindCoreEvents();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@.TrimEnd())
    } elseif ($bootstrap.Contains("render();")) {
        $bootstrap = $bootstrap.Replace("render();", @"
render();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@.TrimEnd())
    } else {
        throw "Could not patch bootstrap.js for actionAuditBridge.js"
    }
}

Set-Content $bootstrapPath $bootstrap -Encoding UTF8

$configPath = ".\config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10p"')
    Set-Content $configPath $config -Encoding UTF8
    Write-Host "Set appConfig version to v4.10p"
}

Write-Host "v4.10p applied."
