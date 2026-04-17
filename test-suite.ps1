# QUANTFLOW PRE-DEPLOYMENT TEST SUITE
# Run from quantflow root folder

$ErrorActionPreference = 'Continue'
$passed = 0
$failed = 0
$warnings = 0
$results = @()

function Test-Result {
    param($name, $status, $detail = "")
    if ($status -eq 'PASS') {
        Write-Host "✓ PASS  " -ForegroundColor Green -NoNewline
        $script:passed++
    } elseif ($status -eq 'WARN') {
        Write-Host "⚠ WARN  " -ForegroundColor Yellow -NoNewline
        $script:warnings++
    } else {
        Write-Host "✗ FAIL  " -ForegroundColor Red -NoNewline
        $script:failed++
    }
    Write-Host "$name" -ForegroundColor White -NoNewline
    if ($detail) { Write-Host "  ($detail)" -ForegroundColor Gray } else { Write-Host "" }
    $script:results += [PSCustomObject]@{ Test = $name; Status = $status; Detail = $detail }
}

function Section {
    param($name)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $name" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
}

Clear-Host
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   QUANTFLOW AUTOMATION — PRE-DEPLOY TESTS     ║" -ForegroundColor Magenta
Write-Host "║   Trade2Retire Academy                        ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Magenta

# ============================================================
Section "1. PROJECT STRUCTURE"
# ============================================================

$requiredDirs = @('client/src', 'client/src/pages', 'client/src/components', 'client/src/stores', 'server/src', 'server/src/routes', 'server/prisma')
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) { Test-Result "Directory exists: $dir" "PASS" }
    else { Test-Result "Directory exists: $dir" "FAIL" "Missing" }
}

$criticalFiles = @(
    'client/package.json', 'client/vite.config.ts', 'client/tailwind.config.js',
    'client/src/App.tsx', 'client/src/main.tsx', 'client/src/index.css',
    'server/package.json', 'server/src/index.ts', 'server/prisma/schema.prisma'
)
foreach ($file in $criticalFiles) {
    if (Test-Path $file) { Test-Result "File exists: $file" "PASS" }
    else { Test-Result "File exists: $file" "FAIL" "Missing" }
}

# ============================================================
Section "2. BACKEND HEALTH"
# ============================================================

try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -TimeoutSec 5
    if ($health.status -eq 'ok') { Test-Result "Backend API reachable" "PASS" "v$($health.version)" }
    else { Test-Result "Backend API reachable" "FAIL" "Unexpected response" }
} catch {
    Test-Result "Backend API reachable" "FAIL" "Server not running on port 4000"
}

# ============================================================
Section "3. AUTHENTICATION"
# ============================================================

$testEmail = "test_$(Get-Random)@quantflow.test"
$testPass = "Test1234!"
$token = $null

try {
    $reg = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -ContentType "application/json" -Body (@{email=$testEmail; password=$testPass; displayName="TestBot"} | ConvertTo-Json) -TimeoutSec 5
    if ($reg.token) {
        Test-Result "User registration" "PASS"
        $token = $reg.token
    } else { Test-Result "User registration" "FAIL" "No token returned" }
} catch { Test-Result "User registration" "FAIL" $_.Exception.Message }

try {
    $login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$testEmail; password=$testPass} | ConvertTo-Json) -TimeoutSec 5
    if ($login.token) { Test-Result "User login" "PASS" } else { Test-Result "User login" "FAIL" }
} catch { Test-Result "User login" "FAIL" $_.Exception.Message }

try {
    $bad = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$testEmail; password="wrong"} | ConvertTo-Json) -TimeoutSec 5 -ErrorAction Stop
    Test-Result "Rejects wrong password" "FAIL" "Allowed invalid login"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) { Test-Result "Rejects wrong password" "PASS" }
    else { Test-Result "Rejects wrong password" "WARN" "Unexpected code" }
}

try {
    $noauth = Invoke-RestMethod -Uri "http://localhost:4000/api/trades" -TimeoutSec 5 -ErrorAction Stop
    Test-Result "Protected routes require auth" "FAIL" "Accessible without token"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) { Test-Result "Protected routes require auth" "PASS" }
    else { Test-Result "Protected routes require auth" "WARN" }
}

