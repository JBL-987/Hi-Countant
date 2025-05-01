import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';

const Recommendations = ({ transactions }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const generatedRecommendations = generateRecommendations(transactions);
      setRecommendations(generatedRecommendations);
    }
  }, [transactions]);

  const generateRecommendations = (transactions) => {
    const recommendations = [];
    
    // Analyze cash flow
    const monthlyCashFlow = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyCashFlow[monthKey]) {
        monthlyCashFlow[monthKey] = {
          income: 0,
          expenses: 0
        };
      }

      if (transaction.transactionType === 'income') {
        monthlyCashFlow[monthKey].income += transaction.amount;
      } else {
        monthlyCashFlow[monthKey].expenses += transaction.amount;
      }
    });

    // Check for cash flow issues
    const cashFlowIssues = Object.entries(monthlyCashFlow).filter(([_, data]) => data.expenses > data.income);
    if (cashFlowIssues.length > 0) {
      recommendations.push({
        id: 1,
        title: 'Cash Flow Optimization Required',
        description: `${cashFlowIssues.length} months show negative cash flow. Consider reviewing expenses and improving collection processes.`,
        impact: 'High',
        category: 'Cash Flow',
        savings: 'Improve liquidity'
      });
    }

    // Analyze expense categories
    const expenseCategories = {};
    transactions
      .filter(t => t.transactionType === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        if (!expenseCategories[category]) {
          expenseCategories[category] = 0;
        }
        expenseCategories[category] += transaction.amount;
      });

    // Find largest expense category
    const largestCategory = Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])[0];

    if (largestCategory) {
      recommendations.push({
        id: 2,
        title: 'Review Largest Expense Category',
        description: `${largestCategory[0]} is your largest expense category. Consider cost reduction strategies.`,
        impact: 'Medium',
        category: 'Cost Reduction',
        savings: 'Potential savings in largest expense category'
      });
    }

    // Check for tax optimization opportunities
    const taxDeductibleExpenses = transactions
      .filter(t => t.transactionType === 'expense' && t.taxDeductible)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (taxDeductibleExpenses / totalExpenses < 0.7) {
      recommendations.push({
        id: 3,
        title: 'Tax Deduction Optimization',
        description: 'Less than 70% of expenses are tax-deductible. Review expense categorization for tax benefits.',
        impact: 'High',
        category: 'Tax Optimization',
        savings: 'Potential tax savings'
      });
    }

    // Check for irregular transactions
    const averageTransaction = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
    const irregularTransactions = transactions.filter(t => 
      Math.abs(t.amount) > averageTransaction * 2
    );

    if (irregularTransactions.length > 0) {
      recommendations.push({
        id: 4,
        title: 'Irregular Transaction Review',
        description: `${irregularTransactions.length} transactions significantly deviate from average. Review for potential issues.`,
        impact: 'Medium',
        category: 'Risk Management',
        savings: 'Reduce financial risk'
      });
    }

    return recommendations;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Recommendations</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Process Improvements</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Process Improvement').length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>Efficiency opportunities</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Cost Reduction</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.category === 'Cost Reduction').length}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>Potential savings opportunities</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">High Priority</h3>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.impact === 'High').length}</p>
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
            {recommendations
              .sort((a, b) => {
                if (a.impact === 'High' && b.impact !== 'High') return -1;
                if (a.impact !== 'High' && b.impact === 'High') return 1;
                return 0;
              })
              .map((rec, index) => (
                <li key={rec.id}>{rec.title}</li>
              ))}
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
