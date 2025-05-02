import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Share2 } from 'lucide-react';

const Reports = ({ transactions }) => {
  const [financialStatements, setFinancialStatements] = useState([]);
  const [taxReports, setTaxReports] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Generate financial statements from transactions
      const statements = generateFinancialStatements(transactions);
      setFinancialStatements(statements);

      // Generate tax reports from transactions
      const reports = generateTaxReports(transactions);
      setTaxReports(reports);
    }
  }, [transactions]);

  const generateFinancialStatements = (transactions) => {
    // Group transactions by quarter
    const quarters = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      const quarterKey = `Q${quarter} ${year}`;
      
      if (!quarters[quarterKey]) {
        quarters[quarterKey] = {
          income: 0,
          expenses: 0,
          date: transaction.date
        };
      }

      if (transaction.transactionType === 'income') {
        quarters[quarterKey].income += transaction.amount;
      } else {
        quarters[quarterKey].expenses += transaction.amount;
      }
    });

    // Convert to array format
    return Object.entries(quarters).map(([period, data], index) => ({
      id: index + 1,
      name: 'Financial Statement',
      period: period,
      date: data.date,
      status: 'final',
      data: {
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      }
    }));
  };

  const generateTaxReports = (transactions) => {
    // Group transactions by quarter and calculate tax-related amounts
    const quarters = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      const quarterKey = `Q${quarter} ${year}`;
      
      if (!quarters[quarterKey]) {
        quarters[quarterKey] = {
          taxableIncome: 0,
          taxDeductibleExpenses: 0,
          date: transaction.date,
          dueDate: new Date(year, (quarter * 3) + 1, 15).toISOString().split('T')[0]
        };
      }

      if (transaction.transactionType === 'income') {
        quarters[quarterKey].taxableIncome += transaction.amount;
      } else if (transaction.taxDeductible) {
        quarters[quarterKey].taxDeductibleExpenses += transaction.amount;
      }
    });

    // Convert to array format
    return Object.entries(quarters).map(([period, data], index) => ({
      id: index + 1,
      name: 'Tax Report',
      period: period,
      date: data.date,
      dueDate: data.dueDate,
      status: 'ready',
      data: {
        taxableIncome: data.taxableIncome,
        taxDeductibleExpenses: data.taxDeductibleExpenses,
        estimatedTax: (data.taxableIncome - data.taxDeductibleExpenses) * 0.25 // Assuming 25% tax rate
      }
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Financial Statements</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialStatements.length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>All statements up to date</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Tax Reports</h3>
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{taxReports.length}</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>{taxReports.filter(r => r.status === 'ready').length} ready for filing</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Analysis Reports</h3>
            <FileText className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{financialStatements.length}</p>
          <p className="text-sm text-purple-500 mt-2 flex items-center">
            <span>Performance insights available</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Financial Statements
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2">Report</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Income</th>
                <th className="px-4 py-2">Expenses</th>
                <th className="px-4 py-2">Profit</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {financialStatements.map((statement) => (
                <tr key={statement.id}>
                  <td className="px-4 py-3 text-sm text-gray-300">{statement.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{statement.period}</td>
                  <td className="px-4 py-3 text-sm text-green-400">{formatCurrency(statement.data.income)}</td>
                  <td className="px-4 py-3 text-sm text-red-400">{formatCurrency(statement.data.expenses)}</td>
                  <td className="px-4 py-3 text-sm text-white">{formatCurrency(statement.data.profit)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                      {statement.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Tax & Compliance Reports
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-2">Report</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Taxable Income</th>
                <th className="px-4 py-2">Deductible Expenses</th>
                <th className="px-4 py-2">Estimated Tax</th>
                <th className="px-4 py-2">Due Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {taxReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-3 text-sm text-gray-300">{report.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{report.period}</td>
                  <td className="px-4 py-3 text-sm text-green-400">{formatCurrency(report.data.taxableIncome)}</td>
                  <td className="px-4 py-3 text-sm text-red-400">{formatCurrency(report.data.taxDeductibleExpenses)}</td>
                  <td className="px-4 py-3 text-sm text-yellow-400">{formatCurrency(report.data.estimatedTax)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(report.dueDate)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'ready' 
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Printer size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
