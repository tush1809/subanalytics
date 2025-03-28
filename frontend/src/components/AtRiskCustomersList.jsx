// src/components/AtRiskCustomersList.jsx
import React from "react";
import './atRisk.css'; // Import the CSS file

const AtRiskCustomersList = ({ atRiskCustomers }) => {
  return (
    <div className="at-risk-customers-list">
      {atRiskCustomers && atRiskCustomers.length > 0 ? (
        <ul className="customers-list">
          {atRiskCustomers.map((customer, index) => (
            <li key={index} className="customer-item">
              <div>
                <h3 className="customer-name">Customer ID: {customer.customer_id}</h3>
                <p className="churn-probability">
                  Churn Probability: {(customer.Prediction_Probability * 100).toFixed(2)}%
                </p>
              </div>
              <span
                className={`risk-level ${
                  customer.Prediction_Probability > 0.7 ? "high-risk" : "medium-risk"
                }`}
              >
                {customer.Prediction_Probability > 0.7 ? "High Risk" : "Medium Risk"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No at-risk customers found.</p>
      )}
    </div>
  );
};

export default AtRiskCustomersList;
