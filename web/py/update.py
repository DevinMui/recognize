import cv2
from PIL import Image
import numpy as np
import os
import sys

cascadePath = "face.xml"
faceCascade = cv2.CascadeClassifier(cascadePath)
recognizer = cv2.createLBPHFaceRecognizer()

try:
	recognizer.load("recognize.xml")
except:
	print "No recognizer found"

image_paths = sys.argv[1] # grabs arrays as an argument

image_paths = image_paths.split(',')
images = []
labels = []
try:
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

except:
	sys.stderr.write("Oh no! One of your files isn't an image!")