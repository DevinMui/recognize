import cv2, os
import numpy as np
from PIL import Image
import requests
import json
import sys

cascadePath = "face.xml"
faceCascade = cv2.CascadeClassifier(cascadePath)
picture = sys.argv[1]

recognizer = cv2.createLBPHFaceRecognizer()

recognizer.load("recognize.xml")
try:
	image_pil = Image.open(picture).convert('L')
	image = np.array(image_pil, 'uint8')
	faces = faceCascade.detectMultiScale(image)

	nbr = ""

	if(len(faces) > 0):
		for(x,y,w,h) in faces:
			nbr, confidence = recognizer.predict(image[y: y + h, x: x + w])
			nbr = "public/pictures/" + str(nbr) + ".jpg"
			break

		sys.stdout.write(nbr)
	else:
		sys.stderr.write("No faces detected")
except:
	sys.stderr.write("Oh no! That's not an image file!")