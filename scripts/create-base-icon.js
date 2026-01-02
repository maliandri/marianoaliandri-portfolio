/**
 * Crea un icono base PNG simple con Sharp
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'icon-base.png');

// Crear SVG válido simple
const svgImage = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#4f46e5"/>
  <text x="256" y="320" font-family="Arial" font-size="200" font-weight="bold" fill="white" text-anchor="middle">MA</text>
  <text x="256" y="380" font-family="Arial" font-size="40" fill="rgba(255,255,255,0.8)" text-anchor="middle">Dev</text>
</svg>
`;

// Convertir SVG a PNG
sharp(Buffer.from(svgImage))
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('✅ Icono base creado: public/icon-base.png');
    console.log('🎨 Ahora puedes ejecutar: npm run pwa:icons');
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
