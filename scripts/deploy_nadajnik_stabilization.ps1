$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$luaContent = @'
-- CC Broadcast 2.3 / OBS Lua (05:55 - 22:00)
local obs = obslua
local START_MIN, END_MIN = (5 * 60 + 55), (22 * 60) -- 05:55 do 22:00
local status_path = os.getenv("LOCALAPPDATA") .. "\\CCBroadcast\\obs-status.txt"
local last_try = 0
local startup_at = os.time()
local last_write = 0
local function active_window()
  local t = os.date("*t")
  local m = t.hour * 60 + t.min
  return m >= START_MIN and m < END_MIN
end
local function report(status)
  local file = io.open(status_path, "w")
  if file then
    file:write(os.date("!%Y-%m-%dT%H:%M:%SZ"), "|", status, "\n")
    file:close()
  end
end
local function tick()
  local now = os.time()
  local active = obs.obs_frontend_streaming_active()
  if active_window() then
    if active then
      if now-last_write >= 30 then report("STREAMING"); last_write=now end
    elseif now-startup_at >= 45 and now-last_try >= 120 then
      last_try=now
      report("START_REQUESTED")
      obs.obs_frontend_streaming_start()
    elseif now-last_write >= 30 then
      report("NOT_STREAMING"); last_write=now
    end
  else
    if active then
      report("STOP_REQUESTED")
      obs.obs_frontend_streaming_stop()
    elseif now-last_write >= 30 then
      report("OFF_SCHEDULE"); last_write=now
    end
  end
end
function script_description()
  return "Christian Culture: emisja codziennie 05:55-22:00, automatyczny start/stop, status lokalny dla nadzorcy Windows."
end
function script_load(settings)
  obs.timer_add(tick, 5000)
end
function script_unload()
  obs.timer_remove(tick)
end
'@

$supContent = @'
<#
  cc-supervisor.ps1 - straznik procesu OBS, toru audio Przegladarki oraz wyjsc multistream Aitum (wersja 2.3).
  Okno nadawania: 05:55 - 22:00.
  Odpowiada za:
  - uruchomienie OBS o 05:55 z flaga --autoplay-policy=no-user-gesture-required
  - neutralizacje doku YouTube (ochrona przed awaria obs-frontend-api.dll)
  - automatyczne wlaczanie Wirtualnej Kamery OBS (podglad PiP w ccMC)
  - straznika toru audio Przegladarki (auto-unmute, 0 dB, auto-refresh przy ciszy >15s)
  - nadzor nad glownym strumieniem i wszystkimi 22 wyjsciami Aitum Multistream
  - lagodne zatrzymanie transmisji o 22:00
