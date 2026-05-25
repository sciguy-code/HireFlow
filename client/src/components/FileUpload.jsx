import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Spinner from './Spinner';

const FileUpload = ({
  label,
  accept = '.pdf',
  maxSizeMB = 5,
  onUpload,
  loading = false,
  error = null,
  currentFileUrl,
  currentFileName = 'Current File'
}) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [localError, setLocalError] = useState(null);

  const validateFile = (file) => {
    setLocalError(null);
    if (!file) return false;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

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
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setLocalFile(file);
        onUpload(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setLocalFile(file);
        onUpload(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {label}
        </span>
      )}
      <div
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${
          dragActive
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
            : 'border-slate-200 hover:border-brand-400 dark:border-slate-800'
        } ${displayError ? 'border-red-400 bg-red-50/10' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {loading ? (
          <div className="flex flex-col items-center space-y-3 py-4">
            <Spinner size="md" />
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Uploading file...</p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  Click to upload
                </button>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-slate-400">
                {accept.toUpperCase().replace(/\./g, '')} up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {localFile && !loading && !displayError && (
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Selected file: {localFile.name}</span>
        </div>
      )}

      {currentFileUrl && !localFile && !loading && (
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 text-xs mt-1">
          <FileText className="w-4 h-4" />
          <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            View Current {currentFileName}
          </a>
        </div>
      )}

      {displayError && (
        <div className="flex items-center space-x-2 text-red-500 text-xs mt-1">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
