# ==============================================================================
# CC INTELLIGENT RAM GUARD & OPTIMIZER (Strażnik Pamięci RAM Christian Culture)
# ==============================================================================
param(
    [switch]$Loop,
    [int]$IntervalSeconds = 90,
    [double]$TriggerPercent = 82.0,
    [double]$MaxProcessCommitGB = 4.0,
    [switch]$KillRunaway
)

$sig = @'
[DllImport("psapi.dll")]
public static extern int EmptyWorkingSet(IntPtr hwProc);
'@
$null = Add-Type -MemberDefinition $sig -Name "PsApi" -Namespace "CCMemoryGuard" -PassThru -ErrorAction SilentlyContinue

function Optimize-SystemMemory {
    param([bool]$Force = $false)

    $os = Get-CimInstance Win32_OperatingSystem
    $totalMB = $os.TotalVisibleMemorySize / 1KB
    $freeMB = $os.FreePhysicalMemory / 1KB
    $usedMB = $totalMB - $freeMB
    $usedPct = [math]::Round(($usedMB / $totalMB) * 100, 1)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] RAM: $([math]::Round($usedMB/1024, 2)) GB / $([math]::Round($totalMB/1024, 2)) GB ($usedPct%) | Wolne: $([math]::Round($freeMB/1024, 2)) GB"

    if (-not $Force -and $usedPct -lt $TriggerPercent) {
        return
    }

    Write-Host "[$timestamp] >>> Uruchamianie procedury oczyszczania RAM (Próg: $TriggerPercent%)..." -ForegroundColor Yellow

    # 1. Trimming procesów o dużym WorkingSet
    $candidates = Get-Process | Where-Object { 
        $_.WorkingSet64 -gt 150MB -and 
        $_.ProcessName -notin @('System', 'Idle', 'csrss', 'smss', 'wininit', 'services')
    }

    $freedMB = 0
    foreach ($proc in $candidates) {
        $before = [math]::Round($proc.WorkingSet64 / 1MB, 0)
        try {
            $null = [CCMemoryGuard.PsApi]::EmptyWorkingSet($proc.Handle)
            $proc.Refresh()
            $after = [math]::Round($proc.WorkingSet64 / 1MB, 0)
            $diff = $before - $after
            if ($diff -gt 0) { $freedMB += $diff }
        } catch {}
    }

    # 2. Sprawdzenie procesów z wyciekiem pamięci (Runaway Commit > $MaxProcessCommitGB)
    $runaways = Get-Process | Where-Object { 
        ($_.PrivateMemorySize64 / 1GB) -gt $MaxProcessCommitGB -and 
        $_.ProcessName -match "language_server|node|electron"
    }

    foreach ($r in $runaways) {
        $commitGB = [math]::Round($r.PrivateMemorySize64 / 1GB, 2)
        Write-Warning "Wykryto proces z wyciekiem pamięci: $($r.ProcessName) (PID $($r.Id)) zużywa $commitGB GB pamięci Private Commit!"
        if ($KillRunaway) {
            Write-Host "Zamykanie wyciekającego procesu PID $($r.Id)..." -ForegroundColor Red
            Stop-Process -Id $r.Id -Force -ErrorAction SilentlyContinue
        }
    }

    # 3. Zgłoszenie garbage collection w .NET
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    $osAfter = Get-CimInstance Win32_OperatingSystem
    $freeAfterMB = $osAfter.FreePhysicalMemory / 1KB
    $usedAfterMB = $totalMB - $freeAfterMB
    $usedAfterPct = [math]::Round(($usedAfterMB / $totalMB) * 100, 1)

    Write-Host "[$timestamp] SUKCES: Zwolniono ok. $([math]::Round($freedMB/1024, 2)) GB RAM. Nowy stan: $([math]::Round($usedAfterMB/1024, 2)) GB ($usedAfterPct%)" -ForegroundColor Green
}

if ($Loop) {
    Write-Host "Strażnik pamięci CC RAM Guard uruchomiony w trybie ciągłym (interwał: ${IntervalSeconds}s, próg: ${TriggerPercent}%)..." -ForegroundColor Cyan
    while ($true) {
        try {
            Optimize-SystemMemory
        } catch {
            Write-Warning "Błąd cyklu: $($_.Exception.Message)"
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Optimize-SystemMemory -Force $true
}
