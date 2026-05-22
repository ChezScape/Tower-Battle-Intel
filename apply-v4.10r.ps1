$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10r Active Control Fix..."

$projectRoot = Get-Location
if (!(Test-Path (Join-Path $projectRoot "bootstrap.js"))) {
    throw "bootstrap.js not found. Run this from the project root."
}

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Copy-IfDifferent($source, $dest) {
    if (!(Test-Path $source)) { throw "Missing patch file: $source" }
    $sourceResolved = (Resolve-Path $source).Path
    $destExists = Test-Path $dest
    if ($destExists) {
        $destResolved = (Resolve-Path $dest).Path
        if ($sourceResolved -eq $destResolved) {
            Write-Host "Already in place: $dest"
            return
        }
    }
    $parent = Split-Path -Parent $dest
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
    Copy-Item $source $dest -Force
    Write-Host "Copied: $dest"
}

Copy-IfDifferent (Join-Path $patchRoot "src\ui\actionAuditBridge.js") (Join-Path $projectRoot "src\ui\actionAuditBridge.js")

$bootstrapPath = Join-Path $projectRoot "bootstrap.js"
$bootstrap = Get-Content $bootstrapPath -Raw
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
    } elseif ($bootstrap.Contains("render();")) {
        $bootstrap = $bootstrap.Replace("render();", @"
render();

    import(""./src/ui/actionAuditBridge.js"")
        .then((module) => module.bindActionAuditBridge?.(() => render()))
        .catch((error) => console.warn(""[Tower Battle Intel] Action audit bridge failed to load"", error));
"@.TrimEnd())
    } else {
        throw "Could not find bindCoreEvents(); or render(); in bootstrap.js"
    }
    Set-Content $bootstrapPath $bootstrap -Encoding UTF8
    Write-Host "Added actionAuditBridge.js import to bootstrap.js"
} else {
    Write-Host "bootstrap.js already loads actionAuditBridge.js"
}

$configPath = Join-Path $projectRoot "config\appConfig.js"
$config = Get-Content $configPath -Raw
$config = [regex]::Replace($config, 'version:\s*""v4\.10[a-z]""', 'version: ""v4.10r""')
$config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10r"')
Set-Content $configPath $config -Encoding UTF8
Write-Host "Set appConfig version to v4.10r"

$cssPatch = Get-Content (Join-Path $patchRoot "patch\active-control-hotfix.css") -Raw
foreach ($cssFile in @("desktop.css", "mobile.css")) {
    $cssPath = Join-Path $projectRoot $cssFile
    if (Test-Path $cssPath) {
        $css = Get-Content $cssPath -Raw
        if ($css -notmatch "v4\.10r Active Control Hotfix") {
            Add-Content $cssPath "`n$cssPatch"
            Write-Host "Appended active control CSS to $cssFile"
        } else {
            Write-Host "$cssFile already has v4.10r CSS"
        }
    }
}

Write-Host "v4.10r apply complete."
