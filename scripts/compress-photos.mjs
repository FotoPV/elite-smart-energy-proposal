/**
 * Migration script: Re-compress all existing oversized photos in S3
 * 
 * Downloads each photo > 500KB, compresses with sharp to max 1600x1200 JPEG quality 82,
 * re-uploads to a new S3 key, and updates the database record.
 */
import mysql from 'mysql2/promise';
import sharp from 'sharp';

const SIZE_THRESHOLD = 500 * 1024; // 500KB — compress anything larger

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all photo documents
  const [photos] = await conn.query(`
    SELECT id, customerId, documentType, fileUrl, fileKey, fileName, fileSize, mimeType 
    FROM customerDocuments 
    WHERE documentType IN ('switchboard_photo','meter_photo','roof_photo','property_photo')
    ORDER BY id
  `);
  
  console.log(`Found ${photos.length} photos total`);
  
  const oversized = photos.filter(p => p.fileSize > SIZE_THRESHOLD);
  console.log(`${oversized.length} photos exceed ${(SIZE_THRESHOLD / 1024).toFixed(0)}KB threshold\n`);
  
  if (oversized.length === 0) {
    console.log('No photos need compression. Done!');
    await conn.end();
    return;
  }
  
  // Import storagePut dynamically (needs env vars)
  const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, '');
  const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
  
  let compressed = 0;
  let failed = 0;
  let totalSaved = 0;
  
  for (const photo of oversized) {
    const originalSizeMB = (photo.fileSize / 1024 / 1024).toFixed(1);
    process.stdout.write(`[${photo.id}] ${photo.fileName} (${originalSizeMB}MB) ... `);
    
    try {
      // Download the original photo
      const response = await fetch(photo.fileUrl);
      if (!response.ok) {
        console.log(`SKIP (download failed: ${response.status})`);
        failed++;
        continue;
      }
      const originalBuffer = Buffer.from(await response.arrayBuffer());
      
      // Compress with sharp
      const compressedBuffer = await sharp(originalBuffer)
        .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
      
      const newSizeMB = (compressedBuffer.length / 1024 / 1024).toFixed(1);
      const savings = ((1 - compressedBuffer.length / photo.fileSize) * 100).toFixed(0);
      
      // Upload compressed version to new S3 key
      const newFileName = photo.fileName.replace(/\.(png|webp|heic|heif)$/i, '.jpg');
      const newFileKey = `documents/${photo.customerId}/compressed-${photo.id}-${newFileName}`;
      
      const uploadUrl = new URL('v1/storage/upload', FORGE_API_URL + '/');
      uploadUrl.searchParams.set('path', newFileKey);
      
      const formData = new FormData();
      formData.append('file', new Blob([compressedBuffer], { type: 'image/jpeg' }), newFileName);
      
      const uploadResp = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FORGE_API_KEY}` },
        body: formData,
      });
      
      if (!uploadResp.ok) {
        console.log(`FAIL (upload failed: ${uploadResp.status})`);
        failed++;
        continue;
      }
      
      const { url: newUrl } = await uploadResp.json();
      
      // Update database record
      await conn.query(
        `UPDATE customerDocuments SET fileUrl = ?, fileKey = ?, fileSize = ?, mimeType = 'image/jpeg' WHERE id = ?`,
        [newUrl, newFileKey, compressedBuffer.length, photo.id]
      );
      
      totalSaved += (photo.fileSize - compressedBuffer.length);
      compressed++;
      console.log(`OK → ${newSizeMB}MB (${savings}% smaller)`);
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
      
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Compressed: ${compressed}/${oversized.length} photos`);
  console.log(`Failed: ${failed}`);
  console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
  console.log(`========================================`);
  
  await conn.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
