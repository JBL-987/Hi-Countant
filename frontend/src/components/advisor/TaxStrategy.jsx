import React, { useState, useEffect } from 'react';
import { PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

const TaxStrategy = ({ transactions }) => {
  const [taxLiabilities, setTaxLiabilities] = useState([{
    type: 'No tax data',
    amount: 0,
    percentage: 0
  }]);
  const [deductions, setDeductions] = useState([{
    category: 'No deductions',
    amount: 0,
    limit: 0
  }]);
  const [taxSavings, setTaxSavings] = useState(0);
  const [estimatedTax, setEstimatedTax] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactions) {
      try {
        setIsLoading(true);
        setError(null);
        
        if (transactions.length > 0) {
          analyzeTaxStrategy(transactions);
        } else {
          setEmptyState();
        }
      } catch (err) {
        setError('Failed to analyze tax strategy: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [transactions]);

  const setEmptyState = () => {
    setTaxLiabilities([{
      type: 'No tax data',
      amount: 0,
      percentage: 0
    }]);
    setDeductions([{
      category: 'No deductions',
      amount: 0,
      limit: 0
    }]);
    setTaxSavings(0);
    setEstimatedTax(0);
  };

  const analyzeTaxStrategy = (transactions) => {
    // Perhitungan pendapatan dan pengeluaran
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Perhitungan aset dan kewajiban
    const totalAssets = transactions
      .filter(t => t.category === 'asset')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalLiabilities = transactions
      .filter(t => t.category === 'liability' || t.category === 'debt')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Perhitungan pajak yang diperkirakan (25% dari pendapatan setelah dikurangi pengeluaran yang memenuhi syarat)
    const taxableIncome = totalIncome - totalExpenses;
    const taxRate = 0.25; // 25% tax rate
    const calculatedTax = Math.max(0, taxableIncome * taxRate);
    setEstimatedTax(calculatedTax);

    // Mengkategorikan kewajiban pajak berdasarkan data aktual transaksi
    // Identifikasi jenis pajak dari transaksi
    const taxCategories = {};
    
    transactions
      .filter(t => t.transactionType === 'expense' && t.category === 'tax')
      .forEach(transaction => {
        const taxType = transaction.subcategory || 'Other Taxes';
        if (!taxCategories[taxType]) {
          taxCategories[taxType] = 0;
        }
        taxCategories[taxType] += parseFloat(transaction.amount || 0);
      });
    
    // Jika tidak ada data pajak dalam transaksi, gunakan estimasi berdasarkan penghasilan
    if (Object.keys(taxCategories).length === 0) {
      // Estimasi pajak penghasilan berdasarkan struktur pajak umum
      taxCategories['Federal Income Tax'] = calculatedTax * 0.6;
      taxCategories['State Income Tax'] = calculatedTax * 0.25;
      taxCategories['Local Tax'] = calculatedTax * 0.1;
      taxCategories['Other Taxes'] = calculatedTax * 0.05;
    }
    
    // Konversi ke format yang diperlukan dengan persentase aktual
    const totalTaxAmount = Object.values(taxCategories).reduce((sum, amount) => sum + amount, 0);
    
    const formattedTaxLiabilities = Object.entries(taxCategories).map(([type, amount]) => ({
      type,
      amount,
      percentage: totalTaxAmount > 0 ? Math.round((amount / totalTaxAmount) * 100) : 0
    }));
    
    // Urutkan dari yang terbesar ke terkecil
    formattedTaxLiabilities.sort((a, b) => b.amount - a.amount);
    
    setTaxLiabilities(formattedTaxLiabilities);

    // Perhitungan potensi pengurangan pajak
    const possibleDeductions = [
      {
        category: 'Charitable Contributions',
        amount: totalExpenses * 0.05, // Contoh: 5% dari pengeluaran adalah sumbangan amal
        limit: totalIncome * 0.6 // Batas 60% dari AGI
      },
      {
        category: 'Business Expenses',
        amount: totalExpenses * 0.3, // Contoh: 30% dari pengeluaran adalah bisnis
        limit: totalIncome // Tidak ada batas spesifik
      },
      {
        category: 'Medical Expenses',
        amount: totalExpenses * 0.08, // Contoh: 8% dari pengeluaran adalah medis
        limit: totalIncome * 0.075 // Hanya yang melebihi 7.5% dari AGI
      }
    ];
    
    setDeductions(possibleDeductions);
    
    const totalDeductionsAmount = possibleDeductions.reduce((sum, d) => {
      const deductibleAmount = d.category === 'Medical Expenses' 
        ? Math.max(0, d.amount - d.limit) 
        : Math.min(d.amount, d.limit); 
      return sum + deductibleAmount;
    }, 0);
    
    const taxSavingsAmount = totalDeductionsAmount * taxRate;
    setTaxSavings(taxSavingsAmount);
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
        <p className="text-gray-400">Loading tax strategy...</p>
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
            {formatCurrency(deductions.reduce((sum, d) => sum + Math.min(d.amount, d.limit), 0))}
          </p>
          <p className="text-sm text-gray-400 mt-2">Across categories</p>
        </div>
      </div>

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
                      {deduction.limit > 0 ? Math.min((deduction.amount / deduction.limit) * 100, 100).toFixed(0) : 0}%
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