#!/usr/bin/env python3
"""
CC STUDIO DAW — Spotify Podcast Production
Episode: Apokalipsa — Księga Nadziei | Odc. 32: Upadek globalnego systemu
Speakers: Wincenty Sieja & Cezary Rogowski
Target: Spotify Podcast Standard (-14.0 LUFS, True Peak <= -1.0 dBFS, MP3 320 kbps, 1400x1400 Cover Art).
"""

import os
import sys
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

VIDEO_PATH = r"C:\Users\czark\Downloads\Upadek globalnego systemu Odc  32.mp4"
DESKTOP_DIR = r"C:\Users\czark\Desktop"
WORK_DIR = r"C:\Users\czark\.gemini\antigravity\brain\5c857e63-5f72-41d2-9880-a3b68b0a0163"

COVER_JPG = os.path.join(DESKTOP_DIR, "Apokalipsa_Odc_32_Okladka_Spotify.jpg")
FINAL_MP3 = os.path.join(DESKTOP_DIR, "Apokalipsa_Odc_32_Upadek_globalnego_systemu_Spotify.mp3")

def create_spotify_cover():
    print("[1/3] Generowanie okładki Spotify 1400x1400 px...")
    # Use frame_end_55m15.jpg as background
    bg_frame = os.path.join(WORK_DIR, "frame_end_55m15.jpg")
    img_bg = Image.open(bg_frame).convert("RGB")
    
    # Target 1400x1400
    w_t, h_t = 1400, 1400
    
    # Crop and fit to fill 1400x1400
    aspect_target = 1.0
    w_orig, h_orig = img_bg.size
    aspect_orig = w_orig / h_orig
    
    # We crop height-centered or width-centered
    if aspect_orig > aspect_target:
        new_w = int(h_orig * aspect_target)
        offset_x = (w_orig - new_w) // 2
        img_cropped = img_bg.crop((offset_x, 0, offset_x + new_w, h_orig))
    else:
        new_h = int(w_orig / aspect_target)
        offset_y = (h_orig - new_h) // 2
        img_cropped = img_bg.crop((0, offset_y, w_orig, offset_y + new_h))
        
    img_canvas = img_cropped.resize((w_t, h_t), Image.Resampling.LANCZOS)
    
    # Create dark gradient overlays on bottom and top for maximum contrast
    overlay = Image.new("RGBA", (w_t, h_t), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    
    # Top gradient
    for y in range(250):
        alpha = int(180 * (1.0 - y / 250.0))
        draw_ov.line([(0, y), (w_t, y)], fill=(5, 8, 15, alpha))
        
    # Bottom gradient
    for y in range(700, 1400):
        alpha = int(230 * ((y - 700) / 700.0))
        draw_ov.line([(0, y), (w_t, y)], fill=(5, 8, 15, alpha))
        
    img_canvas = Image.alpha_composite(img_canvas.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img_canvas)
    
    # Load fonts
    font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
    font_ep = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 46)
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\georgiab.ttf", 68)
    font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 38)
    font_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 32)
    
    # Top Badge: STUDIO DOBREGO SŁOWA • CHRISTIAN CULTURE
    top_text = "STUDIO DOBREGO SŁOWA  •  CHRISTIAN CULTURE"
    bbox_top = draw.textbbox((0, 0), top_text, font=font_badge)
    w_top = bbox_top[2] - bbox_top[0]
    draw.text(((w_t - w_top) // 2, 70), top_text, fill=(212, 181, 120), font=font_badge)
    
    # Series Name: APOKALIPSA: KSIĘGA NADZIEI
    series_text = "APOKALIPSA: KSIĘGA NADZIEI"
    bbox_ser = draw.textbbox((0, 0), series_text, font=font_ep)
    w_ser = bbox_ser[2] - bbox_ser[0]
    draw.text(((w_t - w_ser) // 2, 860), series_text, fill=(255, 215, 0), font=font_ep)
    
    # Golden separator line
    draw.line([(350, 930), (1050, 930)], fill=(196, 163, 90), width=3)
    
    # Episode number badge: ODCINEK 32
    ep_text = "ODCINEK 32"
    bbox_ep = draw.textbbox((0, 0), ep_text, font=font_badge)
    w_ep = bbox_ep[2] - bbox_ep[0]
    # Pill background
    pad_x, pad_y = 30, 10
    x_pill = (w_t - w_ep) // 2
    draw.rounded_rectangle([x_pill - pad_x, 960 - pad_y, x_pill + w_ep + pad_x, 960 + 40 + pad_y], radius=15, fill=(255, 122, 0))
    draw.text((x_pill, 960), ep_text, fill=(255, 255, 255), font=font_badge)
    
    # Title: UPADEK GLOBALNEGO SYSTEMU
    title_text = "Upadek globalnego systemu"
    bbox_title = draw.textbbox((0, 0), title_text, font=font_title)
    w_title = bbox_title[2] - bbox_title[0]
    draw.text(((w_t - w_title) // 2, 1050), title_text, fill=(255, 255, 255), font=font_title)
    
    # Subtitle: Apokalipsa 17 i 18
    sub_text = "Wykład biblijny: Apokalipsa 17 i 18"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    draw.text(((w_t - w_sub) // 2, 1145), sub_text, fill=(226, 204, 154), font=font_sub)
    
    # Speakers: Wincenty Sieja • Cezary Rogowski
    speakers_text = "Wincenty Sieja  •  Cezary Rogowski"
    bbox_spk = draw.textbbox((0, 0), speakers_text, font=font_brand)
    w_spk = bbox_spk[2] - bbox_spk[0]
    draw.text(((w_t - w_spk) // 2, 1230), speakers_text, fill=(200, 210, 230), font=font_brand)
    
    # Gold border
    draw.rectangle([0, 0, w_t - 1, h_t - 1], outline=(196, 163, 90), width=6)
    
    img_canvas.save(COVER_JPG, quality=95)
    print(f"  -> Okładka zapisana: {COVER_JPG}")
    return COVER_JPG

def master_audio():
    print("\n[2/3] Mastering audio do standardu Spotify (-14.0 LUFS, True Peak <= -1.0 dBFS)...")
    
    # Pass 1 measured metrics for input video:
    # I = -20.8 LUFS, TP = -2.0 dBFS, LRA = 6.7 LU, thresh = -31.6 LUFS
    # We configure EBU R128 linear normalization with vocal cleanup filter:
    
    audio_filter = (
        "highpass=f=75:p=2,"
        "equalizer=f=280:t=q:w=2.0:g=-1.5,"
        "equalizer=f=3200:t=q:w=1.2:g=1.5,"
        "equalizer=f=11000:t=h:g=0.8,"
        "loudnorm=I=-14.0:TP=-1.0:LRA=7:measured_I=-20.8:measured_TP=-2.0:measured_LRA=6.7:measured_thresh=-31.6:offset=0.2:linear=true"
    )
    
    temp_wav = os.path.join(WORK_DIR, "spotify_mastered_audio.wav")
    
    cmd_render = [
        'ffmpeg', '-y', '-i', VIDEO_PATH,
        '-vn',
        '-af', audio_filter,
        '-c:a', 'pcm_s16le',
        '-ar', '44100',
        '-ac', '2',
        temp_wav
    ]
    
    print("  Renderowanie toru audio (filtracja + loudness normalization)...")
    subprocess.run(cmd_render, check=True)
    print(f"  -> Wyrenderowano nieskompresowany master WAV: {temp_wav}")
    
    print("\n[3/3] Enkodowanie MP3 320 kbps i osadzanie metadanych ID3v2 + Okładki...")
    
    cmd_mp3 = [
        'ffmpeg', '-y',
        '-i', temp_wav,
        '-i', COVER_JPG,
        '-map', '0:a',
        '-map', '1:v',
        '-c:a', 'libmp3lame',
        '-b:a', '320k',
        '-c:v', 'copy',
        '-id3v2_version', '3',
        '-metadata:s:v', 'title=Album cover',
        '-metadata:s:v', 'comment=Cover (front)',
        '-metadata', 'title=Apokalipsa Odc. 32 — Upadek globalnego systemu',
        '-metadata', 'artist=Wincenty Sieja, Cezary Rogowski',
        '-metadata', 'album_artist=Studio Dobrego Słowa / Christian Culture',
        '-metadata', 'album=Apokalipsa — Księga Nadziei',
        '-metadata', 'track=32',
        '-metadata', 'date=2026',
        '-metadata', 'genre=Podcast',
        '-metadata', 'publisher=Christian Culture / Studio Dobrego Słowa',
        '-metadata', 'comment=Wykład biblijny: Apokalipsa 17 i 18. Prowadzą Wincenty Sieja i Cezary Rogowski. https://polskieradio.cc',
        FINAL_MP3
    ]
    subprocess.run(cmd_mp3, check=True)
    print(f"  -> Gotowy plik emisyjny MP3: {FINAL_MP3}")
    
    # Cleanup temp wav
    if os.path.exists(temp_wav):
        os.remove(temp_wav)

if __name__ == "__main__":
    create_spotify_cover()
    master_audio()
    print("\n✅ PRODUKCJA SPOTIFY ZAKOŃCZONA SUKCESEM!")
