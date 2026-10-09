# Builds the bank-sync plugin JAR and sideloads it into the local RuneLite client.
# Usage: .\plugin\build-and-sideload.ps1   (from repo root or plugin dir)
# After running, restart RuneLite (or toggle the plugin) to pick up the new JAR.
$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
    .\gradlew.bat shadowJar
    if ($LASTEXITCODE -ne 0) { throw "gradle shadowJar failed with exit code $LASTEXITCODE" }

    $jar = Get-ChildItem "$PSScriptRoot\build\libs\*-all.jar" |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $jar) { throw "No *-all.jar found in build\libs" }

    $destDir = Join-Path $env:USERPROFILE ".runelite\sideloaded-plugins"
    New-Item -ItemType Directory -Force $destDir | Out-Null
    $dest = Join-Path $destDir "osrs-boss-sync.jar"
    Copy-Item $jar.FullName $dest -Force

    Write-Host "Sideloaded $($jar.Name) -> $dest"
}
finally {
    Pop-Location
}
