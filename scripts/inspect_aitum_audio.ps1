$p = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles\Bez_tytułu\aitum.json"
if (Test-Path $p) {
    $raw = Get-Content $p -Raw -Encoding UTF8
    if ($raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }
    $j = $raw | ConvertFrom-Json
    foreach ($out in $j.outputs) {
        "OUT: $($out.name)"
        "  audio_encoder: $($out.audio_encoder)"
        "  audio_encoder_settings: $($out.audio_encoder_settings | ConvertTo-Json -Compress)"
        "  vod_track: $($out.vod_track)"
        "  stream_server: $($out.stream_server)"
    }
}
