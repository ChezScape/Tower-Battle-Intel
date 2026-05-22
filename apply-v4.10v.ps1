$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10v Universal Download Fix..."

if (!(Test-Path ".\index.html")) { throw "index.html not found. Run this from the project root." }
if (!(Test-Path ".\bootstrap.js")) { throw "bootstrap.js not found. Run this from the project root." }

if (!(Test-Path ".\src\ui")) { New-Item -ItemType Directory -Path ".\src\ui" -Force | Out-Null }
if (!(Test-Path ".\tests")) { New-Item -ItemType Directory -Path ".\tests" -Force | Out-Null }
if (!(Test-Path ".\docs")) { New-Item -ItemType Directory -Path ".\docs" -Force | Out-Null }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bridgeSource = Join-Path $scriptDir "src\ui\universalDownloadBridge.js"
$bridgeDest = ".\src\ui\universalDownloadBridge.js"
if (!(Test-Path $bridgeSource)) {
    if (Test-Path $bridgeDest) { Write-Host "universalDownloadBridge.js already exists in project root." }
    else { throw "Missing src\ui\universalDownloadBridge.js in patch." }
} else {
    $srcPath = (Resolve-Path $bridgeSource).Path
    $destParent = Resolve-Path -LiteralPath (Split-Path $bridgeDest -Parent)
    $destPath = Join-Path $destParent.Path "universalDownloadBridge.js"
    if ($srcPath -ne $destPath) { Copy-Item $bridgeSource $bridgeDest -Force }
    else { Write-Host "Bridge source and destination are the same; skipping copy." }
}

$testSource = Join-Path $scriptDir "tests\universal-download-fix.test.mjs"
if (Test-Path $testSource) { Copy-Item $testSource ".\tests\universal-download-fix.test.mjs" -Force }
$docSource = Join-Path $scriptDir "docs\universal-download-fix-v4.10v.md"
if (Test-Path $docSource) { Copy-Item $docSource ".\docs\universal-download-fix-v4.10v.md" -Force }

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
    Write-Host "Added universalDownloadBridge.js before app.js in index.html"
} else {
    Write-Host "index.html already loads universalDownloadBridge.js"
}

$configPath = ".\config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10v"')
    Set-Content $configPath $config -Encoding UTF8
    Write-Host "Set appConfig version to v4.10v"
}

$cssPatch = Join-Path $scriptDir "patch\universal-download-fix.css"
if (Test-Path $cssPatch) {
    $css = Get-Content $cssPatch -Raw
    foreach ($cssFile in @(".\desktop.css", ".\mobile.css")) {
        if (Test-Path $cssFile) {
            $current = Get-Content $cssFile -Raw
            if ($current -notmatch "v4\.10v Universal Download Fix") {
                Add-Content $cssFile "`n$css"
                Write-Host "Appended universal download CSS to $cssFile"
            } else {
                Write-Host "$cssFile already contains universal download CSS"
            }
        }
    }
}

Write-Host "v4.10v Universal Download Fix applied."
