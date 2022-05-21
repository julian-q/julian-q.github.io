import os
from PIL import Image

i = -1

new_images = []

for file in os.listdir():
    if file[0].isnumeric():
        if int(file[0]) > i:
            i = int(file[0])
    elif file.startswith('IMG'):
        new_images.append(file)

i += 1

for image in new_images:
    with Image.open(image) as im:
        width, height = im.size
        ratio = width / height
        im_small = im.resize((800, int(800 / ratio)))
        im_small.save(f'{i}_small.jpg')
        im.save(f'{i}.JPG')
        os.remove(image)
        i += 1
