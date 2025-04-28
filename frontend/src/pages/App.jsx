import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  AlertCircle,
  Eye,
  X,
  BarChart3,
  Calculator,
  ClipboardCheck,
  PieChart,
  Calendar,
  CreditCard,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Plus,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Users,
  Building,
  Receipt,
  FileSpreadsheet,
  Menu,
} from "lucide-react";
import Swal from "sweetalert2";
import Logo from "../components/Logo";

function App({ actor, isAuthenticated, login, logout }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [fileTransferProgress, setFileTransferProgress] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingFile, setAnalyzingFile] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sample data for the dashboard
  const financialSummary = {
    revenue: 24850,
    expenses: 18340,
    profit: 6510,
    pendingInvoices: 3200,
    upcomingBills: 1850,
  };

  const recentTransactions = [
    {
      id: 1,
      date: "2023-11-15",
      description: "Client Payment - ABC Corp",
      amount: 2500,
      type: "income",
    },
    {
      id: 2,
      date: "2023-11-14",
      description: "Office Supplies",
      amount: 120,
      type: "expense",
    },
    {
      id: 3,
      date: "2023-11-12",
      description: "Software Subscription",
      amount: 49.99,
      type: "expense",
    },
    {
      id: 4,
      date: "2023-11-10",
      description: "Client Payment - XYZ Ltd",
      amount: 1800,
      type: "income",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      date: "2023-12-15",
      description: "Quarterly Tax Filing",
      type: "tax",
    },
    { id: 2, date: "2023-12-01", description: "Rent Payment", type: "bill" },
    {
      id: 3,
      date: "2023-11-25",
      description: "Client Invoice Due",
      type: "invoice",
    },
  ];

  const GEMINI_API_KEY = "AIzaSyA6uSVWMWopA9O1l5F74QeeBw0vA4bU9o4";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (actor) {
      loadFiles();
    }
  }, [actor, isAuthenticated, navigate]);

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

      // Construct a prompt that's specific to accounting documents
      const prompt = `
You are Hi! Countant, an AI accountant assistant. Please analyze this document and provide:

1. A summary of key financial information
2. Any important dates, amounts, or transactions
3. Accounting implications or recommendations
4. Potential tax considerations
5. Any anomalies or items that require attention

Document: ${truncatedContent}
      `;

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
              temperature: 0.2,
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

      setAnalysisResult({
        fileName: fileName,
        content: content,
      });

      return result;
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
      Swal.fire({
        title: "Reading file...",
        text: "Please wait while we load the file content",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

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
      }

      const data = new Blob(chunks, { type: fileType });

      // Determine how to read the file based on its type
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

      if (isTextBased || isSpreadsheet || isDocument || isPDF || isImage) {
        const reader = new FileReader();

        reader.onload = async (e) => {
          let fileContent = e.target.result;

          // Add context about the file type to help Gemini process it better
          let fileTypeContext = "";
          if (isTextBased) fileTypeContext = "This is a text file.";
          if (isSpreadsheet) fileTypeContext = "This is a spreadsheet file.";
          if (isDocument) fileTypeContext = "This is a document file.";
          if (isPDF) fileTypeContext = "This is a PDF file.";
          if (isImage)
            fileTypeContext =
              "This is an image file (text content may be limited).";

          // For binary files that were read as text, we might get garbled content
          // Add a note about this to the AI
          if (
            ((isSpreadsheet || isDocument || isPDF || isImage) &&
              fileContent.includes("�")) ||
            fileContent.length > 100000
          ) {
            fileContent = `[This file appears to be in binary format and couldn't be fully parsed as text. Here's a sample of the content that could be extracted:]\n\n${fileContent.substring(
              0,
              5000
            )}`;
          }

          // Combine the context with the content
          const contentWithContext = `${fileTypeContext}\n\nFile name: ${name}\n\nContent:\n${fileContent}`;

          await processDocumentWithAI(contentWithContext, name);
        };

        // Always try to read as text first - Gemini works best with text
        reader.readAsText(data);
      } else {
        Swal.close();
        Swal.fire({
          icon: "warning",
          title: "Unsupported File Type",
          text: `File type "${fileType}" cannot be processed by our AI. Please upload a text, document, spreadsheet, PDF, or image file.`,
        });
      }
    } catch (error) {
      console.error("Processing failed:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: `Failed to process ${name}: ${error.message}`,
      });
    }
  }

  async function handleFileDownload(name) {
    setFileTransferProgress({
      mode: "Downloading",
      fileName: name,
      progress: 0,
    });
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

        setFileTransferProgress((prev) => ({
          ...prev,
          progress: Math.floor(((i + 1) / totalChunks) * 100),
        }));
      }

      const data = new Blob(chunks, { type: fileType });
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
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMessage(`Failed to download ${name}: ${error.message}`);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: `Failed to download ${name}: ${error.message}`,
      });
    } finally {
      setFileTransferProgress(null);
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

  const getFileIcon = () => {
    // Simplified version - just return a file icon
    // We can enhance this later to show different icons based on file type
    return <FileText className="text-gray-400" />;
  };

  const closeAnalysis = () => {
    setAnalysisResult(null);
    setAnalyzingFile("");
  };

  // Sidebar navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { id: "track", label: "Track", icon: <Calculator size={20} /> },
    { id: "audit", label: "Audit", icon: <ClipboardCheck size={20} /> },
    { id: "estimate", label: "Estimate", icon: <PieChart size={20} /> },
    { id: "independent", label: "Independent", icon: <FileText size={20} /> },
    {
      id: "documents",
      label: "Documents",
      icon: <FileSpreadsheet size={20} />,
    },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

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
                <nav className="px-2 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-white border border-blue-500/30"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          activeTab === item.id
                            ? "text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* User menu */}
              <div className="border-t border-blue-900/30 p-4">
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <span>Logout</span>
                </button>
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
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Financial summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">
                          Revenue
                        </h3>
                        <DollarSign className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(financialSummary.revenue)}
                      </p>
                      <p className="text-sm text-green-500 mt-2 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>12% from last month</span>
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">
                          Expenses
                        </h3>
                        <Wallet className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(financialSummary.expenses)}
                      </p>
                      <p className="text-sm text-red-500 mt-2 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>8% from last month</span>
                      </p>
                    </div>

                    <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">
                          Profit
                        </h3>
                        <PieChart className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(financialSummary.profit)}
                      </p>
                      <p className="text-sm text-blue-500 mt-2 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>5% from last month</span>
                      </p>
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="bg-gray-900 border border-blue-900/30 rounded-lg shadow-md">
                    <div className="p-4 border-b border-blue-900/30">
                      <h2 className="text-lg font-medium text-white">
                        Recent Transactions
                      </h2>
                    </div>
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              <th className="px-4 py-2">Date</th>
                              <th className="px-4 py-2">Description</th>
                              <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {recentTransactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {formatDate(transaction.date)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {transaction.description}
                                </td>
                                <td
                                  className={`px-4 py-3 text-sm text-right ${
                                    transaction.type === "income"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming deadlines */}
                  <div className="bg-gray-900 border border-blue-900/30 rounded-lg shadow-md">
                    <div className="p-4 border-b border-blue-900/30">
                      <h2 className="text-lg font-medium text-white">
                        Upcoming Deadlines
                      </h2>
                    </div>
                    <div className="p-4">
                      <ul className="divide-y divide-gray-800">
                        {upcomingDeadlines.map((deadline) => (
                          <li
                            key={deadline.id}
                            className="py-3 flex items-center"
                          >
                            <div
                              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                deadline.type === "tax"
                                  ? "bg-red-900/30"
                                  : deadline.type === "bill"
                                  ? "bg-yellow-900/30"
                                  : "bg-blue-900/30"
                              }`}
                            >
                              {deadline.type === "tax" ? (
                                <Receipt className="h-5 w-5 text-red-500" />
                              ) : deadline.type === "bill" ? (
                                <CreditCard className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <p className="text-sm font-medium text-white">
                                {deadline.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(deadline.date)}
                              </p>
                            </div>
                            <button className="ml-2 px-3 py-1 text-xs font-medium rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700">
                              Remind
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6">
                  {/* Upload area */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${
                      dragActive
                        ? "border-blue-500 bg-gray-800/50"
                        : "border-gray-700"
                    } bg-gray-900 p-10 shadow-md transition-colors`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/30">
                      <Upload className="h-10 w-10 text-blue-400" />
                    </div>
                    <p className="mb-2 text-xl font-medium text-white">
                      Drag and drop your files here
                    </p>
                    <p className="mb-6 text-sm text-gray-400">
                      or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="fileInput"
                    />
                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all hover:opacity-90 focus:outline-none"
                    >
                      Choose File
                    </label>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center rounded-lg bg-red-900/30 border border-red-800 p-4 text-sm text-red-300 shadow-sm">
                      <AlertCircle className="mr-3 h-5 w-5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {fileTransferProgress && (
                    <div className="rounded-lg bg-gray-900 border border-blue-900/30 p-6 shadow-md">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-base font-medium text-white">
                          {fileTransferProgress.mode}{" "}
                          {fileTransferProgress.fileName}
                        </span>
                        <span className="text-base font-medium text-blue-400">
                          {fileTransferProgress.progress}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-800">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                          style={{ width: `${fileTransferProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
                    <h2 className="mb-6 text-xl font-bold text-white">
                      Your Documents
                    </h2>

                    {isLoading ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-t-blue-500"></div>
                        <p className="mt-4 text-gray-400">
                          Loading your files...
                        </p>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="py-16 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                        <p className="text-lg text-gray-400">
                          You have no documents yet. Upload some to get started!
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-800">
                        {files.map((file) => (
                          <div
                            key={file.name}
                            className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                                {getFileIcon(file.name)}
                              </div>
                              <span className="text-base font-medium text-white">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                              <button
                                onClick={() => handleFileDownload(file.name)}
                                className="flex flex-1 items-center justify-center rounded-lg bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-900/50 sm:flex-initial"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </button>
                              <button
                                onClick={() => handleFileProcessing(file.name)}
                                disabled={analyzingFile === file.name}
                                className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-initial ${
                                  analyzingFile === file.name
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"
                                }`}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {analyzingFile === file.name
                                  ? "Processing..."
                                  : "Process File"}
                              </button>
                              <button
                                onClick={() => handleFileDelete(file.name)}
                                className="flex flex-1 items-center justify-center rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50 sm:flex-initial"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {analysisResult && (
                    <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
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
                          <X size={18} className="text-gray-400" />
                        </button>
                      </div>
                      <div className="border-t border-gray-800 my-2 pt-4"></div>
                      <div className="prose prose-invert max-w-none">
                        <div
                          className="bg-gray-800 p-4 rounded-lg text-gray-300 overflow-y-auto"
                          style={{ maxHeight: "500px" }}
                        >
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
                  )}
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab === "track" && (
                <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                  <div className="text-center">
                    <Calculator className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Track Module
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      This module will help you track transactions and generate
                      financial statements.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "audit" && (
                <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                  <div className="text-center">
                    <ClipboardCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Audit Module
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      This module will help you audit your financial data and
                      ensure compliance.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "estimate" && (
                <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Estimate Module
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      This module will help you forecast cash flow and compare
                      budget vs actual data.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "independent" && (
                <div className="flex items-center justify-center h-64 bg-gray-900 border border-blue-900/30 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Independent Module
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      This module will help you generate journal entries and
                      answer accounting questions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
