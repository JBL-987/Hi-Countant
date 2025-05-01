import React, { useState } from 'react';
import { FileText, Download, Printer, Share2 } from 'lucide-react';

const Reports = () => {
  // Sample financial statements
  const financialStatements = [
    { 
      id: 1, 
      name: 'Balance Sheet', 
      period: 'Q4 2023',
      date: '2023-12-31',
      status: 'final'
    },
    { 
      id: 2, 
      name: 'Income Statement', 
      period: 'Q4 2023',
      date: '2023-12-31',
      status: 'final'
    },
    { 
      id: 3, 
      name: 'Cash Flow Statement', 
      period: 'Q4 2023',
      date: '2023-12-31',
      status: 'final'
    },
    { 
      id: 4, 
      name: 'Balance Sheet', 
      period: 'Q3 2023',
      date: '2023-09-30',
      status: 'final'
    },
    { 
      id: 5, 
      name: 'Income Statement', 
      period: 'Q3 2023',
      date: '2023-09-30',
      status: 'final'
    },
    { 
      id: 6, 
      name: 'Cash Flow Statement', 
      period: 'Q3 2023',
      date: '2023-09-30',
      status: 'final'
    },
  ];

  // Sample tax reports
  const taxReports = [
    { 
      id: 1, 
      name: 'Quarterly Tax Summary', 
      period: 'Q4 2023',
      date: '2023-12-31',
      dueDate: '2024-01-15',
      status: 'ready'
    },
    { 
      id: 2, 
      name: 'Annual Tax Report', 
      period: 'FY 2023',
      date: '2023-12-31',
      dueDate: '2024-04-15',
      status: 'pending'
    },
    { 
      id: 3, 
      name: 'Sales Tax Report', 
      period: 'Q4 2023',
      date: '2023-12-31',
      dueDate: '2024-01-31',
      status: 'ready'
    },
  ];

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last generated: Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Financial Statements</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">6</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <span>All statements up to date</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Tax Reports</h3>
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>2 ready for filing</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Analysis Reports</h3>
            <FileText className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">4</p>
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
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {financialStatements.map((statement) => (
                <tr key={statement.id}>
                  <td className="px-4 py-3 text-sm text-gray-300">{statement.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{statement.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(statement.date)}</td>
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
