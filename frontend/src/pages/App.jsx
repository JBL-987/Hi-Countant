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
  const [processingMode, setProcessingMode] = useState("auto"); // "auto" or "manual"
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [manualEntries, setManualEntries] = useState([]);

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
          Swal.fire("Deleted!", "The transaction has been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete transaction:", error);
          Swal.fire(
            "Error",
            "Failed to delete transaction. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const handleDeleteAllTransactions = () => {
    if (transactions.length === 0) {
      Swal.fire(
        "No Transactions",
        "There are no transactions to delete.",
        "info"
      );
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
          console.log("Deleting all transactions from localStorage");
          // Clear transactions from localStorage
          localStorage.setItem("transactions", JSON.stringify([]));
          console.log(
            "Successfully deleted all transactions from localStorage"
          );
          // Clear transactions from state
          setTransactions([]);
          Swal.fire(
            "Deleted!",
            "All transactions have been deleted.",
            "success"
          );
        } catch (error) {
          console.error("Failed to delete all transactions:", error);
          Swal.fire(
            "Error",
            "Failed to delete all transactions. Please try again.",
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

  const closeAnalysis = () => {
    setAnalysisResult(null);
    setAnalyzingFile("");
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

  const GEMINI_API_KEY = "AIzaSyA6uSVWMWopA9O1l5F74QeeBw0vA4bU9o4";

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

        console.log("Formatted transactions:", formattedTransactions);
        setTransactions(formattedTransactions);
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

IMPORTANT: This file likely contains MULTIPLE transactions (like a bank statement, expense report, or accounting table). You MUST extract ALL transactions and return them as an array of transaction objects.

PAY SPECIAL ATTENTION TO TABULAR DATA: If the file contains a table of transactions, make sure to extract each row as a separate transaction. Look for patterns like dates, amounts, descriptions, etc. in columns.

BE EXTREMELY THOROUGH: Scan the entire document carefully. Don't miss any transactions. Look for tables, lists, or any structured data that contains financial information. If there are multiple pages, check all of them.

For each transaction, extract the following specific information:
1. Transaction type: Determine based on context - use "expense" for debits/payments/outgoing funds and "income" for credits/deposits/incoming funds
2. Amount: Extract numeric value only (no currency symbols)
3. Date: Convert to YYYY-MM-DD format
4. Description: Use the transaction description or memo field
5. Category: Extract from document or infer from description
6. Payment method: Extract if available
7. Reference number: Extract if available
8. Is it tax deductible: Set to true for business expenses, false for personal or non-deductible items

Return ONLY a valid JSON array with these fields. If you can't determine a value, use null.

ALWAYS return an array of transactions, even if there's only one transaction,if there is more, return all of detected transactions, do not hallucinate, read all entire trasanctions, complete, recursively, to ensure no transaction is missing:
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
- Extract ALL line items in the statement
- Pay attention to transaction dates, descriptions, and amounts
- Look for transaction codes, reference numbers, or categories
- If there are running balances, focus on the individual transactions, not the balance

EXTREMELY IMPORTANT: Your response must ONLY contain the raw JSON array. Do not include any explanations, markdown formatting, or code blocks. Just return the raw JSON array starting with [ and ending with ]. Nothing else.

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

            // Add the extracted transactions to our state if in auto mode
            // or if this file was explicitly selected for processing
            if (processingMode === "auto" || analyzingFile === fileName) {
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

              const updatedTransactions = [
                ...transactions, // Use the current transactions state
                ...formattedTransactions,
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
                  <p>${
                    processingMode === "auto" || analyzingFile === fileName
                      ? `Successfully extracted and added ${transactions.length} transactions from ${fileName} to log trails`
                      : `Successfully extracted ${transactions.length} transactions from ${fileName}. Switch to manual processing mode to add them to log trails.`
                  }</p>
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
    mimeType
  ) {
    try {
      setAnalyzingFile(fileName);
      addProcessingLog(`Starting Gemini AI processing for ${fileName}`, "info");

      Swal.fire({
        title: "Processing document...",
        text: `Analyzing ${fileName} with Gemini AI`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

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

IMPORTANT: This file likely contains MULTIPLE transactions (like a bank statement, expense report, or accounting table). You MUST extract ALL transactions and return them as an array of transaction objects.

PAY SPECIAL ATTENTION TO TABULAR DATA: If the file contains a table of transactions, make sure to extract each row as a separate transaction. Look for patterns like dates, amounts, descriptions, etc. in columns.

BE EXTREMELY THOROUGH: Scan the entire document carefully. Don't miss any transactions. Look for tables, lists, or any structured data that contains financial information. If there are multiple pages, check all of them.

For each transaction, extract the following specific information:
1. Transaction type: Determine based on context - use "expense" for debits/payments/outgoing funds and "income" for credits/deposits/incoming funds
2. Amount: Extract numeric value only (no currency symbols)
3. Date: Convert to YYYY-MM-DD format
4. Description: Use the transaction description or memo field
5. Category: Extract from document or infer from description
6. Payment method: Extract if available
7. Reference number: Extract if available
8. Is it tax deductible: Set to true for business expenses, false for personal or non-deductible items

Return ONLY a valid JSON array with these fields. If you can't determine a value, use null.

ALWAYS return an array of transactions, even if there's only one transaction:
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
- Extract ALL line items in the statement
- Pay attention to transaction dates, descriptions, and amounts
- Look for transaction codes, reference numbers, or categories
- If there are running balances, focus on the individual transactions, not the balance

EXTREMELY IMPORTANT: Your response must ONLY contain the raw JSON array. Do not include any explanations, markdown formatting, or code blocks. Just return the raw JSON array starting with [ and ending with ]. Nothing else.

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

            // Add file reference and timestamp to each transaction
            const timestampedTransactions = transactions.map((transaction) => ({
              ...transaction,
              sourceFile: fileName,
              timestamp: new Date().toISOString(),
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            }));

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

            const updatedTransactions = [
              ...transactions, // Use the current transactions state
              ...formattedTransactions,
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

            // Show the extracted data in a popup for review
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

        // Show a more detailed error message with options
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

        // Don't mark the file as processed since we couldn't extract data
        setAnalyzingFile(""); // Clear the analyzing state
        return { rawContent: content };
      }
    } catch (error) {
      Swal.close();
      addProcessingLog(`Processing failed: ${error.message}`, "error");
      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: `Failed to process ${fileName}: ${error.message}`,
      });
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

            // In manual mode, we only process when explicitly requested
            // In auto mode, we process immediately
            if (processingMode === "auto" || isManualEntry) {
              addProcessingLog(
                `Processing mode: ${
                  processingMode === "auto" ? "automatic" : "manual"
                }`,
                "info"
              );
              addProcessingLog(
                `Sending to Gemini AI for processing...`,
                "info"
              );
              await processDocumentWithAI(contentWithContext, name);
            } else {
              // For manual mode, just show a success message
              addProcessingLog(
                `File loaded but not processed (manual mode)`,
                "info"
              );
              Swal.close();
              Swal.fire({
                icon: "success",
                title: "File Loaded",
                text: `${name} is ready for processing. Click "Process File" again when you want to extract transactions.`,
                showConfirmButton: true,
              });
            }
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

            // In manual mode, we only process when explicitly requested
            // In auto mode, we process immediately
            if (processingMode === "auto" || isManualEntry) {
              addProcessingLog(
                `Processing mode: ${
                  processingMode === "auto" ? "automatic" : "manual"
                }`,
                "info"
              );
              addProcessingLog(
                `Sending to Gemini AI for processing...`,
                "info"
              );

              // Send the binary data to Gemini for processing
              await processDocumentWithBinaryData(
                base64Content,
                name,
                fileTypeContext,
                fileType
              );
            } else {
              // For manual mode, just show a success message
              addProcessingLog(
                `File loaded but not processed (manual mode)`,
                "info"
              );
              Swal.close();
              Swal.fire({
                icon: "success",
                title: "File Loaded",
                text: `${name} is ready for processing. Click "Process File" again when you want to extract transactions.`,
                showConfirmButton: true,
              });
            }
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
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `${name} has been deleted.`,
              timer: 2000,
              timerProgressBar: true,
            });
          } else {
            setErrorMessage("Failed to delete file");
            Swal.fire({
              icon: "error",
              title: "Delete Failed",
              text: "Failed to delete file.",
            });
          }
        } catch (error) {
          console.error("Delete failed:", error);
          setErrorMessage(`Failed to delete ${name}: ${error.message}`);
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: `Failed to delete ${name}: ${error.message}`,
          });
        }
      }
    });
  }

  // Function to handle saving manual data entries
  async function handleSaveManualData(data) {
    try {
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
                      getFileIcon={getFileIcon}
                      analyzingFile={analyzingFile}
                      errorMessage={errorMessage}
                      fileTransferProgress={fileTransferProgress}
                      onSaveManualData={handleSaveManualData}
                      processingMode={processingMode}
                      onProcessingModeChange={setProcessingMode}
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
                    />
                  )}

                  {activeSubTab === "analysis" && (
                    <Analysis
                      transaction={transactions} 
                    />
                  )}

                  {activeSubTab === "reports" && <Reports />}

                  {activeSubTab === "recommendations" && <Recommendations />}
                </>
              )}

              {activeMainCategory === "advisor" && (
                <>
                  {activeSubTab === "financial-planning" && (
                    <FinancialPlanning />
                  )}

                  {activeSubTab === "investment" && <Investment />}

                  {activeSubTab === "tax-strategy" && <TaxStrategy />}
                </>
              )}

              {/* Advisor placeholder */}
              {activeMainCategory === "advisor" && (
                <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Agentic Advisor
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      This feature is coming soon. The Agentic Advisor will
                      provide personalized financial advice and planning.
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Result Modal */}
              {analysisResult && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 border border-blue-900/30 rounded-xl p-6 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {analysisResult.fileName} Analysis
                        </h2>
                        <p className="text-sm text-blue-400 mt-1">
                          Powered by Gemini AI
                        </p>
                      </div>
                      <button
                        onClick={closeAnalysis}
                        className="p-1 rounded-full hover:bg-gray-800"
                      >
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="border-t border-gray-800 my-2 pt-4"></div>
                    <div className="prose prose-invert max-w-none flex-1 overflow-auto">
                      <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
                        {/* Format the content with Markdown-like rendering */}
                        {analysisResult.content
                          .split("\n")
                          .map((line, index) => {
                            // Format headings
                            if (line.startsWith("# ")) {
                              return (
                                <h1
                                  key={index}
                                  className="text-xl font-bold text-white mt-4 mb-2"
                                >
                                  {line.substring(2)}
                                </h1>
                              );
                            } else if (line.startsWith("## ")) {
                              return (
                                <h2
                                  key={index}
                                  className="text-lg font-bold text-white mt-3 mb-2"
                                >
                                  {line.substring(3)}
                                </h2>
                              );
                            } else if (line.startsWith("### ")) {
                              return (
                                <h3
                                  key={index}
                                  className="text-md font-bold text-white mt-2 mb-1"
                                >
                                  {line.substring(4)}
                                </h3>
                              );
                            }
                            // Format lists
                            else if (line.match(/^\d+\.\s/)) {
                              return (
                                <div key={index} className="ml-4 my-1">
                                  {line}
                                </div>
                              );
                            } else if (line.match(/^-\s/)) {
                              return (
                                <div key={index} className="ml-4 my-1">
                                  {line}
                                </div>
                              );
                            } else if (line.match(/^\*\s/)) {
                              return (
                                <div key={index} className="ml-4 my-1">
                                  {line}
                                </div>
                              );
                            }
                            // Format empty lines
                            else if (line.trim() === "") {
                              return <div key={index} className="h-2"></div>;
                            }
                            // Default paragraph
                            else {
                              return (
                                <div key={index} className="my-1">
                                  {line}
                                </div>
                              );
                            }
                          })}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          // Create a blob and download the analysis as a text file
                          const blob = new Blob([analysisResult.content], {
                            type: "text/plain",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${analysisResult.fileName}-analysis.txt`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                      >
                        Download Analysis
                      </button>
                    </div>
                  </div>
                </div>
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