#>
param(
  [switch]$Once,
  [switch]$DryRun,
  [switch]$SimulateOffWindow
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$START_MIN = 355; $END_MIN = 1320                     # 05:55-22:00 (pelna gotowosc przed 06:00 rano)
$RETRY_SEC = 120; $ALERT_AFTER = 3
$script:lastTry = @{}; $script:attempts = @{}
$script:lastSummary = [DateTime]::MinValue
$script:lastAudioCheck = [DateTime]::MinValue
$script:lastBrowserRefresh = [DateTime]::MinValue
$script:silentChecks = 0
$script:lastMissing = ""
$script:closeLoggedOffWindow = $false

$root = $PSScriptRoot
if (-not $root) { $root = Join-Path $env:LOCALAPPDATA 'CCBroadcast' }
$log = Join-Path $root 'supervisor.log'
$chStatus = Join-Path $root 'channels-status.txt'
$excludeFile = Join-Path $root 'exclude-channels.txt'

function Log($msg) {
  $line = "$(Get-Date -Format o) $msg"
  Write-Host $line
  try { Add-Content -LiteralPath $log -Value $line -Encoding UTF8 } catch {}
}

if (-not (Test-Path $excludeFile)) {
  try {
    [IO.File]::WriteAllText($excludeFile, "Vertical Stream`r`nVertical Backtrack`r`nVertical Virtual Camera`r`nFB CR`r`n", $utf8NoBom)
  } catch {}
}

function Get-ObsPath {
  $paths = @(
    "$env:ProgramFiles\obs-studio\bin\64bit\obs64.exe",
    "${env:ProgramFiles(x86)}\obs-studio\bin\64bit\obs64.exe"
  )
  foreach ($p in $paths) { if (Test-Path $p) { return $p } }
  throw "Nie znaleziono obs64.exe w standardowych sciezkach."
}

function Ensure-ObsCleanConfigAndLua {
  $globalIni = Join-Path $env:APPDATA 'obs-studio\global.ini'
  if (Test-Path $globalIni) {
    try {
      $gini = Get-Content $globalIni -Raw -Encoding UTF8
      if ($gini -notmatch '(?m)^DisableShutdownCheck=true') {
        if ($gini -match '(?m)^\[General\]') {
          $gini = $gini -replace '(?m)^\[General\]', "[General]`r`nDisableShutdownCheck=true"
        } else {
          $gini = "[General]`r`nDisableShutdownCheck=true`r`n" + $gini
        }
        [System.IO.File]::WriteAllText($globalIni, $gini, $utf8NoBom)
        Log "APPLIED_DISABLE_SHUTDOWN_CHECK"
      }
    } catch { Log "WARN_GLOBAL_INI $($_.Exception.Message)" }
  }

  $sceneFiles = Get-ChildItem (Join-Path $env:APPDATA 'obs-studio\basic\scenes\*.json') -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "Bez_tytu*" -and $_.Name -notlike "*.bak*" }
  $luaPath = (Join-Path $root 'cc_schedule.lua') -replace '\\','/'
  foreach ($sf in $sceneFiles) {
    try {
      $sc = Get-Content $sf.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
      if (-not $sc.modules) { continue }
      $scriptsArr = @()
      if ($sc.modules.'scripts-tool') { $scriptsArr = @($sc.modules.'scripts-tool') }
      if (-not ($scriptsArr | Where-Object { $_.path -eq $luaPath })) {
        $scriptsArr += [PSCustomObject]@{ path = $luaPath; settings = [PSCustomObject]@{} }
        $sc.modules.'scripts-tool' = $scriptsArr
        Copy-Item $sf.FullName "$($sf.FullName).bak-a007" -Force
        [System.IO.File]::WriteAllText($sf.FullName, ($sc | ConvertTo-Json -Depth 25), $utf8NoBom)
        Log "LUA_REGISTERED_IN_SCENE $($sf.Name)"
      }
    } catch { Log "WARN_SCENE_LUA_UPDATE $($_.Exception.Message)" }
  }
}

function Open-Obs([int]$eventSubs = 0) {
  $cfg = Get-Content (Join-Path $env:APPDATA 'obs-studio\plugin_config\obs-websocket\config.json') -Raw | ConvertFrom-Json
  $ws = New-Object System.Net.WebSockets.ClientWebSocket
  $ct = [Threading.CancellationToken]::None
  if (-not $ws.ConnectAsync([Uri]"ws://127.0.0.1:$($cfg.server_port)", $ct).Wait(3000) -or $ws.State -ne 'Open') { $ws.Dispose(); throw 'WS_CONNECT_TIMEOUT' }
  $c = @{ ws = $ws; ct = $ct; n = 0 }
  $hello = Receive-Obs $c
  $identify = @{ rpcVersion = 1; eventSubscriptions = $eventSubs }
  if ($hello.d.authentication) {
    $sha = [Security.Cryptography.SHA256]::Create()
    $h = { param($s) [Convert]::ToBase64String($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($s))) }
    $secret = &$h ($cfg.server_password + $hello.d.authentication.salt)
    $identify.authentication = &$h ($secret + $hello.d.authentication.challenge)
  }
  Send-Obs $c @{ op = 1; d = $identify }
  $res = Receive-Obs $c
  if ($res.op -ne 2) { Close-Obs $c; throw "WS_IDENTIFY_FAILED op=$($res.op)" }
  return $c
}

function Send-Obs($c, $obj) {
  $b = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 6 -Compress))
  $t = $c.ws.SendAsync([ArraySegment[byte]]::new($b), [Net.WebSockets.WebSocketMessageType]::Text, $true, $c.ct)
  if (-not $t.Wait(3000)) { throw 'WS_SEND_TIMEOUT' }
}

