import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const TaxStrategy = ({ transactions }) => {
  const [taxLiabilities, setTaxLiabilities] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [taxSavings, setTaxSavings] = useState(0);
  const [estimatedTax, setEstimatedTax] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      try {
        setIsLoading(true);
        setError(null);
        analyzeTaxStrategy(transactions);
      } catch (err) {
        setError('Failed to analyze tax strategy: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [transactions]);

  const analyzeTaxStrategy = (transactions) => {
    // Filter tax-related transactions
    const taxTransactions = transactions.filter(t => 
      t.tags?.includes('tax') || 
      t.category === 'tax' || 
      t.description?.toLowerCase().includes('tax')
    );

    // Calculate taxable income
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Calculate tax-deductible expenses
    const deductibleExpenses = transactions
      .filter(t => t.tags?.includes('deductible') || 
                  ['charity', 'education', 'medical', 'business'].includes(t.category))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Group tax liabilities by type
    const liabilitiesByType = taxTransactions
      .filter(t => t.amount < 0) // Tax payments are negative
      .reduce((acc, t) => {
        const type = t.taxType || 'Other';
        acc[type] = (acc[type] || 0) + Math.abs(parseFloat(t.amount || 0));
        return acc;
      }, {});

    // Calculate estimated tax (simplified - would use actual tax brackets)
    const estimatedTaxRate = 0.25; // Example 25% flat rate
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
    const calculatedEstimatedTax = taxableIncome * estimatedTaxRate;
    setEstimatedTax(calculatedEstimatedTax);

    // Calculate potential tax savings from deductions
    const calculatedTaxSavings = deductibleExpenses * estimatedTaxRate;
    setTaxSavings(calculatedTaxSavings);

    // Set tax liabilities
    setTaxLiabilities(
      Object.entries(liabilitiesByType).map(([type, amount]) => ({
        type,
        amount,
        percentage: (amount / calculatedEstimatedTax * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount)
    );

    // Set deductions
    setDeductions([
      {
        category: 'Charitable Contributions',
        amount: transactions
          .filter(t => t.category === 'charity')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        limit: totalIncome * 0.6 // 60% of AGI limit
      },
      {
        category: 'Medical Expenses',
        amount: transactions
          .filter(t => t.category === 'medical')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        limit: totalIncome * 0.075 // 7.5% of AGI floor
      },
      {
        category: 'Education',
        amount: transactions
          .filter(t => t.category === 'education')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        limit: 2500 // American Opportunity Credit limit
      },
      {
        category: 'Business Expenses',
        amount: transactions
          .filter(t => t.category === 'business')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        limit: totalIncome // Generally limited to business income
      }
    ].filter(d => d.amount > 0));
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
        <p className="text-gray-400">Loading tax strategy...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No data available for tax strategy</p>
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
        <h1 className="text-2xl font-bold text-white">Tax Strategy</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-blue-500" />
            <h3 className="text-gray-300 font-medium">Estimated Tax</h3>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(estimatedTax)}</p>
          <p className="text-sm text-gray-400 mt-2">Based on 25% rate</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-gray-300 font-medium">Tax Savings</h3>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(taxSavings)}</p>
          <p className="text-sm text-gray-400 mt-2">From deductions</p>
        </div>
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <h3 className="text-gray-300 font-medium">Total Deductions</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(deductions.reduce((sum, d) => sum + d.amount, 0))}
          </p>
          <p className="text-sm text-gray-400 mt-2">Across categories</p>
        </div>
      </div>

      {/* Tax Liabilities Breakdown */}
      {taxLiabilities.length > 0 && (
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-white">Tax Liabilities by Type</h2>
          <div className="space-y-4">
            {taxLiabilities.map((liability, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-300 font-medium">{liability.type}</h3>
                  <span className="text-gray-400">{formatCurrency(liability.amount)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${liability.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">{liability.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deductions Breakdown */}
      {deductions.length > 0 && (
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-bold text-white">Deductions Analysis</h2>
          <div className="space-y-4">
            {deductions.map((deduction, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-300 font-medium">{deduction.category}</h3>
                  <span className="text-gray-400">{formatCurrency(deduction.amount)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-1/2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${Math.min((deduction.amount / deduction.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {Math.min((deduction.amount / deduction.limit) * 100, 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {deduction.amount > deduction.limit ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500 inline mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-green-500 inline mr-1" />
                    )}
                    <span className="text-gray-400">Limit: {formatCurrency(deduction.limit)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">Tax Strategy Recommendations</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          <li>Consider increasing charitable contributions before year-end to maximize deductions (up to 60% of AGI).</li>
          <li>Review medical expenses to ensure all eligible costs are documented (above 7.5% of AGI).</li>
          <li>Explore additional education credits if eligible (up to $2,500 per student).</li>
          <li>Ensure all business expenses are properly categorized for maximum deductions.</li>
        </ul>
      </div>
    </div>
  );
};

export default TaxStrategy;