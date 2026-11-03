#!/usr/bin/env python3
"""
CC STUDIO DAW — Radio Promo Mixer for #TOPTEN (polskieradio.cc/topTEN)
Voiced with Google AI Studio (Gemini 3.8 Flash TTS)
Mastered to EBU R128 (-16.0 LUFS, True Peak <= -1.0 dBFS, 48 kHz 24-bit PCM Broadcast Master).
"""

import os
import sys
import math
import subprocess
import wave
import numpy as np

INTRO_PATH = r"C:\Users\czark\Downloads\Top Ten – Your hit list on Christian Culture.wav"
OUTRO_PATH = r"C:\Users\czark\Downloads\Top Ten – Your hit list on Christian Culture (1).wav"

VO_DIR = r"C:\Users\czark\Desktop\@ICC\storage\topten_gemini_tts"
DESKTOP_DIR = r"C:\Users\czark\Desktop"

def load_wav(path):
    with wave.open(path, 'rb') as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        frames = w.getnframes()
        data = np.frombuffer(w.readframes(frames), dtype=np.int16).astype(np.float32) / 32768.0
        if ch == 2:
            data = data.reshape(-1, 2)
        else:
            data = np.column_stack([data, data])
    return sr, data

def save_wav_float(path, data, sr=48000):
    data = np.clip(data, -1.0, 1.0)
    data_int16 = (data * 32767.0).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data_int16.tobytes())

