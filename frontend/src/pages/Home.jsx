import React from 'react'
import { useEffect , useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import Dashboard from '../components/Dashboard';
import AtRiskCustomersList from '../components/AtRiskCustomersList';


const Home = () => {
    const [predictedData, setPredictedData] = useState(null);
      const [churnRate, setChurnRate] = useState(null);
      const [planDistribution, setPlanDistribution] = useState(null);
      const [atRiskCustomers, setAtriskCustomers] = useState(null);
    
      const handlePredictedDataChange = (newPredictedData) => {
        setPredictedData(newPredictedData);
      };
    
      useEffect(() => {
        // console.log(predictedData);
        setChurnRate(predictedData ? predictedData.data.churn_rate : null);
        setPlanDistribution(
          predictedData ? predictedData.data.subscription_plan_distribution : null
        );
        setAtriskCustomers(
          predictedData ? predictedData.data.top_3_customers_at_risk : null
        );
      }, [predictedData]);
  return (
    <div>
        <Header />
      <div>
        <FileUpload sendPredictedDataToParent={handlePredictedDataChange} />
        <Dashboard churnRate={churnRate} planDistribution={planDistribution} atRiskCustomers={atRiskCustomers} />
        {/* {atRiskCustomers && <AtRiskCustomersList atRiskCustomers={atRiskCustomers} />} */}
      </div>
      
    </div>
  )
}

export default Home
