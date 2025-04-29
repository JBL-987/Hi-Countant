import React from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analysis = () => {
  // Sample financial ratios data
  const financialRatios = [
    { name: 'Current Ratio', value: '2.5', change: '+0.3', status: 'positive' },
    { name: 'Quick Ratio', value: '1.8', change: '+0.2', status: 'positive' },
    { name: 'Debt-to-Equity', value: '0.45', change: '-0.05', status: 'positive' },
    { name: 'Profit Margin', value: '18%', change: '+2%', status: 'positive' },
    { name: 'Return on Assets', value: '12%', change: '-1%', status: 'negative' },
    { name: 'Inventory Turnover', value: '6.2', change: '+0.4', status: 'positive' },
  ];

  // Sample budget vs actual data
  const budgetComparison = [
    { category: 'Revenue', budget: 120000, actual: 125000, variance: 5000, status: 'positive' },
    { category: 'Cost of Goods', budget: 70000, actual: 68000, variance: 2000, status: 'positive' },
    { category: 'Operating Expenses', budget: 30000, actual: 32000, variance: -2000, status: 'negative' },
    { category: 'Marketing', budget: 10000, actual: 12000, variance: -2000, status: 'negative' },
    { category: 'R&D', budget: 15000, actual: 14000, variance: 1000, status: 'positive' },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Financial Analysis</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Profitability</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">18%</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>2% from last period</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Liquidity</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">2.5</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>0.3 from last period</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Debt Ratio</h3>
            <PieChart className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">0.45</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span>0.05 from last period</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Financial Ratios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialRatios.map((ratio, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm font-medium mb-2">{ratio.name}</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{ratio.value}</p>
                <p className={`text-sm flex items-center ${
                  ratio.status === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {ratio.status === 'positive' ? 
                    <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  }
                  <span>{ratio.change}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Budget vs. Actual
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Budget</th>
                <th className="px-4 py-2 text-right">Actual</th>
                <th className="px-4 py-2 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {budgetComparison.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-300">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(item.budget)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(item.actual)}</td>
                  <td className={`px-4 py-3 text-sm text-right ${
                    item.status === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Anomalies & Trends
        </h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-white text-md font-medium mb-2">Detected Anomalies</h3>
            <p className="text-gray-300">
              Unusual increase in marketing expenses (20% above budget). This may require further investigation.
            </p>
          </div>
          <div>
            <h3 className="text-white text-md font-medium mb-2">Positive Trends</h3>
            <p className="text-gray-300">
              Revenue has consistently exceeded budget for the last 3 months, indicating strong sales performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
