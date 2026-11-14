$profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
$updates = @{
    "CC TV" = "rzeb-442c-078a-pvv1-7d9j"
    "RCC" = "x09v-7a9a-8buh-xt76-azu2"
    "Personality Plus" = "x5xh-8g1y-ethh-g0mz-audj"
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
            Write-Output "Updated $($out.name) in $($dir.Name) to $newKey"
        }
    }

    if ($modified) {
        $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
    }
}
