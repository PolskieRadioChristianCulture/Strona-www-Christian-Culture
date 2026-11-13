from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

WORK_DIR = r"C:\Users\czark\.gemini\antigravity\brain\5c857e63-5f72-41d2-9880-a3b68b0a0163"
COVER_JPG = r"C:\Users\czark\Desktop\Apokalipsa_Odc_32_Okladka_Spotify.jpg"

def create_spotify_cover():
    bg_frame = os.path.join(WORK_DIR, "frame_end_55m15.jpg")
    img_bg = Image.open(bg_frame).convert("RGB")
    
    w_t, h_t = 1400, 1400
    w_orig, h_orig = img_bg.size
    
    # Crop to 1:1 square centered
    new_w = h_orig
    offset_x = (w_orig - new_w) // 2
    img_cropped = img_bg.crop((offset_x, 0, offset_x + new_w, h_orig))
    img_canvas = img_cropped.resize((w_t, h_t), Image.Resampling.LANCZOS)
    
    # We want to keep the upper half with the rising sun and "Apokalipsa: Księga Nadziei"
    # In 1400x1400:
    # "Apokalipsa: Księga Nadziei" is located around y = 600 to 760.
    # "Oglądaj kolejny odcinek." is around y = 780 to 830.
    
    # Create dark gradient overlay on the lower half to cover "Oglądaj kolejny odcinek" and give contrast
    overlay = Image.new("RGBA", (w_t, h_t), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    
    # Top subtle gradient
    for y in range(200):
        alpha = int(140 * (1.0 - y / 200.0))
        draw_ov.line([(0, y), (w_t, y)], fill=(5, 8, 15, alpha))
        
    # Lower gradient starting from y=760 to hide "Oglądaj kolejny odcinek"
    for y in range(760, 1400):
        progress = (y - 760) / (1400 - 760)
        alpha = int(245 * (progress ** 0.8))
        draw_ov.line([(0, y), (w_t, y)], fill=(8, 10, 18, alpha))
        
    img_canvas = Image.alpha_composite(img_canvas.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img_canvas)
    
    # Load fonts
    font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 34)
    font_ep_pill = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 40)
    font_title = ImageFont.truetype(r"C:\Windows\Fonts\georgiab.ttf", 72)
    font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
    font_spk = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 36)
    font_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 30)
    
    # Top Header: STUDIO DOBREGO SŁOWA • CHRISTIAN CULTURE
    top_text = "STUDIO DOBREGO SŁOWA   •   CHRISTIAN CULTURE"
    bbox_top = draw.textbbox((0, 0), top_text, font=font_badge)
    w_top = bbox_top[2] - bbox_top[0]
    draw.text(((w_t - w_top) // 2, 60), top_text, fill=(212, 181, 120), font=font_badge)
    
    # Episode number pill (Orange #FF7A00): ODCINEK 32
    ep_text = "ODCINEK 32"
    bbox_ep = draw.textbbox((0, 0), ep_text, font=font_ep_pill)
    w_ep = bbox_ep[2] - bbox_ep[0]
    pad_x, pad_y = 35, 12
    x_pill = (w_t - w_ep) // 2
    y_pill = 820
    draw.rounded_rectangle([x_pill - pad_x, y_pill - pad_y, x_pill + w_ep + pad_x, y_pill + 40 + pad_y], radius=16, fill=(255, 122, 0))
    draw.text((x_pill, y_pill), ep_text, fill=(255, 255, 255), font=font_ep_pill)
    
    # Golden separator
    draw.line([(400, 915), (1000, 915)], fill=(196, 163, 90), width=2)
    
    # Title: Upadek globalnego systemu
    title_text = "Upadek globalnego systemu"
    bbox_title = draw.textbbox((0, 0), title_text, font=font_title)
    w_title = bbox_title[2] - bbox_title[0]
    draw.text(((w_t - w_title) // 2, 950), title_text, fill=(255, 255, 255), font=font_title)
    
    # Subtitle: Wykład biblijny: Apokalipsa 17 i 18
    sub_text = "Wykład biblijny: Apokalipsa 17 i 18"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    w_sub = bbox_sub[2] - bbox_sub[0]
    draw.text(((w_t - w_sub) // 2, 1060), sub_text, fill=(226, 204, 154), font=font_sub)
    
    # Speakers: Wincenty Sieja • Mariusz Adamczyk
    speakers_text = "Wykładowca: Wincenty Sieja   |   Prowadzący: Mariusz Adamczyk"
    bbox_spk = draw.textbbox((0, 0), speakers_text, font=font_spk)
    w_spk = bbox_spk[2] - bbox_spk[0]
    draw.text(((w_t - w_spk) // 2, 1150), speakers_text, fill=(210, 220, 235), font=font_spk)
    
    # Bottom brand footer: polskieradio.cc
    bot_text = "OFICJALNY PODCAST CHRISTIAN CULTURE  •  polskieradio.cc"
    bbox_bot = draw.textbbox((0, 0), bot_text, font=font_brand)
    w_bot = bbox_bot[2] - bbox_bot[0]
    draw.text(((w_t - w_bot) // 2, 1290), bot_text, fill=(180, 150, 95), font=font_brand)
    
    # Premium Gold border
    draw.rectangle([0, 0, w_t - 1, h_t - 1], outline=(196, 163, 90), width=8)
    
    img_canvas.save(COVER_JPG, quality=95)
    print("Cover updated successfully!")

if __name__ == "__main__":
    create_spotify_cover()
