import React from "react";
import { X, Download, FileText } from "lucide-react";

const TransactionDetails = ({ transaction, onClose, onDownloadPdf }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format amount for display
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return "N/A";
    return parseFloat(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-6 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Transaction Details</h2>
            <p className="text-sm text-blue-400 mt-1">
              {transaction.transactionType === "expense" ? "Expense" : "Income"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="border-t border-gray-800 my-2 pt-4"></div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Amount</h3>
              <p
                className={`text-xl font-bold ${
                  transaction.transactionType === "expense"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {transaction.transactionType === "expense" ? "-" : "+"}
                {formatAmount(transaction.amount)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Date</h3>
              <p className="text-white">{formatDate(transaction.date)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Description
              </h3>
              <p className="text-white">{transaction.description || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Category
              </h3>
              <p className="text-white">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                  {transaction.category || "Uncategorized"}
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Payment Method
              </h3>
              <p className="text-white">
                {transaction.paymentMethod || "Not specified"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Reference
              </h3>
              <p className="text-white">{transaction.reference || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Tax Deductible
              </h3>
              <p className="text-white">
                {transaction.taxDeductible ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Source File
              </h3>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                <p className="text-white">
                  {transaction.sourceFile || "Manual Entry"}
                </p>
                {transaction.sourceFile && (
                  <button
                    onClick={() =>
                      onDownloadPdf && onDownloadPdf(transaction.sourceFile)
                    }
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {transaction.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
              <div className="bg-gray-800 p-3 rounded-md text-gray-300">
                {transaction.notes}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
