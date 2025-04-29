import React from 'react';
import { ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';

const Validation = () => {
  // Sample validation data
  const validationItems = [
    { 
      id: 1, 
      type: 'receipt', 
      name: 'Office Supplies Receipt.pdf', 
      status: 'valid', 
      message: 'All fields validated successfully',
      date: '2023-11-15'
    },
    { 
      id: 2, 
      type: 'invoice', 
      name: 'Consulting Services Invoice.pdf', 
      status: 'warning', 
      message: 'Missing tax identification number',
      date: '2023-11-10'
    },
    { 
      id: 3, 
      type: 'transaction', 
      name: 'Bank Statement November.csv', 
      status: 'valid', 
      message: 'All transactions reconciled',
      date: '2023-11-05'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Validation</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last validated: Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Valid Documents</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <span>No action needed</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Warnings</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">1</p>
          <p className="text-sm text-yellow-500 mt-2 flex items-center">
            <span>Requires attention</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Errors</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2 flex items-center">
            <span>No errors found</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Validation Results
        </h2>

        <div className="divide-y divide-gray-800">
          {validationItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center space-x-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  item.status === 'valid' ? 'bg-green-900/30' : 
                  item.status === 'warning' ? 'bg-yellow-900/30' : 'bg-red-900/30'
                }`}>
                  <ClipboardCheck className={`h-5 w-5 ${
                    item.status === 'valid' ? 'text-green-500' : 
                    item.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <span className="text-base font-medium text-white block">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {item.type} • {item.date}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.status === 'valid' ? 'bg-green-900/30 text-green-400' : 
                item.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {item.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-bold text-white">
          Compliance Check
        </h2>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-300">
            All documents have been checked against accounting standards (GAAP, IFRS).
            No compliance issues were found in the current dataset.
          </p>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-400">Compliant with accounting standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Validation;
