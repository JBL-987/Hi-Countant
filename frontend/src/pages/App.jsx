import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Trash2, FileText, AlertCircle } from 'lucide-react';

function App({ actor, isAuthenticated, login, logout }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [fileTransferProgress, setFileTransferProgress] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (actor) {
      loadFiles();
    }
  }, [actor, isAuthenticated, navigate]);

  async function loadFiles() {
    setIsLoading(true);
    try {
      const fileList = await actor.getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      setErrorMessage('Failed to load files. Please try again.');
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
      return;
    }

    try {
      const fileExists = await actor.checkFileExists(file.name);
      if (fileExists) {
        setErrorMessage(`File "${file.name}" already exists. Please choose a different file name.`);
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
        const chunkSize = 1024 * 1024; // 1 MB chunks
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
        } catch (error) {
          console.error('Upload failed:', error);
          setErrorMessage(`Failed to upload ${file.name}: ${error.message}`);
        } finally {
          await loadFiles();
          setFileTransferProgress(null);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error checking file exists:', error);
      setErrorMessage(`Error: ${error.message}`);
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
    } catch (error) {
      console.error('Download failed:', error);
      setErrorMessage(`Failed to download ${name}: ${error.message}`);
    } finally {
      setFileTransferProgress(null);
    }
  }

  async function handleFileDelete(name) {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const success = await actor.deleteFile(name);
        if (success) {
          await loadFiles();
        } else {
          setErrorMessage('Failed to delete file');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        setErrorMessage(`Failed to delete ${name}: ${error.message}`);
      }
    }
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
    
    return <FileText className="text-gray-600" />;
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
                      <div className="flex w-full space-x-3 sm:w-auto">
                        <button 
                          onClick={() => handleFileDownload(file.name)} 
                          className="flex flex-1 items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 sm:flex-initial"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;