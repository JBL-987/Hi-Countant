import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, AlertTriangle, Download, Filter } from 'lucide-react';

const Validation = ({ 
  transactions,
  onViewTransaction,
  onExportTransactions
}) => {
  const [validationResults, setValidationResults] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to check processed files
  const checkProcessedFiles = () => {
    const files = JSON.parse(localStorage.getItem("processedFiles") || "[]");
    setProcessedFiles(files);
  };

  // Function to validate transaction
  const validateTransaction = (transaction) => {
    let status = 'valid';
    let messages = [];
    
    // Check if the transaction comes from a processed file
    if (transaction.sourceFile && !processedFiles.includes(transaction.sourceFile)) {
      messages.push('File not yet processed');
      status = 'warning';
    }

    // 1. Documentation Completeness Validation
    if (!transaction.description) {
      messages.push('Transaction description incomplete');
      status = 'error';
    }
    if (!transaction.sourceFile && !transaction.reference) {
      messages.push('Source document unavailable');
      status = 'error';
    }

    // 2. Monetary Value Validation
    if (!transaction.amount || isNaN(parseFloat(transaction.amount))) {
      messages.push('Invalid transaction amount');
      status = 'error';
    }

    // 3. Accounting Period Validation
    if (!transaction.date) {
      messages.push('Transaction date missing');
      status = 'error';
    } else {
      const transactionDate = new Date(transaction.date);
      const currentDate = new Date();
      if (transactionDate > currentDate) {
        messages.push('Future dated transactions not allowed');
        status = 'error';
      }
    }

    // 4. Classification Validation
    if (!transaction.category) {
      messages.push('Transaction category not specified');
      status = 'warning';
    }
    if (!transaction.transactionType) {
      messages.push('Transaction type not specified');
      status = 'error';
    }

    // 5. Consistency Validation
    if (transaction.transactionType === 'expense' && parseFloat(transaction.amount) > 0) {
      messages.push('Expense amount must be negative');
      status = 'error';
    }
    if (transaction.transactionType === 'income' && parseFloat(transaction.amount) < 0) {
      messages.push('Income amount must be positive');
      status = 'error';
    }

    // 6. Reference Completeness
    if (!transaction.reference && Math.abs(parseFloat(transaction.amount)) > 10000) {
      messages.push('Large transactions require reference number');
      status = 'warning';
    }

    return {
      id: transaction.id,
      type: 'transaction',
      name: transaction.description || 'Unnamed Transaction',
      status,
      message: messages.join('; '),
      date: transaction.date,
      details: {
        ...transaction,
        validationIssues: messages,
        isProcessed: transaction.sourceFile ? processedFiles.includes(transaction.sourceFile) : true
      }
    };
  };

  // Filter and search functions
  const filteredResults = validationResults.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Effect to validate transactions when component mounts or when transactions/processed files change
  useEffect(() => {
    checkProcessedFiles();
    
    if (transactions && transactions.length > 0) {
      const results = transactions.map(validateTransaction);
      setValidationResults(results);
      
      // Calculate compliance status
      const errors = results.filter(r => r.status === 'error').length;
      const warnings = results.filter(r => r.status === 'warning').length;
      
      setComplianceStatus({
        materialityViolations: results.filter(r => r.message.includes('amount')).length,
        documentationViolations: results.filter(r => r.message.includes('document')).length,
        classificationErrors: results.filter(r => r.message.includes('category')).length,
        timingErrors: results.filter(r => r.message.includes('date')).length,
        totalErrors: errors,
        totalWarnings: warnings
      });
    }
  }, [transactions, processedFiles]);

  // Calculate statistics
  const validCount = validationResults.filter(item => item.status === 'valid').length;
  const warningCount = validationResults.filter(item => item.status === 'warning').length;
  const errorCount = validationResults.filter(item => item.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Transaction Validation</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={onExportTransactions}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="warning">Warnings</option>
          <option value="error">Errors</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Valid Documents Card */}
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Valid Transactions</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{validCount}</p>
          <p className="text-sm text-green-500 mt-2">No action required</p>
        </div>

        {/* Warnings Card */}
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Warnings</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{warningCount}</p>
          <p className="text-sm text-yellow-500 mt-2">Requires attention</p>
        </div>

        {/* Errors Card */}
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Errors</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white">{errorCount}</p>
          <p className="text-sm text-red-400 mt-2">Requires immediate action</p>
        </div>
      </div>

      {/* Validation Results */}
      <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Validation Results</h2>
        <div className="divide-y divide-gray-800">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="py-4 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
              onClick={() => onViewTransaction(item.details)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    item.status === 'valid' ? 'bg-green-900/30' :
                    item.status === 'warning' ? 'bg-yellow-900/30' : 'bg-red-900/30'
                  }`}>
                    <ClipboardCheck className={`h-5 w-5 ${
                      item.status === 'valid' ? 'text-green-500' :
                      item.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'valid' ? 'bg-green-900/30 text-green-400' :
                  item.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {item.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      {complianceStatus && (
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Compliance Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">GAAP Compliance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Materiality Violations:</span>
                  <span className={complianceStatus.materialityViolations > 0 ? 'text-red-400' : 'text-green-400'}>
                    {complianceStatus.materialityViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Documentation Issues:</span>
                  <span className={complianceStatus.documentationViolations > 0 ? 'text-red-400' : 'text-green-400'}>
                    {complianceStatus.documentationViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Classification Errors:</span>
                  <span className={complianceStatus.classificationErrors > 0 ? 'text-red-400' : 'text-green-400'}>
                    {complianceStatus.classificationErrors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timing Errors:</span>
                  <span className={complianceStatus.timingErrors > 0 ? 'text-red-400' : 'text-green-400'}>
                    {complianceStatus.timingErrors}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Overall Status</h3>
              <div className="p-4 rounded-lg bg-gray-800">
                <div className="flex items-center space-x-2">
                  {complianceStatus.totalErrors === 0 && complianceStatus.totalWarnings === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-400">Fully Compliant</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-400">
                        {`Requires Attention (${complianceStatus.totalErrors} errors, ${complianceStatus.totalWarnings} warnings)`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validation;
