import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export default function FileUploader({ onFileSelect, isLoading }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Por favor sube un archivo PDF válido.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div 
        className={`drop-zone ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input 
          id="file-input" 
          type="file" 
          accept="application/pdf" 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        
        {isLoading ? (
          <div className="animate-fade-in">
            <div style={{ display: 'inline-block', marginBottom: '1rem' }} className="spinner">
              <UploadCloud size={48} />
            </div>
            <h3>Procesando Acta con IA...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Por favor espera un momento, esto podría tomar unos segundos.</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <UploadCloud size={48} />
            <h3 style={{ marginBottom: '0.5rem' }}>Arrastra un PDF de Acta aquí</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>o haz clic para explorar tus archivos</p>
            <div className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={14} /> PDF soportado
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
