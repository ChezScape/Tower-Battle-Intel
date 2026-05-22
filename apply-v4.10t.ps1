$ErrorActionPreference = "Stop"
Write-Host "Applying Tower Battle Intel v4.10t Native Control Guard..."

if (!(Test-Path ".\bootstrap.js")) {
    throw "bootstrap.js not found. Run this from the project root."
}

if (!(Test-Path ".\src\ui\nativeControlGuard.js")) {
    throw "Missing .\src\ui\nativeControlGuard.js. Copy/merge the patch contents into the project root first."
}

$bootstrapPath = ".\bootstrap.js"
$bootstrap = Get-Content $bootstrapPath -Raw

if ($bootstrap -notmatch "nativeControlGuard\.js") {
    $importBlock = @'
import {
    bindNativeControlGuard
} from "./src/ui/nativeControlGuard.js";

'@

    if ($bootstrap -match '"use strict";\s*') {
        $bootstrap = [regex]::Replace($bootstrap, '"use strict";\s*', "`"use strict`";`r`n`r`n$importBlock", 1)
    }
    else {
        $bootstrap = $importBlock + $bootstrap
    }
}

if ($bootstrap -notmatch "bindNativeControlGuard\(\)") {
    if ($bootstrap -match "export function bootstrap\(\)\s*\{") {
        $bootstrap = [regex]::Replace($bootstrap, "export function bootstrap\(\)\s*\{", "export function bootstrap() {`r`n`r`n    bindNativeControlGuard();", 1)
    }
    else {
        throw "Could not find export function bootstrap() in bootstrap.js"
    }
}

Set-Content $bootstrapPath $bootstrap -Encoding UTF8

$configPath = ".\config\appConfig.js"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw
    $config = [regex]::Replace($config, 'version:\s*"v4\.10[a-z]"', 'version: "v4.10t"')
    Set-Content $configPath $config -Encoding UTF8
}

Write-Host "Applied v4.10t. Run: node .\tests\native-control-guard.test.mjs"
