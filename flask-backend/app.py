from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import pandas as pd
import pickle

# Initialize Flask app
app = Flask(__name__)

# Set up the file upload directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the trained model and encoders
try:
    with open('model/churn_model.pkl', 'rb') as f:
        model_data = pickle.load(f)
    model = model_data['model']
    
    with open('model/encoders.pkl', 'rb') as f:
        encoders = pickle.load(f)
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
    return jsonify({'message': 'Welcome to the Prediction Microservice'}), 200


# Prediction route
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

        # Read the uploaded file
        try:
            if filename.endswith('.csv'):
                data = pd.read_csv(file_path)
            else:
                data = pd.read_excel(file_path)
        except Exception as e:
            return jsonify({'message': f"Error reading file: {e}"}), 400

        # # Check if all required columns are present
        # required_columns = ['Subscription_Plan', 'column1', 'column2', 'column3']  # Replace with actual column names required for your model
        # missing_columns = [col for col in required_columns if col not in data.columns]
        # if missing_columns:
        #     return jsonify({'message': f"Missing required columns: {', '.join(missing_columns)}"}), 400

        # Calculate subscription plan distribution
        subscription_plan_distribution = data['subscription_plan'].value_counts().to_dict()

        # Process the file (encoding and predictions)
        try:
            for column, encoder in encoders.items():
                if column in data.columns:
                    data[column] = encoder.transform(data[column])

            # Make predictions
            predictions = model.predict(data)
            pred_probs = model.predict_proba(data)

            # Add predictions and probabilities to the data
            data["Prediction"] = ["Churn" if pred == 1 else "No Churn" for pred in predictions]
            data["Prediction_Probability"] = [prob[1] for prob in pred_probs]  # Assuming [1] is for "Churn"

            # Calculate the churn rate
            churn_count = (data["Prediction"] == "Churn").sum()
            total_count = len(data)
            churn_rate = (churn_count / total_count) * 100

            # Get the top 5 users at risk of churning
            top_3_at_risk = data[data["Prediction"] == "Churn"].sort_values(by="Prediction_Probability", ascending=False).head(3)

            # Prepare the results to return
            top_3_customers = top_3_at_risk[["customer_id", "Prediction_Probability"]].to_dict(orient="records")  # Replace "User_ID" with your actual column for user identifier

            results = {
                "predictions": data[["Prediction", "Prediction_Probability"]].to_dict(orient="records"),
                "churn_rate": churn_rate,
                "subscription_plan_distribution": subscription_plan_distribution,
                "top_3_customers_at_risk": top_3_customers
            }

            return jsonify(results), 200
        except Exception as e:
            return jsonify({'message': f"Error during prediction: {e}"}), 500
    else:
        return jsonify({'message': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
