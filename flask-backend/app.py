from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
import os
import pandas as pd
import pickle

load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Set up the file upload directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
# print(NVIDIA_API_KEY)

# NVIDIA client
client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = NVIDIA_API_KEY
)

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
            top_3_customers = top_3_at_risk.to_dict(orient="records")

            prediction_results = {
                "predictions": data[["Prediction", "Prediction_Probability"]].to_dict(orient="records"),
                "churn_rate": churn_rate,
                "subscription_plan_distribution": subscription_plan_distribution,
                "top_3_customers_at_risk": top_3_customers
            }

            insight_results = get_insights(prediction_results)

            result = {
                "prediction_results": prediction_results,
                "insight_results": insight_results
            }

            return jsonify(result), 200
        except Exception as e:
            print(e)
            return jsonify({'message': f"Error during prediction: {e}"}), 500
    else:
        return jsonify({'message': 'Invalid file type'}), 400


# Function for getting insights
def get_insights(prediction):

    churn_rate = prediction["churn_rate"]
    subscription_plan_distribution = prediction["subscription_plan_distribution"]
    top_3_customers_at_risk = prediction["top_3_customers_at_risk"]

    # Extract details for the top 3 customers at risk
    customer_details = []
    for i, customer in enumerate(top_3_customers_at_risk, start=1):
        customer_details.append({
            f"customer_id_{i}": customer.get("customer_id", "N/A"),
            f"churn_probability_{i}": round(customer.get("Prediction_Probability", 0) * 100, 2),
            f"plan_{i}": customer.get("subscription_plan", "N/A"),
            f"tenure_{i}": customer.get("tenure_months", "N/A"),
            f"avg_session_duration_{i}": customer.get("avg_session_duration", "N/A"),
            f"login_frequency_{i}": customer.get("login_frequency", "N/A"),
            f"feature_usage_percentage_{i}": customer.get("feature_usage_percentage", "N/A"),
            f"contract_type_{i}": customer.get("contract_type", "N/A"),
            f"billing_frequency_{i}": customer.get("billing_frequency", "N/A"),
            f"is_auto_renew_{i}": customer.get("is_auto_renew", "N/A"),
            f"num_support_tickets_{i}": customer.get("num_support_tickets", "N/A")
        })

    # print(customer_details)

    # Flatten customer details into the prompt
    insightsPrompt = f"""You are an expert business analyst specializing in SaaS analytics. Given the following subscription data, generate detailed business insights along with actionable recommendations to help improve retention, optimize subscription plans, and reduce churn.

        ### Data Summary:
        - **Churn Rate**: {str(churn_rate)}%
        - **Subscription Plan Distribution**: {str(subscription_plan_distribution)}
        - **Top 3 Customers at Risk**:
        1. **Customer ID**: {str(customer_details[0]['customer_id_1'])} | **Churn Probability**: {str(customer_details[0]['churn_probability_1'])}% | **Plan**: {str(customer_details[0]['plan_1'])} | **Tenure**: {str(customer_details[0]['tenure_1'])} months | **Avg Session Duration**: {str(customer_details[0]['avg_session_duration_1'])} mins | **Login Frequency**: {str(customer_details[0]['login_frequency_1'])} times/week | **Feature Usage**: {str(customer_details[0]['feature_usage_percentage_1'])}% | **Contract Type**: {str(customer_details[0]['contract_type_1'])} | **Billing Frequency**: {str(customer_details[0]['billing_frequency_1'])} | **Auto Renew**: {str(customer_details[0]['is_auto_renew_1'])} | **Support Tickets**: {str(customer_details[0]['num_support_tickets_1'])}
        2. **Customer ID**: {str(customer_details[1]['customer_id_2'])} | **Churn Probability**: {str(customer_details[1]['churn_probability_2'])}% | **Plan**: {str(customer_details[1]['plan_2'])} | **Tenure**: {str(customer_details[1]['tenure_2'])} months | **Avg Session Duration**: {str(customer_details[1]['avg_session_duration_2'])} mins | **Login Frequency**: {str(customer_details[1]['login_frequency_2'])} times/week | **Feature Usage**: {str(customer_details[1]['feature_usage_percentage_2'])}% | **Contract Type**: {str(customer_details[1]['contract_type_2'])} | **Billing Frequency**: {str(customer_details[1]['billing_frequency_2'])} | **Auto Renew**: {str(customer_details[1]['is_auto_renew_2'])} | **Support Tickets**: {str(customer_details[1]['num_support_tickets_2'])}
        3. **Customer ID**: {str(customer_details[2]['customer_id_3'])} | **Churn Probability**: {str(customer_details[2]['churn_probability_3'])}% | **Plan**: {str(customer_details[2]['plan_3'])} | **Tenure**: {str(customer_details[2]['tenure_3'])} months | **Avg Session Duration**: {str(customer_details[2]['avg_session_duration_3'])} mins | **Login Frequency**: {str(customer_details[2]['login_frequency_3'])} times/week | **Feature Usage**: {str(customer_details[2]['feature_usage_percentage_3'])}% | **Contract Type**: {str(customer_details[2]['contract_type_3'])} | **Billing Frequency**: {str(customer_details[2]['billing_frequency_3'])} | **Auto Renew**: {str(customer_details[2]['is_auto_renew_3'])} | **Support Tickets**: {str(customer_details[2]['num_support_tickets_3'])}

        ### **Output Requirements:**
        1. Overview Summary: Provide a 2-3 sentence overview of the business health based on churn rate, subscription distribution, and top-risk customers.
        2. Insights for Each Metric:
        - Churn Rate: Explain why the churn rate might be high or low and identify potential contributing factors.
        - Subscription Plan Distribution: Highlight which plans perform well or poorly and suggest ways to optimize each tier.
        - Top 3 Customers at Risk: Analyze why each top-risk customer is likely to churn, identifying behavioral or engagement patterns.
        3. Business Recommendations:
        - Provide 3 actionable recommendations to improve retention, optimize plan performance, and engage high-risk customers.
        - Suggest strategies for loyalty programs, re-engagement campaigns, or feature improvements.

        ### Example Output Structure:
        {{
        "overview": "Summarize the key business health indicators in 2-3 sentences.",
        "churn_rate_insights": ["Insight 1", "Insight 2", "Insight 3"],
        "plan_distribution_insights": ["Insight 1", "Insight 2", "Insight 3"],
        "top_customers_at_risk_insights": ["Insight 1", "Insight 2", "Insight 3"],
        "business_recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
        }}
    """

    completion = client.chat.completions.create(
        model="nvidia/llama-3.1-nemotron-70b-instruct",
        messages=[{"role":"user","content":insightsPrompt}],
        temperature=0.8,
        top_p=0.8,
        max_tokens=1024,
        stream=True
    )

    result = ""
    for chunk in completion:
        if chunk.choices[0].delta.content:
            result += chunk.choices[0].delta.content

    # print()
    # print(result)

    return result


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5001)
