import cv2, os
import numpy as np
from PIL import Image
import requests
import json
import sys

url = "http://localhost:3000/match"

cascadePath = "face.xml"
faceCascade = cv2.CascadeClassifier(cascadePath)
picture = sys.argv[1]

recognizer = cv2.createLBPHFaceRecognizer()

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

path = '../web/pictures'

images, labels = get_images_and_labels(path)

recognizer.train(images, np.array(labels))

image_pil = Image.open(picture).convert('L')
image = np.array(image_pil, 'uint8')
faces = faceCascade.detectMultiScale(image)
nbr = ""

recognizer.save('recognize.xml')

for(x,y,w,h) in faces:
    nbr, confidence = recognizer.predict(image[y: y + h, x: x + w])
    nbr = "pictures/" + str(nbr) + ".jpg"
    break

sys.stdout.write(nbr) # print out file for app
