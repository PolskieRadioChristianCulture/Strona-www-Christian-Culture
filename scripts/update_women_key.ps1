$outputName = "CC Women"
$newKey = "1q2s-78zq-pbff-0x2f-emj3"

$profilesDir = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles"
$profiles = Get-ChildItem $profilesDir -Directory
foreach ($dir in $profiles) {
    $p = Join-Path $dir.FullName "aitum.json"
    if (Test-Path $p) {
        $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
        $found = $false
        foreach ($out in $raw.outputs) {
            if ($out.name -eq $outputName) {
                Write-Output "In profile $($dir.Name): Found $outputName, old key: $($out.stream_key)"
                $out.stream_key = $newKey
                Write-Output "  New key set: $($out.stream_key)"
                $found = $true
            }
        }
        if ($found) {
            $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
        }
    }
}
Write-Output "Key update completed for $outputName."
