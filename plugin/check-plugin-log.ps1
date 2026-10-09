# Scans the RuneLite client log for sideload/plugin activity and errors.
# Usage: .\plugin\check-plugin-log.ps1 [-Last 60] [-Pattern "extra|terms"]
param(
    [int]$Last = 60,
    [string]$Pattern = "sideload|BankSync|boss-helper|error|exception|warn"
)

$log = Join-Path $env:USERPROFILE ".runelite\logs\client.log"
if (-not (Test-Path $log)) {
    Write-Error "RuneLite log not found at $log (has the client been run?)"
    exit 1
}

Select-String -Path $log -Pattern $Pattern -CaseSensitive:$false |
    Select-Object -Last $Last |
    ForEach-Object { $_.Line }
