import { Express, Request, Response } from 'express';
import { storagePut } from './storage';

/**
 * Register the PDF upload route for client-side generated PDFs.
 * The client generates the PDF using jsPDF + html2canvas, then uploads it here for S3 storage.
 */
export function registerPdfUploadRoute(app: Express) {
  app.post('/api/upload-pdf', async (req: Request, res: Response) => {
    try {
      // Accept raw binary data with content type
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks);
          
          // Parse multipart form data manually or use raw body
          // For simplicity, we'll accept base64 JSON payload
          let pdfBuffer: Buffer;
          let fileName: string;
          let proposalId: string;
          
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            const jsonBody = JSON.parse(body.toString());
            pdfBuffer = Buffer.from(jsonBody.pdfData, 'base64');
            fileName = jsonBody.fileName || `proposal-${Date.now()}.pdf`;
            proposalId = jsonBody.proposalId || '0';
          } else {
            // Fallback: treat entire body as PDF
            pdfBuffer = body;
            fileName = `proposal-${Date.now()}.pdf`;
            proposalId = '0';
          }
          
          // Upload to S3
          const fileKey = `exports/${fileName}`;
          const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');
          
          res.json({ success: true, url, fileName });
        } catch (err) {
          console.error('PDF upload processing error:', err);
          res.status(500).json({ success: false, error: 'Failed to process PDF upload' });
        }
      });
    } catch (err) {
      console.error('PDF upload error:', err);
      res.status(500).json({ success: false, error: 'Failed to upload PDF' });
    }
  });
}
