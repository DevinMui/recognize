import cv2
from PIL import Image
import numpy as np
import os
import sys

image_paths = sys.argv[1] # grabs arrays as an argument

images = []
labels = []
for image_path in image_paths:
	image_pil = Image.open(image_path).convert('L')
	image = np.array(image_pil, 'uint8')
	nbr = image_path
	faces = faceCascade.detectMultiScale(image)
	nbr = int(os.path.split(image_path)[1].split(".")[0])
	for (x, y, w, h) in faces:
		images.append(image[y: y + h, x: x + w])
		labels.append(nbr)

recognizer.update(images, np.array(labels))

recognizer.save('recognize.xml')