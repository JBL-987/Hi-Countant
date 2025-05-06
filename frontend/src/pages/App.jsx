import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Calculator,
  ClipboardCheck,
  PieChart,
  DollarSign,
  Search,
  Bell,
  Settings,
  Users,
  FileSpreadsheet,
  Menu,
  TrendingUp,
  ChevronRight,
  Receipt,
  Folder,
  Image,
} from "lucide-react";
import Swal from "sweetalert2";
import Logo from "../components/Logo";
import { storeDocumentPosition } from "../utils/documentPositionTracker";
import { validateTransactions } from '../utils/transactionUtils';

// Import Accountant components
import DataInput from "../components/accountant/DataInput";
import Workspace from "../components/accountant/Workspace";
import Validation from "../components/accountant/Validation";
import Analysis from "../components/accountant/Analysis";
import Reports from "../components/accountant/Reports";
import Recommendations from "../components/accountant/Recommendations";
import LogTrails from "../components/accountant/LogTrails";
import TransactionDetails from "../components/accountant/TransactionDetails";
import ProcessingLog from "../components/accountant/ProcessingLog";

// Import Advisor components
import FinancialPlanning from "../components/advisor/FinancialPlanning";
import Investment from "../components/advisor/Investment";
import TaxStrategy from "../components/advisor/TaxStrategy";

