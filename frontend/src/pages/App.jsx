import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Trash2, FileText, AlertCircle, Eye, X } from 'lucide-react';
import Swal from 'sweetalert2';

function App({ actor, isAuthenticated, login, logout }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [fileTransferProgress, setFileTransferProgress] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingFile, setAnalyzingFile] = useState("");

  const OPENROUTER_API_KEY = "your-api-key";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (actor) {
      loadFiles();
    }
  }, [actor, isAuthenticated, navigate]);

  const DocumentAnalysisCard = ({ analysis, onClose }) => {
    if (!analysis) return null;
    
    return (
      <div className="card card-border bg-base-100 w-full lg:w-4/5 mx-auto mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-xl font-semibold">{analysis.fileName} Analysis</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle">
              <X size={18} />
            </button>
          </div>
          <div className="divider my-2"></div>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {analysis.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  async function processDocumentWithAI(fileContent, fileName) {
    try {
      setAnalyzingFile(fileName);
      
      Swal.fire({
        title: 'Processing document...',
        text: `Analyzing ${fileName} with AI`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "mistralai/mistral-small-3.1-24b-instruct:free", 
          "messages": [
            {
              "role": "user",
              "content": `Please analyze this document and provide a summary of key points, insights, and any important information: ${fileContent}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = await response.json();
      Swal.close();
      
      setAnalysisResult({
        fileName: fileName,
        content: result.choices[0].message.content
      });
      
      return result;
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Processing Failed',
        text: `Failed to process ${fileName}: ${error.message}`
      });
      console.error('AI processing failed:', error);
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
      console.error('Failed to load files:', error);
      setErrorMessage('Failed to load files. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load files. Please try again.'
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
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
      setErrorMessage('Please select a file to upload.');
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a file to upload.'
      });
      return;
    }

    try {
      const fileExists = await actor.checkFileExists(file.name);
      if (fileExists) {
        setErrorMessage(`File "${file.name}" already exists. Please choose a different file name.`);
        Swal.fire({
          icon: 'warning',
          title: 'File Already Exists',
          text: `File "${file.name}" already exists. Please choose a different file name.`
        });
        return;
      }

      setFileTransferProgress({
        mode: 'Uploading',
        fileName: file.name,
        progress: 0
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
              progress: Math.floor(((i + 1) / totalChunks) * 100)
            }));
          }
          
          Swal.fire({
            icon: 'success',
            title: 'Upload Complete',
            text: `${file.name} has been uploaded successfully!`
          });
        } catch (error) {
          console.error('Upload failed:', error);
          setErrorMessage(`Failed to upload ${file.name}: ${error.message}`);
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: `Failed to upload ${file.name}: ${error.message}`
          });
        } finally {
          await loadFiles();
          setFileTransferProgress(null);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error checking file exists:', error);
      setErrorMessage(`Error: ${error.message}`);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${error.message}`
      });
    }
  }

  async function handleFileProcessing(name) {
    try {
      Swal.fire({
        title: 'Reading file...',
        text: 'Please wait while we load the file content',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const totalChunks = Number(await actor.getTotalChunks(name));
      const fileTypeResult = await actor.getFileType(name);
      const fileType = fileTypeResult && fileTypeResult.length > 0 ? fileTypeResult[0] : '';
      
      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkResult = await actor.getFileChunk(name, BigInt(i));
        const chunkBlob = chunkResult && chunkResult.length > 0 ? chunkResult[0] : null;
        
        if (chunkBlob) {
          chunks.push(chunkBlob);
        } else {
          throw new Error(`Failed to retrieve chunk ${i}`);
        }
      }

      const data = new Blob(chunks, { type: fileType });
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        
        await processDocumentWithAI(fileContent, name);
      };
      
      if (fileType.includes('text') || 
          fileType.includes('csv') || 
          fileType.includes('spreadsheetml') || 
          fileType.includes('excel') ||
          fileType.includes('document') ||
          fileType.includes('pdf') || 
          fileType.includes('jpg') ||
          fileType.includes('png') ||
          fileType.includes('jpeg')) {
        reader.readAsText(data);
      } else {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Unsupported File Type',
          text: `File type "${fileType}" cannot be processed by our AI. Please upload a text or document file.`
        });
      }
    } catch (error) {
      console.error('Processing failed:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Processing Failed',
        text: `Failed to process ${name}: ${error.message}`
      });
    }
  }

  async function handleFileDownload(name) {
    setFileTransferProgress({
      mode: 'Downloading',
      fileName: name,
      progress: 0
    });
    try {
      const totalChunks = Number(await actor.getTotalChunks(name));
      const fileTypeResult = await actor.getFileType(name);
      const fileType = fileTypeResult && fileTypeResult.length > 0 ? fileTypeResult[0] : '';
      
      let chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const chunkResult = await actor.getFileChunk(name, BigInt(i));
        const chunkBlob = chunkResult && chunkResult.length > 0 ? chunkResult[0] : null;
        
        if (chunkBlob) {
          chunks.push(chunkBlob);
        } else {
          throw new Error(`Failed to retrieve chunk ${i}`);
        }

        setFileTransferProgress((prev) => ({
          ...prev,
          progress: Math.floor(((i + 1) / totalChunks) * 100)
        }));
      }

      const data = new Blob(chunks, { type: fileType });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        text: `${name} has been downloaded successfully!`,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Download failed:', error);
      setErrorMessage(`Failed to download ${name}: ${error.message}`);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: `Failed to download ${name}: ${error.message}`
      });
    } finally {
      setFileTransferProgress(null);
    }
  }

  async function handleFileDelete(name) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const success = await actor.deleteFile(name);
          if (success) {
            await loadFiles();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `${name} has been deleted.`,
              timer: 2000,
              timerProgressBar: true
            });
          } else {
            setErrorMessage('Failed to delete file');
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'Failed to delete file.'
            });
          }
        } catch (error) {
          console.error('Delete failed:', error);
          setErrorMessage(`Failed to delete ${name}: ${error.message}`);
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: `Failed to delete ${name}: ${error.message}`
          });
        }
      }
    });
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const sheetExtensions = ['xlsx', 'csv'];
    
    return <FileText className="text-gray-600" />;
  };

  const closeAnalysis = () => {
    setAnalysisResult(null);
    setAnalyzingFile("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="container mx-auto max-w-3xl">
        {!isAuthenticated ? (
          <div className="rounded-xl bg-gray-500 border-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">Authentication Required</h2>
            <p className="mb-6 text-gray-600">Please sign in to access your secure Hi! Countant storage.</p>
            <button 
              onClick={login} 
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Login with Internet Identity
            </button>
          </div>
        ) : (
          <div className="space-y-6"> 
            <div 
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} bg-white p-10 shadow-md transition-colors`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <p className="mb-2 text-xl font-medium text-gray-800">Drag and drop your files here</p>
              <p className="mb-6 text-sm text-gray-500">or click to browse</p>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Choose File
              </label>
            </div>

            {errorMessage && (
              <div className="flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-800 shadow-sm">
                <AlertCircle className="mr-3 h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {fileTransferProgress && (
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-medium text-gray-800">
                    {fileTransferProgress.mode} {fileTransferProgress.fileName}
                  </span>
                  <span className="text-base font-medium text-blue-600">{fileTransferProgress.progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-200">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${fileTransferProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Your Files</h2>
              
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-4 text-gray-500">Loading your files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-lg text-gray-500">You have no files yet. Upload some to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <div key={file.name} className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getFileIcon(file.name)}
                        </div>
                        <span className="text-base font-medium text-gray-800">{file.name}</span>
                      </div>
                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <button 
                          onClick={() => handleFileDownload(file.name)} 
                          className="flex flex-1 items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:flex-initial"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </button>
                        <button 
                          onClick={() => handleFileProcessing(file.name)}
                          disabled={analyzingFile === file.name}
                          className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-initial ${
                            analyzingFile === file.name 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {analyzingFile === file.name ? 'Processing...' : 'Process File'}
                        </button>
                        <button 
                          onClick={() => handleFileDelete(file.name)} 
                          className="flex flex-1 items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 sm:flex-initial"
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
              <DocumentAnalysisCard 
                analysis={analysisResult} 
                onClose={closeAnalysis} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;