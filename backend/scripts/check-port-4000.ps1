$connections = netstat -ano | Select-String ':4000'
if (-not $connections) {
  Write-Host "Nothing is listening on port 4000."
  exit 0
}
$connections | ForEach-Object { Write-Host $_.Line }
Write-Host ""
Write-Host "Find the PID in the LISTENING row. To stop it, run:"
Write-Host "Stop-Process -Id <ACTUAL_PID> -Force"
Write-Host "Replace <ACTUAL_PID> with the numeric PID; do not type the angle brackets."
