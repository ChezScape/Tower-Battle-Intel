$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10s Dropdown + Collapsible Fix..."

if (!(Test-Path ".\bootstrap.js")) {
    throw "bootstrap.js not found. Run this from the project root."
}

if (!(Test-Path ".\src\ui")) {
    New-Item -ItemType Directory -Force ".\src\ui" | Out-Null
}

$sourceBridge = ".\src\ui\actionAuditBridge.js"
if (!(Test-Path $sourceBridge)) {
    throw "Missing src\ui\actionAuditBridge.js from the extracted patch. Copy/merge the patch into the project root first."
}

$configPath = ".\config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10s"')
    Set-Content $configPath $config -Encoding UTF8
    Write-Host "Set appConfig version to v4.10s"
}

$bootstrapPath = ".\bootstrap.js"
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
        Set-Content $bootstrapPath $bootstrap -Encoding UTF8
        Write-Host "Added actionAuditBridge.js import to bootstrap.js"
    } else {
        Write-Host "bootstrap.js already changed or bindCoreEvents marker missing. Skipping import insert."
    }
} else {
    Write-Host "bootstrap.js already loads actionAuditBridge.js"
}

$hotfixPath = ".\patch\active-control-hotfix.css"
if (Test-Path $hotfixPath) {
    $hotfix = Get-Content $hotfixPath -Raw
    foreach ($cssPath in @(".\desktop.css", ".\mobile.css")) {
        if (Test-Path $cssPath) {
            $css = Get-Content $cssPath -Raw
            if ($css -notmatch "v4\.10s Dropdown \+ Collapsible Fix") {
                Add-Content $cssPath "`n$hotfix"
                Write-Host "Appended v4.10s hotfix CSS to $cssPath"
            } else {
                Write-Host "$cssPath already has v4.10s hotfix CSS"
            }
        }
    }
} else {
    Write-Host "patch\active-control-hotfix.css not found. CSS append skipped."
}

Write-Host "v4.10s patch applied."
