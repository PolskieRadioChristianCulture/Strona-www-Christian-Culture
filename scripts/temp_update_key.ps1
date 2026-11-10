
    $profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
            $found = $false
            foreach ($out in $raw.outputs) {
                if ($out.name -eq "Werset Dnia") {
                    $out.stream_key = "7saw-ma2m-gq38-svh0-5ku5"
                    if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                        $out.video_encoders[0].stream_key = "7saw-ma2m-gq38-svh0-5ku5"
                    }
                    $found = $true
                }
            }
            if ($found) {
                $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
            }
        }
    }
    Write-Output "Successfully updated Werset Dnia key in profiles."
  