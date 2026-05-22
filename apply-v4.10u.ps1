$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10u Final Control Polish..."

if (!(Test-Path ".\bootstrap.js")) {
    throw "bootstrap.js not found. Run this from the project root."
}

if (!(Test-Path ".\src\ui")) {
    New-Item -ItemType Directory -Path ".\src\ui" -Force | Out-Null
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bridgeSource = Join-Path $scriptDir "src\ui\finalControlPolishBridge.js"
$bridgeDest = ".\src\ui\finalControlPolishBridge.js"

if (!(Test-Path $bridgeSource)) {
    if (Test-Path $bridgeDest) {
        Write-Host "finalControlPolishBridge.js already exists in project root."
    } else {
        throw "Missing src\ui\finalControlPolishBridge.js in patch."
    }
} elseif ((Resolve-Path $bridgeSource).Path -ne (Resolve-Path -LiteralPath (Split-Path $bridgeDest -Parent) -ErrorAction SilentlyContinue | ForEach-Object { Join-Path $_.Path "finalControlPolishBridge.js" })) {
    Copy-Item $bridgeSource $bridgeDest -Force
} else {
    Write-Host "Bridge source and destination are the same; skipping copy."
}

$bootstrapPath = ".\bootstrap.js"
$bootstrap = Get-Content $bootstrapPath -Raw

if ($bootstrap -notmatch "finalControlPolishBridge\.js") {
    $importBlock = @'

    import("./src/ui/finalControlPolishBridge.js")
        .then((module) => module.bindFinalControlPolishBridge?.(() => render()))
        .catch((error) => console.warn("[Tower Battle Intel] Final control polish bridge failed to load", error));
'@

    if ($bootstrap -match "nativeControlGuard\.js[\s\S]*?catch\([^\n]+\);") {
        $bootstrap = [regex]::Replace($bootstrap, "(nativeControlGuard\.js[\s\S]*?catch\([^\n]+\);)", "`$1$importBlock", 1)
    }
    elseif ($bootstrap -match "actionAuditBridge\.js[\s\S]*?catch\([^\n]+\);") {
        $bootstrap = [regex]::Replace($bootstrap, "(actionAuditBridge\.js[\s\S]*?catch\([^\n]+\);)", "`$1$importBlock", 1)
    }
    elseif ($bootstrap.Contains("render();")) {
        $bootstrap = $bootstrap.Replace("render();", "render();$importBlock")
    }
    else {
        throw "Could not find a safe bootstrap insertion point."
    }

    Set-Content $bootstrapPath $bootstrap -Encoding UTF8
    Write-Host "Added finalControlPolishBridge.js import to bootstrap.js"
} else {
    Write-Host "bootstrap.js already loads finalControlPolishBridge.js"
}

$configPath = ".\config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10u"')
    Set-Content $configPath $config -Encoding UTF8
    Write-Host "Set appConfig version to v4.10u"
}

$cssPatch = Join-Path $scriptDir "patch\final-control-polish.css"
if (Test-Path $cssPatch) {
    $css = Get-Content $cssPatch -Raw
    foreach ($cssFile in @(".\desktop.css", ".\mobile.css")) {
        if (Test-Path $cssFile) {
            $current = Get-Content $cssFile -Raw
            if ($current -notmatch "v4\.10u Final Control Polish") {
                Add-Content $cssFile "`n$css"
                Write-Host "Appended final control CSS to $cssFile"
            } else {
                Write-Host "$cssFile already contains final control CSS"
            }
        }
    }
}

Write-Host "v4.10u Final Control Polish applied."
