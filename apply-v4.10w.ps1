$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10w Manual Download Fallback..."

if (!(Test-Path ".\index.html")) { throw "index.html not found. Run this from the project root." }
if (!(Test-Path ".\config\appConfig.js")) { throw "config\appConfig.js not found. Run this from the project root." }

if (!(Test-Path ".\src\ui")) { New-Item -ItemType Directory -Path ".\src\ui" -Force | Out-Null }
if (!(Test-Path ".\tests")) { New-Item -ItemType Directory -Path ".\tests" -Force | Out-Null }
if (!(Test-Path ".\docs")) { New-Item -ItemType Directory -Path ".\docs" -Force | Out-Null }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$bridgeSource = Join-Path $scriptDir "src\ui\universalDownloadBridge.js"
$bridgeDest = ".\src\ui\universalDownloadBridge.js"
if (!(Test-Path $bridgeSource)) {
    if (!(Test-Path $bridgeDest)) { throw "Missing src\ui\universalDownloadBridge.js" }
    Write-Host "Bridge source missing in patch folder but destination already exists; continuing."
} else {
    $sourcePath = (Resolve-Path $bridgeSource).Path
    $destPath = $null
    if (Test-Path $bridgeDest) { $destPath = (Resolve-Path $bridgeDest).Path }
    if ($destPath -and $sourcePath -eq $destPath) {
        Write-Host "Bridge source and destination are the same; skipping copy."
    } else {
        Copy-Item $bridgeSource $bridgeDest -Force
        Write-Host "Copied universalDownloadBridge.js"
    }
}

$indexPath = ".\index.html"
$index = Get-Content $indexPath -Raw
if ($index -notmatch "universalDownloadBridge\.js") {
    $scriptTag = '    <script src="./src/ui/universalDownloadBridge.js"></script>'
    if ($index -match '<script\s+type="module"\s+src="\.\/app\.js"') {
        $index = $index -replace '(?=<script\s+type="module"\s+src="\.\/app\.js")', "$scriptTag`r`n    "
    } elseif ($index -match '<script\s+type="module"\s+src="app\.js"') {
        $index = $index -replace '(?=<script\s+type="module"\s+src="app\.js")', "$scriptTag`r`n    "
    } else {
        throw "Could not find app.js module script in index.html"
    }
    Set-Content $indexPath $index -Encoding UTF8
    Write-Host "Added universalDownloadBridge.js before app.js"
} else {
    Write-Host "index.html already loads universalDownloadBridge.js"
}

$configPath = ".\config\appConfig.js"
$config = Get-Content $configPath -Raw
$config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10w"')
Set-Content $configPath $config -Encoding UTF8
Write-Host "Set appConfig version to v4.10w"

$cssPatch = Join-Path $scriptDir "patch\universal-download-fix.css"
if (Test-Path $cssPatch) {
    $css = Get-Content $cssPatch -Raw
    foreach ($cssFile in @(".\desktop.css", ".\mobile.css")) {
        if (Test-Path $cssFile) {
            $current = Get-Content $cssFile -Raw
            if ($current -notmatch "v4\.10w Manual Download Fallback") {
                Add-Content $cssFile "`n$css"
                Write-Host "Appended v4.10w CSS to $cssFile"
            } else {
                Write-Host "$cssFile already contains v4.10w CSS"
            }
        }
    }
}

$testSource = Join-Path $scriptDir "tests\manual-download-fallback.test.mjs"
$testDest = ".\tests\manual-download-fallback.test.mjs"
if (Test-Path $testSource) {
    $sourcePath = (Resolve-Path $testSource).Path
    $destPath = $null
    if (Test-Path $testDest) { $destPath = (Resolve-Path $testDest).Path }
    if (!$destPath -or $sourcePath -ne $destPath) { Copy-Item $testSource $testDest -Force }
}

Write-Host "v4.10w Manual Download Fallback applied."
