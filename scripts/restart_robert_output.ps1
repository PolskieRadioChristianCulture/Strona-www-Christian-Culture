$cfg = Get-Content (Join-Path $env:APPDATA "obs-studio\plugin_config\obs-websocket\config.json") -Raw | ConvertFrom-Json
$ct = [Threading.CancellationToken]::None
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([Uri]"ws://127.0.0.1:$($cfg.server_port)", $ct).Wait()

function Odbierz {
    $buf = New-Object byte[] 2097152
    $ms = New-Object IO.MemoryStream
    do {
        $r = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), $ct).Result
        $ms.Write($buf, 0, $r.Count)
    } while (-not $r.EndOfMessage)
    [Text.Encoding]::UTF8.GetString($ms.ToArray()) | ConvertFrom-Json
}
function Wyslij($obj) {
    $b = [Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 5 -Compress))
    $ws.SendAsync([ArraySegment[byte]]::new($b), [Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()
}
function Sha64($s) { [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($s))) }

$hello = Odbierz
$identify = @{ rpcVersion = 1; eventSubscriptions = 0 }
if ($hello.d.authentication) {
    $secret = Sha64 ($cfg.server_password + $hello.d.authentication.salt)
    $identify.authentication = Sha64 ($secret + $hello.d.authentication.challenge)
}
Wyslij @{ op = 1; d = $identify }
$null = Odbierz

Write-Output "Stopping Output Robert..."
Wyslij @{ op = 6; d = @{ requestType = "TriggerHotkeyByName"; requestId = "stop_robert"; requestData = @{ hotkeyName = "AitumStreamSuiteStopOutputRobert" } } }
$res1 = Odbierz
Write-Output "Stop: $($res1.d.requestStatus.result)"

Start-Sleep -Seconds 3

Write-Output "Starting Output Robert..."
Wyslij @{ op = 6; d = @{ requestType = "TriggerHotkeyByName"; requestId = "start_robert"; requestData = @{ hotkeyName = "AitumStreamSuiteStartOutputRobert" } } }
$res2 = Odbierz
Write-Output "Start: $($res2.d.requestStatus.result)"

$ws.CloseAsync([Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "", $ct).Wait()
