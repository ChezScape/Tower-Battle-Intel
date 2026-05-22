$ErrorActionPreference = "Stop"

Write-Host "Applying Tower Battle Intel v4.10y History Search Focus Fix..."

if (!(Test-Path ".\index.html")) { throw "index.html not found. Run this from the project root." }
if (!(Test-Path ".\config\appConfig.js")) { throw "config\appConfig.js not found. Run this from the project root." }

$source = ".\src\ui\historySearchFocusGuard.js"
if (!(Test-Path $source)) { throw "Missing .\src\ui\historySearchFocusGuard.js. Copy the patch contents into the project root first." }

# Ensure classic guard loads before app.js.
$indexPath = ".\index.html"
$index = Get-Content $indexPath -Raw
if ($index -notmatch "historySearchFocusGuard\.js") {
    $scriptTag = '    <script src="./src/ui/historySearchFocusGuard.js"></script>'
    if ($index -match '<script\s+type="module"\s+src="\.\/app\.js"') {
        $index = $index -replace '(?=<script\s+type="module"\s+src="\.\/app\.js")', "$scriptTag`r`n    "
        Set-Content $indexPath $index -Encoding UTF8
        Write-Host "Added historySearchFocusGuard.js before app.js"
    }
    else {
        throw "Could not find app.js module script in index.html"
    }
}
else {
    Write-Host "index.html already loads historySearchFocusGuard.js"
}

# Set app version to v4.10y.
$configPath = ".\config\appConfig.js"
$config = Get-Content $configPath -Raw
$config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10y"')
Set-Content $configPath $config -Encoding UTF8
Write-Host "Set appConfig version to v4.10y"

Write-Host "v4.10y History Search Focus Fix applied."
