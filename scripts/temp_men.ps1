
    $profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
            $found = $false
            foreach ($out in $raw.outputs) {
                if ($out.name -eq "CC MEN") {
                    $out.stream_key = "u6k4-d01e-y7rp-e9sm-fssv"
                    $found = $true
                }
            }
            if ($found) {
                $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
            }
        }
    }
    Write-Output "Updated CC MEN key."
  