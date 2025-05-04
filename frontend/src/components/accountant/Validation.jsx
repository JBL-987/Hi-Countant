import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  CheckSquare,
  FileWarning,
  Filter,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import DocumentComparison from "./DocumentComparison";
import {
  getDocumentPosition,
  hasDocumentPosition,
  getTransactionsForDocument,
} from "../../utils/documentPositionTracker";

const Validation = ({
  transactions,
  onViewTransaction,
  onExportTransactions,
  files,
  handleFileDownload,
}) => {
  const [validationResults, setValidationResults] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [verifiedTransactions, setVerifiedTransactions] = useState({});
  const [flaggedTransactions, setFlaggedTransactions] = useState({});

  // Function to check processed files
  const checkProcessedFiles = () => {
    const files = JSON.parse(localStorage.getItem("processedFiles") || "[]");
    setProcessedFiles(files);
  };

  // Load verification status from localStorage
  useEffect(() => {
    try {
      const verified = JSON.parse(
        localStorage.getItem("verifiedTransactions") || "{}"
      );
      const flagged = JSON.parse(
        localStorage.getItem("flaggedTransactions") || "{}"
      );
      setVerifiedTransactions(verified);
      setFlaggedTransactions(flagged);
    } catch (error) {
      console.error("Failed to load verification status:", error);
    }
  }, []);

  // Handle transaction verification
  const handleVerifyTransaction = (transactionId, notes) => {
    const newVerified = {
      ...verifiedTransactions,
      [transactionId]: {
        timestamp: new Date().toISOString(),
        notes: notes || "",
      },
    };

    // Remove from flagged if it was flagged before
    const newFlagged = { ...flaggedTransactions };
    if (newFlagged[transactionId]) {
      delete newFlagged[transactionId];
    }

    setVerifiedTransactions(newVerified);
    setFlaggedTransactions(newFlagged);

    // Save to localStorage
    localStorage.setItem("verifiedTransactions", JSON.stringify(newVerified));
    localStorage.setItem("flaggedTransactions", JSON.stringify(newFlagged));

    // Close the document comparison
    setSelectedTransaction(null);
  };

  // Handle flagging transaction issues
  const handleFlagTransaction = (transactionId, notes) => {
    const newFlagged = {
      ...flaggedTransactions,
      [transactionId]: {
        timestamp: new Date().toISOString(),
        notes: notes || "",
      },
    };

    // Remove from verified if it was verified before
    const newVerified = { ...verifiedTransactions };
    if (newVerified[transactionId]) {
      delete newVerified[transactionId];
    }

    setFlaggedTransactions(newFlagged);
    setVerifiedTransactions(newVerified);

    // Save to localStorage
    localStorage.setItem("flaggedTransactions", JSON.stringify(newFlagged));
    localStorage.setItem("verifiedTransactions", JSON.stringify(newVerified));

    // Close the document comparison
    setSelectedTransaction(null);
  };

  // Function to validate transaction
  const validateTransaction = (transaction) => {
    let status = "valid";
    let messages = [];

    // Check verification status
    if (verifiedTransactions[transaction.id]) {
      status = "valid";
      messages.push("Manually verified");
    } else if (flaggedTransactions[transaction.id]) {
      status = "error";
      messages.push(
        `Flagged: ${
          flaggedTransactions[transaction.id].notes || "Issue detected"
        }`
      );
    }

    // Check if the transaction has been verified against source document
    if (transaction.sourceFile) {
      // Check if the source file exists in the files list
      const fileExists = files.some(
        (file) => file.name === transaction.sourceFile
      );

      if (!fileExists) {
        messages.push("Source document unavailable");
        status = status === "valid" ? "warning" : status;
      } else if (!hasDocumentPosition(transaction.id)) {
        messages.push("Not verified against source document");
        status = status === "valid" ? "warning" : status;
      }
    }

    // Check if the transaction comes from a processed file
    if (
      transaction.sourceFile &&
      !processedFiles.includes(transaction.sourceFile)
    ) {
      messages.push("File not yet processed");
      status = status === "valid" ? "warning" : status;
    }

    // 1. Documentation Completeness Validation
    if (!transaction.description) {
      messages.push("Transaction description incomplete");
      status = "error";
    }

    // 2. Monetary Value Validation
    if (!transaction.amount || isNaN(parseFloat(transaction.amount))) {
      messages.push("Invalid transaction amount");
      status = "error";
    }

    // 3. Accounting Period Validation
    if (!transaction.date) {
      messages.push("Transaction date missing");
      status = "error";
    } else {
      const transactionDate = new Date(transaction.date);
      const currentDate = new Date();
      if (transactionDate > currentDate) {
        messages.push("Future dated transactions not allowed");
        status = "error";
      }
    }

    // 4. Classification Validation
    if (!transaction.category) {
      messages.push("Transaction category not specified");
      status = "warning";
    }
    if (!transaction.transactionType) {
      messages.push("Transaction type not specified");
      status = "error";
    }

    // 5. Consistency Validation
    if (
      transaction.transactionType === "income" &&
      parseFloat(transaction.amount) < 0
    ) {
      messages.push("Income amount must be positive");
      status = "error";
    }

    // 6. Reference Completeness
    if (
      !transaction.reference &&
      Math.abs(parseFloat(transaction.amount)) > 10000
    ) {
      messages.push("Large transactions require reference number");
      status = "warning";
    }

    return {
      id: transaction.id,
      type: "transaction",
      name: transaction.description || "Unnamed Transaction",
      status,
      message: messages.join("; "),
      date: transaction.date,
      details: {
        ...transaction,
        validationIssues: messages,
        isProcessed: transaction.sourceFile
          ? processedFiles.includes(transaction.sourceFile)
          : true,
      },
    };
  };

  // Filter and search functions
  const filteredResults = validationResults.filter((item) => {
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const errors = results.filter((r) => r.status === "error").length;
      const warnings = results.filter((r) => r.status === "warning").length;

      setComplianceStatus({
        materialityViolations: results.filter((r) =>
          r.message.includes("amount")
        ).length,
        documentationViolations: results.filter((r) =>
          r.message.includes("document")
        ).length,
        classificationErrors: results.filter((r) =>
          r.message.includes("category")
        ).length,
        timingErrors: results.filter((r) => r.message.includes("date")).length,
        totalErrors: errors,
        totalWarnings: warnings,
      });
    }
  }, [transactions, processedFiles]);

  // Calculate statistics
  const validCount = validationResults.filter(
    (item) => item.status === "valid"
  ).length;
  const warningCount = validationResults.filter(
    (item) => item.status === "warning"
  ).length;
  const errorCount = validationResults.filter(
    (item) => item.status === "error"
  ).length;

  const totalExpenses = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

  // Handle opening document comparison
  const handleOpenDocumentComparison = (transaction) => {
    setSelectedTransaction(transaction);
  };

  // Handle closing document comparison
  const handleCloseDocumentComparison = () => {
    setSelectedTransaction(null);
  };

  // Start the validation process
  const startValidationProcess = () => {
    // Show a confirmation dialog
    Swal.fire({
      title: "Start Validation Process?",
      text: "This will validate all transactions against their source documents. Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, start validation",
    }).then((result) => {
      if (result.isConfirmed) {
        // Show a loading dialog
        Swal.fire({
          title: "Validating Transactions...",
          html: `
            <div class="text-center">
              <div class="mb-3">Validating ${transactions.length} transactions</div>
              <div class="progress-bar-container" style="height: 10px; background-color: #333; border-radius: 5px; overflow: hidden;">
                <div id="validation-progress-bar" style="height: 100%; width: 0%; background-color: #3b82f6; transition: width 0.3s;"></div>
              </div>
              <div id="validation-progress-text" class="mt-2">Starting validation...</div>
            </div>
          `,
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            const progressBar = document.getElementById(
              "validation-progress-bar"
            );
            const progressText = document.getElementById(
              "validation-progress-text"
            );

            // Start with animation to show it's working
            progressBar.style.width = "5%";
            progressText.textContent = "Preparing to validate...";
          },
        });

        // Simulate validation process with progress updates
        setTimeout(async () => {
          const progressBar = document.getElementById(
            "validation-progress-bar"
          );
          const progressText = document.getElementById(
            "validation-progress-text"
          );

          // Get transactions that need validation
          const transactionsToValidate = transactions.filter(
            (t) =>
              t.sourceFile &&
              !verifiedTransactions[t.id] &&
              !flaggedTransactions[t.id]
          );

          const totalToValidate = transactionsToValidate.length;
          let validatedCount = 0;
          let sourceMissingCount = 0;
          let validCount = 0;
          let warningCount = 0;

          // Process transactions in batches
          for (let i = 0; i < transactionsToValidate.length; i++) {
            const transaction = transactionsToValidate[i];
            validatedCount++;

            // Update progress
            const progress =
              5 + Math.round((validatedCount / totalToValidate) * 95);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Validating transaction ${validatedCount}/${totalToValidate}`;

            // Check if source document exists
            const fileExists = files.some(
              (file) => file.name === transaction.sourceFile
            );
            if (!fileExists) {
              sourceMissingCount++;
            } else {
              // Perform validation checks
              const validationResult = validateTransaction(transaction);
              if (validationResult.status === "valid") {
                validCount++;
              } else if (validationResult.status === "warning") {
                warningCount++;
              }
            }

            // Small delay to keep UI responsive
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          // Final update
          progressBar.style.width = "100%";
          progressText.textContent = `Validation complete!`;

          // Close the loading dialog after a short delay
          setTimeout(() => {
            Swal.close();

            // Show validation results
            Swal.fire({
              title: "Validation Complete",
              html: `
                <div class="text-left">
                  <p>Validated ${validatedCount} transactions:</p>
                  <ul class="mt-2 list-disc pl-5">
                    <li class="text-green-500">${validCount} valid transactions</li>
                    <li class="text-yellow-500">${warningCount} transactions with warnings</li>
                    <li class="text-red-500">${sourceMissingCount} transactions with missing source documents</li>
                  </ul>
                  <p class="mt-4">Click on any transaction to verify it against its source document.</p>
                </div>
              `,
              icon: "success",
              confirmButtonText: "Continue",
            });
          }, 1000);
        }, 500);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Document Comparison Modal */}
      {selectedTransaction && (
        <DocumentComparison
          transaction={selectedTransaction}
          onClose={handleCloseDocumentComparison}
          onVerify={handleVerifyTransaction}
          onFlagIssue={handleFlagTransaction}
          handleFileDownload={handleFileDownload}
          files={files}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">
          Transaction Validation
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => startValidationProcess()}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Start Validation
          </button>
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
            <h3 className="text-gray-400 text-sm font-medium">
              Valid Transactions
            </h3>
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
        <h2 className="text-xl font-bold text-white mb-6">
          Validation Results
        </h2>
        <div className="divide-y divide-gray-800">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="py-4 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      item.status === "valid"
                        ? "bg-green-900/30"
                        : item.status === "warning"
                        ? "bg-yellow-900/30"
                        : "bg-red-900/30"
                    }`}
                  >
                    <ClipboardCheck
                      className={`h-5 w-5 ${
                        item.status === "valid"
                          ? "text-green-500"
                          : item.status === "warning"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      {verifiedTransactions[item.id] && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {flaggedTransactions[item.id] && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </span>
                      )}
                      {item.details.sourceFile && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                          <FileText className="h-3 w-3 mr-1" />
                          {item.details.sourceFile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "valid"
                        ? "bg-green-900/30 text-green-400"
                        : item.status === "warning"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {item.message}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenDocumentComparison(item.details)}
                      className="p-2 rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                      title="Verify against document"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewTransaction(item.details)}
                      className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                      title="View transaction details"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      {complianceStatus && (
        <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Compliance Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                GAAP Compliance
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Materiality Violations:</span>
                  <span
                    className={
                      complianceStatus.materialityViolations > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {complianceStatus.materialityViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Documentation Issues:</span>
                  <span
                    className={
                      complianceStatus.documentationViolations > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {complianceStatus.documentationViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Classification Errors:</span>
                  <span
                    className={
                      complianceStatus.classificationErrors > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {complianceStatus.classificationErrors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timing Errors:</span>
                  <span
                    className={
                      complianceStatus.timingErrors > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {complianceStatus.timingErrors}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Overall Status</h3>
              <div className="p-4 rounded-lg bg-gray-800">
                <div className="flex items-center space-x-2">
                  {complianceStatus.totalErrors === 0 &&
                  complianceStatus.totalWarnings === 0 ? (
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
