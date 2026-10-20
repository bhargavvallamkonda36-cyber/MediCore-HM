# MediCore API security smoke tests (PowerShell)

Run these in a new PowerShell terminal while the backend is running on port 4000.

## 1. Patient login and capture token
```powershell
$loginBody = @{
  email = "bhargavchandra673@gmail.com"
  password = Read-Host "Enter the patient's current password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
  -Uri "http://localhost:4000/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $loginBody

$patientToken = $loginResponse.accessToken
if ([string]::IsNullOrWhiteSpace($patientToken)) { throw "Login did not return accessToken." }
$patientHeaders = @{ Authorization = "Bearer $patientToken" }
Write-Host "Patient login successful. Role: $($loginResponse.user.role)" -ForegroundColor Green
```

## 2. Verify profile access
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/auth/profile" -Method Get -Headers $patientHeaders
```
Expected: HTTP 200 and the logged-in patient's profile.

## 3. Verify patient cannot list all patients
```powershell
try {
  Invoke-RestMethod -Uri "http://localhost:4000/patients" -Method Get -Headers $patientHeaders
  Write-Host "WARNING: patient listing returned success; review RBAC." -ForegroundColor Red
} catch {
  $status = [int]$_.Exception.Response.StatusCode
  Write-Host "Patient listing response status: $status"
  if ($status -eq 403) {
    Write-Host "PASS: patient is denied access to the staff patient list." -ForegroundColor Green
  } else {
    Write-Host $_.ErrorDetails.Message
  }
}
```

## 4. Verify unauthenticated access is rejected
```powershell
try {
  Invoke-RestMethod -Uri "http://localhost:4000/patients" -Method Get
  Write-Host "WARNING: unauthenticated request succeeded; review JwtAuthGuard." -ForegroundColor Red
} catch {
  $status = [int]$_.Exception.Response.StatusCode
  Write-Host "Unauthenticated response status: $status"
  if ($status -eq 401) {
    Write-Host "PASS: unauthenticated request is rejected." -ForegroundColor Green
  } else {
    Write-Host $_.ErrorDetails.Message
  }
}
```

## 5. Test own patient record
The recent profile response showed user ID `7` and patient-table ID `2`. These IDs differ in this database. Test the patient record ID only:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/patients/2" -Method Get -Headers $patientHeaders
```
Expected: success only if the service maps the authenticated user to patient record ID 2. If it returns 403 or 404, inspect `patients.service.ts`; do not weaken the guard.

## 6. Password reset
The reset utility prompts for a new password and confirmation. Use at least 8 characters. After a successful reset, test login using the new password. Never put passwords in source files or commit them to Git.

## Result interpretation
- `401`: missing, malformed, invalid, or expired token.
- `403`: authenticated user lacks role or ownership permission.
- `404` on `/`: expected if no root route exists.
- `EADDRINUSE :::4000`: another backend process is already listening. Check `netstat -ano | findstr :4000`; do not start a second copy.