# ============================================================
Section "4. TRADE CRUD OPERATIONS"
# ============================================================

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    $tradeId = $null

    try {
        $newTrade = @{
            pair="EUR/USD"; direction="LONG"; entryPrice=1.0850; exitPrice=1.0892
            stopLoss=1.0820; takeProfit=1.0910; lotSize=0.1; riskPercent=1.0
            entryTime="2026-04-15T14:30:00Z"; exitTime="2026-04-15T17:00:00Z"
            psychology=@{ preMood=4; preConfidence=5 }
        } | ConvertTo-Json -Depth 5
        $create = Invoke-RestMethod -Uri "http://localhost:4000/api/trades" -Method POST -Headers $headers -ContentType "application/json" -Body $newTrade -TimeoutSec 5
        if ($create.trade.id) {
            Test-Result "Create trade" "PASS" "P&L: `$$($create.trade.pnlDollars)"
            $tradeId = $create.trade.id
            if ($create.trade.pnlDollars -gt 0) { Test-Result "Auto P&L calculation" "PASS" }
            else { Test-Result "Auto P&L calculation" "FAIL" "Expected positive P&L" }
            if ($create.trade.session) { Test-Result "Auto session detection" "PASS" "$($create.trade.session)" }
            else { Test-Result "Auto session detection" "FAIL" }
        } else { Test-Result "Create trade" "FAIL" }
    } catch { Test-Result "Create trade" "FAIL" $_.Exception.Message }

    try {
        $list = Invoke-RestMethod -Uri "http://localhost:4000/api/trades" -Headers $headers -TimeoutSec 5
        if ($list.trades.Count -gt 0) { Test-Result "List trades" "PASS" "$($list.trades.Count) trade(s)" }
        else { Test-Result "List trades" "FAIL" }
    } catch { Test-Result "List trades" "FAIL" }

    if ($tradeId) {
        try {
            $upd = @{ pair="EUR/AUD"; pnlDollars=100 } | ConvertTo-Json
            Invoke-RestMethod -Uri "http://localhost:4000/api/trades/$tradeId" -Method PUT -Headers $headers -ContentType "application/json" -Body $upd -TimeoutSec 5 | Out-Null
            Test-Result "Update trade (edit)" "PASS"
        } catch { Test-Result "Update trade (edit)" "FAIL" }

        try {
            Invoke-RestMethod -Uri "http://localhost:4000/api/trades/$tradeId" -Method DELETE -Headers $headers -TimeoutSec 5 | Out-Null
            Test-Result "Delete trade" "PASS"
        } catch { Test-Result "Delete trade" "FAIL" }
    }
} else {
    Test-Result "Trade CRUD tests" "FAIL" "No auth token"
}

# ============================================================
Section "5. ANALYTICS ENGINE"
# ============================================================

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $analytics = Invoke-RestMethod -Uri "http://localhost:4000/api/analytics/overview" -Headers $headers -TimeoutSec 5
        $metrics = @('totalTrades','winRate','totalPnl','profitFactor','expectancy','maxDrawdown','byPair','bySession','equityCurve')
        $allPresent = $true
        foreach ($m in $metrics) {
            if (-not ($analytics.PSObject.Properties.Name -contains $m)) { $allPresent = $false }
        }
        if ($allPresent) { Test-Result "Analytics endpoint returns all metrics" "PASS" }
        else { Test-Result "Analytics endpoint returns all metrics" "FAIL" "Missing fields" }
    } catch { Test-Result "Analytics endpoint" "FAIL" $_.Exception.Message }
}

