import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analysis = ({ transactions }) => {
  // State untuk menyimpan hasil analisis
  const [financialRatios, setFinancialRatios] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  // Effect untuk menganalisis transaksi ketika data berubah
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      analyzeTransactions(transactions);
    }
  }, [transactions]);

  // Fungsi untuk menganalisis transaksi
  const analyzeTransactions = (transactions) => {
    // Hitung total pendapatan dan pengeluaran
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

    // Hitung rasio keuangan yang sebenarnya
    const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;
    
    // Hitung Current Ratio (Asset Lancar / Kewajiban Lancar)
    const currentAssets = transactions
      .filter(t => t.transactionType === 'income' || t.category === 'asset')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const currentLiabilities = transactions
      .filter(t => t.category === 'liability' || t.category === 'debt')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const currentRatio = currentLiabilities > 0 ? 
      (currentAssets / currentLiabilities).toFixed(2) : 
      0;

    // Hitung Debt Ratio (Total Hutang / Total Aset)
    const totalDebts = transactions
      .filter(t => t.category === 'liability' || t.category === 'debt')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalAssets = transactions
      .filter(t => t.transactionType === 'income' || t.category === 'asset')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const debtRatio = totalAssets > 0 ? 
      (totalDebts / totalAssets).toFixed(2) : 
      0;

    // Hitung perubahan dari periode sebelumnya (misalnya bulan lalu)
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) <= lastMonthDate
    );

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

    const lastMonthProfitMargin = lastMonthIncome > 0 ? 
      ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome * 100).toFixed(1) : 
      0;

    const profitMarginChange = (parseFloat(profitMargin) - parseFloat(lastMonthProfitMargin)).toFixed(1);

    // Set financial ratios dengan perubahan yang dihitung
    setFinancialRatios([
      {
        name: 'Current Ratio',
        value: currentRatio.toString(),
        change: `${currentRatio > 2 ? '+' : '-'}${Math.abs(currentRatio - 2).toFixed(2)}`,
        status: currentRatio >= 2 ? 'positive' : 'negative'
      },
      {
        name: 'Profit Margin',
        value: `${profitMargin}%`,
        change: `${profitMarginChange > 0 ? '+' : ''}${profitMarginChange}%`,
        status: profitMarginChange >= 0 ? 'positive' : 'negative'
      },
      {
        name: 'Debt Ratio',
        value: debtRatio.toString(),
        change: `${debtRatio <= 0.5 ? '-' : '+'}${Math.abs(debtRatio - 0.5).toFixed(2)}`,
        status: debtRatio <= 0.5 ? 'positive' : 'negative'
      },
    ]);

    // Hitung budget comparison berdasarkan data aktual
    const averageMonthlyIncome = totalIncome / 12; // Asumsi data setahun
    const averageMonthlyExpenses = totalExpenses / 12;

    setBudgetComparison([
      {
        category: 'Revenue',
        budget: averageMonthlyIncome * 0.9, // Target 90% dari rata-rata
        actual: totalIncome,
        variance: totalIncome - (averageMonthlyIncome * 0.9),
        status: totalIncome >= (averageMonthlyIncome * 0.9) ? 'positive' : 'negative'
      },
      {
        category: 'Expenses',
        budget: averageMonthlyExpenses * 1.1, // Target 110% dari rata-rata
        actual: totalExpenses,
        variance: (averageMonthlyExpenses * 1.1) - totalExpenses,
        status: totalExpenses <= (averageMonthlyExpenses * 1.1) ? 'positive' : 'negative'
      }
    ]);

    // Hitung monthly trends
    const calculateMonthlyTrends = () => {
      const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'long' });
        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0 };
        }
        if (t.transactionType === 'income') {
          acc[month].income += parseFloat(t.amount || 0);
        } else {
          acc[month].expenses += parseFloat(t.amount || 0);
        }
        return acc;
      }, {});
      
      setMonthlyTrends(Object.entries(monthlyData).map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      })));
    };

    const analyzeExpenseCategories = () => {
      const categoryData = transactions
        .filter(t => t.transactionType === 'expense')
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + parseFloat(t.amount || 0);
          return acc;
        }, {});

      setExpensesByCategory(
        Object.entries(categoryData)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / totalExpenses * 100).toFixed(1)
          }))
          .sort((a, b) => b.amount - a.amount)
      );
    };

    const detectAnomalies = () => {
      const averageTransaction = totalExpenses / transactions.length;
      const threshold = averageTransaction * 2; // Transaksi 2x lebih besar dari rata-rata

      const detectedAnomalies = transactions.filter(t => 
        parseFloat(t.amount) > threshold
      ).map(t => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
        type: t.transactionType,
        reason: `Unusual ${t.transactionType} amount (${formatCurrency(t.amount)})`
      }));

      setAnomalies(detectedAnomalies);
    };
  };

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
          <p className="text-2xl font-bold text-white">{financialRatios.find(r => r.name === 'Profit Margin')?.value || '0%'}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{financialRatios.find(r => r.name === 'Profit Margin')?.change || '0%'} from last period</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Liquidity</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialRatios.find(r => r.name === 'Current Ratio')?.value || '0'}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{financialRatios.find(r => r.name === 'Current Ratio')?.change || '0'} from last period</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Debt Ratio</h3>
            <PieChart className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialRatios.find(r => r.name === 'Debt Ratio')?.value || '0'}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span>{financialRatios.find(r => r.name === 'Debt Ratio')?.change || '0'} from last period</span>
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
              {transactions && transactions.length > 0 
                ? "Analysis of transaction patterns shows no significant anomalies."
                : "No transactions available for anomaly detection."}
            </p>
          </div>
          <div>
            <h3 className="text-white text-md font-medium mb-2">Positive Trends</h3>
            <p className="text-gray-300">
              {transactions && transactions.length > 0 
                ? "Transaction analysis shows normal business operations."
                : "No transactions available for trend analysis."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Monthly Trends
        </h2>
        <div className="space-y-4">
          {monthlyTrends.map((month, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-gray-300 font-medium">{month.month}</h3>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-400">Income</p>
                  <p className="text-lg font-bold text-green-500">
                    {formatCurrency(month.income)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Expenses</p>
                  <p className="text-lg font-bold text-red-500">
                    {formatCurrency(month.expenses)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Profit</p>
                  <p className={`text-lg font-bold ${
                    month.profit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(month.profit)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Expense Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expensesByCategory.map((category, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-300">{category.category}</h3>
                <p className="text-sm text-gray-400">{category.percentage}%</p>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {formatCurrency(category.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-4 mt-4">
          <h3 className="text-red-400 font-medium mb-2">Detected Anomalies</h3>
          <div className="space-y-2">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="bg-gray-800 rounded p-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">{anomaly.date}</span>
                  <span className="text-red-400">{formatCurrency(anomaly.amount)}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{anomaly.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
