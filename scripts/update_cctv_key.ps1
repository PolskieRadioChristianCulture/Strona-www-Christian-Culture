$profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
$profiles = Get-ChildItem $profilesDir -Directory
foreach ($dir in $profiles) {
    $p = Join-Path $dir.FullName "aitum.json"
    if (Test-Path $p) {
        Write-Output "Processing: $p"
        $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
        $found = $false
        foreach ($out in $raw.outputs) {
            if ($out.name -eq "CC TV") {
                Write-Output "  Found CC TV, old key: $($out.stream_key)"
                $out.stream_key = "bpta-dj4x-p34k-5d8y-3mqx"
                Write-Output "  New key set: $($out.stream_key)"
                $found = $true
            }
        }
        if ($found) {
            $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
            Write-Output "  Updated $p"
        }
    }
}
