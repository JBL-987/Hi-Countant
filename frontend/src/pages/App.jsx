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

function App({ actor, isAuthenticated, login }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [fileTransferProgress, setFileTransferProgress] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingFile, setAnalyzingFile] = useState("");
  const [activeMainCategory, setActiveMainCategory] = useState("accountant");
  const [activeSubTab, setActiveSubTab] = useState("data-input");

  // Sample data removed as it's no longer needed with the new component structure

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
      const cleanedcontent = content.replace(/[\*`']/g, "");

      setAnalysisResult({
        fileName: fileName,
        content: cleanedcontent,
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

  // Function to process binary files (PDFs, images, etc.) using Gemini's multimodal capabilities
  async function processDocumentWithBinaryData(
    base64Data,
    fileName,
    fileTypeContext,
    mimeType
  ) {
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

      // Construct the API request with multimodal content (text + image/PDF)
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
                    text: `You are Hi! Countant, an AI accountant assistant. Please analyze this ${fileTypeContext} file and provide:\n\n1. A summary of key financial information\n2. Any important dates, amounts, or transactions\n3. Accounting implications or recommendations\n4. Potential tax considerations\n5. Any anomalies or items that require attention\n\nFile name: ${fileName}`,
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
        // For text-based files, read as text
        if (isTextBased) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const fileContent = e.target.result;
            const contentWithContext = `This is a text file.\n\nFile name: ${name}\n\nContent:\n${fileContent}`;
            await processDocumentWithAI(contentWithContext, name);
          };
          reader.readAsText(data);
        }
        // For binary files (PDFs, images, etc.), convert to base64 and send to Gemini
        else {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Content = e.target.result.split(",")[1]; // Remove the data URL prefix

            // Determine file type for context
            let fileTypeContext = "";
            if (isSpreadsheet) fileTypeContext = "spreadsheet";
            if (isDocument) fileTypeContext = "document";
            if (isPDF) fileTypeContext = "PDF";
            if (isImage) fileTypeContext = "image";

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
    return <FileText className="text-gray-400" />;
  };

  const closeAnalysis = () => {
    setAnalysisResult(null);
    setAnalyzingFile("");
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

                  {activeSubTab === "validation" && <Validation />}

                  {activeSubTab === "analysis" && <Analysis />}

                  {activeSubTab === "reports" && <Reports />}

                  {activeSubTab === "recommendations" && <Recommendations />}
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
    </div>
  );
}

export default App;
