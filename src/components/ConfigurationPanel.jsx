import React, { useState, useEffect } from 'react';
import { Key, Save, Check, FileSpreadsheet, FileText, Database } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ConfigurationPanel({ onConfigChanged }) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(false);
  const [configEmail, setConfigEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState(false);
  const [nominaCount, setNominaCount] = useState(0);
  const [hasTemplate, setHasTemplate] = useState(false);

  useEffect(() => {
    // Configurar API Key
    const storedKey = localStorage.getItem('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '';
    if (storedKey) {
      setApiKey(storedKey);
      setSavedKey(true);
      if (onConfigChanged) onConfigChanged(storedKey);
    }
    
    // Configurar Email
    const storedEmail = localStorage.getItem('UATP_EMAIL') || 'mi@correo.cl';
    setConfigEmail(storedEmail);
    
    // Revisar si hay Nómina cargada
    const nominaDescargada = localStorage.getItem('NOMINA_ESCUELAS');
    if (nominaDescargada) {
      try { setNominaCount(JSON.parse(nominaDescargada).length); } catch(e){}
    }
    
    // Revisar si hay Plantilla cargada
    const templateGuardada = localStorage.getItem('TEMPLATE_DOCX');
    if (templateGuardada) setHasTemplate(true);
  }, [onConfigChanged]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      setSavedKey(true);
      if (onConfigChanged) onConfigChanged(apiKey.trim());
      setTimeout(() => setSavedKey(false), 3000);
    }
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (configEmail.trim()) {
      localStorage.setItem('UATP_EMAIL', configEmail.trim());
      setSavedEmail(true);
      setTimeout(() => setSavedEmail(false), 3000);
    }
  };

  const handleNominaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Limpiamos la cabecera (ignoramos la fila 1 si es texto)
        const nominaData = [];
        for (let i = 1; i < data.length; i++) {
          if (!data[i][0] && !data[i][1]) continue;
          nominaData.push({
            llave: data[i][0] ? String(data[i][0]).trim() : '',
            oficial: data[i][1] ? String(data[i][1]).trim() : '',
            rbd: data[i][2] ? String(data[i][2]).trim() : '',
            comuna: data[i][3] ? String(data[i][3]).trim() : '',
            director: data[i][4] ? String(data[i][4]).trim() : ''
          });
        }

        localStorage.setItem('NOMINA_ESCUELAS', JSON.stringify(nominaData));
        setNominaCount(nominaData.length);
        alert(`Nómina cargada: ${nominaData.length} escuelas registradas.`);
      } catch (err) {
        alert("Error procesando este archivo Excel. Revisa el formato.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Data = evt.target.result;
      try {
        localStorage.setItem('TEMPLATE_DOCX', base64Data);
        setHasTemplate(true);
        alert("¡Plantilla DOCX cargada correctamente!");
      } catch (err) {
        alert("Error al guardar la plantilla (puede ser muy grande para el almacenamiento local).");
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Database size={20} className="text-gradient" />
        <h3 style={{ margin: 0 }}>Recursos y Configuración</h3>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Configura la llave del sistema, correo de notificaciones, nómina de escuelas (Excel) y la plantilla original del acta (Word).
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {/* Gemini API Key */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>API Key Gemini</div>
          <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <Key size={18} style={{ color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="input-base" 
                placeholder="AIzaSy..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                style={{ flex: 1, padding: '0.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              {savedKey ? <Check size={16} /> : <Save size={16} />}
            </button>
          </form>
        </div>

        {/* Correo de Notificaciones */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Correo de Reportes UATP</div>
          <form onSubmit={handleSaveEmail} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <input 
                type="email" 
                className="input-base" 
                placeholder="correo@slep..." 
                value={configEmail}
                onChange={(e) => setConfigEmail(e.target.value)}
                required
                style={{ flex: 1, padding: '0.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              {savedEmail ? <Check size={16} /> : <Save size={16} />}
            </button>
          </form>
        </div>

        {/* Carga de Nómina */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nómina Base (.xls/.xlsx)</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {nominaCount > 0 ? (
                <><span style={{ color: 'var(--success)' }}>●</span> {nominaCount} elementos cargados</>
              ) : (
                <><span style={{ color: 'var(--danger)' }}>●</span> Sin datos (Se requiere Nómina)</>
              )}
            </div>
          </div>
          <div>
            <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <FileSpreadsheet size={16} /> Cargar Excel
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style={{ display: 'none' }} onChange={handleNominaUpload} />
            </label>
          </div>
        </div>

        {/* Carga de Plantilla DOCX */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Plantilla Original (.docx)</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {hasTemplate ? (
                <><span style={{ color: 'var(--success)' }}>●</span> Plantilla guardada</>
              ) : (
                <><span style={{ color: 'var(--warning)' }}>●</span> Usando formato web (Fallback)</>
              )}
            </div>
          </div>
          <div>
            <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <FileText size={16} /> Cargar DOCX
              <input type="file" accept=".docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={handleTemplateUpload} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