function Receive-Obs($c, [int]$timeoutMs = 8000) {
  $buf = New-Object byte[] 1048576; $ms = New-Object IO.MemoryStream
  do {
    $t = $c.ws.ReceiveAsync([ArraySegment[byte]]::new($buf), $c.ct)
    if (-not $t.Wait($timeoutMs)) { return $null }
    $r = $t.Result
    $ms.Write($buf, 0, $r.Count)
  } while (-not $r.EndOfMessage)
  [Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
}

function Req($c, $type, $data = $null) {
  $c.n++
  $id = "sup-$($c.n)"
  $payload = @{ op = 6; d = @{ requestType = $type; requestId = $id } }
  if ($data) { $payload.d.requestData = $data }
  Send-Obs $c $payload
  for ($i = 0; $i -lt 40; $i++) {
    $res = Receive-Obs $c
    if (-not $res) { throw 'WS_RECEIVE_TIMEOUT' }
    if ($res.op -eq 7 -and $res.d.requestId -eq $id) { return $res.d }
  }
  throw "WS_UNEXPECTED_RESPONSE"
}

function Close-Obs($c) {
  try {
    if ($c -and $c.ws -and $c.ws.State -eq 'Open') {
      [void]$c.ws.CloseAsync([Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'bye', $c.ct).Wait(1500)
    }
  } catch {}
  try { if ($c -and $c.ws) { $c.ws.Dispose() } } catch {}
}

function Test-BrowserAudioPeak([string]$inputName, [int]$seconds = 3) {
  $cm = Open-Obs 65536
  try {
    $maxDb = -100.0
    $end = (Get-Date).AddSeconds($seconds)
    while ((Get-Date) -lt $end) {
      $m = Receive-Obs $cm 1500
      if (-not $m -or $m.op -ne 5 -or $m.d.eventType -ne 'InputVolumeMeters') { continue }
      foreach ($inp in $m.d.eventData.inputs) {
        if ($inp.inputName -ne $inputName) { continue }
        $peak = 0.0
        foreach ($ch in $inp.inputLevelsMul) {
          if ($ch.Count -ge 2 -and [double]$ch[1] -gt $peak) { $peak = [double]$ch[1] }
        }
        $db = if ($peak -gt 0) { 20 * [math]::Log10($peak) } else { -100.0 }
        if ($db -gt $maxDb) { $maxDb = $db }
      }
    }
    return [math]::Round($maxDb, 1)
  } finally {
    Close-Obs $cm
  }
}

function Ensure-BrowserAudio($c) {
  try {
    $inputs = (Req $c 'GetInputList').responseData.inputs
    $browserInput = ($inputs | Where-Object { $_.inputKind -eq 'browser_source' } | Select-Object -First 1).inputName
    if (-not $browserInput) { return -100.0 }

    $mute = (Req $c 'GetInputMute' @{ inputName = $browserInput }).responseData.inputMuted
    if ($mute -and -not $DryRun) {
      [void](Req $c 'SetInputMute' @{ inputName = $browserInput; inputMuted = $false })
      Log "AUDIO_WATCHDOG_UNMUTED '$browserInput'"
    }

    $vol = (Req $c 'GetInputVolume' @{ inputName = $browserInput }).responseData.inputVolumeDb
    if ($vol -lt -1.0 -and -not $DryRun) {
      [void](Req $c 'SetInputVolume' @{ inputName = $browserInput; inputVolumeDb = 0.0 })
      Log "AUDIO_WATCHDOG_VOLUME_RESET '$browserInput' (was $([math]::Round($vol,1)) dB -> 0.0 dB)"
    }

    $now = Get-Date
    if (($now - $script:lastAudioCheck).TotalSeconds -ge 60) {
      $script:lastAudioCheck = $now
      $peakDb = Test-BrowserAudioPeak $browserInput 4
      if ($peakDb -lt -60.0) {
        $script:silentChecks++
        if ($script:silentChecks -ge 2 -and ($now - $script:lastBrowserRefresh).TotalSeconds -ge 240) {
          $script:lastBrowserRefresh = $now
          $script:silentChecks = 0
          if (-not $DryRun) {
            [void](Req $c 'PressInputPropertiesButton' @{ inputName = $browserInput; propertyName = 'refreshnocache' })
          }
          Log "AUDIO_WATCHDOG_REFRESH_BROWSER '$browserInput' (2 consecutive silence checks: $peakDb dB)"
        }
      } else {
        $script:silentChecks = 0
      }
      return $peakDb
    }
  } catch {
    Log "WARN_AUDIO_WATCHDOG $($_.Exception.Message)"
  }
  return $null
}

function Get-State($c) {
  $prefix = 'AitumStreamSuiteStartOutput'
  $exclude = @(Get-Content $excludeFile -Encoding UTF8 | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  $hotkeys = @((Req $c 'GetHotkeyList').responseData.hotkeys)
  $channels = @($hotkeys | Where-Object { $_.StartsWith($prefix) } | ForEach-Object { $_.Substring($prefix.Length) } | Where-Object { $exclude -notcontains $_ })
  $active = @{}
  foreach ($o in (Req $c 'GetOutputList').responseData.outputs) { $active[$o.outputName] = [bool]$o.outputActive }
  $main = (Req $c 'GetStreamStatus').responseData
  [pscustomobject]@{
    Channels = $channels
    Missing  = @($channels | Where-Object { -not $active["Aitum Stream Suite Output $_"] })
    AnyAitumActive = [bool]($active.Keys | Where-Object { $_ -like 'Aitum Stream Suite Output *' -and $active[$_] })
    MainActive = [bool]$main.outputActive; MainReconnecting = [bool]$main.outputReconnecting
  }
}

function Write-ChannelStatus($s) {
  $utc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  $line = "$utc|main=$(if($s.MainActive){'ON'}else{'off'})|aitum=$($s.Channels.Count - $s.Missing.Count)/$($s.Channels.Count)|missing=$($s.Missing -join ';')"
  if ($DryRun) { Write-Host "[DRY] channels-status: $line"; return }
  [IO.File]::WriteAllText($chStatus, "$line`n", $utf8NoBom)
}

function Ensure-AllChannels {
  $c = Open-Obs
  try {
    $script:closeLoggedOffWindow = $false
    try {
      $vc = (Req $c 'GetVirtualCamStatus').responseData
      if (-not $vc.outputActive) {
        if ($DryRun) { Log 'WOULD_START virtualcam (podglad PiP ccMC)' } else {
          [void](Req $c 'StartVirtualCam')
          Log 'START virtualcam (podglad PiP ccMC)'
        }
      }
    } catch { Log "WARN_VIRTUALCAM $($_.Exception.Message)" }

    $peakDb = Ensure-BrowserAudio $c

    $s = Get-State $c
    if (-not $s.MainActive -and -not $s.MainReconnecting) {
      if ($DryRun) { Log 'WOULD_START main (Osobowosc +)' } else { [void](Req $c 'StartStream'); Log 'START main (Osobowosc +)'; Start-Sleep -Seconds 4 }
    }
    $now = Get-Date; $started = @()
    foreach ($ch in $s.Missing) {
      if ($script:lastTry.ContainsKey($ch) -and ($now - $script:lastTry[$ch]).TotalSeconds -lt $RETRY_SEC) { continue }
      $script:lastTry[$ch] = $now; $script:attempts[$ch] = 1 + [int]$script:attempts[$ch]
      if ($script:attempts[$ch] -eq $ALERT_AFTER) { Log "ALERT_CHANNEL_NOT_STARTING '$ch' po $ALERT_AFTER probach (klucz/stream w YouTube?)" }
      if ($DryRun) { $started += $ch; continue }
      [void](Req $c 'TriggerHotkeyByName' @{ hotkeyName = "AitumStreamSuiteStartOutput$ch" })
      $started += $ch
      Start-Sleep -Milliseconds 1500
    }
    if ($started.Count) { Log "$(if($DryRun){'WOULD_START'}else{'START'}) aitum $($started.Count): $($started -join ', ')" }
    $s = Get-State $c
    foreach ($ch in $s.Channels) { if ($s.Missing -notcontains $ch) { $script:attempts.Remove($ch) } }
    Write-ChannelStatus $s
    $miss = $s.Missing -join ';'
    if ($miss -ne $script:lastMissing -or ((Get-Date) - $script:lastSummary).TotalMinutes -ge 10) {
      $audioInfo = if ($null -ne $peakDb) { " audioPeak=${peakDb}dB" } else { "" }
      Log "SUMMARY main=$(if($s.MainActive){'ON'}else{'off'}) aitum=$($s.Channels.Count - $s.Missing.Count)/$($s.Channels.Count) missing=[$miss]$audioInfo"
      $script:lastMissing = $miss; $script:lastSummary = Get-Date
    }
  } finally { Close-Obs $c }
}

function Stop-AllStreamsGracefully {
  $c = Open-Obs
  try {
    try {
      $vc = (Req $c 'GetVirtualCamStatus').responseData
      if ($vc.outputActive) {
        if (-not $DryRun) { [void](Req $c 'StopVirtualCam') }
        Log 'OFF_WINDOW_STOP virtualcam'
      }
    } catch {}

    $s = Get-State $c
    if ($s.AnyAitumActive) {
      if ($DryRun) { Log 'WOULD_STOP all aitum outputs' } else { [void](Req $c 'TriggerHotkeyByName' @{ hotkeyName = 'AitumStreamSuiteStopAllOutputs' }); Log 'OFF_WINDOW_STOP aitum' }
    }
    if ($s.MainActive) {
      if ($DryRun) { Log 'WOULD_STOP main' } else { [void](Req $c 'StopStream'); Log 'OFF_WINDOW_STOP main' }
    }
    if (-not $DryRun -and ($s.AnyAitumActive -or $s.MainActive)) { Start-Sleep -Seconds 5; $s = Get-State $c }
    Write-ChannelStatus $s
    return (-not $s.AnyAitumActive -and -not $s.MainActive)
  } finally { Close-Obs $c }
}

function Time-ToMinutes { $now = Get-Date; return ($now.Hour * 60 + $now.Minute) }
function Is-OnAirWindow { if ($SimulateOffWindow) { return $false }; $m = Time-ToMinutes; return ($m -ge $START_MIN -and $m -lt $END_MIN) }

function Do-Check {
  $obs = @(Get-Process obs64 -ErrorAction SilentlyContinue)
  if (Is-OnAirWindow) {
    if ($obs.Count -eq 0) {
      if ($DryRun) { Log 'WOULD_START_OBS'; return }
      Ensure-ObsCleanConfigAndLua
      $exe = Get-ObsPath
      Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe) -ArgumentList '--disable-shutdown-check --autoplay-policy=no-user-gesture-required' | Out-Null
      $script:lastTry = @{}; $script:attempts = @{}
      Log 'OBS_START_PROCESS (05:55-22:00, autoplay-policy enabled)'
    } elseif (((Get-Date) - $obs[0].StartTime).TotalSeconds -ge 45) {
      Ensure-AllChannels
    }
  } elseif ($obs.Count -gt 0) {
    $stopped = Stop-AllStreamsGracefully
    $m = Time-ToMinutes
    if ($m -ge ($END_MIN + 2) -or $m -lt $START_MIN) {
      if (-not $stopped) { Log 'ALERT_OBS_NOT_CONFIRMED_STOPPED; nie zamykam procesu'; return }
      if ($DryRun) { Log 'WOULD_CLOSE_OBS'; return }
      Ensure-ObsCleanConfigAndLua
      foreach ($p in $obs) {
        try {
          if ($p.CloseMainWindow()) {
            Log 'OBS_GRACEFUL_CLOSE_REQUESTED'
          } elseif (-not $script:closeLoggedOffWindow) {
            Log 'OFF_WINDOW_STREAMS_STOPPED_STANDBY (OBS w zasobniku w trybie czuwania)'
            $script:closeLoggedOffWindow = $true
          }
        } catch { Log "ALERT_CLOSE_ERROR $($_.Exception.Message)" }
      }
    }
  }
}

$createdNew = $false
$lock = New-Object System.Threading.Mutex($true, 'Local\CCBroadcastSupervisorMutex', [ref]$createdNew)
if (-not $createdNew) {
  Write-Host "Inna instancja cc-supervisor juz dziala."
  exit 0
}

try {
  Log "SUPERVISOR_STARTED v2.3 (05:55-22:00 + AudioWatchdog)$(if($DryRun){' DRYRUN'})"
  do {
    try { Do-Check } catch { Log "ERROR $($_.Exception.Message)" }
    if (-not $Once) { Start-Sleep -Seconds 30 }
  } until ($Once)
} finally { if ($lock) { $lock.ReleaseMutex(); $lock.Dispose() } }
'@

$targets = @(
  'C:\Users\nazir\AppData\Local\CCBroadcast',
  'C:\Users\nazir\a007\CC_OBS_Autostart_2_0'
)

foreach ($dir in $targets) {
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText((Join-Path $dir 'cc_schedule.lua'), $luaContent, $utf8NoBom)
  [System.IO.File]::WriteAllText((Join-Path $dir 'cc-supervisor.ps1'), $supContent, $utf8NoBom)
  Write-Output "Updated cc_schedule.lua and cc-supervisor.ps1 in $dir"
}

# Zaktualizuj wyzwalacz Harmonogramu Zadan na 05:55 + AtLogOn
$taskName = 'CC Broadcast Autopilot 2.0'
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  $tDaily = New-ScheduledTaskTrigger -Daily -At '05:55'
  $tLogon = New-ScheduledTaskTrigger -AtLogOn
  Set-ScheduledTask -TaskName $taskName -Trigger @($tDaily, $tLogon) | Out-Null
  Write-Output "Updated ScheduledTask '$taskName' triggers to Daily 05:55 + AtLogOn"
}

# Wykonaj pojedynczy przebieg weryfikacyjny (--Once), a nastepnie uruchom zadanie w tle
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\nazir\AppData\Local\CCBroadcast\cc-supervisor.ps1" -Once
Start-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Write-Output "Started ScheduledTask '$taskName' in background."
