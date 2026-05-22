$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10x Save As Download Fix..."

if (!(Test-Path ".\index.html")) { throw "index.html not found. Run this from the project root." }
if (!(Test-Path ".\config\appConfig.js")) { throw "config\appConfig.js not found. Run this from the project root." }

if (!(Test-Path ".\src\ui")) { New-Item -ItemType Directory -Path ".\src\ui" -Force | Out-Null }
if (!(Test-Path ".\tests")) { New-Item -ItemType Directory -Path ".\tests" -Force | Out-Null }
if (!(Test-Path ".\docs")) { New-Item -ItemType Directory -Path ".\docs" -Force | Out-Null }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Copy-IfDifferent($source, $dest) {
    if (!(Test-Path $source)) { return }
    $sourcePath = (Resolve-Path $source).Path
    $destPath = $null
    if (Test-Path $dest) { $destPath = (Resolve-Path $dest).Path }
    if ($destPath -and $sourcePath -eq $destPath) {
        Write-Host "Source and destination are the same for $dest; skipping copy."
    } else {
        Copy-Item $source $dest -Force
        Write-Host "Copied $dest"
    }
}

Copy-IfDifferent (Join-Path $scriptDir "src\ui\universalDownloadBridge.js") ".\src\ui\universalDownloadBridge.js"
Copy-IfDifferent (Join-Path $scriptDir "tests\save-as-download-fix.test.mjs") ".\tests\save-as-download-fix.test.mjs"
Copy-IfDifferent (Join-Path $scriptDir "docs\save-as-download-fix-v4.10x.md") ".\docs\save-as-download-fix-v4.10x.md"

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
$config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10x"')
Set-Content $configPath $config -Encoding UTF8
Write-Host "Set appConfig version to v4.10x"

$cssPatch = Join-Path $scriptDir "patch\universal-download-fix.css"
if (Test-Path $cssPatch) {
    $css = Get-Content $cssPatch -Raw
    foreach ($cssFile in @(".\desktop.css", ".\mobile.css")) {
        if (Test-Path $cssFile) {
            $current = Get-Content $cssFile -Raw
            if ($current -notmatch "v4\.10x Save As Download Fix") {
                Add-Content $cssFile "`n$css"
                Write-Host "Appended v4.10x CSS to $cssFile"
            } else {
                Write-Host "$cssFile already contains v4.10x CSS"
            }
        }
    }
}

Write-Host "v4.10x Save As Download Fix applied."
