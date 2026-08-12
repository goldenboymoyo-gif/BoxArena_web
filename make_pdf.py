import os
import requests
from PIL import Image

# Curated high-resolution images featuring only a single boxer
solo_boxer_urls = [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed",  # Solo boxer wrapping hands
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd",  # Solo boxer stance
    "https://images.unsplash.com/photo-1509563800182-12a8e5368079",  # Solo boxer training
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff",  # Solo heavy bag workout
    "https://images.unsplash.com/photo-1517438322307-e67111335449",  # Solo boxer portrait
    "https://images.unsplash.com/photo-1544033527-b192daee1f5b",  # Solo ring stance
]

downloaded_images = []

print("Downloading solo boxer images...")
for idx, url in enumerate(solo_boxer_urls, start=1):
    response = requests.get(url, stream=True, timeout=30)
    if response.status_code == 200:
        filename = f"boxer_temp_{idx}.jpg"
        with open(filename, "wb") as f:
            f.write(response.content)

        # Convert image to RGB format for PDF compatibility
        img = Image.open(filename).convert("RGB")
        downloaded_images.append((filename, img))
        print(f"  [{idx}] Downloaded: {url} ({len(response.content)} bytes)")
    else:
        print(f"  [{idx}] FAILED ({response.status_code}): {url}")

# Compile into a single PDF
if downloaded_images:
    pdf_filename = "Solo_Boxers_Collection.pdf"
    image_list = [img for _, img in downloaded_images]

    # Save the first image as the PDF root and append the rest
    image_list[0].save(
        pdf_filename,
        save_all=True,
        append_images=image_list[1:],
    )
    print(f"Success! PDF generated: {pdf_filename}")

    # Clean up temporary image files
    for filename, img in downloaded_images:
        img.close()
        if os.path.exists(filename):
            os.remove(filename)
else:
    print("No images downloaded — no PDF created.")
