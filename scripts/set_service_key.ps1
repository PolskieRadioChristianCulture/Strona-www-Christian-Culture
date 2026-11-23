$p = "C:\Users\nazir\AppData\Roaming\obs-studio\basic\profiles\Bez_tytułu\service.json"
$j = @{
    type = "rtmp_custom"
    settings = @{
        server = "rtmp://a.rtmp.youtube.com/live2"
        key = "bpta-dj4x-p34k-5d8y-3mqx"
        use_auth = $false
        bwtest = $false
    }
}
$j | ConvertTo-Json | Set-Content -Path $p -Encoding UTF8
Write-Output "service.json updated successfully!"
