import React from 'react';
import { TrendingUp, DollarSign, BarChart3, ChevronRight, Loader } from 'lucide-react';

const LoadingState = ({ message }) => (
  <div className="flex flex-col justify-center items-center py-10 space-y-2">
    <Loader className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2" />
    <div className="text-white text-sm">{message}</div>
  </div>
);

const Investment = ({ transaction, isLoading }) => {
  const investmentData = transaction; 
  
  if (isLoading) {
    return <LoadingState message="Loading investments data..." />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Investment Portfolio</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Total Portfolio Value</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{investmentData?.portfolio?.totalValue}</p>
        </div>
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Monthly Return</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{investmentData?.portfolio?.monthlyReturn}%</p>
        </div>
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Annual Return</h3>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{investmentData?.portfolio?.annualReturn}%</p>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Asset Allocation</h2>
        <div className="space-y-4">
          {investmentData?.assets?.map((asset) => (
            <div key={asset.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{asset.name}</h3>
                <span className="text-sm text-gray-400">Return: {asset.return}%</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${asset.allocation}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-400">Value: {asset.value}</span>
                  <span className="text-sm text-gray-400">Allocation: {asset.allocation}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Recommendations</h2>
        <div className="space-y-4">
          {investmentData?.recommendations?.map((rec) => (
            <div key={rec.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{rec.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
              <p className="mt-2 text-gray-300">{rec.description}</p>
              <button className="mt-3 flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <span>View details</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investment;