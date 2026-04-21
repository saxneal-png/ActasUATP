import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

// Funciones para manejar la descarga del DOCX final.
export const generarDocxLocal = (data, templateBase64) => {
  try {
    // 1. Decodificar la plantilla Base64
    const base64Str = templateBase64.split(',')[1] || templateBase64;
    const binaryString = window.atob(base64Str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 2. Cargar en PizZip
    const zip = new PizZip(bytes.buffer);
    
    // 3. Iniciar docxtemplater
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    // 4. Mapear las etiquetas exactas de la plantilla original
    const docData = {
      NOMBRE_ESCUELA: data.oficial || data.escuela_key || '-',
      RBD: data.rbd || '-',
      COMUNA: data.comuna || '-',
      DIRECTOR: data.director || '-',
      FECHA_VISITA: data.fecha || '-',
      OBJETIVO_VISITA: data.objetivo || 'Sin objetivo definido',
      PEDAGOGICO_FORMAL: data.pedagogico || 'Sin observaciones',
      INFRA_FORMAL: data.infra || 'Sin observaciones',
      HALLAZGO_CONVIVENCIA: data.convivencia || 'Sin observaciones',
      ACUERDO_1: data.acuerdo || 'Sin acuerdos',
      RESPONSABLE_1: data.responsable || 'No asignado',
      PLAZO_1: data.plazo || 'Sin plazo',
      PREGUNTA_BOT: data.pregunta || '-',
      ESTANDAR_REF: data.estandar || '-',
      NUDOS_CRITICOS: data.nudos_criticos || 'Sin nudos críticos detectados.'
    };

    // Renderizar
    doc.render(docData);

    // 5. Generar y exportar el documento
    const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    saveAs(out, `Acta_Formal_${data.oficial || 'Escuela'}_${data.fecha.replace(/\//g, '-')}.docx`);
    return true;
  } catch (error) {
    console.error("Error generando DOCX desde plantilla:", error);
    return false;
  }
};
