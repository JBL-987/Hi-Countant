import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Check, 
  Eye, 
  ArrowLeft, 
  ArrowRight,
  FileWarning
} from 'lucide-react';
import { getDocumentPosition } from '../../utils/documentPositionTracker';

const DocumentComparison = ({ 
  transaction, 
  onClose, 
  onVerify, 
  onFlagIssue,
  handleFileDownload,
  files
}) => {
  const [documentData, setDocumentData] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verified, flagged
  const [verificationNotes, setVerificationNotes] = useState('');
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  
  useEffect(() => {
    const loadDocumentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get position data for this transaction
        const positionData = getDocumentPosition(transaction.id);
        setDocumentData(positionData);
        
        // If we have a source file, try to load it
        if (transaction.sourceFile) {
          // Check if the file exists in the files list
          const fileExists = files.some(file => file.name === transaction.sourceFile);
          
          if (fileExists) {
            // Download the file
            const fileData = await handleFileDownload(transaction.sourceFile, true);
            
            if (fileData) {
              // Create a URL for the file
              const fileUrl = URL.createObjectURL(fileData);
              setDocumentPreviewUrl(fileUrl);
              
              // Clean up the URL when the component unmounts
              return () => URL.revokeObjectURL(fileUrl);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load document data:', error);
        setError('Failed to load document data. The source document may be unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocumentData();
  }, [transaction, handleFileDownload, files]);
  
  const handleVerify = () => {
    setVerificationStatus('verified');
    onVerify && onVerify(transaction.id, verificationNotes);
  };
  
  const handleFlagIssue = () => {
    setVerificationStatus('flagged');
    onFlagIssue && onFlagIssue(transaction.id, verificationNotes);
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-blue-900/50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Document Verification
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <FileWarning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Document Unavailable</h3>
                <p className="text-gray-400 max-w-md">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Left side - Document Preview */}
              <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 bg-gray-700 text-white font-medium flex items-center justify-between">
                  <span>Source Document: {transaction.sourceFile || 'Unknown'}</span>
                  {documentPreviewUrl && (
                    <a 
                      href={documentPreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open Full Document
                    </a>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                  {documentPreviewUrl ? (
                    <div className="w-full h-full">
                      {transaction.sourceFile?.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${documentPreviewUrl}#toolbar=0`} 
                          className="w-full h-full border-0"
                          title="PDF Preview"
                        />
                      ) : transaction.sourceFile?.match(/\.(jpe?g|png|gif)$/i) ? (
                        <img 
                          src={documentPreviewUrl} 
                          alt="Document Preview" 
                          className="max-w-full max-h-full object-contain mx-auto"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">
                            Preview not available for this file type.
                            <br />
                            <a 
                              href={documentPreviewUrl} 
                              download={transaction.sourceFile}
                              className="text-blue-400 hover:underline"
                            >
                              Download the file
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileWarning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Source Document Unavailable</h3>
                      <p className="text-gray-400">
                        The original document could not be loaded or is no longer available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Transaction Details */}
              <div className="w-full md:w-96 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 bg-gray-700 text-white font-medium">
                  Transaction Details
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-4">
                    {/* Transaction Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className={`font-medium ${
                        transaction.transactionType === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.transactionType === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                    
                    {/* Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="font-medium text-white">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="font-medium text-white">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-1">
                      <span className="text-gray-400">Description:</span>
                      <div className="p-2 bg-gray-900 rounded border border-gray-700 text-white">
                        {transaction.description || 'No description'}
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="font-medium text-white">
                        {transaction.category || 'Uncategorized'}
                      </span>
                    </div>
                    
                    {/* Payment Method */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className="font-medium text-white">
                        {transaction.paymentMethod || 'Not specified'}
                      </span>
                    </div>
                    
                    {/* Reference */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Reference:</span>
                      <span className="font-medium text-white">
                        {transaction.reference || 'None'}
                      </span>
                    </div>
                    
                    {/* Tax Deductible */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tax Deductible:</span>
                      <span className="font-medium text-white">
                        {transaction.taxDeductible ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    {/* Source File */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className="font-medium text-white">
                        {transaction.sourceFile || 'Manual Entry'}
                      </span>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Recorded:</span>
                      <span className="font-medium text-white">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>
                    
                    {/* Verification Notes */}
                    <div className="space-y-1 pt-4 border-t border-gray-700">
                      <label className="text-gray-400">Verification Notes:</label>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-white"
                        rows={3}
                        placeholder="Add notes about this verification..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Verification Actions */}
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <button
                    onClick={handleFlagIssue}
                    className="px-4 py-2 bg-red-900/30 text-red-400 rounded-md hover:bg-red-900/50 transition-colors flex items-center"
                    disabled={verificationStatus === 'flagged'}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Flag Issue
                  </button>
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 bg-green-900/30 text-green-400 rounded-md hover:bg-green-900/50 transition-colors flex items-center"
                    disabled={verificationStatus === 'verified'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentComparison;
