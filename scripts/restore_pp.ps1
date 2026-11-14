$profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
$updates = @{
    "Personality Plus" = "9dve-bpam-3rzc-ufuy-28rk"
}

foreach ($dir in Get-ChildItem $profilesDir -Directory) {
    $p = Join-Path $dir.FullName "aitum.json"
    if (-not (Test-Path $p)) { continue }
    $raw = Get-Content $p -Raw -Encoding UTF8
    if ($raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }
    $j = $raw | ConvertFrom-Json
    $modified = $false

    foreach ($out in $j.outputs) {
        if ($updates.ContainsKey($out.name)) {
            $newKey = $updates[$out.name]
            $out.stream_key = $newKey
            if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                $out.video_encoders[0].stream_key = $newKey
            }
            $modified = $true
            Write-Output "Restored $($out.name) in $($dir.Name) to $newKey"
        }
    }

    if ($modified) {
        $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
    }
}