def process_vocal_track(input_wav, processed_vocal_wav, sr=48000):
    """
    Upsamples Google AI Studio 24kHz mono to 48kHz stereo and applies CC STUDIO Vocal Strip:
    - High-Pass 80Hz (24dB/oct)
    - De-Mud -2.0dB at 300Hz
    - Presence +2.0dB at 3.5kHz
    - High-Shelf +1.0dB at 12kHz
    - Radio Compressor (Attack 15ms, Release 120ms, Ratio 2.2:1)
    """
    cmd = [
        'ffmpeg', '-y', '-i', input_wav,
        '-af', (
            'highpass=f=80:p=2,'
            'equalizer=f=300:t=q:w=2.0:g=-2.0,'
            'equalizer=f=3500:t=q:w=1.2:g=2.0,'
            'equalizer=f=12000:t=h:g=1.0,'
            'acompressor=threshold=-18dB:ratio=2.2:attack=15:release=120:makeup=2.5dB'
        ),
        '-ar', str(sr), '-ac', '2',
        processed_vocal_wav
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def build_music_bed_30s(intro_wav, outro_wav, sr=48000):
    """
    Builds a ~31s music bed:
    - 0.0s - 7.5s: Intro build & drop
    - 7.5s - 13.0s: Intro vocal & beat
    - 13.0s - 23.0s: Crossfade into Outro groove
    - 23.0s - 31.5s: Outro finale drop and natural reverb decay.
    """
    sr_i, intro = load_wav(intro_wav)
    sr_o, outro = load_wav(outro_wav)
    
    intro_part = intro[:int(14.0 * sr)].copy()
    outro_part = outro[int(18.0 * sr):].copy() # 10.4s
    bridge_part = outro[int(9.0 * sr):int(19.0 * sr)].copy() # 10s
    
    total_len = int(32.0 * sr)
    bed = np.zeros((total_len, 2), dtype=np.float32)
    
    fade_i = int(1.5 * sr)
    fade_curve_out = np.linspace(1.0, 0.0, fade_i)[:, None]
    fade_curve_in = np.linspace(0.0, 1.0, fade_i)[:, None]
    
    intro_part[-fade_i:] *= fade_curve_out
    bed[:len(intro_part)] += intro_part
    
    t_bridge = int(11.5 * sr)
    bridge_part[:fade_i] *= fade_curve_in
    bridge_part[-fade_i:] *= fade_curve_out
    bed[t_bridge:t_bridge + len(bridge_part)] += bridge_part
    
    t_outro = int(20.0 * sr)
    outro_part[:fade_i] *= fade_curve_in
    bed[t_outro:t_outro + len(outro_part)] += outro_part
    
    return bed

def build_music_bed_45s(intro_wav, outro_wav, sr=48000):
    """
    Builds a ~47s music bed:
    - 0.0s - 13.0s: Intro build, drop and groove
    - 13.0s - 36.0s: Outro extended rhythm groove
    - 36.0s - 47.0s: Outro finale drop and natural reverb decay.
    """
    sr_i, intro = load_wav(intro_wav)
    sr_o, outro = load_wav(outro_wav)
    
    intro_part = intro[:int(14.0 * sr)].copy()
    outro_groove = outro[int(4.0 * sr):int(18.0 * sr)].copy()
    outro_finale = outro[int(18.0 * sr):].copy()
    
    total_len = int(47.0 * sr)
    bed = np.zeros((total_len, 2), dtype=np.float32)
    
    fade_len = int(2.0 * sr)
    fade_in = np.linspace(0.0, 1.0, fade_len)[:, None]
    fade_out = np.linspace(1.0, 0.0, fade_len)[:, None]
    
    intro_part[-fade_len:] *= fade_out
    bed[:len(intro_part)] += intro_part
    
    t_groove = int(12.0 * sr)
    outro_groove[:fade_len] *= fade_in
    outro_groove[-fade_len:] *= fade_out
    bed[t_groove:t_groove + len(outro_groove)] += outro_groove
    
    t_groove2 = int(24.0 * sr)
    outro_groove2 = outro[int(5.0 * sr):int(18.0 * sr)].copy()
    outro_groove2[:fade_len] *= fade_in
    outro_groove2[-fade_len:] *= fade_out
    bed[t_groove2:t_groove2 + len(outro_groove2)] += outro_groove2
    
    t_finale = int(36.0 * sr)
    outro_finale[:fade_len] *= fade_in
    bed[t_finale:t_finale + len(outro_finale)] += outro_finale
    
    return bed

def mix_spot(music_bed, vocal_wav, vocal_start_s, output_premaster_wav, duck_db=-13.0, sr=48000):
    """
    Mixes music bed and processed vocal with smooth ducking envelope.
    """
    sr_v, vocal = load_wav(vocal_wav)
    assert sr_v == sr
    
    vocal_len = len(vocal)
    total_len = max(len(music_bed), int(vocal_start_s * sr) + vocal_len + int(4.0 * sr))
    
    if len(music_bed) < total_len:
        pad = np.zeros((total_len - len(music_bed), 2), dtype=np.float32)
        music_bed = np.vstack([music_bed, pad])
    else:
        music_bed = music_bed[:total_len].copy()
    
    duck_gain = 10.0 ** (duck_db / 20.0)
    envelope = np.ones(total_len, dtype=np.float32)
    
    t_start = int(vocal_start_s * sr)
    t_end = t_start + vocal_len
    
    attack_len = int(0.08 * sr)
    att_start = max(0, t_start - int(0.04 * sr))
    envelope[att_start:att_start + attack_len] = np.linspace(1.0, duck_gain, attack_len)
    envelope[att_start + attack_len:t_end] = duck_gain
    
    release_len = int(0.70 * sr)
    rel_end = min(total_len, t_end + release_len)
    actual_rel = rel_end - t_end
    if actual_rel > 0:
        envelope[t_end:rel_end] = np.linspace(duck_gain, 1.0, actual_rel)
    
    ducked_music = music_bed * envelope[:, None]
    mix = ducked_music.copy()
    mix[t_start:t_start + vocal_len] += vocal * 0.95
    
    save_wav_float(output_premaster_wav, mix, sr=sr)
    return output_premaster_wav

def master_ebu_r128(input_wav, output_wav, output_mp3, target_lufs=-16.0, true_peak=-1.0):
    """
    Applies EBU R128 2-pass loudness normalization and exports Broadcast WAV & 320k MP3.
    """
    import json
    pass1_cmd = [
        'ffmpeg', '-i', input_wav,
        '-af', f'loudnorm=I={target_lufs}:TP={true_peak}:LRA=7:print_format=json',
        '-f', 'null', '-'
    ]
    res = subprocess.run(pass1_cmd, stderr=subprocess.PIPE, text=True)
    lines = res.stderr.splitlines()
    json_lines = []
    capture = False
    for line in lines:
        if '{' in line:
            capture = True
        if capture:
            json_lines.append(line)
        if '}' in line and capture:
            break
    measured = json.loads('\n'.join(json_lines))
    
    loudnorm_filter = (
        f"loudnorm=I={target_lufs}:TP={true_peak}:LRA=7:"
        f"measured_I={measured['input_i']}:"
        f"measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:"
        f"measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}:linear=true"
    )
    
    cmd_wav = [
        'ffmpeg', '-y', '-i', input_wav,
        '-af', loudnorm_filter,
        '-c:a', 'pcm_s24le',
        '-ar', '48000',
        output_wav
    ]
    subprocess.run(cmd_wav, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    cmd_mp3 = [
        'ffmpeg', '-y', '-i', output_wav,
        '-c:a', 'libmp3lame',
        '-b:a', '320k',
        output_mp3
    ]
    subprocess.run(cmd_mp3, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def run_production():
    os.makedirs(DESKTOP_DIR, exist_ok=True)
    temp_dir = os.path.join(os.path.dirname(__file__), "temp_audio_google_ai")
    os.makedirs(temp_dir, exist_ok=True)
    
    print("=== CC STUDIO DAW — PRODUKCJA SPOTÓW RADIOWYCH #TOPTEN (GOOGLE AI STUDIO) ===")
    
    # 1. Process vocals from Google AI Studio
    print("\n[1/4] Przetwarzanie torów wokalnych Google AI Studio (Upsampling 48kHz + Vocal Strip)...")
    google_vo_files = [
        ("30s_Enceladus_meski_radiowy", "30s_Enceladus_meski_radiowy.wav"),
        ("30s_Puck_meski_dynamiczny", "30s_Puck_meski_dynamiczny.wav"),
        ("30s_Aoede_zenski_energetyczny", "30s_Aoede_zenski_energetyczny.wav"),
        ("30s_Fenrir_meski_mocny", "30s_Fenrir_meski_mocny.wav"),
        ("45s_Enceladus_meski_radiowy", "45s_Enceladus_meski_radiowy.wav"),
        ("45s_Puck_meski_dynamiczny", "45s_Puck_meski_dynamiczny.wav"),
        ("45s_Aoede_zenski_energetyczny", "45s_Aoede_zenski_energetyczny.wav"),
    ]
    
    processed_vos = {}
    for key, filename in google_vo_files:
        src = os.path.join(VO_DIR, filename)
        dst = os.path.join(temp_dir, f"{key}_proc.wav")
        process_vocal_track(src, dst)
        processed_vos[key] = dst
        print(f"  -> Przygotowano tor: {key}")

    # 2. Build Music Beds
    print("\n[2/4] Budowanie podkładów muzycznych (Intro -> Groove -> Outro)...")
    bed_30 = build_music_bed_30s(INTRO_PATH, OUTRO_PATH)
    bed_45 = build_music_bed_45s(INTRO_PATH, OUTRO_PATH)
    
    # 3. Mix & Master
    print("\n[3/4] Miksowanie ze zjazdem beatowym (ducking -13 dB) i mastering EBU R128 (-16 LUFS)...")
    mix_configs = [
        ("30s_Enceladus_meski_radiowy", bed_30, 7.5, "TopTEN_Reklama_Radiowa_30s_GoogleAI_Enceladus", "Wersja 30s — Google AI Enceladus (Męski Radiowy)"),
        ("30s_Puck_meski_dynamiczny", bed_30, 7.5, "TopTEN_Reklama_Radiowa_30s_GoogleAI_Puck", "Wersja 30s — Google AI Puck (Męski Dynamiczny)"),
        ("30s_Aoede_zenski_energetyczny", bed_30, 7.5, "TopTEN_Reklama_Radiowa_30s_GoogleAI_Aoede", "Wersja 30s — Google AI Aoede (Żeński Promienny)"),
        ("30s_Fenrir_meski_mocny", bed_30, 7.5, "TopTEN_Reklama_Radiowa_30s_GoogleAI_Fenrir", "Wersja 30s — Google AI Fenrir (Męski Mocny)"),
        ("45s_Enceladus_meski_radiowy", bed_45, 7.5, "TopTEN_Reklama_Radiowa_45s_GoogleAI_Enceladus", "Wersja 45s — Google AI Enceladus (Dla Artystów / Męski)"),
        ("45s_Puck_meski_dynamiczny", bed_45, 7.5, "TopTEN_Reklama_Radiowa_45s_GoogleAI_Puck", "Wersja 45s — Google AI Puck (Dla Artystów / Dynamiczny)"),
        ("45s_Aoede_zenski_energetyczny", bed_45, 7.5, "TopTEN_Reklama_Radiowa_45s_GoogleAI_Aoede", "Wersja 45s — Google AI Aoede (Dla Artystów / Żeński)"),
    ]
    
    results = []
    for vo_key, bed, start_s, base_name, desc in mix_configs:
        premaster = os.path.join(temp_dir, f"{base_name}_premaster.wav")
        mix_spot(bed, processed_vos[vo_key], start_s, premaster, duck_db=-13.0)
        
        out_wav = os.path.join(DESKTOP_DIR, f"{base_name}.wav")
        out_mp3 = os.path.join(DESKTOP_DIR, f"{base_name}.mp3")
        master_ebu_r128(premaster, out_wav, out_mp3, target_lufs=-16.0, true_peak=-1.0)
        results.append((desc, out_wav, out_mp3))
        print(f"  [OK] Wyrenderowano: {desc}")
    
    print("\n=== GOTOWE MASTER BROADCAST (GOOGLE AI STUDIO) ===")
    for desc, w, m in results:
        print(f"\n{desc}:")
        print(f"  WAV Master: {w}")
        print(f"  MP3 320k:   {m}")

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    run_production()
