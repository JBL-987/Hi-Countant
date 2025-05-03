import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const FinancialPlanning = ({ transactions }) => {
  const [financialGoals, setFinancialGoals] = useState([]);
  const [cashFlow, setCashFlow] = useState({});
  const [netWorth, setNetWorth] = useState(0);
  const [emergencyFund, setEmergencyFund] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      try {
        setIsLoading(true);
        setError(null);
        analyzeFinancialPlan(transactions);
      } catch (err) {
        setError('Failed to analyze financial plan: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [transactions]);

  const analyzeFinancialPlan = (transactions) => {
    // Calculate total income and expenses
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Calculate assets and liabilities
    const totalAssets = transactions
      .filter(t => t.category === 'asset')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalLiabilities = transactions
      .filter(t => t.category === 'liability' || t.category === 'debt')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Calculate net worth
    const calculatedNetWorth = totalAssets - totalLiabilities;
    setNetWorth(calculatedNetWorth);

    // Calculate emergency fund coverage
    const monthlyExpenses = totalExpenses / 12;
    const emergencyFundMonths = totalAssets > 0 ? 
      Math.floor((totalAssets / monthlyExpenses) * 100) / 100 : 0;

    setEmergencyFund({
      monthsCovered: emergencyFundMonths,
      recommended: 6, // Typically 3-6 months of expenses
      status: emergencyFundMonths >= 6 ? 'healthy' : emergencyFundMonths >= 3 ? 'moderate' : 'low'
    });

    // Set cash flow analysis
    setCashFlow({
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0
    });

    // Set financial goals (example goals)
    setFinancialGoals([
      {
        name: 'Emergency Fund',
        current: emergencyFundMonths,
        target: 6,
        unit: 'months',
        progress: Math.min((emergencyFundMonths / 6) * 100, 100),
        status: emergencyFundMonths >= 6 ? 'achieved' : 'in-progress'
      },
      {
        name: 'Savings Rate',
        current: cashFlow.savingsRate,
        target: 20,
        unit: '%',
        progress: Math.min((cashFlow.savingsRate / 20) * 100, 100),
        status: cashFlow.savingsRate >= 20 ? 'achieved' : 'in-progress'
      },
      {
        name: 'Debt Reduction',
        current: totalLiabilities,
        target: totalLiabilities * 0.5, // Aim to reduce by 50%
        unit: 'currency',
        progress: totalLiabilities > 0 ? 
          Math.max(0, 100 - (totalLiabilities / (totalLiabilities * 0.5) * 100)) : 
          100,
        status: totalLiabilities <= 0 ? 'achieved' : 'in-progress'
      }
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 flex-col">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-400">Loading financial plan...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No data available for financial planning</p>
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
        <h1 className="text-2xl font-bold text-white">Financial Planning</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Net Worth */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Net Worth</h2>
        <div className="text-center">
          <p className="text-4xl font-bold text-white">{formatCurrency(netWorth)}</p>
          <p className="text-gray-400 mt-2">Your total assets minus liabilities</p>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Cash Flow Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Monthly Income</h3>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(cashFlow.income / 12)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Monthly Expenses</h3>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(cashFlow.expenses / 12)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Savings Rate</h3>
            <p className="text-2xl font-bold text-blue-500">{cashFlow.savingsRate}%</p>
          </div>
        </div>
      </div>

      {/* Emergency Fund */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Emergency Fund</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Current Coverage</h3>
            <p className="text-2xl font-bold text-white">
              {emergencyFund.monthsCovered} months
            </p>
            <p className={`text-sm mt-1 ${
              emergencyFund.status === 'healthy' ? 'text-green-500' : 
              emergencyFund.status === 'moderate' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {emergencyFund.status === 'healthy' ? 'Healthy' : 
               emergencyFund.status === 'moderate' ? 'Moderate' : 'Low'} coverage
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-gray-400 text-sm font-medium">Recommended</h3>
            <p className="text-2xl font-bold text-white">{emergencyFund.recommended} months</p>
            <p className="text-sm text-gray-400 mt-1">of living expenses</p>
          </div>
        </div>
      </div>

      {/* Financial Goals */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Financial Goals</h2>
        <div className="space-y-4">
          {financialGoals.map((goal, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-300 font-medium">{goal.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  goal.status === 'achieved' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                }`}>
                  {goal.status === 'achieved' ? 'Achieved' : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {goal.unit === 'currency' ? formatCurrency(goal.current) : goal.current}{goal.unit}
                  </p>
                  <p className="text-xs text-gray-400">Target: {goal.unit === 'currency' ? 
                    formatCurrency(goal.target) : goal.target}{goal.unit}</p>
                </div>
                <div className="w-1/2">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        goal.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`} 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {Math.min(goal.progress, 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanning;