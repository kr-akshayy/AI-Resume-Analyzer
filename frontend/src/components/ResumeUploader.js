'use client';

import { useRef, useState, useCallback } from 'react';

export default function ResumeUploader({ files, setFiles }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(isValidFile);
    addFiles(droppedFiles);
  }, [files]);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(isValidFile);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const isValidFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validExts = ['.pdf', '.docx'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return validTypes.includes(file.type) || validExts.includes(ext);
  };

  const addFiles = (newFiles) => {
    const combined = [...files];
    for (const file of newFiles) {
      if (!combined.find(f => f.name === file.name && f.size === file.size)) {
        combined.push(file);
      }
    }
    setFiles(combined.slice(0, 10)); // Max 10 files
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (name) => {
    return name.toLowerCase().endsWith('.pdf') ? '📄' : '📝';
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        id="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <div className="upload-zone-icon">📁</div>
        <p className="upload-zone-text">
          {dragActive
            ? 'Drop your resumes here!'
            : 'Drag & drop resumes here, or click to browse'}
        </p>
        <p className="upload-zone-hint">
          Supports PDF & DOCX • Max 10 files • 10MB each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="file-list" id="file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="file-item">
              <div className="file-item-info">
                <span className="file-item-icon">{getFileIcon(file.name)}</span>
                <div>
                  <div className="file-item-name">{file.name}</div>
                  <div className="file-item-size">{formatSize(file.size)}</div>
                </div>
              </div>
              <button
                className="file-item-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                title="Remove file"
                id={`remove-file-${index}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
