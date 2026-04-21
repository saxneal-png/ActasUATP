import React from 'react';
import { generarDocxLocal } from '../services/docTemplateService';
import { Mail, Briefcase, Calendar, Info, MapPin, Building, Flag, Download } from 'lucide-react';

export default function ActaViewer({ data, onExportEmail }) {
  if (!data) return null;

  const handleExportDoc = () => {
    // Si hay una plantilla en localStorage, intentamos usar docxtemplater primero
    const templateGuardada = localStorage.getItem('TEMPLATE_DOCX');
    if (templateGuardada) {
      const exito = generarDocxLocal(data, templateGuardada);
      if (exito) return; 
      // Si falla, hace fallback al HTML
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Acta Formal</title>
        <style>
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; padding: 2cm; }
          h1 { text-align: center; font-size: 16pt; color: #2c3e50; border-bottom: 1px solid #2c3e50; padding-bottom: 5px; margin-bottom: 20px;}
          h2 { font-size: 13pt; color: #34495e; margin-top: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 3px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>ACTA VISITA TÉCNICA PEDAGÓGICA (UATP)</h1>
        
        <div class="section">
          <p><span class="label">Establecimiento:</span> ${data.oficial || data.escuela_key || '-'}</p>
          <p><span class="label">RBD / Comuna:</span> ${data.rbd || '-'} / ${data.comuna || '-'}</p>
          <p><span class="label">Director(a):</span> ${data.director || '-'}</p>
          <br/>
          <p><span class="label">Fecha:</span> ${data.fecha}</p>
          <p><span class="label">Objetivo de la Visita:</span> ${data.objetivo}</p>
          <p><span class="label">Estándar MBDLE Referencia:</span> ${data.estandar}</p>
        </div>

        <h2>I. Observaciones según Dimensiones MBDLE</h2>
        <div class="section">
          <p><span class="label">Liderazgo Pedagógico:</span><br/>${data.pedagogico}</p>
          <p><span class="label">Gestión de Recursos e Infraestructura:</span><br/>${data.infra}</p>
          <p><span class="label">Convivencia Escolar y Clima:</span><br/>${data.convivencia}</p>
        </div>

        <h2>II. Acuerdos y Compromisos</h2>
        <div class="section">
          <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; border-color: #000;">
            <tr>
              <th style="background-color: #eee; text-align: left;">Acuerdo Principal</th>
              <th style="background-color: #eee; text-align: left;">Responsable</th>
              <th style="background-color: #eee; text-align: left;">Plazo</th>
            </tr>
            <tr>
              <td>${data.acuerdo}</td>
              <td>${data.responsable}</td>
              <td>${data.plazo}</td>
            </tr>
          </table>
        </div>

        <h2>III. Reflexión Estratégica y Nudos Críticos</h2>
        <div class="section">
          <p style="font-style: italic;">"${data.pregunta}"</p>
          ${data.nudos_criticos ? `
          <br/>
          <p><span class="label">Nudos Críticos (Modelo Desarrollo / MBDLE):</span><br/>${data.nudos_criticos}</p>
          ` : ''}
        </div>

        ${data.tareas && data.tareas.length > 0 ? `
        <h2>IV. Tareas y Acciones Definidas</h2>
        <div class="section">
          <ul>
            ${data.tareas.map(t => `<li style="margin-bottom: 10px;"><strong>${t.titulo}:</strong> ${t.notas}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${data.eventos && data.eventos.length > 0 ? `
        <h2>V. Próximos Eventos</h2>
        <div class="section">
          <ul>
            ${data.eventos.map(e => `<li><strong>${e.titulo}</strong> - Fecha programada: ${e.inicio} ${e.lugar ? `<br/>Lugar: ${e.lugar}` : ''}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <br/><br/><br/><br/>
        <table style="width: 100%; text-align: center; border: none;">
          <tr>
            <td style="width: 50%;"><div style="width: 80%; margin: 0 auto; border-top: 1px solid #000; padding-top: 10px;">Asesor Técnico Pedagógico (UATP)</div></td>
            <td style="width: 50%;"><div style="width: 80%; margin: 0 auto; border-top: 1px solid #000; padding-top: 10px;">Director(a) / Equipo Directivo</div></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_${(data.oficial || data.fecha).replace(/\//g, '-')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Resultados del Acta</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleExportDoc} className="btn btn-secondary">
            <Download size={18} /> Descargar Acta (.doc)
          </button>
          <button onClick={() => onExportEmail(data)} className="btn btn-primary">
            <Mail size={18} /> Notificar a UATP
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Metadatos principales */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Info size={20} /> Metadatos Oficiales
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.oficial && (
               <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)' }}>
                 <strong>{data.oficial}</strong><br/>
                 <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                   RBD: {data.rbd} | Comuna: {data.comuna} <br/>
                   Director(a): {data.director}
                 </span>
               </div>
            )}
            <p><strong>Fecha:</strong> {data.fecha}</p>
            <p><strong>Objetivo:</strong> {data.objetivo}</p>
            <p><strong>Estándar MBDLE:</strong> <span className="badge badge-success">{data.estandar}</span></p>
          </div>
        </div>

        {/* Dimensiones MBDLE */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building size={20} /> Dimensiones MBDLE
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Liderazgo Pedagógico:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{data.pedagogico}</p>
            </div>
            <div>
              <strong>Infraestructura:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{data.infra}</p>
            </div>
            <div>
              <strong>Convivencia:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{data.convivencia}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tareas y Acuerdos */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Flag size={20} /> Acuerdos y Pregunta Estratégica
        </h3>
        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Acuerdo Principal:</strong> {data.acuerdo} <br/>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Responsable: {data.responsable} | Plazo: {data.plazo}
          </span>
        </div>
        <div style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem', marginBottom: data.nudos_criticos ? '1rem' : '0' }}>
          <strong>Pregunta para el Equipo Directivo:</strong>
          <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{data.pregunta}"</p>
        </div>
        {data.nudos_criticos && (
          <div style={{ borderLeft: '4px solid var(--danger)', paddingLeft: '1rem' }}>
            <strong style={{ color: 'var(--danger)' }}>Nudos Críticos Identificados (Desarrollo Capacidades/MBDLE):</strong>
            <p style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>{data.nudos_criticos}</p>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Tareas detectadas */}
        {data.tareas && data.tareas.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Briefcase size={20} /> Tareas Detectadas ({data.tareas.length})
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.tareas.map((tarea, idx) => (
                <li key={idx} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px' }}>
                  <strong>{tarea.titulo}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{tarea.notas}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Eventos detectados */}
        {data.eventos && data.eventos.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calendar size={20} /> Eventos Detectados ({data.eventos.length})
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.eventos.map((evento, idx) => (
                <li key={idx} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{evento.titulo}</strong>
                    <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{evento.inicio}</span>
                  </div>
                  {evento.lugar && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <MapPin size={12} /> {evento.lugar}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
