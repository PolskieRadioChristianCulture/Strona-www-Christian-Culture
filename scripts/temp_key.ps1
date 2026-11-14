
    $profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8
            if ($raw.Length -gt 0 -and $raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }
            $j = $raw | ConvertFrom-Json
            $found = $false
            foreach ($out in $j.outputs) {
                if ($out.name -eq "Biblia Audio") {
                    $out.stream_key = "wf6b-91hh-e6jt-ga17-41yh"
                    if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                        $out.video_encoders[0].stream_key = "wf6b-91hh-e6jt-ga17-41yh"
                    }
                    $found = $true
                }
            }
            if ($found) { $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8 }
        }
    }
    Write-Output "Updated Biblia Audio"
  