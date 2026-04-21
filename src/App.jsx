import React, { useState } from 'react';
import ConfigurationPanel from './components/ConfigurationPanel';
import FileUploader from './components/FileUploader';
import ActaViewer from './components/ActaViewer';
import { solicitarAnalisisGemini } from './services/geminiService';
import { Radar } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actaData, setActaData] = useState(null);
  const [error, setError] = useState(null);
  const [nominaEscuelas, setNominaEscuelas] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  // Cargar nomina desde localStorage
  const loadNomina = () => {
    const rawNomina = localStorage.getItem('NOMINA_ESCUELAS');
    if (rawNomina) {
      try { setNominaEscuelas(JSON.parse(rawNomina)); } catch(e) {}
    }
  };

  React.useEffect(() => {
    loadNomina();
  }, []);

  const handleConfigChanged = (key) => {
    if (key) setApiKey(key);
    loadNomina();
  };

  const handleFileSelect = async (file) => {
    if (!apiKey) {
      setError("Por favor configura tu API Key de Gemini primero.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setActaData(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          
          let schoolNameParam = selectedSchool || file.name.replace('.pdf', '');
          const result = await solicitarAnalisisGemini(base64Data, file.type, apiKey, schoolNameParam);
          
          // Mapear con la nómina si existe un matching
          if (selectedSchool) {
            const schoolData = nominaEscuelas.find(s => s.llave === selectedSchool || s.oficial === selectedSchool);
            if (schoolData) {
              result.oficial = schoolData.oficial;
              result.rbd = schoolData.rbd;
              result.comuna = schoolData.comuna;
              result.director = schoolData.director;
            }
          }
          
          setActaData(result);
        } catch (err) {
          setError(err.message || "Error procesando el documento.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error leyendo el archivo.");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error inesperado: " + err.message);
      setIsLoading(false);
    }
  };

  const handleExportEmail = (data) => {
    const defaultEmail = localStorage.getItem('UATP_EMAIL') || 'dionicio.flores@slepvallediguillin.gob.cl';
    const subject = `Resumen Bot UATP: Nueva Acta Procesada`;
    
    // Generar cuerpo del correo
    let body = `Estimado equipo UATP,\n\nSe adjunta el reporte del acta procesada:\n\n`;
    body += `Objetivo: ${data.objetivo}\n`;
    body += `Acuerdo: ${data.acuerdo} (Responsable: ${data.responsable})\n\n`;
    
    if (data.nudos_criticos) {
      body += `NUDOS CRÍTICOS IDENTIFICADOS:\n${data.nudos_criticos}\n\n`;
    }
    
    if (data.tareas && data.tareas.length > 0) {
      body += `TAREAS DETECTADAS:\n`;
      data.tareas.forEach(t => body += `- ${t.titulo}: ${t.notas}\n`);
      body += `\n`;
    }
    
    if (data.eventos && data.eventos.length > 0) {
      body += `EVENTOS DETECTADOS:\n`;
      data.eventos.forEach(e => body += `- ${e.titulo} (${e.inicio})\n`);
    }

    // Abrir cliente de correo predeterminado
    window.location.href = `mailto:${defaultEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '50%', border: '1px solid var(--glass-border)' }}>
            <Radar size={48} className="text-gradient" />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Radar UATP <span className="text-gradient">Local</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Análisis automatizado de actas con IA para Asesores Técnicos Pedagógicos
        </p>
      </header>

      <main>
        <ConfigurationPanel onConfigChanged={handleConfigChanged} />
        
        {error && (
          <div className="glass-panel badge-danger" style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {nominaEscuelas.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>1. Seleccionar Establecimiento</h3>
            <select 
              className="input-base" 
              value={selectedSchool} 
              onChange={e => setSelectedSchool(e.target.value)}
            >
              <option value="">Selección automática (Intenta detectar por el archivo)</option>
              {nominaEscuelas.map((esc, i) => (
                <option key={i} value={esc.llave}>{esc.oficial} (RBD: {esc.rbd})</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: nominaEscuelas.length > 0 ? '1rem' : '2rem' }}>
           {nominaEscuelas.length > 0 && <h3 style={{ marginBottom: '1rem' }}>2. Cargar Documento PDF</h3>}
        </div>

        <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
        
        <ActaViewer data={actaData} onExportEmail={handleExportEmail} />
      </main>
    </div>
  );
}

export default App;
