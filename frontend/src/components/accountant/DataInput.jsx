import React, { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  ArrowUpRight,
  Calculator,
  FileUp,
  PenLine,
} from "lucide-react";
import ManualDataInput from "./ManualDataInput";

const DataInput = ({
  onFileUpload,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  dragActive,
  files,
  isLoading,
  handleFileDownload,
  handleFileProcessing,
  handleFileDelete,
  getFileIcon,
  analyzingFile,
  errorMessage,
  fileTransferProgress,
  onSaveManualData,
  processingMode,
  onProcessingModeChange,
}) => {
  const [inputMode, setInputMode] = useState("file"); // 'file' or 'manual'

  const handleSaveManualData = (data) => {
    if (onSaveManualData) {
      onSaveManualData(data);
    } else {
      console.log("Manual data saved:", data);
      // If no handler is provided, we'll just show an alert
      alert("Transaction saved successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Data Input</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Last updated: Today</span>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-2 flex">
        <button
          onClick={() => setInputMode("file")}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
            inputMode === "file"
              ? "bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <FileUp size={18} className="mr-2" />
          File Upload
        </button>
        <button
          onClick={() => setInputMode("manual")}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
            inputMode === "manual"
              ? "bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <PenLine size={18} className="mr-2" />
          Manual Entry
        </button>
      </div>

      {/* Processing Mode Toggle */}
      {inputMode === "file" && (
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">
              Processing Mode
            </h3>
            <div className="relative inline-flex items-center cursor-pointer">
              <span
                className={`mr-3 text-sm ${
                  processingMode === "manual"
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                Manual
              </span>
              <div
                className="relative"
                onClick={() =>
                  onProcessingModeChange(
                    processingMode === "auto" ? "manual" : "auto"
                  )
                }
              >
                <div className="w-11 h-6 bg-gray-800 rounded-full border border-gray-700"></div>
                <div
                  className={`absolute top-0.5 left-0.5 bg-gradient-to-r from-blue-600 to-purple-600 w-5 h-5 rounded-full transition-transform duration-300 ease-in-out ${
                    processingMode === "auto" ? "translate-x-5" : ""
                  }`}
                ></div>
              </div>
              <span
                className={`ml-3 text-sm ${
                  processingMode === "auto"
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                Automatic
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 bg-gray-800 p-3 rounded border border-gray-700">
            {processingMode === "auto" ? (
              <div>
                <p className="font-medium text-blue-400 mb-1">
                  Automatic Mode:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Documents are processed immediately upon upload</li>
                  <li>Transactions are automatically added to log trails</li>
                  <li>Manual entries are processed right away</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="font-medium text-blue-400 mb-1">Manual Mode:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Documents are only processed when you click "Process File"
                  </li>
                  <li>
                    You can review transactions before adding to log trails
                  </li>
                  <li>
                    Manual entries are always processed and added to log trails
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Documents</h3>
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{files.length}</p>
          <p className="text-sm text-blue-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>Upload new documents</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-blue-900/30 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">
              Manual Entries
            </h3>
            <Calculator className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-sm text-green-500 mt-2 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>Add new transaction</span>
          </p>
        </div>
      </div>

      {/* Conditional Content Based on Input Mode */}
      {inputMode === "file" ? (
        <>
          {/* File Upload Area */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${
              dragActive ? "border-blue-500 bg-gray-800/50" : "border-gray-700"
            } bg-gray-900 p-10 shadow-md transition-colors`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/30">
              <Upload className="h-10 w-10 text-blue-400" />
            </div>
            <p className="mb-2 text-xl font-medium text-white">
              Drag and drop your files here
            </p>
            <p className="mb-6 text-sm text-gray-400">or click to browse</p>
            <input
              type="file"
              onChange={onFileUpload}
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
              <span>{errorMessage}</span>
            </div>
          )}

          {fileTransferProgress && (
            <div className="rounded-lg bg-gray-900 border border-blue-900/30 p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-medium text-white">
                  {fileTransferProgress.mode} {fileTransferProgress.fileName}
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

          {/* Document List */}
          <div className="rounded-xl bg-gray-900 border border-blue-900/30 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">
              Your Documents
            </h2>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-t-blue-500"></div>
                <p className="mt-4 text-gray-400">Loading your files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-16 text-center">
                <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-gray-600" />
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
                      <div>
                        <span className="text-base font-medium text-white">
                          {file.name}
                        </span>
                        {(() => {
                          // Check if file has been processed
                          const processedFiles = JSON.parse(
                            localStorage.getItem("processedFiles") || "[]"
                          );
                          const isProcessed = processedFiles.includes(
                            file.name
                          );

                          return isProcessed ? (
                            <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded-full">
                              Processed
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <button
                        onClick={() => handleFileDownload(file.name)}
                        className="flex flex-1 items-center justify-center rounded-lg bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-900/50 sm:flex-initial"
                      >
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
                        {analyzingFile === file.name
                          ? "Processing..."
                          : (() => {
                              // Check if file has been processed
                              const processedFiles = JSON.parse(
                                localStorage.getItem("processedFiles") || "[]"
                              );
                              const isProcessed = processedFiles.includes(
                                file.name
                              );

                              return isProcessed
                                ? "Process Again"
                                : "Process File";
                            })()}
                      </button>
                      <button
                        onClick={() => handleFileDelete(file.name)}
                        className="flex flex-1 items-center justify-center rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50 sm:flex-initial"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Manual Data Input Form */
        <ManualDataInput onSaveData={handleSaveManualData} />
      )}
    </div>
  );
};

export default DataInput;
