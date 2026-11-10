
    $profilesDir = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8
            if ($raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }
            $j = $raw | ConvertFrom-Json
            $found = $false
            foreach ($out in $j.outputs) {
                if ($out.name -eq "RCC TV24") {
                    $out.stream_key = "xm8c-ryw0-yut2-gger-fugv"
                    if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                        $out.video_encoders[0].stream_key = "xm8c-ryw0-yut2-gger-fugv"
                    }
                    $found = $true
                }
            }
            if ($found) { $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8 }
        }
    }
    Write-Output "Updated RCC TV24"
  