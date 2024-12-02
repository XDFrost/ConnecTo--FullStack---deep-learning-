from flask import Flask, request, jsonify
from PIL import Image
from transformers import pipeline
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)

CORS(app)
 
# Load the NSFW classification model
classifier = pipeline("image-classification", model="Falconsai/nsfw_image_detection")

@app.route('/api/models/classifyNSFW', methods=['POST'])
def classify_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    try:
        # Open the image directly from the file stream
        img = Image.open(BytesIO(file.read()))
        res = classifier(img)
        return jsonify({'result': res})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=9000, debug = True)
