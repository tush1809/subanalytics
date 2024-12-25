import React from "react";
import ChurnRateChart from "./ChurnRateChart";
import "./dashboard.css";
import PlanDistributionChart from "./PlanDistributionChart";
import AtRiskCustomersList from "./AtRiskCustomersList";

const Dashboard = ({ churnRate, planDistribution, atRiskCustomers }) => {
  return (
    <div className="dashboard">
      {churnRate && (
        <div className="dashboard-card">
          <h3>Churn Rate</h3>
          <ChurnRateChart churnRate={churnRate} />
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
  );
};

export default Dashboard;
