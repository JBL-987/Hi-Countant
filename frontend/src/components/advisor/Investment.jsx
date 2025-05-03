import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const Investment = ({ transactions }) => {
  const [portfolio, setPortfolio] = useState([{
    type: 'No investments',
    amount: 0,
    percentage: 0
  }]);
  const [returns, setReturns] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    roi: 0
  });
  const [diversification, setDiversification] = useState({
    assetClasses: 0,
    primaryAllocation: 0,
    score: 'needs improvement'
  });
  const [riskAssessment, setRiskAssessment] = useState({
    highRisk: 0,
    percentage: 0,
    level: 'low'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactions) {
      try {
        setIsLoading(true);
        setError(null);
        
        if (transactions.length > 0) {
          analyzeInvestments(transactions);
        } else {
          setEmptyState();
        }
      } catch (err) {
        setError('Failed to analyze investments: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [transactions]);

  const setEmptyState = () => {
    setPortfolio([{
      type: 'No investments',
      amount: 0,
      percentage: 0
    }]);
    setReturns({
      total: 0,
      positive: 0,
      negative: 0,
      roi: 0
    });
    setDiversification({
      assetClasses: 0,
      primaryAllocation: 0,
      score: 'needs improvement'
    });
    setRiskAssessment({
      highRisk: 0,
      percentage: 0,
      level: 'low'
    });
  };

  const analyzeInvestments = (transactions) => {
    // ... existing analysis logic ...
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-400">Loading investment analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
   <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Investment Analysis</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Investments</h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(portfolio.reduce((sum, item) => sum + item.amount, 0))}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Asset Classes</h3>
            <p className="text-2xl font-bold text-white">{diversification.assetClasses}</p>
            <p className={`text-sm mt-1 ${
              diversification.score === 'excellent' ? 'text-green-500' : 
              diversification.score === 'good' ? 'text-blue-500' : 'text-yellow-500'
            }`}>
              {diversification.score}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Risk Level</h3>
            <p className="text-2xl font-bold text-white capitalize">{riskAssessment.level}</p>
            <p className="text-sm text-gray-400 mt-1">
              {riskAssessment.percentage}% in high-risk
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Portfolio Allocation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-300 capitalize">{item.type}</h3>
                <p className="text-sm text-gray-400">{item.percentage}%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full bg-blue-500" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {formatCurrency(item.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Returns */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Investment Returns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Returns</h3>
            <p className={`text-2xl font-bold ${
              returns.total >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(returns.total)}
            </p>
            <p className="text-sm text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">ROI</h3>
            <p className={`text-2xl font-bold ${
              parseFloat(returns.roi) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {returns.roi}%
            </p>
            <p className="text-sm text-gray-400 mt-1">Return on Investment</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Gains vs Losses</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-green-500 font-bold">{formatCurrency(returns.positive)}</p>
                <p className="text-xs text-gray-400">Gains</p>
              </div>
              <div>
                <p className="text-red-500 font-bold">{formatCurrency(returns.negative)}</p>
                <p className="text-xs text-gray-400">Losses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Risk Assessment</h2>
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 font-medium mb-2">Risk Level</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    riskAssessment.level === 'high' ? 'bg-red-500' : 
                    riskAssessment.level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} 
                  style={{ 
                    width: riskAssessment.level === 'high' ? '100%' : 
                           riskAssessment.level === 'moderate' ? '60%' : '30%' 
                  }}
                ></div>
              </div>
              <span className="ml-4 capitalize text-sm font-medium">
                {riskAssessment.level} risk
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {riskAssessment.percentage}% of your portfolio is in high-risk investments
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-300 font-medium mb-2">Diversification</h3>
            <div className="flex items-center">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    diversification.score === 'excellent' ? 'bg-green-500' : 
                    diversification.score === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} 
                  style={{ 
                    width: diversification.score === 'excellent' ? '100%' : 
                           diversification.score === 'good' ? '70%' : '40%' 
                  }}
                ></div>
              </div>
              <span className="ml-4 capitalize text-sm font-medium">
                {diversification.score}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {diversification.assetClasses} asset classes, largest allocation is {diversification.primaryAllocation}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investment;