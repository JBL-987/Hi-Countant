import React, { useState } from 'react';
import { Lightbulb, TrendingUp, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';

const Recommendations = () => {
  // Sample recommendations
  const recommendations = [
    { 
      id: 1, 
      title: 'Optimize Accounts Payable Process', 
      description: 'Implement automated invoice processing to reduce manual data entry and improve accuracy.',
      impact: 'High',
      category: 'Process Improvement',
      savings: '$5,000 annually'
    },
    { 
      id: 2, 
      title: 'Review Vendor Contracts', 
      description: 'Several vendor contracts are due for renewal. Negotiate better terms based on your payment history.',
      impact: 'Medium',
      category: 'Cost Reduction',
      savings: '$3,200 annually'
    },
    { 
      id: 3, 
      title: 'Implement Cash Flow Forecasting', 
      description: 'Set up a 13-week cash flow forecast to better anticipate cash needs and optimize working capital.',
      impact: 'High',
      category: 'Financial Planning',
      savings: 'Improved liquidity'
    },
    { 
      id: 4, 
      title: 'Tax Deduction Opportunity', 
      description: 'Recent equipment purchases qualify for Section 179 deduction. Consult with tax advisor before year-end.',
      impact: 'High',
      category: 'Tax Optimization',
      savings: '$12,000 tax savings'
    },
    { 
      id: 5, 
      title: 'Accounts Receivable Follow-up', 
      description: 'Implement a structured follow-up process for overdue invoices to improve collection time.',
      impact: 'Medium',
      category: 'Cash Flow',
      savings: 'Reduce DSO by 5 days'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Recommendations</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Process Improvements</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>Efficiency opportunities</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Cost Reduction</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">$20,200</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>Potential annual savings</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">High Priority</h3>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-sm text-yellow-500 mt-2 flex items-center">
            <span>Require immediate attention</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          AI-Generated Recommendations
        </h2>

        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-800/80 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/30">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-white">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recommendation.impact === 'High' 
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : recommendation.impact === 'Medium'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {recommendation.impact} Impact
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">{recommendation.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{recommendation.category}</span>
                    <span className="text-xs font-medium text-green-400">{recommendation.savings}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 ml-12">
                <button className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <span>View details</span>
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Implementation Plan
        </h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300">
            Our AI has analyzed your financial data and business operations to generate these recommendations. 
            To maximize the benefits, we suggest implementing them in the following order:
          </p>
          <ol className="mt-4 space-y-2 pl-5 list-decimal text-gray-300">
            <li>Tax Deduction Opportunity (before year-end)</li>
            <li>Accounts Receivable Follow-up (immediate cash flow impact)</li>
            <li>Review Vendor Contracts (as they come up for renewal)</li>
            <li>Implement Cash Flow Forecasting (within next 30 days)</li>
            <li>Optimize Accounts Payable Process (longer-term project)</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <p className="text-sm text-blue-300">
              <strong>Pro Tip:</strong> Schedule a meeting with your team to review these recommendations and assign responsibilities for implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