# ============================================================
Section "6. PLAYBOOKS & NOTEBOOK"
# ============================================================

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    try {
        $pb = @{ name="Test Playbook"; setupType="Pullback"; entryRules=@("Rule 1"); exitRules=@("Exit 1"); confluences=@("Support") } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "http://localhost:4000/api/playbooks" -Method POST -Headers $headers -ContentType "application/json" -Body $pb -TimeoutSec 5
        if ($res.playbook.id) {
            Test-Result "Create playbook" "PASS"
            Invoke-RestMethod -Uri "http://localhost:4000/api/playbooks/$($res.playbook.id)" -Method DELETE -Headers $headers -TimeoutSec 5 | Out-Null
            Test-Result "Delete playbook" "PASS"
        } else { Test-Result "Create playbook" "FAIL" }
    } catch { Test-Result "Playbook CRUD" "FAIL" }

    try {
        $nb = @{ title="Test"; content="Test content"; type="DAILY_PLAN" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "http://localhost:4000/api/notebook" -Method POST -Headers $headers -ContentType "application/json" -Body $nb -TimeoutSec 5
        if ($res.entry.id) {
            Test-Result "Create notebook entry" "PASS"
            Invoke-RestMethod -Uri "http://localhost:4000/api/notebook/$($res.entry.id)" -Method DELETE -Headers $headers -TimeoutSec 5 | Out-Null
            Test-Result "Delete notebook entry" "PASS"
        } else { Test-Result "Create notebook entry" "FAIL" }
    } catch { Test-Result "Notebook CRUD" "FAIL" }
}

# ============================================================
Section "7. FRONTEND BUILD"
# ============================================================

try {
    $vite = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($vite.StatusCode -eq 200) { Test-Result "Frontend serving on port 3000" "PASS" }
    else { Test-Result "Frontend serving on port 3000" "FAIL" }
} catch { Test-Result "Frontend serving on port 3000" "FAIL" "Not reachable" }

# TypeScript check
Push-Location client
try {
    $tsc = & npx tsc --noEmit 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) { Test-Result "TypeScript compiles (client)" "PASS" }
    else {
        $errCount = ([regex]::Matches($tsc, "error TS")).Count
        Test-Result "TypeScript compiles (client)" "WARN" "$errCount TS errors (non-blocking)"
    }
} catch { Test-Result "TypeScript check" "WARN" "Could not run tsc" }
Pop-Location

# ============================================================
Section "8. SECURITY CHECKS"
# ============================================================

$envLeak = Get-ChildItem -Path "server/src","client/src" -Recurse -File 2>$null | Select-String -Pattern "sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}" -List
if ($envLeak) { Test-Result "No hardcoded API keys" "FAIL" "$($envLeak.Count) suspicious strings" }
else { Test-Result "No hardcoded API keys" "PASS" }

$gitignore = 'server/node_modules','client/node_modules','server/quantflow.db','server/.env'
$hasGitignore = Test-Path ".gitignore"
if (-not $hasGitignore) { Test-Result ".gitignore exists" "WARN" "Create before git commits" }
else { Test-Result ".gitignore exists" "PASS" }

if (Test-Path "server/src/middleware/auth.ts") {
    $authCode = Get-Content "server/src/middleware/auth.ts" -Raw
    if ($authCode -match "JWT_SECRET.*=.*'quantflow-secret-key-change-in-production'") {
        Test-Result "JWT secret is placeholder" "WARN" "Change before production!"
    } else { Test-Result "JWT secret configured" "PASS" }
}

$bcryptCheck = Select-String -Path "server/src/routes/auth.ts" -Pattern "bcrypt" -Quiet
if ($bcryptCheck) { Test-Result "Password hashing (bcrypt)" "PASS" }
else { Test-Result "Password hashing (bcrypt)" "FAIL" "Not found" }

# ============================================================
Section "9. DATABASE INTEGRITY"
# ============================================================

if (Test-Path "server/prisma/quantflow.db") {
    $dbSize = (Get-Item "server/prisma/quantflow.db").Length
    Test-Result "Database file exists" "PASS" "$([math]::Round($dbSize/1KB, 1)) KB"
} else {
    Test-Result "Database file exists" "FAIL" "Run npx prisma db push"
}

# ============================================================
Section "10. CODE QUALITY"
# ============================================================

