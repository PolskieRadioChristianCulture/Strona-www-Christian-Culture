from PIL import Image

im = Image.open('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/youtube_upload_error.png')
print("Image size:", im.size)
# Zapiszmy wycinek środka ekranu (okno dialogowe)
w, h = im.size
crop_box = (w // 4, h // 4, 3 * w // 4, 3 * h // 4)
crop = im.crop(crop_box)
crop.save('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/yt_error_dialog_crop.png')
print("Cropped dialog saved.")
