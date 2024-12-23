import warnings
from hezar.models import Model
import sys
import base64
import requests
from PIL import Image
from io import BytesIO

warnings.filterwarnings("ignore", category=FutureWarning, module="hezar.models.model")

def load_image(input_type, input_data):
    if input_type == "url":
        response = requests.get(input_data)
        image = Image.open(BytesIO(response.content))
    elif input_type == "base64":
        image_data = base64.b64decode(input_data)
        image = Image.open(BytesIO(image_data))
    else:
        raise ValueError("Invalid input type. Must be 'url' or 'base64'.")
    return image

def main():
    input_type = sys.argv[1]
    input_data = sys.argv[2]
    
    model = Model.load("hezarai/crnn-fa-printed-96-long")
    image = load_image(input_type, input_data)
    texts = model.predict(image)
    print(texts)

if __name__ == "__main__":
    main()