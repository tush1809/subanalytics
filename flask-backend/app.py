from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from datetime import datetime
import os
import pandas as pd
import pickle
import json
import boto3
import requests

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Set up the file upload directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# API Keys from environment
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# AWS Bedrock configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

# Initialize Bedrock client
try:
    bedrock_runtime = boto3.client(
        'bedrock-runtime',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_DEFAULT_REGION
    )
    print("Bedrock client initialized successfully")
except Exception as e:
    print(f"Error initializing Bedrock client: {e}")
    bedrock_runtime = None

# Hugging Face configuration
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"

# Load the trained model and encoders
try:
    with open('model/churn_model.pkl', 'rb') as f:
        model_data = pickle.load(f)
    model = model_data['model']
    
    with open('model/encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)
    print("ML models loaded successfully")
except Exception as e:
    print(f"Error loading model or encoders: {e}")
    model = None
    encoders = {}

# Ensure the uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Check allowed file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Home "/" route
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Prediction