function App({ actor, isAuthenticated, login }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [fileTransferProgress, setFileTransferProgress] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState("");
  const [activeMainCategory, setActiveMainCategory] = useState("accountant");
  const [activeSubTab, setActiveSubTab] = useState("data-input");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [ManualEntries, setManualEntries] = useState([]);

  // Processing log state
  const [processingLogs, setProcessingLogs] = useState([]);
  const [showProcessingLog, setShowProcessingLog] = useState(false);
  const [minimizeProcessingLog, setMinimizeProcessingLog] = useState(false);

  // Transaction handling functions
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseTransactionDetails = () => {
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = (transactionId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Find the transaction to be deleted (for notification)
        const transactionToDelete = transactions.find(
          (t) => t.id === transactionId
        );
        const transactionDesc = transactionToDelete
          ? transactionToDelete.description ||
            `${transactionToDelete.transactionType} transaction`
          : "transaction";

        const filteredTransactions = transactions.filter(
          (t) => t.id !== transactionId
        );

        // Format transactions to match expected structure
        const formattedTransactions = filteredTransactions.map((t) => ({
          id: t.id,
          transactionType: t.transactionType,
          amount:
            typeof t.amount === "number"
              ? t.amount
              : parseFloat(t.amount || "0"),
          date: t.date || "",
          description: t.description || "",
          category: t.category || null,
          paymentMethod: t.paymentMethod || null,
          reference: t.reference || null,
          taxDeductible: !!t.taxDeductible,
          sourceFile: t.sourceFile || null,
          timestamp: t.timestamp || new Date().toISOString(),
        }));

        setTransactions(formattedTransactions);

        try {
          // Save updated transactions to localStorage
          console.log(
            "Saving updated transactions after deletion to localStorage:",
            formattedTransactions
          );
          localStorage.setItem(
            "transactions",
            JSON.stringify(formattedTransactions)
          );

          // Show non-intrusive toast notification
          import("../utils/toastNotification").then(({ showToast }) => {
            showToast(
              `Transaction "${transactionDesc}" deleted successfully`,
              "success"
            );
          });

          // Add to processing log
          addProcessingLog(`Deleted transaction: ${transactionDesc}`, "info");
        } catch (error) {
          console.error("Failed to delete transaction:", error);

          // Show error toast
          import("../utils/toastNotification").then(({ showToast }) => {
            showToast(
              `Failed to delete transaction: ${error.message}`,
              "error"
            );
          });

          // Add to processing log
          addProcessingLog(
            `Failed to delete transaction: ${error.message}`,
            "error"
          );
        }
      }
    });
  };

  const handleDeleteAllTransactions = () => {
    if (transactions.length === 0) {
      // Import and use the toast notification
      import("../utils/toastNotification").then(({ showToast }) => {
        showToast("No transactions to delete", "info");
      });
      return;
    }

    Swal.fire({
      title: "Delete All Transactions?",
      text: "This will permanently delete ALL transactions. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Get the count for the notification
          const count = transactions.length;

          // IMMEDIATELY show a loading dialog that can't be dismissed
          Swal.fire({
            title: "Deleting Transactions...",
            html: `
              <div class="text-center">
                <div class="mb-3">Deleting ${count} transactions</div>
                <div class="progress-bar-container" style="height: 10px; background-color: #333; border-radius: 5px; overflow: hidden;">
                  <div id="delete-progress-bar" style="height: 100%; width: 0%; background-color: #dc3545; transition: width 0.3s;"></div>
                </div>
                <div id="delete-progress-text" class="mt-2">Starting deletion...</div>
              </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              const progressBar = document.getElementById(
                "delete-progress-bar"
              );
              const progressText = document.getElementById(
                "delete-progress-text"
              );

              // Start with animation to show it's working
              progressBar.style.width = "5%";
              progressText.textContent = "Preparing to delete...";
            },
          });

          // Wait a moment to show the dialog
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Process in batches to update the UI
          const batchSize = 100;
          const batches = Math.ceil(count / batchSize);
          const progressBar = document.getElementById("delete-progress-bar");
          const progressText = document.getElementById("delete-progress-text");

          // Process in batches
          for (let i = 0; i < batches; i++) {
            // Update progress
            const progress = Math.round(((i + 1) / batches) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Deleting transactions (${Math.min(
              (i + 1) * batchSize,
              count
            )}/${count})`;

            // Simulate batch processing with a small delay to update UI
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Clear transactions from localStorage
          localStorage.setItem("transactions", JSON.stringify([]));

          // Clear transactions from state
          setTransactions([]);

          // Final update
          progressBar.style.width = "100%";
          progressText.textContent = `Deleted ${count} transactions successfully!`;

          // Close the loading dialog after a short delay
          setTimeout(() => {
            Swal.close();

            // Show success notification
            import("../utils/toastNotification").then(({ showToast }) => {
              showToast(
                `Successfully deleted ${count} transactions`,
                "success"
              );
            });
          }, 1000);

          // Add to processing log
          addProcessingLog(
            `Deleted ${count} transactions from log trails`,
            "info"
          );
        } catch (error) {
          console.error("Failed to delete all transactions:", error);

          // Show error toast
          import("../utils/toastNotification").then(({ showToast }) => {
            showToast(
              `Failed to delete transactions: ${error.message}`,
              "error"
            );
          });

          // Add to processing log
          addProcessingLog(
            `Failed to delete transactions: ${error.message}`,
            "error"
          );
        }
      }
    });
  };

  const handleExportTransactions = () => {
    // Create CSV content
    const headers = [
      "Date",
      "Type",
      "Description",
      "Category",
      "Amount",
      "Payment Method",
      "Reference",
      "Tax Deductible",
      "Source File",
    ];
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [
          t.date || "",
          t.transactionType || "",
          `"${(t.description || "").replace(/"/g, '""')}"`, // Escape quotes in description
          t.category || "",
          t.amount || 0,
          t.paymentMethod || "",
          t.reference || "",
          t.taxDeductible ? "Yes" : "No",
          t.sourceFile || "Manual Entry",
        ].join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processing log functions
  const addProcessingLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setProcessingLogs((prev) => [...prev, { message, type, timestamp }]);

    // Show the log window if it's not already visible
    if (!showProcessingLog) {
      setShowProcessingLog(true);
    }
  };

  const clearProcessingLogs = () => {
    setProcessingLogs([]);
  };

  const closeProcessingLog = () => {
    setShowProcessingLog(false);
    clearProcessingLogs();
  };

  const toggleMinimizeProcessingLog = () => {
    setMinimizeProcessingLog((prev) => !prev);
  };

  // Helper function to extract JSON from text
  function extractJsonFromText(text) {
    console.log("Attempting to extract JSON from text");

    // First, check if the text is already valid JSON
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("Text is already valid JSON array");
        return text;
      }
    } catch (e) {
      // Not valid JSON, continue with extraction
    }

    // Handle the specific format we're seeing in the logs
    if (text.includes("```json") && text.includes("```")) {
      console.log("Found markdown JSON code block");
      // Extract content between ```json and ```
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        const jsonContent = match[1].trim();
        console.log(
          "Extracted from code block:",
          jsonContent.substring(0, 50) + "..."
        );
        return jsonContent;
      }
    }

    // Try to extract from any markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const potentialJson = codeBlockMatch[1].trim();
      console.log(
        "Found content in code block:",
        potentialJson.substring(0, 50) + "..."
      );

      // Check if it starts with [ and ends with ]
      if (potentialJson.startsWith("[") && potentialJson.endsWith("]")) {
        return potentialJson;
      }
    }

    // Look for anything that looks like a JSON array
    const jsonPattern = /\[\s*\{\s*"[^"]+"\s*:[\s\S]*?\}\s*\]/g;
    const jsonMatches = text.match(jsonPattern);
    if (jsonMatches && jsonMatches.length > 0) {
      console.log("Found JSON-like array pattern");
      return jsonMatches[0];
    }

    // Most aggressive approach - just find everything between the first [ and the last ]
    const startBracket = text.indexOf("[");
    const endBracket = text.lastIndexOf("]");

    if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
      console.log("Extracting everything between first [ and last ]");
      return text.substring(startBracket, endBracket + 1).trim();
    }

    // If all else fails, try to find individual JSON objects and combine them
    const objectPattern = /\{\s*"[^"]+"\s*:[\s\S]*?(?:\}\s*,|\}$)/g;
    const matches = Array.from(text.matchAll(objectPattern));
    if (matches && matches.length > 0) {
      console.log(`Found ${matches.length} potential JSON objects`);
      const objects = matches.map((match) => {
        let obj = match[0].trim();
        if (obj.endsWith(",")) {
          obj = obj.slice(0, -1);
        }
        return obj;
      });
      return "[" + objects.join(",") + "]";
    }

    console.log("Could not extract JSON from text");
    return null;
  }

  const GEMINI_API_KEY = "AIzaSyCH6esa0di5rgxVJHq8Os2YaBIMzFAOUgc";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (actor) {
      loadFiles();
      loadTransactions();
    }
  }, [actor, isAuthenticated, navigate]);

  // Helper function to check if two transactions are duplicates
  function areTransactionsDuplicate(t1, t2) {
    // Check if key fields match
    return (
      t1.date === t2.date &&
      Math.abs(parseFloat(t1.amount) - parseFloat(t2.amount)) < 0.01 && // Allow for small floating point differences
      t1.description === t2.description &&
      t1.transactionType === t2.transactionType
    );
  }

  // Helper function to remove duplicate transactions from an array
  function removeDuplicateTransactions(transactions) {
    const uniqueTransactions = [];

    for (const transaction of transactions) {
      // Check if this transaction is a duplicate of any we've already added
      const isDuplicate = uniqueTransactions.some((existingTransaction) =>
        areTransactionsDuplicate(existingTransaction, transaction)
      );

      // If it's not a duplicate, add it to our unique list
      if (!isDuplicate) {
        uniqueTransactions.push(transaction);
      }
    }

    return uniqueTransactions;
  }

  // Load transactions from localStorage
  function loadTransactions() {
    try {
      console.log("Loading transactions from localStorage...");
      const storedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
      console.log("Transactions loaded from localStorage:", storedTransactions);

      if (storedTransactions && storedTransactions.length > 0) {
        console.log(
          `Setting ${storedTransactions.length} transactions from localStorage`
        );

        // Format transactions to ensure they match our expected structure
        const formattedTransactions = storedTransactions.map((t) => ({
          id:
            t.id ||
            `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          transactionType: t.transactionType,
          amount:
            typeof t.amount === "number"
              ? t.amount
              : parseFloat(t.amount || "0"),
          date: t.date || "",
          description: t.description || "",
          category: t.category || null,
          paymentMethod: t.paymentMethod || null,
          reference: t.reference || null,
          taxDeductible: !!t.taxDeductible,
          sourceFile: t.sourceFile || null,
          timestamp: t.timestamp || new Date().toISOString(),
        }));

        // Remove any duplicate transactions
        const uniqueTransactions = removeDuplicateTransactions(
          formattedTransactions
        );

        if (uniqueTransactions.length < formattedTransactions.length) {
          console.log(
            `Removed ${
              formattedTransactions.length - uniqueTransactions.length
            } duplicate transactions`
          );

          // Save the deduplicated transactions back to localStorage
          localStorage.setItem(
            "transactions",
            JSON.stringify(uniqueTransactions)
          );
        }

        console.log("Formatted transactions:", uniqueTransactions);
        setTransactions(uniqueTransactions);
      } else {
        console.log("No transactions found in localStorage");
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      addProcessingLog(
        `Failed to load transactions: ${error.message}`,
        "error"
      );
    }
  }

  // This component is now replaced by the inline analysis result display

  async function processDocumentWithAI(fileContent, fileName) {
    try {
      setAnalyzingFile(fileName);

      Swal.fire({
        title: "Processing document...",
        text: `Analyzing ${fileName} with Gemini AI`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Prepare the content for Gemini API
      // Truncate if necessary as Gemini has token limits
      const truncatedContent =
        fileContent.length > 30000
          ? fileContent.substring(0, 30000) +
            "... [content truncated due to length]"
          : fileContent;

      // Construct a prompt that's specific to extracting transaction data
      const prompt = `You are Hi! Countant, an AI accountant assistant. Please analyze this document and extract ALL financial transaction information.

IMPORTANT: This file likely contains financial transaction data. You MUST extract UNIQUE transactions and return them as an array of transaction objects.

PAY SPECIAL ATTENTION TO TABULAR DATA: If the file contains a table of transactions, extract each row as a separate transaction. Look for patterns like dates, amounts, descriptions, etc. in columns.

BE EXTREMELY THOROUGH BUT AVOID DUPLICATES: Scan the entire document carefully, but make sure each transaction is only included ONCE in your output. If you see the same transaction multiple times (same date, amount, and description), only include it once.

For each UNIQUE transaction, extract the following specific information:
1. Transaction type: Determine based on context - use "expense" for debits/payments/outgoing funds and "income" for credits/deposits/incoming funds
2. Amount: Extract numeric value only (no currency symbols)
3. Date: Convert to YYYY-MM-DD format
4. Description: Use the transaction description or memo field
5. Category: Extract from document or infer from description
6. Payment method: Extract if available
7. Reference number: Extract if available
8. Is it tax deductible: Set to true for business expenses, false for personal or non-deductible items

Return ONLY a valid JSON array with these fields. If you can't determine a value, use null.

ALWAYS return an array of UNIQUE transactions:
[
  {
    "transactionType": "expense",
    "amount": 125.50,
    "date": "2023-05-15",
    "description": "Office supplies purchase",
    "category": "Office Supplies",
    "paymentMethod": "credit card",
    "reference": "INV-12345",
    "taxDeductible": true
  }
]

For tables with "Debit" and "Credit" columns:
- Transactions with values in the "Debit" column should be "expense" type
- Transactions with values in the "Credit" column should be "income" type
- Use the amount from whichever column has a value

For bank statements or financial reports:
- Extract each line item in the statement ONLY ONCE
- Pay attention to transaction dates, descriptions, and amounts
- Look for transaction codes, reference numbers, or categories
- If there are running balances, focus on the individual transactions, not the balance
- If the same transaction appears multiple times (e.g., in a summary and detail section), only include it once

EXTREMELY IMPORTANT: Your response must ONLY contain the raw JSON array with UNIQUE transactions. Do not include any explanations, markdown formatting, or code blocks. Just return the raw JSON array starting with [ and ending with ]. Nothing else.

Document: ${truncatedContent}`;

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Gemini API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const result = await response.json();
      Swal.close();

      // Extract the content from Gemini's response format
      const content = result.candidates[0].content.parts[0].text;

      // Try to parse the JSON from the response
      try {
        console.log("Full content from Gemini:", content);

        // Use our helper function to extract JSON
        const jsonStr = extractJsonFromText(content);

        if (jsonStr) {
          console.log(
            "Extracted JSON string (first 100 chars):",
            jsonStr.substring(0, 100) + "..."
          );

          try {
            const transactions = JSON.parse(jsonStr);

            console.log(
              `Extracted ${transactions.length} transactions from ${fileName}`
            );

            // Add the extracted transactions to our state
            // Always process if this file was explicitly selected for processing
            if (analyzingFile === fileName) {
              // Add file reference and timestamp to each transaction
              const timestampedTransactions = transactions.map(
                (transaction) => ({
                  ...transaction,
                  sourceFile: fileName,
                  timestamp: new Date().toISOString(),
                  id: `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 9)}`,
                })
              );

              // Fix: We need to make sure the transaction structure matches what the backend expects
              const formattedTransactions = timestampedTransactions.map(
                (t) => ({
                  id: t.id,
                  transactionType: t.transactionType,
                  amount:
                    typeof t.amount === "number"
                      ? t.amount
                      : parseFloat(t.amount || "0"),
                  date: t.date || "",
                  description: t.description || "",
                  category: t.category || null,
                  paymentMethod: t.paymentMethod || null,
                  reference: t.reference || null,
                  taxDeductible: !!t.taxDeductible,
                  sourceFile: t.sourceFile || null,
                  timestamp: t.timestamp || new Date().toISOString(),
                })
              );

              // Load the most current transactions from localStorage to avoid overriding
              const currentStoredTransactions = JSON.parse(
                localStorage.getItem("transactions") || "[]"
              );

              // Create a map of existing transaction IDs to avoid duplicates
              const existingTransactionIds = new Map();
              currentStoredTransactions.forEach((t) => {
                existingTransactionIds.set(t.id, true);
              });

              // Filter out any transactions that might be duplicates
              const uniqueNewTransactions = formattedTransactions.filter(
                (t) => !existingTransactionIds.has(t.id)
              );

              // Combine existing transactions with new unique ones
              const updatedTransactions = [
                ...currentStoredTransactions,
                ...uniqueNewTransactions,
              ];

              setTransactions(updatedTransactions);

              // Save to localStorage
              try {
                console.log(
                  "Saving transactions to localStorage:",
                  updatedTransactions
                );
                localStorage.setItem(
                  "transactions",
                  JSON.stringify(updatedTransactions)
                );
                console.log("Transactions saved successfully to localStorage");
              } catch (error) {
                console.error(
                  "Failed to save transactions to localStorage:",
                  error
                );
                console.error("Error details:", error);
              }
            }

            // Show the extracted data in a popup for review
            Swal.fire({
              icon: "success",
              title: "Document Processed",
              html: `
                <div class="text-left">
                  <p>Successfully extracted and added ${
                    transactions.length
                  } transactions from ${fileName} to log trails</p>
                  <div class="mt-4">
                    <h3 class="text-lg font-bold mb-2">Extracted Transactions:</h3>
                    <div class="bg-gray-100 p-3 rounded max-h-60 overflow-auto text-sm">
                      <pre>${JSON.stringify(
                        transactions.slice(0, 10),
                        null,
                        2
                      )}${
                transactions.length > 10
                  ? "\n\n... and " +
                    (transactions.length - 10) +
                    " more transactions"
                  : ""
              }</pre>
                    </div>
                  </div>
                </div>
              `,
              width: "600px",
            });

            // Mark file as processed in localStorage
            const processedFiles = JSON.parse(
              localStorage.getItem("processedFiles") || "[]"
            );
            if (!processedFiles.includes(fileName)) {
              processedFiles.push(fileName);
              localStorage.setItem(
                "processedFiles",
                JSON.stringify(processedFiles)
              );
            }

            return { transactions, rawContent: content };
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            throw new Error("Failed to parse JSON: " + parseError.message);
          }
        } else {
          console.log("No valid JSON string found");
          throw new Error("No valid JSON found in the response");
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON from Gemini response:", jsonError);
        console.log("Raw content:", content);

        Swal.fire({
          icon: "warning",
          title: "Processing Issue",
          text: "The document was processed, but we couldn't extract structured transaction data. Please try again or use manual entry.",
        });

        return { rawContent: content };
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: `Failed to process ${fileName}: ${error.message}`,
      });
      console.error("AI processing failed:", error);
      setAnalyzingFile("");
      return null;
    } finally {
      setAnalyzingFile("");
    }
  }

  // Function to process binary files (PDFs, images, etc.) using Gemini's multimodal capabilities
  async function processDocumentWithBinaryData(
    base64Data,
    fileName,
    fileTypeContext,
    mimeType,
    silentMode = false
  ) {
    try {
      setAnalyzingFile(fileName);
      addProcessingLog(`Starting Gemini AI processing for ${fileName}`, "info");

      // Only show the processing popup if not in silent mode
      if (!silentMode) {
        Swal.fire({
          title: "Processing document...",
          text: `Analyzing ${fileName} with Gemini AI`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }

      // Construct the API request with multimodal content (text + image/PDF)
      addProcessingLog(`Preparing API request to Gemini`, "info");
      addProcessingLog(`Using model: gemini-2.5-flash-preview-04-17`, "info");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Hi! Countant, an AI accountant assistant. Please analyze this ${fileTypeContext} file and extract ALL financial transaction information.

IMPORTANT: This file likely contains financial transaction data. You MUST extract UNIQUE transactions and return them as an array of transaction objects.

PAY SPECIAL ATTENTION TO TABULAR DATA: If the file contains a table of transactions, extract each row as a separate transaction. Look for patterns like dates, amounts, descriptions, etc. in columns.

BE EXTREMELY THOROUGH BUT AVOID DUPLICATES: Scan the entire document carefully, but make sure each transaction is only included ONCE in your output. If you see the same transaction multiple times (same date, amount, and description), only include it once.

For each UNIQUE transaction, extract the following specific information:
1. Transaction type: Determine based on context - use "expense" for debits/payments/outgoing funds and "income" for credits/deposits/incoming funds
2. Amount: Extract numeric value only (no currency symbols)
3. Date: Convert to YYYY-MM-DD format
4. Description: Use the transaction description or memo field
5. Category: Extract from document or infer from description
6. Payment method: Extract if available
7. Reference number: Extract if available
8. Is it tax deductible: Set to true for business expenses, false for personal or non-deductible items

Return ONLY a valid JSON array with these fields. If you can't determine a value, use null.

ALWAYS return an array of UNIQUE transactions:
[
  {
    "transactionType": "expense",
    "amount": 125.50,
    "date": "2023-05-15",
    "description": "Office supplies purchase",
    "category": "Office Supplies",
    "paymentMethod": "credit card",
    "reference": "INV-12345",
    "taxDeductible": true
  }
]

For tables with "Debit" and "Credit" columns:
- Transactions with values in the "Debit" column should be "expense" type
- Transactions with values in the "Credit" column should be "income" type
- Use the amount from whichever column has a value

For PDF bank statements or financial reports:
- Extract each line item in the statement ONLY ONCE
- Pay attention to transaction dates, descriptions, and amounts
- Look for transaction codes, reference numbers, or categories
- If there are running balances, focus on the individual transactions, not the balance
- If the same transaction appears multiple times (e.g., in a summary and detail section), only include it once

EXTREMELY IMPORTANT: Your response must ONLY contain the raw JSON array with UNIQUE transactions. Do not include any explanations, markdown formatting, or code blocks. Just return the raw JSON array starting with [ and ending with ]. Nothing else.

File name: ${fileName}`,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      addProcessingLog(`Sending request to Gemini API...`, "info");

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || response.statusText;
        addProcessingLog(`Gemini API error: ${errorMessage}`, "error");
        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      addProcessingLog(`Received response from Gemini API`, "success");
      const result = await response.json();
      Swal.close();

      // Extract the content from Gemini's response format
      const content = result.candidates[0].content.parts[0].text;
      addProcessingLog(`Response size: ${content.length} characters`, "info");

      // Try to parse the JSON from the response
      try {
        console.log("Binary processing - Full content from Gemini:", content);
        addProcessingLog(`Attempting to extract JSON from response`, "info");

        // Use our helper function to extract JSON
        const jsonStr = extractJsonFromText(content);

        if (jsonStr) {
          console.log(
            "Binary processing - Extracted JSON string (first 100 chars):",
            jsonStr.substring(0, 100) + "..."
          );
          addProcessingLog(`JSON data found in response`, "success");

          try {
            addProcessingLog(`Parsing JSON data...`, "info");
            const transactions = JSON.parse(jsonStr);

            console.log(
              `Extracted ${transactions.length} transactions from ${fileName}`
            );
            addProcessingLog(
              `Successfully extracted ${transactions.length} transactions`,
              "success"
            );

            // ALWAYS add transactions to log trails when a file is explicitly processed
            // This ensures that when a user clicks "Process File", the transactions are added
            addProcessingLog(`Adding transactions to log trails`, "info");

            // Add file reference, timestamp, and position data to each transaction
            const timestampedTransactions = transactions.map((transaction) => {
              // Generate a unique ID for this transaction
              const transactionId = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`;

              // Store document position data for validation
              const extractionData = {
                pageNumber: transaction.pageNumber || 1,
                lineNumber: transaction.lineNumber || null,
                position: transaction.position || null,
                extractedText: transaction.description || null,
                confidence: transaction.confidence || 0.9,
                extractionMethod: "gemini-ai",
              };

              // Store the position data for this transaction
              storeDocumentPosition(transactionId, fileName, extractionData);

              // Return the transaction with additional metadata
              return {
                ...transaction,
                sourceFile: fileName,
                timestamp: new Date().toISOString(),
                id: transactionId,
              };
            });

            // Fix: We need to make sure the transaction structure matches what the backend expects
            const formattedTransactions = timestampedTransactions.map((t) => ({
              id: t.id,
              transactionType: t.transactionType,
              amount:
                typeof t.amount === "number"
                  ? t.amount
                  : parseFloat(t.amount || "0"),
              date: t.date || "",
              description: t.description || "",
              category: t.category || null,
              paymentMethod: t.paymentMethod || null,
              reference: t.reference || null,
              taxDeductible: !!t.taxDeductible,
              sourceFile: t.sourceFile || null,
              timestamp: t.timestamp || new Date().toISOString(),
            }));

            // Load the most current transactions from localStorage to avoid overriding
            const currentStoredTransactions = JSON.parse(
              localStorage.getItem("transactions") || "[]"
            );

            // Create a map of existing transaction IDs to avoid duplicates
            const existingTransactionIds = new Map();
            currentStoredTransactions.forEach((t) => {
              existingTransactionIds.set(t.id, true);
            });

            // Filter out any transactions that might be duplicates
            const uniqueNewTransactions = formattedTransactions.filter(
              (t) => !existingTransactionIds.has(t.id)
            );

            // Combine existing transactions with new unique ones
            const updatedTransactions = [
              ...currentStoredTransactions,
              ...uniqueNewTransactions,
            ];

            setTransactions(updatedTransactions);

            // Save to localStorage
            try {
              console.log(
                "Saving transactions to localStorage:",
                updatedTransactions
              );
              localStorage.setItem(
                "transactions",
                JSON.stringify(updatedTransactions)
              );
              console.log("Transactions saved successfully to localStorage");
              addProcessingLog(`Transactions saved to localStorage`, "success");
            } catch (error) {
              console.error(
                "Failed to save transactions to localStorage:",
                error
              );
              console.error("Error details:", error);
              addProcessingLog(
                `Failed to save transactions to localStorage: ${error.message}`,
                "error"
              );
            }

            addProcessingLog(
              `${timestampedTransactions.length} transactions added to log trails`,
              "success"
            );

            // Now we can clear the analyzingFile state
            setAnalyzingFile("");

            // Mark file as processed in localStorage
            const processedFiles = JSON.parse(
              localStorage.getItem("processedFiles") || "[]"
            );
            if (!processedFiles.includes(fileName)) {
              processedFiles.push(fileName);
              localStorage.setItem(
                "processedFiles",
                JSON.stringify(processedFiles)
              );
              addProcessingLog(`Marked ${fileName} as processed`, "info");
            }

            // Show the extracted data in a popup for review (if not in silent mode)
            if (!silentMode) {
              Swal.fire({
                icon: "success",
                title: "Document Processed",
                html: `
                  <div class="text-left">
                    <p>Successfully extracted and added ${
                      transactions.length
                    } transaction${
                  transactions.length !== 1 ? "s" : ""
                } from ${fileName} to log trails.</p>
                    <div class="mt-4">
                      <h3 class="text-lg font-bold mb-2">Extracted Transactions:</h3>
                      <div class="bg-gray-100 p-3 rounded max-h-60 overflow-auto text-sm">
                        <pre>${JSON.stringify(
                          transactions.slice(0, 10),
                          null,
                          2
                        )}${
                  transactions.length > 10
                    ? "\n\n... and " +
                      (transactions.length - 10) +
                      " more transactions"
                    : ""
                }</pre>
                      </div>
                    </div>
                  </div>
                `,
                width: "600px",
              });
            }

            return { transactions, rawContent: content };
          } catch (parseError) {
            console.error(
              "Binary processing - Error parsing JSON:",
              parseError
            );
            addProcessingLog(
              `Error parsing JSON: ${parseError.message}`,
              "error"
            );
            throw new Error("Failed to parse JSON: " + parseError.message);
          }
        } else {
          console.log("Binary processing - No valid JSON string found");
          addProcessingLog(`No valid JSON found in the response`, "error");
          throw new Error("No valid JSON found in the response");
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON from Gemini response:", jsonError);
        console.log("Raw content:", content);
        addProcessingLog(
          `Failed to extract structured data: ${jsonError.message}`,
          "warning"
        );

        // Show a more detailed error message with options (if not in silent mode)
        if (!silentMode) {
          Swal.fire({
            icon: "warning",
            title: "Processing Issue",
            html: `
              <div class="text-left">
                <p>The document was processed, but we couldn't extract structured transaction data.</p>
                <p class="mt-2">This could be due to:</p>
                <ul class="list-disc pl-5 mt-1 text-sm">
                  <li>Document format not being recognized properly</li>
                  <li>No clear transaction data in the document</li>
                  <li>AI model limitations in extracting this specific format</li>
                </ul>
                <p class="mt-2">You can:</p>
                <ul class="list-disc pl-5 mt-1 text-sm">
                  <li>Try processing again</li>
                  <li>Use manual data entry instead</li>
                  <li>Try a different document format</li>
                </ul>
              </div>
            `,
            confirmButtonText: "OK",
          });
        }

        // Don't mark the file as processed since we couldn't extract data
        setAnalyzingFile(""); // Clear the analyzing state
        return { rawContent: content };
      }
    } catch (error) {
      if (!silentMode) {
        Swal.close();
      }
      addProcessingLog(`Processing failed: ${error.message}`, "error");

      if (!silentMode) {
        Swal.fire({
          icon: "error",
          title: "Processing Failed",
          text: `Failed to process ${fileName}: ${error.message}`,
        });
      }
      console.error("AI processing failed:", error);
      setAnalyzingFile("");
      return null;
    } finally {
      // Don't clear analyzingFile here, as it's needed for the transaction processing logic
      // We'll clear it after transactions are added to log trails
      addProcessingLog(`Processing completed for ${fileName}`, "info");
    }
  }

  async function loadFiles() {
    setIsLoading(true);
    try {
      const fileList = await actor.getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error("Failed to load files:", error);
      setErrorMessage("Failed to load files. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Failed to load files. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    handleUploadLogic(file);
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadLogic(e.dataTransfer.files[0]);
    }
  };

  async function handleUploadLogic(file) {
    setErrorMessage(null);

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a file to upload.",
      });
      return;
    }

    try {
      const fileExists = await actor.checkFileExists(file.name);
      if (fileExists) {
        setErrorMessage(
          `File "${file.name}" already exists. Please choose a different file name.`
        );
        Swal.fire({
          icon: "warning",
          title: "File Already Exists",
          text: `File "${file.name}" already exists. Please choose a different file name.`,
        });
        return;
      }

      setFileTransferProgress({
        mode: "Uploading",
        fileName: file.name,
        progress: 0,
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = new Uint8Array(e.target.result);
        const chunkSize = 1024 * 1024;
        const totalChunks = Math.ceil(content.length / chunkSize);

        try {
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, content.length);
            const chunk = content.slice(start, end);

            await actor.uploadFileChunk(file.name, chunk, BigInt(i), file.type);
            setFileTransferProgress((prev) => ({
              ...prev,
              progress: Math.floor(((i + 1) / totalChunks) * 100),
            }));
          }

          Swal.fire({
            icon: "success",
            title: "Upload Complete",
            text: `${file.name} has been uploaded successfully!`,
          });
        } catch (error) {
          console.error("Upload failed:", error);
          setErrorMessage(`Failed to upload ${file.name}: ${error.message}`);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: `Failed to upload ${file.name}: ${error.message}`,
          });
        } finally {
          await loadFiles();
          setFileTransferProgress(null);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error checking file exists:", error);
      setErrorMessage(`Error: ${error.message}`);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error: ${error.message}`,
      });
    }
  }

  // Function to process all documents
  async function handleProcessAllFiles() {
    try {
      // Check if there are any files to process
      if (files.length === 0) {
        import("../utils/toastNotification").then(({ showToast }) => {
          showToast("No documents to process", "info");
        });
        return;
      }

      // Show confirmation dialog
      Swal.fire({
        title: "Process All Documents?",
        text: `This will process all ${files.length} documents. Continue?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, process all!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Show processing log
          setShowProcessingLog(true);
          clearProcessingLogs();
          addProcessingLog(
            `Starting to process all ${files.length} files`,
            "info"
          );

          // IMMEDIATELY show a loading dialog that can't be dismissed
          Swal.fire({
            title: "Processing Documents...",
            html: `
              <div class="text-center">
                <div class="mb-3">Processing ${files.length} documents</div>
                <div class="progress-bar-container" style="height: 10px; background-color: #333; border-radius: 5px; overflow: hidden;">
                  <div id="process-progress-bar" style="height: 100%; width: 0%; background-color: #3b82f6; transition: width 0.3s;"></div>
                </div>
                <div id="process-progress-text" class="mt-2">Starting processing...</div>
              </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              const progressBar = document.getElementById(
                "process-progress-bar"
              );
              const progressText = document.getElementById(
                "process-progress-text"
              );

              // Start with animation to show it's working
              progressBar.style.width = "5%";
              progressText.textContent = "Preparing to process...";
            },
          });

          // Wait a moment to show the dialog
          await new Promise((resolve) => setTimeout(resolve, 300));

          const progressBar = document.getElementById("process-progress-bar");
          const progressText = document.getElementById("process-progress-text");

          // Get list of unprocessed files
          const processedFiles = JSON.parse(
            localStorage.getItem("processedFiles") || "[]"
          );

          const unprocessedFiles = files.filter(
            (file) => !processedFiles.includes(file.name)
          );
          const totalFiles = unprocessedFiles.length;

          if (totalFiles === 0) {
            progressBar.style.width = "100%";
            progressText.textContent =
              "All documents have already been processed!";

            // Close the loading dialog after a short delay
            setTimeout(() => {
              Swal.close();

              // Show info notification
              import("../utils/toastNotification").then(({ showToast }) => {
                showToast(`All documents have already been processed`, "info");
              });
            }, 1500);
            return;
          }

          // Process files one by one
          let processedCount = 0;
          let successCount = 0;
          let errorCount = 0;

          for (const file of unprocessedFiles) {
            processedCount++;

            // Update progress
            const progress = 5 + Math.round((processedCount / totalFiles) * 95); // Start at 5% and go to 100%
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Processing document ${processedCount}/${totalFiles}: ${file.name}`;

            try {
              addProcessingLog(`Processing file: ${file.name}`, "info");

              // Get the file data
              const fileData = await handleFileDownload(file.name, true);

              if (fileData) {
                // Determine file type
                const fileType = file.name.split(".").pop().toLowerCase();
                const isTextBased = ["txt", "csv", "json"].includes(fileType);
                const isSpreadsheet = ["xlsx", "xls", "ods"].includes(fileType);
                const isDocument = ["doc", "docx", "odt"].includes(fileType);
                const isPDF = fileType === "pdf";
                const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                  fileType
                );

                if (isTextBased) {
                  // Process text-based files
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const fileContent = e.target.result;
                    const contentWithContext = `This is a text file.\n\nFile name: ${file.name}\n\nContent:\n${fileContent}`;
                    await processDocumentWithAI(contentWithContext, file.name);
                  };
                  reader.readAsText(fileData);
                } else {
                  // Process binary files
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const base64Content = e.target.result.split(",")[1];

                    // Determine file type for context
                    let fileTypeContext = "";
                    if (isSpreadsheet) fileTypeContext = "spreadsheet";
                    if (isDocument) fileTypeContext = "document";
                    if (isPDF) fileTypeContext = "PDF";
                    if (isImage) fileTypeContext = "image";

                    // Process with Gemini in silent mode
                    await processDocumentWithBinaryData(
                      base64Content,
                      file.name,
                      fileTypeContext,
                      `application/${fileType}`,
                      true // Silent mode
                    );
                  };
                  reader.readAsDataURL(fileData);
                }

                successCount++;
              } else {
                errorCount++;
                addProcessingLog(
                  `Failed to download file: ${file.name}`,
                  "error"
                );
              }
            } catch (error) {
              errorCount++;
              addProcessingLog(
                `Error processing file ${file.name}: ${error.message}`,
                "error"
              );
            }

            // Small delay to keep UI responsive
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          // Final update
          progressBar.style.width = "100%";
          progressText.textContent = `Processed ${successCount} documents successfully! (${errorCount} errors)`;

          // Close the loading dialog after a short delay
          setTimeout(() => {
            Swal.close();

            // Show success notification
            import("../utils/toastNotification").then(({ showToast }) => {
              showToast(
                `Processed ${successCount} documents (${errorCount} errors)`,
                successCount > 0 ? "success" : "warning"
              );
            });
          }, 1500);

          // Add to processing log
          addProcessingLog(
            `Completed processing ${successCount} documents with ${errorCount} errors`,
            errorCount > 0 ? "warning" : "success"
          );
        }
      });
    } catch (error) {
      console.error("Batch processing failed:", error);

      // Show error notification
      import("../utils/toastNotification").then(({ showToast }) => {
        showToast(`Batch processing failed: ${error.message}`, "error");
      });

      // Add to processing log
      addProcessingLog(`Batch processing failed: ${error.message}`, "error");

      // Close any open dialogs
      Swal.close();
    }
  }

  async function handleFileProcessing(name) {
    try {
      // Show processing log
      setShowProcessingLog(true);
      clearProcessingLogs();
      addProcessingLog(`Starting to process file: ${name}`, "info");

      // Check if file has already been processed
      const processedFiles = JSON.parse(
        localStorage.getItem("processedFiles") || "[]"
      );

      if (processedFiles.includes(name)) {
        addProcessingLog(`File ${name} has already been processed`, "warning");
        Swal.fire({
          icon: "info",
          title: "Already Processed",
          text: `This document has already been processed. The transactions are in your log trails.`,
          showCancelButton: true,
          confirmButtonText: "Process Again",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            // Remove from processed files to allow reprocessing
            const updatedProcessedFiles = processedFiles.filter(
              (file) => file !== name
            );
            localStorage.setItem(
              "processedFiles",
              JSON.stringify(updatedProcessedFiles)
            );
            addProcessingLog(`Reprocessing file: ${name}`, "info");
            // Call the function again to process
            handleFileProcessing(name);
          } else {
            addProcessingLog(`Processing cancelled for ${name}`, "info");
          }
        });
        return;
      }

      Swal.fire({
        title: "Reading file...",
        text: "Please wait while we load the file content",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      addProcessingLog(`Loading file content for ${name}...`, "info");
      const totalChunks = Number(await actor.getTotalChunks(name));
      addProcessingLog(`File has ${totalChunks} chunks to process`, "info");

      const fileTypeResult = await actor.getFileType(name);
      const fileType =
        fileTypeResult && fileTypeResult.length > 0 ? fileTypeResult[0] : "";
      addProcessingLog(`File type detected: ${fileType || "unknown"}`, "info");

      let chunks = [];
      addProcessingLog(`Starting to download file chunks...`, "info");

      for (let i = 0; i < totalChunks; i++) {
        addProcessingLog(
          `Downloading chunk ${i + 1}/${totalChunks}...`,
          "info"
        );
        const chunkResult = await actor.getFileChunk(name, BigInt(i));
        const chunkBlob =
          chunkResult && chunkResult.length > 0 ? chunkResult[0] : null;

        if (chunkBlob) {
          chunks.push(chunkBlob);
        } else {
          addProcessingLog(`Failed to retrieve chunk ${i}`, "error");
          throw new Error(`Failed to retrieve chunk ${i}`);
        }
      }

      addProcessingLog(`All chunks downloaded successfully`, "success");

      const data = new Blob(chunks, { type: fileType });
      addProcessingLog(`Created blob with size: ${data.size} bytes`, "info");

      const isTextBased =
        fileType.includes("text") ||
        fileType.includes("csv") ||
        fileType.includes("json") ||
        fileType.includes("xml") ||
        fileType.includes("html") ||
        fileType.includes("javascript") ||
        fileType.includes("typescript") ||
        name.endsWith(".txt") ||
        name.endsWith(".csv") ||
        name.endsWith(".json") ||
        name.endsWith(".xml") ||
        name.endsWith(".html") ||
        name.endsWith(".js") ||
        name.endsWith(".ts");

      const isSpreadsheet =
        fileType.includes("spreadsheetml") ||
        fileType.includes("excel") ||
        fileType.includes("sheet") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".ods");

      const isDocument =
        fileType.includes("document") ||
        fileType.includes("wordprocessing") ||
        name.endsWith(".docx") ||
        name.endsWith(".doc") ||
        name.endsWith(".rtf") ||
        name.endsWith(".odt");

      const isPDF = fileType.includes("pdf") || name.endsWith(".pdf");

      const isImage =
        fileType.includes("image") ||
        fileType.includes("jpg") ||
        fileType.includes("jpeg") ||
        fileType.includes("png") ||
        fileType.includes("gif") ||
        fileType.includes("webp") ||
        fileType.includes("svg") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp") ||
        name.endsWith(".svg");

      // Check if this is a manual entry PDF (follows our naming pattern)
      const isManualEntry =
        name.startsWith("Transaction_") ||
        name.match(/^\d{4}-\d{2}-\d{2}_[A-Z][a-z]+/);

      // Log the file type detection
      if (isTextBased) addProcessingLog(`Detected text-based file`, "info");
      if (isSpreadsheet) addProcessingLog(`Detected spreadsheet file`, "info");
      if (isDocument) addProcessingLog(`Detected document file`, "info");
      if (isPDF) addProcessingLog(`Detected PDF file`, "info");
      if (isImage) addProcessingLog(`Detected image file`, "info");
      if (isManualEntry) addProcessingLog(`Detected manual entry file`, "info");

      if (isTextBased || isSpreadsheet || isDocument || isPDF || isImage) {
        // For text-based files, read as text
        if (isTextBased) {
          addProcessingLog(`Processing text-based file: ${name}`, "info");
          const reader = new FileReader();
          reader.onload = async (e) => {
            const fileContent = e.target.result;
            addProcessingLog(
              `File content loaded, size: ${fileContent.length} characters`,
              "info"
            );
            const contentWithContext = `This is a text file.\n\nFile name: ${name}\n\nContent:\n${fileContent}`;

            // Always process the document
            addProcessingLog(`Sending to Gemini AI for processing...`, "info");
            await processDocumentWithAI(contentWithContext, name);
          };
          reader.readAsText(data);
        }
        // For binary files (PDFs, images, etc.), convert to base64 and send to Gemini
        else {
          addProcessingLog(`Processing binary file: ${name}`, "info");
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Content = e.target.result.split(",")[1]; // Remove the data URL prefix
            addProcessingLog(
              `Base64 content generated, length: ${base64Content.length}`,
              "info"
            );

            // Determine file type for context
            let fileTypeContext = "";
            if (isSpreadsheet) fileTypeContext = "spreadsheet";
            if (isDocument) fileTypeContext = "document";
            if (isPDF) fileTypeContext = "PDF";
            if (isImage) fileTypeContext = "image";

            addProcessingLog(`File context type: ${fileTypeContext}`, "info");

            // Always process the document
            addProcessingLog(`Sending to Gemini AI for processing...`, "info");

            // Send the binary data to Gemini for processing
            await processDocumentWithBinaryData(
              base64Content,
              name,
              fileTypeContext,
              fileType
            );
          };
          reader.readAsDataURL(data);
        }
      } else {
        addProcessingLog(`Unsupported file type: ${fileType}`, "error");
        Swal.close();
        Swal.fire({
          icon: "warning",
          title: "Unsupported File Type",
          text: `File type "${fileType}" cannot be processed by our AI. Please upload a text, document, spreadsheet, PDF, or image file.`,
        });
      }
    } catch (error) {
      console.error("Processing failed:", error);
      addProcessingLog(`Processing failed: ${error.message}`, "error");
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: `Failed to process ${name}: ${error.message}`,
      });
    }
  }

  async function handleFileDownload(name, forPreview = false) {
    if (!forPreview) {
      setFileTransferProgress({
        mode: "Downloading",
        fileName: name,
        progress: 0,
      });
    }

    try {
      const totalChunks = Number(await actor.getTotalChunks(name));
      const fileTypeResult = await actor.getFileType(name);
      const fileType =
        fileTypeResult && fileTypeResult.length > 0 ? fileTypeResult[0] : "";

      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkResult = await actor.getFileChunk(name, BigInt(i));
        const chunkBlob =
          chunkResult && chunkResult.length > 0 ? chunkResult[0] : null;

        if (chunkBlob) {
          chunks.push(chunkBlob);
        } else {
          throw new Error(`Failed to retrieve chunk ${i}`);
        }

        if (!forPreview) {
          setFileTransferProgress((prev) => ({
            ...prev,
            progress: Math.floor(((i + 1) / totalChunks) * 100),
          }));
        }
      }

      // Create a blob from the chunks
      let mimeType = fileType;

      // Set appropriate MIME types based on file extension
      if (!fileType || fileType === "") {
        if (name.toLowerCase().endsWith(".csv")) {
          mimeType = "text/csv";
        } else if (name.toLowerCase().endsWith(".xlsx")) {
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if (name.toLowerCase().endsWith(".xls")) {
          mimeType = "application/vnd.ms-excel";
        } else if (name.toLowerCase().endsWith(".docx")) {
          mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (name.toLowerCase().endsWith(".doc")) {
          mimeType = "application/msword";
        }
      }

      console.log(`Creating blob for ${name} with type: ${mimeType}`);
      const data = new Blob(chunks, { type: mimeType });
      console.log(`Created blob: size=${data.size}, type=${data.type}`);

      // If this is for preview, return the blob instead of triggering a download
      if (forPreview) {
        console.log(`Returning blob for preview: ${name}`);
        return data;
      }

      // Otherwise, proceed with download
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Download Complete",
        text: `${name} has been downloaded successfully!`,
        timer: 2000,
        timerProgressBar: true,
      });

      return null; // Return null for normal downloads
    } catch (error) {
      console.error("Download failed:", error);
      if (!forPreview) {
        setErrorMessage(`Failed to download ${name}: ${error.message}`);
        Swal.fire({
          icon: "error",
          title: "Download Failed",
          text: `Failed to download ${name}: ${error.message}`,
        });
      }
      return null;
    } finally {
      if (!forPreview) {
        setFileTransferProgress(null);
      }
    }
  }

  async function handleFileDelete(name) {
    // Handle "Delete All" case
    if (name === "ALL") {
      Swal.fire({
        title: "Delete All Documents?",
        text: "Are you sure you want to delete ALL documents? This cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete all!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Get the count for the notification
            const count = files.length;

            // IMMEDIATELY show a loading dialog that can't be dismissed
            Swal.fire({
              title: "Deleting Documents...",
              html: `
                <div class="text-center">
                  <div class="mb-3">Deleting ${count} documents</div>
                  <div class="progress-bar-container" style="height: 10px; background-color: #333; border-radius: 5px; overflow: hidden;">
                    <div id="delete-progress-bar" style="height: 100%; width: 0%; background-color: #dc3545; transition: width 0.3s;"></div>
                  </div>
                  <div id="delete-progress-text" class="mt-2">Starting deletion...</div>
                </div>
              `,
              allowOutsideClick: false,
              showConfirmButton: false,
              didOpen: () => {
                const progressBar = document.getElementById(
                  "delete-progress-bar"
                );
                const progressText = document.getElementById(
                  "delete-progress-text"
                );

                // Start with animation to show it's working
                progressBar.style.width = "5%";
                progressText.textContent = "Preparing to delete...";
              },
            });

            // Wait a moment to show the dialog
            await new Promise((resolve) => setTimeout(resolve, 300));

            const progressBar = document.getElementById("delete-progress-bar");
            const progressText = document.getElementById(
              "delete-progress-text"
            );

            // Delete files one by one with progress updates
            for (let i = 0; i < files.length; i++) {
              const file = files[i];

              // Update progress
              const progress = 5 + Math.round(((i + 1) / count) * 95); // Start at 5% and go to 100%
              progressBar.style.width = `${progress}%`;
              progressText.textContent = `Deleting document ${
                i + 1
              }/${count}: ${file.name}`;

              // Delete the file
              await actor.deleteFile(file.name);

              // Small delay to keep UI responsive
              await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // Final update
            progressBar.style.width = "100%";
            progressText.textContent = `Deleted ${count} documents successfully!`;

            // Refresh the file list
            await loadFiles();

            // Close the loading dialog after a short delay
            setTimeout(() => {
              Swal.close();

              // Show success notification
              import("../utils/toastNotification").then(({ showToast }) => {
                showToast(`Successfully deleted ${count} documents`, "success");
              });
            }, 1000);

            // Add to processing log
            addProcessingLog(`Deleted ${count} documents`, "info");
          } catch (error) {
            console.error("Failed to delete all files:", error);

            // Show error toast
            import("../utils/toastNotification").then(({ showToast }) => {
              showToast(
                `Failed to delete documents: ${error.message}`,
                "error"
              );
            });

            // Add to processing log
            addProcessingLog(
              `Failed to delete documents: ${error.message}`,
              "error"
            );
          }
        }
      });
      return;
    }

    // Handle single file deletion
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const success = await actor.deleteFile(name);
          if (success) {
            await loadFiles();

            // Show non-intrusive toast notification
            import("../utils/toastNotification").then(({ showToast }) => {
              showToast(`Document "${name}" deleted successfully`, "success");
            });

            // Add to processing log
            addProcessingLog(`Deleted document: ${name}`, "info");
          } else {
            setErrorMessage("Failed to delete file");

            // Show error toast
            import("../utils/toastNotification").then(({ showToast }) => {
              showToast("Failed to delete document", "error");
            });
          }
        } catch (error) {
          console.error("Delete failed:", error);
          setErrorMessage(`Failed to delete ${name}: ${error.message}`);

          // Show error toast
          import("../utils/toastNotification").then(({ showToast }) => {
            showToast(`Failed to delete document: ${error.message}`, "error");
          });
        }
      }
    });
  }

  // Function to generate fake transactions
  async function generateFakeTransactions(count) {
    try {
      // Import the PDF generator dynamically
      const { generateTransactionPDF } = await import("../utils/pdfGenerator");

      // Categories for fake data - expanded for more variety
      const transactionTypes = [
        "expense",
        "income",
        "transfer",
        "asset",
        "liability",
      ];

      const expenseCategories = [
        "Advertising",
        "Office Supplies",
        "Rent",
        "Utilities",
        "Travel",
        "Consulting",
        "Insurance",
        "Meals & Entertainment",
        "Software Subscriptions",
        "Professional Development",
        "Legal Fees",
        "Accounting Services",
        "Repairs & Maintenance",
        "Shipping & Postage",
        "Printing",
        "Vehicle Expenses",
        "Telephone",
        "Internet",
        "Employee Benefits",
        "Salaries & Wages",
        "Contractor Payments",
        "Bank Fees",
        "Interest Expense",
        "Taxes",
        "Licenses & Permits",
        "Dues & Subscriptions",
      ];

      const incomeCategories = [
        "Sales",
        "Services",
        "Interest Income",
        "Dividends",
        "Royalties",
        "Rental Income",
        "Commission",
        "Consulting Revenue",
        "Product Sales",
        "Affiliate Income",
        "Sponsorship",
        "Grants",
        "Donations",
        "Refunds",
        "Investment Returns",
        "Asset Sales",
        "Licensing Fees",
      ];

      const transferCategories = [
        "Bank Transfer",
        "Credit Card Payment",
        "Loan Payment",
        "Investment Transfer",
        "Savings Transfer",
        "Retirement Contribution",
        "Tax Payment",
        "Payroll Transfer",
        "Vendor Payment",
        "Customer Refund",
        "Expense Reimbursement",
      ];

      const assetCategories = [
        "Equipment Purchase",
        "Vehicle Purchase",
        "Property Acquisition",
        "Furniture & Fixtures",
        "Computer Hardware",
        "Software Licenses",
        "Investment Purchase",
        "Inventory",
        "Intellectual Property",
      ];

      const liabilityCategories = [
        "Loan Proceeds",
        "Credit Line",
        "Mortgage",
        "Equipment Financing",
        "Accounts Payable",
        "Tax Liability",
        "Payroll Liabilities",
        "Customer Deposits",
      ];

      const paymentMethods = [
        "cash",
        "credit",
        "debit",
        "transfer",
        "check",
        "wire",
        "PayPal",
        "Venmo",
        "Zelle",
        "ACH",
        "Apple Pay",
        "Google Pay",
        "Bitcoin",
        "Cryptocurrency",
      ];

      const companies = [
        "Acme Corp",
        "TechSolutions",
        "Global Services",
        "Local Shop",
        "Office Depot",
        "Amazon",
        "Staples",
        "AT&T",
        "Verizon",
        "Comcast",
        "Microsoft",
        "Google",
        "Apple",
        "Dell",
        "HP",
        "Lenovo",
        "Samsung",
        "LG",
        "Sony",
        "Panasonic",
        "Best Buy",
        "Walmart",
        "Target",
        "Costco",
        "Home Depot",
        "Lowe's",
        "FedEx",
        "UPS",
        "USPS",
        "DHL",
        "Uber",
        "Lyft",
        "Airbnb",
        "Hilton",
        "Marriott",
        "Southwest Airlines",
        "Delta Airlines",
        "United Airlines",
        "Enterprise",
        "Hertz",
        "Avis",
        "Shell",
        "BP",
        "Exxon",
        "Chevron",
        "Starbucks",
        "McDonald's",
        "Subway",
        "Chipotle",
        "Whole Foods",
      ];

      // Descriptions for more variety
      const expenseDescriptions = [
        "Payment for {service}",
        "Monthly subscription to {service}",
        "Purchase from {company}",
        "Invoice payment to {company}",
        "Quarterly payment for {service}",
        "Annual subscription to {service}",
        "Maintenance service from {company}",
        "Consulting services from {company}",
        "Equipment rental from {company}",
        "Software license renewal for {service}",
        "Professional services from {company}",
        "Office supplies from {company}",
        "Utility payment to {company}",
        "Insurance premium to {company}",
      ];

      const incomeDescriptions = [
        "Payment from {client}",
        "Invoice {number} from {client}",
        "Monthly retainer from {client}",
        "Service fee from {client}",
        "Product sale to {client}",
        "Consulting fee from {client}",
        "Commission from {client}",
        "Royalty payment from {client}",
        "Project completion payment from {client}",
        "Milestone payment from {client}",
      ];

      // Create a progress bar element
      const progressBarContainer = document.createElement("div");
      progressBarContainer.style.position = "fixed";
      progressBarContainer.style.top = "0";
      progressBarContainer.style.left = "0";
      progressBarContainer.style.width = "100%";
      progressBarContainer.style.zIndex = "9999";

      const progressBar = document.createElement("div");
      progressBar.style.height = "4px";
      progressBar.style.width = "0%";
      progressBar.style.backgroundColor = "#10B981"; // Green color
      progressBar.style.transition = "width 0.3s ease";

      progressBarContainer.appendChild(progressBar);
      document.body.appendChild(progressBarContainer);

      // Create a status element
      const statusElement = document.createElement("div");
      statusElement.style.position = "fixed";
      statusElement.style.top = "10px";
      statusElement.style.right = "10px";
      statusElement.style.padding = "8px 12px";
      statusElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      statusElement.style.color = "white";
      statusElement.style.borderRadius = "4px";
      statusElement.style.fontSize = "14px";
      statusElement.style.zIndex = "9999";
      statusElement.style.maxWidth = "300px";
      statusElement.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
      statusElement.textContent = `Generating transaction 0/${count}`;

      document.body.appendChild(statusElement);

      // Create a batch of transactions to process
      const transactionsToProcess = [];

      // Generate all transaction data first
      for (let i = 0; i < count; i++) {
        // Update progress
        progressBar.style.width = `${Math.round((i / count) * 50)}%`; // First half of progress is generating data
        statusElement.textContent = `Generating transaction ${i + 1}/${count}`;

        // Generate random transaction type
        const transactionType =
          transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

        // Select appropriate category based on transaction type
        let category;
        let description;
        let company = companies[Math.floor(Math.random() * companies.length)];
        let service =
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ].toLowerCase();
        let client = companies[Math.floor(Math.random() * companies.length)];
        let invoiceNumber = Math.floor(Math.random() * 10000) + 1000;

        if (transactionType === "expense") {
          category =
            expenseCategories[
              Math.floor(Math.random() * expenseCategories.length)
            ];
          // Use expense descriptions with replacements
          const descTemplate =
            expenseDescriptions[
              Math.floor(Math.random() * expenseDescriptions.length)
            ];
          description = descTemplate
            .replace("{service}", service)
            .replace("{company}", company);
        } else if (transactionType === "income") {
          category =
            incomeCategories[
              Math.floor(Math.random() * incomeCategories.length)
            ];
          // Use income descriptions with replacements
          const descTemplate =
            incomeDescriptions[
              Math.floor(Math.random() * incomeDescriptions.length)
            ];
          description = descTemplate
            .replace("{client}", client)
            .replace("{number}", invoiceNumber);
        } else if (transactionType === "transfer") {
          category =
            transferCategories[
              Math.floor(Math.random() * transferCategories.length)
            ];
          description = `${category} - ${
            Math.random() > 0.5 ? "Outgoing" : "Incoming"
          }`;
        } else if (transactionType === "asset") {
          category =
            assetCategories[Math.floor(Math.random() * assetCategories.length)];
          description = `${category} - ${company}`;
        } else if (transactionType === "liability") {
          category =
            liabilityCategories[
              Math.floor(Math.random() * liabilityCategories.length)
            ];
          description = `${category} - ${company}`;
        }

        // Generate a random date within the last year, with more recent dates more likely
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Use a weighted random to favor more recent dates (square the random value)
        const randomWeight = Math.random() * Math.random(); // Squaring makes recent dates more likely
        const randomDate = new Date(
          oneYearAgo.getTime() +
            randomWeight * (today.getTime() - oneYearAgo.getTime())
        );
        const dateString = randomDate.toISOString().split("T")[0];

        // Generate random amount with different ranges based on transaction type
        let amount;
        if (transactionType === "expense") {
          // Expenses tend to be smaller
          amount =
            Math.round((10 + Math.random() * Math.random() * 2000) * 100) / 100;
        } else if (transactionType === "income") {
          // Income can be larger
          amount = Math.round((100 + Math.random() * 9900) * 100) / 100;
        } else if (
          transactionType === "asset" ||
          transactionType === "liability"
        ) {
          // Assets and liabilities tend to be much larger
          amount = Math.round((500 + Math.random() * 49500) * 100) / 100;
        } else {
          // Transfers can vary
          amount = Math.round((50 + Math.random() * 4950) * 100) / 100;
        }

        // Create transaction data
        const transactionData = {
          transactionType,
          amount,
          date: dateString,
          description,
          category,
          paymentMethod:
            paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          reference: `REF-${Math.floor(Math.random() * 10000) + 10000}`,
          taxDeductible: transactionType === "expense" && Math.random() > 0.3, // Most expenses are tax deductible
          notes: "Auto-generated transaction",
          timestamp: new Date().toISOString(),
        };

        transactionsToProcess.push(transactionData);

        // Small delay to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Now process all transactions (generate PDFs and upload)
      let processedCount = 0;
      let filesToProcess = [];

      for (const transactionData of transactionsToProcess) {
        processedCount++;

        // Update progress
        const totalProgress = 50 + Math.round((processedCount / count) * 50); // Second half of progress
        progressBar.style.width = `${totalProgress}%`;
        statusElement.textContent = `Processing transaction ${processedCount}/${count}`;

        // Generate PDF
        const pdfBlob = generateTransactionPDF(transactionData);

        // Create a filename based on the transaction data
        const date = new Date(transactionData.date).toISOString().split("T")[0];
        const type =
          transactionData.transactionType.charAt(0).toUpperCase() +
          transactionData.transactionType.slice(1);
        const amountStr = parseFloat(transactionData.amount)
          .toFixed(2)
          .replace(".", "_");
        const timestamp = Date.now().toString().slice(-6) + processedCount; // Use last 6 digits of timestamp + index for uniqueness
        const fileName = `Transaction_${date}_${type}_${amountStr}_${timestamp}.pdf`;

        // Upload the PDF to the backend
        await uploadPdfToBackend(pdfBlob, fileName);

        // Add to list of files to process with Gemini
        filesToProcess.push(fileName);

        // Process files in batches of 10 or at the end
        if (processedCount % 10 === 0 || processedCount === count) {
          await loadFiles(); // Refresh the file list

          // Process the last file in the batch with Gemini
          // This will be enough to demonstrate the processing is happening
          const lastFileName = filesToProcess[filesToProcess.length - 1];

          statusElement.textContent = `Processing documents with AI (batch ${Math.ceil(
            processedCount / 10
          )} of ${Math.ceil(count / 10)})`;

          // Get the file from the backend
          const fileData = await handleFileDownload(lastFileName, true);

          if (fileData) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Content = e.target.result.split(",")[1]; // Remove the data URL prefix

              // Process the PDF with Gemini
              await processDocumentWithBinaryData(
                base64Content,
                lastFileName,
                "PDF",
                "application/pdf",
                true // Silent mode - don't show additional popups
              );
            };
            reader.readAsDataURL(fileData);
          }

          // Clear the batch
          filesToProcess = [];
        }

        // Small delay to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Final refresh of files
      await loadFiles();

      // Remove progress bar and status element
      document.body.removeChild(progressBarContainer);
      document.body.removeChild(statusElement);

      Swal.fire({
        icon: "success",
        title: "Fake Transactions Generated",
        text: `Successfully created ${count} fake transactions!`,
      });

      return true;
    } catch (error) {
      console.error("Failed to generate fake transactions:", error);

      // Remove progress bar and status element if they exist
      if (document.body.contains(progressBarContainer)) {
        document.body.removeChild(progressBarContainer);
      }
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to generate fake transactions: ${error.message}`,
      });
      return false;
    }
  }

  // Function to handle saving manual data entries
  async function handleSaveManualData(data) {
    try {
      // Check if this is a request to generate fake transactions
      if (data.generateFake && data.count) {
        Swal.fire({
          title: "Generating Fake Transactions...",
          text: `Please wait while we create ${data.count} fake transactions`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await generateFakeTransactions(data.count);
        return true;
      }

      Swal.fire({
        title: "Generating Document...",
        text: "Please wait while we create your transaction record",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Import the PDF generator dynamically
      const { generateTransactionPDF } = await import("../utils/pdfGenerator");

      // Generate a PDF from the transaction data
      console.log("Generating PDF for transaction:", data);

      // Make sure amount is a number
      if (typeof data.amount === "string") {
        data.amount = parseFloat(data.amount) || 0;
      }

      // Make sure line items have numeric amounts
      if (data.lineItems && Array.isArray(data.lineItems)) {
        data.lineItems = data.lineItems.map((item) => ({
          ...item,
          amount:
            typeof item.amount === "string"
              ? parseFloat(item.amount) || 0
              : item.amount,
        }));
      }

      const pdfBlob = generateTransactionPDF(data);
      console.log("PDF generated successfully:", pdfBlob);

      // Create a filename based on the transaction data
      const date = new Date(data.date).toISOString().split("T")[0];
      const type =
        data.transactionType.charAt(0).toUpperCase() +
        data.transactionType.slice(1);
      const amount = parseFloat(data.amount).toFixed(2).replace(".", "_");
      const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp for uniqueness
      const fileName = `Transaction_${date}_${type}_${amount}_${timestamp}.pdf`;

      // Save the manual entry to state
      const newEntry = {
        id: Date.now().toString(), // Generate a unique ID
        ...data,
        createdAt: new Date().toISOString(),
        fileName: fileName,
      };

      setManualEntries((prevEntries) => [...prevEntries, newEntry]);

      // Upload the PDF to the backend as if it were a file
      await uploadPdfToBackend(pdfBlob, fileName);

      // Close the loading dialog
      Swal.close();

      // ALWAYS process manual entries immediately, regardless of processing mode
      Swal.fire({
        title: "Processing transaction...",
        text: "Please wait while we add this transaction to log trails",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // We need to get the file from the backend to process it
      const fileData = await handleFileDownload(fileName, true);

      if (fileData) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Content = e.target.result.split(",")[1]; // Remove the data URL prefix

          // Process the PDF with Gemini
          await processDocumentWithBinaryData(
            base64Content,
            fileName,
            "PDF",
            "application/pdf"
          );
        };
        reader.readAsDataURL(fileData);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Processing Issue",
          text: "Could not process the transaction automatically. You can process it manually from the Workspace tab.",
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to save transaction:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: `Failed to save transaction: ${error.message}`,
      });
      return false;
    }
  }

  // Helper function to upload PDF to backend
  async function uploadPdfToBackend(pdfBlob, fileName) {
    try {
      setFileTransferProgress({
        mode: "Uploading",
        fileName: fileName,
        progress: 0,
      });

      // Convert blob to array buffer for upload
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);

      // Use the same chunk-based upload mechanism as for regular files
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(content.length / chunkSize);

      // Check if file already exists
      const fileExists = await actor.checkFileExists(fileName);
      if (fileExists) {
        // Append a unique identifier to avoid overwriting
        const timestamp = Date.now();
        fileName = fileName.replace(".pdf", `_${timestamp}.pdf`);
      }

      // Upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, content.length);
        const chunk = content.slice(start, end);

        await actor.uploadFileChunk(
          fileName,
          chunk,
          BigInt(i),
          "application/pdf"
        );

        setFileTransferProgress((prev) => ({
          ...prev,
          progress: Math.floor(((i + 1) / totalChunks) * 100),
        }));
      }

      // Refresh the file list
      await loadFiles();
      setFileTransferProgress(null);

      return true;
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      setErrorMessage(`Failed to upload transaction record: ${error.message}`);
      setFileTransferProgress(null);
      throw error;
    }
  }

  const getFileIcon = (fileName) => {
    // Check if this is a transaction PDF (follows our naming pattern)
    if (
      fileName &&
      (fileName.startsWith("Transaction_") ||
        fileName.match(/^\d{4}-\d{2}-\d{2}_[A-Z][a-z]+/))
    ) {
      return <Calculator className="text-green-400" />;
    }

    // Check file extension
    const extension = fileName?.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return <FileText className="text-red-400" />;
    } else if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return <Image className="text-purple-400" />;
    } else if (["xlsx", "xls", "csv"].includes(extension)) {
      return <FileSpreadsheet className="text-blue-400" />;
    }

    // For other files, return the default icon
    return <FileText className="text-gray-400" />;
  };

  // Main navigation categories
  const mainCategories = [
    {
      id: "accountant",
      label: "Agentic Accountant",
      icon: <Calculator size={20} />,
      active: activeMainCategory === "accountant",
    },
    {
      id: "advisor",
      label: "Agentic Advisor",
      icon: <Users size={20} />,
      active: activeMainCategory === "advisor",
    },
  ];

  // Accountant sub-navigation items
  const accountantSubItems = [
    {
      id: "data-input",
      label: "Data Input",
      icon: <FileSpreadsheet size={20} />,
    },
    {
      id: "log-trails",
      label: "Log Trails",
      icon: <Receipt size={20} />,
    },
    {
      id: "workspace",
      label: "Workspace",
      icon: <Folder size={20} />,
    },
    {
      id: "validation",
      label: "Validation",
      icon: <ClipboardCheck size={20} />,
    },
    { id: "analysis", label: "Analysis", icon: <PieChart size={20} /> },
    { id: "reports", label: "Reports", icon: <FileText size={20} /> },
    {
      id: "recommendations",
      label: "Recommendations",
      icon: <BarChart3 size={20} />,
    },
  ];

  // Advisor sub-navigation items (for future implementation)
  const advisorSubItems = [
    {
      id: "financial-planning",
      label: "Financial Planning",
      icon: <DollarSign size={20} />,
    },
    { id: "investment", label: "Investment", icon: <TrendingUp size={20} /> },
    { id: "tax-strategy", label: "Tax Strategy", icon: <Receipt size={20} /> },
  ];

  // Formatting functions moved to individual components

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!isAuthenticated ? (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-8 text-center shadow-lg max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Logo className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white">
              Authentication Required
            </h2>
            <p className="mb-6 text-gray-400">
              Please sign in to access your Hi! Countant AI accountant platform.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all hover:opacity-90 focus:outline-none"
            >
              Login with Internet Identity
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col h-full bg-gray-900 border-r border-blue-900/30">
              {/* Logo */}
              <div className="flex items-center h-16 px-4 border-b border-blue-900/30">
                <div className="flex items-center space-x-3">
                  <Logo className="h-8 w-8" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Hi! Countant
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-6">
                  {/* Main Categories */}
                  <div className="space-y-1">
                    {mainCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveMainCategory(category.id);
                          // Set default sub-tab for the category
                          if (category.id === "accountant") {
                            setActiveSubTab("data-input");
                          } else if (category.id === "advisor") {
                            setActiveSubTab("financial-planning");
                          }
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeMainCategory === category.id
                            ? "bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white border border-blue-500/30"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center">
                          <span
                            className={`mr-3 ${
                              activeMainCategory === category.id
                                ? "text-blue-400"
                                : "text-gray-400"
                            }`}
                          >
                            {category.icon}
                          </span>
                          {category.label}
                        </div>
                        {category.active && (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-800"></div>

                  {/* Sub-items for Accountant */}
                  {activeMainCategory === "accountant" && (
                    <div className="space-y-1 pl-2">
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Accountant Features
                      </p>
                      {accountantSubItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSubTab(item.id)}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeSubTab === item.id
                              ? "bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                        >
                          <span
                            className={`mr-3 ${
                              activeSubTab === item.id
                                ? "text-blue-400"
                                : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sub-items for Advisor */}
                  {activeMainCategory === "advisor" && (
                    <div className="space-y-1 pl-2">
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Advisor Features
                      </p>
                      {advisorSubItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSubTab(item.id)}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeSubTab === item.id
                              ? "bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                        >
                          <span
                            className={`mr-3 ${
                              activeSubTab === item.id
                                ? "text-blue-400"
                                : "text-gray-500"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-blue-900/30 bg-gray-900">
              {/* Mobile menu button */}
              <button className="md:hidden text-gray-400 hover:text-white">
                <Menu size={24} />
              </button>

              {/* Search */}
              <div className="flex-1 max-w-md ml-4 md:ml-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                  />
                </div>
              </div>

              {/* Right buttons */}
              <div className="flex items-center ml-4 space-x-4">
                <button className="text-gray-400 hover:text-white">
                  <Bell size={20} />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <Settings size={20} />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">HC</span>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-950">
              {/* Import the components */}
              {activeMainCategory === "accountant" && (
                <>
                  {activeSubTab === "data-input" && (
                    <DataInput
                      onFileUpload={handleFileUpload}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      dragActive={dragActive}
                      files={files}
                      isLoading={isLoading}
                      handleFileDownload={handleFileDownload}
                      handleFileProcessing={handleFileProcessing}
                      handleFileDelete={handleFileDelete}
                      handleProcessAllFiles={handleProcessAllFiles}
                      getFileIcon={getFileIcon}
                      analyzingFile={analyzingFile}
                      errorMessage={errorMessage}
                      fileTransferProgress={fileTransferProgress}
                      onSaveManualData={handleSaveManualData}
                    />
                  )}

                  {activeSubTab === "log-trails" && (
                    <LogTrails
                      transactions={transactions}
                      onViewTransaction={handleViewTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onExportTransactions={handleExportTransactions}
                      onDeleteAllTransactions={handleDeleteAllTransactions}
                    />
                  )}

                  {activeSubTab === "workspace" && (
                    <Workspace
                      files={files}
                      handleFileDownload={handleFileDownload}
                      handleFileProcessing={handleFileProcessing}
                      handleFileDelete={handleFileDelete}
                      analyzingFile={analyzingFile}
                    />
                  )}

                  {activeSubTab === "validation" && (
                    <Validation
                      transactions={transactions}
                      onViewTransaction={handleViewTransaction}
                      onExportTransactions={handleExportTransactions}
                      files={files}
                      handleFileDownload={handleFileDownload}
                    />
                  )}

                  {activeSubTab === "analysis" && (
                    <Analysis transactions={transactions} />
                  )}

                  {activeSubTab === "reports" && (
                      <Reports
                      transactions={transactions}
                      files={files}
                      handleFileDownload={handleFileDownload}
                      handleFileDelete={handleFileDelete}/>
                    )}
                    
                  {activeSubTab === "recommendations" && (
                    <Recommendations transactions={transactions}/>
                  )}
                </>
              )}

              {activeMainCategory === "advisor" && (
                <>
                  {activeSubTab === "financial-planning" && (
                    <FinancialPlanning
                      transactions={transactions}
                      isLoading={isLoading}
                    />
                  )}
                  {activeSubTab === "investment" && (
                    <Investment
                      transactions={transactions}
                      isLoading={isLoading}
                    />
                  )}
                  {activeSubTab === "tax-strategy" && (
                    <TaxStrategy
                      transactions={transactions}
                      isLoading={isLoading}
                    />
                  )}
                  {["financial-planning", "investment", "tax-strategy"].indexOf(
                    activeSubTab
                  ) === -1 && (
                    <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">
                          Agentic Advisor
                        </h3>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={handleCloseTransactionDetails}
          onDownloadPdf={handleFileDownload}
        />
      )}

      {/* Processing Log */}
      <ProcessingLog
        logs={processingLogs}
        visible={showProcessingLog}
        onClose={closeProcessingLog}
        onMinimize={toggleMinimizeProcessingLog}
        minimized={minimizeProcessingLog}
      />
    </div>
  );
}

export default App;
