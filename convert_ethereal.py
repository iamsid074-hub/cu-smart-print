from PIL import Image

input_path = "public/mobile-ethereal-v3.png"
output_path = "public/mobile-ethereal-v3.webp"

try:
    img = Image.open(input_path)
    img.save(output_path, "WEBP", quality=85)
    print(f"Successfully converted {input_path} to {output_path}")
except Exception as e:
    print(f"Error: {e}")
