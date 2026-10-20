param(
  [string]$BaseUrl = "http://localhost:4000",
  [Parameter(Mandatory=$true)][string]$AdminToken,
  [Parameter(Mandatory=$true)][string]$DoctorToken
)

$ErrorActionPreference = "Stop"

function Test-Status {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [string]$Token,
    [int[]]$Expected
  )

  $headers = @{}
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }

  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method `
      -Headers $headers -UseBasicParsing -ErrorAction Stop
    $actual = [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response) {
      $actual = [int]$_.Exception.Response.StatusCode
    } else {
      Write-Host "[ERROR] $Name — request failed: $($_.Exception.Message)" -ForegroundColor Red
      return
    }
  }

  if ($Expected -contains $actual) {
    Write-Host "[PASS] $Name => $actual" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] $Name => $actual (expected $($Expected -join ' or '))" -ForegroundColor Red
  }
}

Write-Host "MediCore RBAC smoke tests against $BaseUrl"
Test-Status -Name "Doctors list without token" -Method "GET" -Path "/doctors" -Token "" -Expected @(401,403)
Test-Status -Name "Doctors list as ADMIN" -Method "GET" -Path "/doctors" -Token $AdminToken -Expected @(200)
Test-Status -Name "Doctors list as DOCTOR" -Method "GET" -Path "/doctors" -Token $DoctorToken -Expected @(200)

# Deliberately send no body. A 400 may mean validation ran before authorization;
# expected role enforcement is 403 for a validly parsed request. Adjust if your
# application uses a different validation/authorization ordering.
Write-Host ""
Write-Host "For POST/PATCH/DELETE tests, use Postman with a valid DTO and a disposable test record."
Write-Host "Do not test DELETE against real data."