$consoleLogCount = 0
Get-ChildItem -Path "client/src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "console\.log" -AllMatches
    if ($matches) { $consoleLogCount += $matches.Matches.Count }
}
if ($consoleLogCount -eq 0) { Test-Result "No console.log in client" "PASS" }
elseif ($consoleLogCount -lt 5) { Test-Result "Console.log usage" "PASS" "$consoleLogCount (acceptable)" }
else { Test-Result "Console.log usage" "WARN" "$consoleLogCount found — clean up for prod" }

$todoCount = 0
Get-ChildItem -Path "client/src","server/src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "TODO|FIXME" -AllMatches
    if ($matches) { $todoCount += $matches.Matches.Count }
}
if ($todoCount -eq 0) { Test-Result "No TODO/FIXME markers" "PASS" }
else { Test-Result "TODO/FIXME markers" "WARN" "$todoCount found" }

# ============================================================
Section "11. DEPENDENCY AUDIT"
# ============================================================

Push-Location client
try {
    $audit = & npm audit --json 2>&1 | Out-String
    try {
        $auditObj = $audit | ConvertFrom-Json
        $high = $auditObj.metadata.vulnerabilities.high + $auditObj.metadata.vulnerabilities.critical
        $mod = $auditObj.metadata.vulnerabilities.moderate
        if ($high -eq 0) { Test-Result "Client: no high/critical vulnerabilities" "PASS" }
        else { Test-Result "Client: security vulnerabilities" "WARN" "$high high/critical" }
    } catch { Test-Result "Client npm audit" "WARN" "Could not parse" }
} catch { Test-Result "Client npm audit" "WARN" }
Pop-Location

Push-Location server
try {
    $audit = & npm audit --json 2>&1 | Out-String
    try {
        $auditObj = $audit | ConvertFrom-Json
        $high = $auditObj.metadata.vulnerabilities.high + $auditObj.metadata.vulnerabilities.critical
        if ($high -eq 0) { Test-Result "Server: no high/critical vulnerabilities" "PASS" }
        else { Test-Result "Server: security vulnerabilities" "WARN" "$high high/critical" }
    } catch { Test-Result "Server npm audit" "WARN" }
} catch { Test-Result "Server npm audit" "WARN" }
Pop-Location

# ============================================================
Section "12. PRODUCTION BUILD TEST"
# ============================================================

Push-Location client
Write-Host "Running production build (may take 30-60 sec)..." -ForegroundColor Gray
try {
    $build = & npm run build 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0 -and (Test-Path "dist/index.html")) {
        $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        Test-Result "Client production build" "PASS" "$([math]::Round($distSize/1MB, 2)) MB"
    } else {
        Test-Result "Client production build" "FAIL" "Build errors"
    }
} catch { Test-Result "Client production build" "FAIL" }
Pop-Location

# ============================================================
# FINAL REPORT
# ============================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              FINAL REPORT                     ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
Write-Host "  ✓ Passed:   $passed" -ForegroundColor Green
Write-Host "  ⚠ Warnings: $warnings" -ForegroundColor Yellow
Write-Host "  ✗ Failed:   $failed" -ForegroundColor Red
Write-Host ""

$total = $passed + $failed + $warnings
$score = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "  Score: $score%" -ForegroundColor $(if ($score -ge 90) {'Green'} elseif ($score -ge 70) {'Yellow'} else {'Red'})
Write-Host ""

if ($failed -eq 0 -and $warnings -le 3) {
    Write-Host "  STATUS: " -NoNewline
    Write-Host "READY FOR DEPLOYMENT" -ForegroundColor Green -BackgroundColor DarkGreen
} elseif ($failed -eq 0) {
    Write-Host "  STATUS: " -NoNewline
    Write-Host "READY (review warnings)" -ForegroundColor Yellow
} else {
    Write-Host "  STATUS: " -NoNewline
    Write-Host "FIX FAILURES BEFORE DEPLOYING" -ForegroundColor Red
}

Write-Host ""
Write-Host "Report saved to test-report.txt" -ForegroundColor Gray
$results | Format-Table | Out-File "test-report.txt"
Write-Host ""

