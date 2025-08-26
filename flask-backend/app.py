from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import pandas as pd
import pickle
import json
import boto3
from botocore.exceptions import ClientError

# Initialize Flask app
app = Flask(__name__)

# Set up the file upload directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize Bedrock client (uses AWS CLI credentials automatically)
try:
    bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    print("✅ Bedrock client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Bedrock client: {e}")
    bedrock_runtime = None

# Load the trained model and encoders
try:
    with open('model/churn_model.pkl', 'rb') as f:
        model_data = pickle.load(f)
    model = model_data['model']
    
    with open('model/encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)
    print("✅ ML models loaded successfully")
except Exception as e:
    print(f"❌ Error loading model or encoders: {e}")
    model = None
    encoders = {}

# Ensure the uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the SaaS Analytics Prediction Service'}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            # Read the uploaded file
            if filename.endswith('.csv'):
                data = pd.read_csv(file_path)
            else:
                data = pd.read_excel(file_path)

            print(f"📊 File processed: {len(data)} records")

            # Calculate subscription plan distribution
            subscription_plan_distribution = data['subscription_plan'].value_counts().to_dict()

            # Process the file (encoding and predictions)
            original_data = data.copy()  # Keep original for response
            
            for column, encoder in encoders.items():
                if column in data.columns:
                    data[column] = encoder.transform(data[column])

            # Make predictions
            predictions = model.predict(data)
            pred_probs = model.predict_proba(data)

            # Add predictions and probabilities to original data
            original_data["Prediction"] = ["Churn" if pred == 1 else "No Churn" for pred in predictions]
            original_data["Prediction_Probability"] = [prob[1] for prob in pred_probs]

            # Calculate the churn rate
            churn_count = (original_data["Prediction"] == "Churn").sum()
            total_count = len(original_data)
            churn_rate = (churn_count / total_count) * 100

            # Get the top 3 users at risk of churning
            top_3_at_risk = original_data[original_data["Prediction"] == "Churn"].sort_values(
                by="Prediction_Probability", ascending=False
            ).head(3)
            
            top_3_customers = top_3_at_risk.to_dict(orient="records")

            prediction_results = {
                "predictions": original_data[["Prediction", "Prediction_Probability"]].to_dict(orient="records"),
                "churn_rate": round(churn_rate, 2),
                "subscription_plan_distribution": subscription_plan_distribution,
                "top_3_customers_at_risk": top_3_customers
            }

            print(f"🎯 Churn rate calculated: {churn_rate:.1f}%")
            print(f"⚠️  High-risk customers: {len(top_3_customers)}")

            # Get insights using Bedrock
            insight_results = get_insights_bedrock(prediction_results)

            result = {
                "prediction_results": prediction_results,
                "insight_results": insight_results
