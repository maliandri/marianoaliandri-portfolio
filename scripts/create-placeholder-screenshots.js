/**
 * Crea screenshots placeholder para desarrollo
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const screenshotsDir = path.join(publicDir, 'screenshots');

// Crear directorio si no existe
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Screenshots móvil
const createMobileScreenshot = (number, title) => {
  const svg = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect width="1080" height="1920" fill="#f9fafb"/>
      <rect x="0" y="0" width="1080" height="400" fill="#4f46e5"/>
      <text x="540" y="200" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Mariano Aliandri</text>
      <text x="540" y="280" font-family="Arial" font-size="40" fill="rgba(255,255,255,0.9)" text-anchor="middle">Full Stack Developer</text>
      <text x="540" y="960" font-family="Arial" font-size="60" fill="#1f2937" text-anchor="middle">${title}</text>
      <text x="540" y="1050" font-family="Arial" font-size="35" fill="#6b7280" text-anchor="middle">Screenshot ${number}</text>
      <text x="540" y="1800" font-family="Arial" font-size="30" fill="#9ca3af" text-anchor="middle">Placeholder</text>
    </svg>
  `;

  return Buffer.from(svg);
};

// Screenshot desktop
const createDesktopScreenshot = () => {
  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="1920" height="1080" fill="#f9fafb"/>
      <rect x="0" y="0" width="1920" height="300" fill="#4f46e5"/>
      <text x="960" y="150" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Portfolio - Mariano Aliandri</text>
      <text x="960" y="220" font-family="Arial" font-size="40" fill="rgba(255,255,255,0.9)" text-anchor="middle">Full Stack Developer</text>
      <text x="960" y="540" font-family="Arial" font-size="60" fill="#1f2937" text-anchor="middle">Vista Desktop</text>
      <text x="960" y="630" font-family="Arial" font-size="35" fill="#6b7280" text-anchor="middle">Screenshot Placeholder</text>
      <text x="960" y="950" font-family="Arial" font-size="30" fill="#9ca3af" text-anchor="middle">Reemplazar con captura real</text>
    </svg>
  `;

  return Buffer.from(svg);
};

async function generateScreenshots() {
  console.log('📸 Generando screenshots placeholder...\n');

  try {
    // Mobile screenshots
    console.log('📱 Screenshots móvil...');
    await sharp(createMobileScreenshot(1, 'Página Principal'))
      .png()
      .toFile(path.join(screenshotsDir, 'mobile-1.png'));
    console.log('  ✅ mobile-1.png');

    await sharp(createMobileScreenshot(2, 'Proyectos'))
      .png()
      .toFile(path.join(screenshotsDir, 'mobile-2.png'));
    console.log('  ✅ mobile-2.png');

    // Desktop screenshot
    console.log('\n💻 Screenshot desktop...');
    await sharp(createDesktopScreenshot())
      .png()
      .toFile(path.join(screenshotsDir, 'desktop-1.png'));
    console.log('  ✅ desktop-1.png');

    console.log('\n✨ Screenshots placeholder generados exitosamente!');
    console.log('📁 Ubicación: public/screenshots/');
    console.log('\n⚠️  Reemplázalos con capturas reales para producción');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateScreenshots();
