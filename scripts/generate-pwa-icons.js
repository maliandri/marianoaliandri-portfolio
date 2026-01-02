/**
 * Script para generar iconos PWA en todos los tamaños necesarios
 *
 * Requisitos:
 * 1. Instalar sharp: npm install -D sharp
 * 2. Tener una imagen base de alta resolución (mínimo 512x512px) en public/icon-base.png
 *
 * Uso: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SHORTCUT_SIZES = [96];

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Buscar icon-base.png o icon-base.svg
let baseIconPath = path.join(publicDir, 'icon-base.png');
if (!fs.existsSync(baseIconPath)) {
  baseIconPath = path.join(publicDir, 'icon-base.svg');
}

// Crear directorio de iconos si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Verificar que existe la imagen base
if (!fs.existsSync(baseIconPath)) {
  console.error('❌ Error: No se encontró icon-base.png o icon-base.svg en /public/');
  console.log('📝 Por favor, coloca una imagen de alta resolución (512x512 o mayor) en:');
  console.log('   public/icon-base.png o public/icon-base.svg');
  process.exit(1);
}

console.log(`📂 Usando: ${path.basename(baseIconPath)}`)

console.log('🎨 Generando iconos PWA...\n');

async function generateIcons() {
  try {
    // Generar iconos estándar
    console.log('📱 Generando iconos estándar...');
    for (const size of ICON_SIZES) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

      await sharp(baseIconPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✅ Generado: icon-${size}x${size}.png`);
    }

    // Generar iconos maskable (con padding para Android adaptive icons)
    console.log('\n🎭 Generando iconos maskable (Android Adaptive)...');
    for (const size of [192, 512]) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);

      // Maskable icons necesitan 20% de padding en todos los lados
      const iconSize = Math.round(size * 0.6); // Icono al 60% del tamaño
      const padding = Math.round((size - iconSize) / 2);

      await sharp(baseIconPath)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 79, g: 70, b: 229, alpha: 1 }, // #4f46e5
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✅ Generado: icon-${size}x${size}-maskable.png`);
    }

    // Generar iconos para shortcuts
    console.log('\n🔗 Generando iconos para shortcuts...');
    const shortcuts = [
      { name: 'shortcut-contact.png', emoji: '📧' },
      { name: 'shortcut-projects.png', emoji: '💼' },
      { name: 'shortcut-tools.png', emoji: '🧮' },
    ];

    for (const shortcut of shortcuts) {
      const outputPath = path.join(iconsDir, shortcut.name);

      // Crear un icono simple con fondo de color
      const svgIcon = `
        <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="20" fill="#4f46e5"/>
          <text x="48" y="65" font-size="48" text-anchor="middle">${shortcut.emoji}</text>
        </svg>
      `;

      await sharp(Buffer.from(svgIcon))
        .png()
        .toFile(outputPath);

      console.log(`  ✅ Generado: ${shortcut.name}`);
    }

    console.log('\n✨ ¡Todos los iconos han sido generados exitosamente!\n');
    console.log('📁 Ubicación: public/icons/\n');

  } catch (error) {
    console.error('❌ Error al generar iconos:', error);
    process.exit(1);
  }
}

generateIcons();
