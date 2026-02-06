import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Generate a PDF from slide HTML content rendered in the browser.
 * This approach works in production without needing Puppeteer/Chrome on the server.
 */
export async function generatePdfFromSlides(
  slideHtmlArray: string[],
  fileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  // Create a hidden container for rendering slides
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1120px;
    height: 630px;
    overflow: hidden;
    z-index: -1;
  `;
  document.body.appendChild(container);

  // A4 landscape dimensions in mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  try {
    for (let i = 0; i < slideHtmlArray.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      onProgress?.(i + 1, slideHtmlArray.length);

      // Render slide HTML into the container
      container.innerHTML = `
        <div style="
          width: 1120px;
          height: 630px;
          background: #000000;
          color: #ffffff;
          overflow: hidden;
          position: relative;
        ">
          ${slideHtmlArray[i]}
        </div>
      `;

      // Wait for images and fonts to load
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture the slide as a canvas
      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: 1120,
        height: 630,
        logging: false,
      });

      // Add canvas as image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload a PDF blob to the server for storage
 */
export async function uploadPdfToServer(
  blob: Blob,
  proposalId: number,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('proposalId', proposalId.toString());

  const response = await fetch('/api/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload PDF');
  }

  const data = await response.json();
  return data.url;
}
