/**
 * Script para crear icono placeholder temporal
 * No requiere dependencias externas - usa Canvas API de Node.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Crear SVG placeholder simple
const createPlaceholderSVG = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo con color brand -->
  <rect width="512" height="512" fill="#4f46e5"/>

  <!-- Iniciales MA -->
  <text x="256" y="320"
        font-family="Arial, sans-serif"
        font-size="200"
        font-weight="bold"
        fill="white"
        text-anchor="middle">MA</text>

  <!-- Subtítulo -->
  <text x="256" y="380"
        font-family="Arial, sans-serif"
        font-size="40"
        fill="rgba(255,255,255,0.8)"
        text-anchor="middle">Full Stack & BI</text>
</svg>`;
};

// Guardar SVG como icon-base
const svgContent = createPlaceholderSVG();
const svgPath = path.join(publicDir, 'icon-base.svg');

fs.writeFileSync(svgPath, svgContent, 'utf-8');

console.log('✅ Icono placeholder creado en public/icon-base.svg');
console.log('📝 Puedes reemplazarlo con tu logo real cuando lo tengas');
