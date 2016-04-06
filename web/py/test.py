import cv2
from PIL import Image
import numpy as np
import os

cascadePath = "face.xml"

picture = 'pictures/2.jpg'

faceCascade = cv2.CascadeClassifier(cascadePath)
recognizer = cv2.createLBPHFaceRecognizer()
image_pil = Image.open(picture).convert('L')
image = np.array(image_pil, 'uint8')
faces = faceCascade.detectMultiScale(image)
nbr = ""
recognizer.load('recognize.xml')

for(x,y,w,h) in faces:
		nbr, confidence = recognizer.predict(image[y: y + h, x: x + w])
		nbr = "pictures/" + str(nbr) + ".jpg"

print nbr

def get_images_and_labels(path):
		i = 0
		image_paths = [os.path.join(path, f) for f in os.listdir(path)]
		images = []
		labels = []
		for image_path in image_paths:
				image_pil = Image.open(image_path).convert('L')
				image = np.array(image_pil, 'uint8')
				nbr = image_path
				faces = faceCascade.detectMultiScale(image)
				for (x, y, w, h) in faces:
						i = i + 1
						images.append(image[y: y + h, x: x + w])
						#labels.append(nbr)
						labels.append(i)
		return images, labels

path = 'pictures/'

images, labels = get_images_and_labels(path)

recognizer.update(images, np.array(labels))

recognizer.save('recognize.xml')

print "updated"