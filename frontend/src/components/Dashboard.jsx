import React from "react";
import ChurnRateChart from "./ChurnRateChart";
import "./dashboard.css";
import PlanDistributionChart from "./PlanDistributionChart";
import AtRiskCustomersList from "./AtRiskCustomersList";

const Dashboard = ({ analyticsData, insightData }) => {
  const churnRate = analyticsData.churn_rate;
  const atRiskCustomers = analyticsData.top_3_customers_at_risk;
  const planDistribution = analyticsData.subscription_plan_distribution;

  return (
    <>
      <div className="dashboard">
        <div className="row">
          <div className="overview-container">
            <h3>Overview</h3>
            <p className="subtext">AI-generated</p>
            <p>{insightData.overview}</p>
          </div>

          {churnRate && (
            <div className="overview-container">
              <h3>Business Health</h3>
              <p style={{ marginTop: "12px" }}>
                The current business health is{" "}
                <span
                  style={{
                    color:
                      churnRate < 15
                        ? "green"
                        : churnRate < 30
                        ? "orange"
                        : "red",
                    fontWeight: "bold",
                  }}>
                  {churnRate < 15
                    ? "Good"
                    : churnRate < 30
                    ? "Average"
                    : "Bad"}
                </span>
                , based on the churn rate of {(churnRate).toFixed(2)}%.
              </p>
            </div>
          )}
        </div>

        {churnRate && (
          <div className="dashboard-card">
            <h3>Churn Rate</h3>
            <ChurnRateChart churnRate={(churnRate).toFixed(2)} />
          </div>
        )}

        {insightData.business_recommendations && (
          <div className="dashboard-card">
            <div>
              <h3>Business Recommendations</h3>
              <p className="subtext">AI-generated</p>
            </div>
            <div className="bullet-point-container">
              {insightData.business_recommendations.map((line, index) => (
                <p key={index} className="bullet-point">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {atRiskCustomers && (
          <div className="dashboard-card">
            <h3>Top 3 customers at high risk of churning</h3>
            <AtRiskCustomersList atRiskCustomers={atRiskCustomers} />
          </div>
        )}

        {planDistribution && (
          <div className="dashboard-card">
            <h3>Subscription Plans Distribution</h3>
            <PlanDistributionChart planDistribution={planDistribution} />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
