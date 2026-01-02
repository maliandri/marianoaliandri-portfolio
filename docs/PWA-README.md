# 📱 Progressive Web App (PWA) - Portfolio Mariano Aliandri

Esta documentación cubre la implementación completa de PWA y el proceso para publicar en Google Play Store.

---

## 📚 Índice de Documentación

1. **[GUIA-PLAY-STORE.md](./GUIA-PLAY-STORE.md)** - Guía paso a paso completa para publicar en Play Store
2. **[PLAY-STORE-ASSETS.md](./PLAY-STORE-ASSETS.md)** - Lista de assets gráficos necesarios
3. **[PWA-CHECKLIST.md](./PWA-CHECKLIST.md)** - Checklist de verificación antes de publicar
4. **Este archivo (PWA-README.md)** - Resumen y quick start

---

## ⚡ Quick Start

### 1. Instalar Dependencias

Ya instaladas automáticamente:
```bash
npm install
```

Paquetes PWA incluidos:
- `vite-plugin-pwa` - Plugin de Vite para PWA
- `workbox-window` - Service Worker management

### 2. Desarrollo Local

```bash
npm run dev
```

El Service Worker está habilitado en desarrollo para testing.

### 3. Build de Producción

```bash
npm run build
npm run preview
```

Esto generará:
- Service Worker en `/dist/sw.js`
- Manifest en `/dist/manifest.webmanifest`
- Assets optimizados

---

## 🎯 ¿Qué se ha implementado?

### ✅ Manifest.json Completo

Ubicación: [public/manifest.json](../public/manifest.json)

Incluye:
- Metadata completa (nombre, descripción, idioma)
- 10 tamaños de iconos (72px a 512px)
- Iconos maskable para Android
- Screenshots para Play Store
- Shortcuts de acceso rápido
- Configuración de display standalone

### ✅ Service Worker con Workbox

Configuración: [vite.config.js](../vite.config.js)

Estrategias de cache:
- **CacheFirst**: Google Fonts, imágenes, assets estáticos
- **StaleWhileRevalidate**: Firebase Storage, JS/CSS
- **NetworkFirst**: APIs y datos dinámicos

Características:
- Auto-update cuando hay nueva versión
- Precaching de assets críticos
- Soporte offline
- Cleanup de caches antiguos

### ✅ Meta Tags PWA

Ubicación: [index.html](../index.html) líneas 35-41

Incluye:
- Apple mobile web app capable
- Theme color para Android/iOS
- Application name
- Status bar style

### ✅ Digital Asset Links (TWA)

Ubicación: [public/.well-known/assetlinks.json](../public/.well-known/assetlinks.json)

**⚠️ IMPORTANTE:** Debes actualizar el SHA256 fingerprint después de generar el keystore con Bubblewrap.

### ✅ Scripts de Generación de Iconos

Ubicación: [scripts/generate-pwa-icons.js](../scripts/generate-pwa-icons.js)

Uso:
```bash
# 1. Coloca tu logo en public/icon-base.png (512x512 mínimo)
npm install -D sharp

# 2. Genera todos los iconos
node scripts/generate-pwa-icons.js
```

Genera:
- 8 tamaños de iconos estándar
- 2 iconos maskable (Android Adaptive)
- 3 iconos para shortcuts

---

## 📂 Estructura de Archivos PWA

```
marianoaliandri-portfolio/
├── public/
│   ├── manifest.json                    # ✅ Manifest PWA completo
│   ├── .well-known/
│   │   └── assetlinks.json              # ✅ Digital Asset Links para TWA
│   ├── icons/                           # ⚠️ Generar con script
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   ├── icon-512x512.png
│   │   ├── icon-192x192-maskable.png
│   │   ├── icon-512x512-maskable.png
│   │   ├── shortcut-contact.png
│   │   ├── shortcut-projects.png
│   │   └── shortcut-tools.png
│   ├── screenshots/                     # ⚠️ Capturar manualmente
│   │   ├── mobile-1.png
│   │   ├── mobile-2.png
│   │   └── desktop-1.png
│   ├── assets/                          # ⚠️ Crear para Play Store
│   │   └── feature-graphic.png         # 1024x500
│   ├── favicon.ico                      # ✅ Ya existe
│   ├── apple-touch-icon.png             # ✅ Ya existe
│   ├── privacy-policy.html              # ✅ Ya existe
│   ├── terms-of-service.html            # ✅ Ya existe
│   └── data-deletion.html               # ✅ Ya existe
│
├── scripts/
│   └── generate-pwa-icons.js            # ✅ Script de generación
│
├── docs/
│   ├── PWA-README.md                    # ✅ Este archivo
│   ├── GUIA-PLAY-STORE.md               # ✅ Guía completa
│   ├── PLAY-STORE-ASSETS.md             # ✅ Lista de assets
│   └── PWA-CHECKLIST.md                 # ✅ Checklist
│
├── vite.config.js                       # ✅ Configuración PWA
├── index.html                           # ✅ Meta tags actualizados
└── package.json                         # ✅ Dependencias instaladas
```

**Leyenda:**
- ✅ Ya completado
- ⚠️ Necesitas completar antes de publicar

---

## 🚀 Proceso de Publicación en 5 Pasos

### Paso 1: Preparar PWA
```bash
# 1. Generar iconos
node scripts/generate-pwa-icons.js

# 2. Capturar screenshots (ver PLAY-STORE-ASSETS.md)
# 3. Crear feature graphic en Canva

# 4. Build de producción
npm run build

# 5. Deploy a producción (Netlify/Vercel)
git push origin main
```

### Paso 2: Verificar PWA
```bash
# 1. Abre https://marianoaliandri.com.ar
# 2. DevTools > Lighthouse > PWA
# 3. Verifica score ≥ 80

# Ver checklist completo: docs/PWA-CHECKLIST.md
```

### Paso 3: Instalar Bubblewrap y Generar AAB
```bash
# Ver guía completa: docs/GUIA-PLAY-STORE.md (Parte 3)

# Resumen:
npm install -g @bubblewrap/cli
mkdir twa-marianoaliandri
cd twa-marianoaliandri
bubblewrap init --manifest=https://marianoaliandri.com.ar/manifest.json
```

### Paso 4: Configurar Digital Asset Links
```bash
# 1. Obtener SHA256 fingerprint
cd twa-marianoaliandri
bubblewrap fingerprint

# 2. Actualizar public/.well-known/assetlinks.json
# 3. Hacer commit y push

# 4. Verificar accesibilidad
curl https://marianoaliandri.com.ar/.well-known/assetlinks.json
```

### Paso 5: Publicar en Play Store
```bash
# 1. Compilar AAB
bubblewrap build

# 2. Subir a Play Console
# Ver guía completa: docs/GUIA-PLAY-STORE.md (Parte 4)
```

---

## 🔧 Comandos Útiles

### PWA Development
```bash
# Desarrollo con SW habilitado
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Generar iconos PWA
node scripts/generate-pwa-icons.js
```

### Testing PWA
```bash
# Lighthouse desde CLI
npm install -g lighthouse
lighthouse https://marianoaliandri.com.ar --view

# Verificar manifest
curl https://marianoaliandri.com.ar/manifest.json | jq

# Verificar service worker
# DevTools > Application > Service Workers
```

### Bubblewrap Commands
```bash
# Inicializar proyecto TWA
bubblewrap init --manifest=URL

# Ver fingerprint
bubblewrap fingerprint

# Compilar APK/AAB
bubblewrap build

# Actualizar configuración
bubblewrap update

# Instalar APK en dispositivo
bubblewrap install
```

---

## 📊 Verificación con Lighthouse

### Requisitos Mínimos PWA

| Categoría | Score Mínimo | Checks Importantes |
|-----------|--------------|-------------------|
| PWA | ≥ 80 | Installable, Service Worker, Manifest |
| Performance | ≥ 80 | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Best Practices | ≥ 80 | HTTPS, Sin errores de consola |
| SEO | ≥ 80 | Meta tags, viewport, robots.txt |

### Cómo ejecutar Lighthouse

**Opción 1: Chrome DevTools**
1. F12 > Lighthouse tab
2. Seleccionar categorías
3. "Analyze page load"

**Opción 2: CLI**
```bash
lighthouse https://marianoaliandri.com.ar \
  --only-categories=pwa,performance \
  --view
```

**Opción 3: PageSpeed Insights**
https://pagespeed.web.dev/

---

## 🎨 Assets Pendientes

Antes de publicar, necesitas crear/capturar:

### Obligatorios:
- [ ] **Iconos PWA** - Ejecutar `node scripts/generate-pwa-icons.js`
- [ ] **Screenshots móvil** (2-8) - 1080x1920px
- [ ] **Feature graphic** - 1024x500px en Canva

### Opcionales:
- [ ] Screenshots desktop - 1920x1080px
- [ ] Screenshots tablet
- [ ] Video promocional

Ver detalles: [PLAY-STORE-ASSETS.md](./PLAY-STORE-ASSETS.md)

---

## ⚙️ Configuración Avanzada

### Personalizar Service Worker

Edita [vite.config.js](../vite.config.js):

```javascript
VitePWA({
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,jpg}'],
    runtimeCaching: [
      // Agregar nuevas estrategias de cache
      {
        urlPattern: /^https:\/\/tu-api\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 horas
          },
        },
      },
    ],
  },
})
```

### Actualizar Manifest

Edita [public/manifest.json](../public/manifest.json):

```json
{
  "shortcuts": [
    {
      "name": "Nuevo Shortcut",
      "url": "/nueva-ruta",
      "icons": [{ "src": "/icons/nuevo-icono.png", "sizes": "96x96" }]
    }
  ]
}
```

### Agregar más Meta Tags

Edita [index.html](../index.html):

```html
<meta name="apple-mobile-web-app-title" content="Título iOS">
<meta name="msapplication-config" content="/browserconfig.xml">
```

---

## 🐛 Troubleshooting

### Service Worker no se registra

**Problema:** DevTools muestra "No service worker registered"

**Solución:**
1. Verifica que estés en HTTPS (o localhost)
2. Limpia cache: DevTools > Application > Clear storage
3. Verifica vite.config.js tenga VitePWA configurado
4. Reconstruye: `npm run build && npm run preview`

### Manifest no se detecta

**Problema:** Lighthouse dice "Manifest not found"

**Solución:**
```html
<!-- Verifica que este link esté en index.html -->
<link rel="manifest" href="/manifest.json">
```

```bash
# Verifica que el archivo sea accesible
curl https://marianoaliandri.com.ar/manifest.json
```

### Digital Asset Links falla

**Problema:** App abre en Chrome en vez de standalone

**Solución:**
1. Verifica SHA256: `bubblewrap fingerprint`
2. Actualiza assetlinks.json con el fingerprint correcto
3. Verifica accesibilidad: `curl https://marianoaliandri.com.ar/.well-known/assetlinks.json`
4. Espera 10-15 minutos para que Google cache actualice
5. Reinstala la app

### Build falla con Bubblewrap

**Problema:** `bubblewrap build` error

**Solución:**
```bash
# Verifica versiones
java -version  # Debe ser 17
echo $ANDROID_HOME  # Debe apuntar a Android SDK

# Reinstala Bubblewrap
npm uninstall -g @bubblewrap/cli
npm install -g @bubblewrap/cli@latest

# Verifica twa-manifest.json sea válido
cat twa-manifest.json | jq
```

---

## 📈 Métricas y Analytics

### Web Vitals Tracking

Ya configurado en [src/utils/webVitals.js](../src/utils/webVitals.js)

Métricas enviadas a Google Analytics:
- **LCP** (Largest Contentful Paint)
- **INP** (Interaction to Next Paint)
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

### Firebase Analytics

Si usas Firebase (ya configurado), eventos PWA automáticos:
- `pwa_install` - Cuando se instala la app
- `pwa_launch` - Cuando se abre desde home screen
- `shortcut_click` - Cuando se usa un shortcut

---

## 🔐 Seguridad y Privacidad

### Políticas Legales

Ya tienes:
- ✅ Política de Privacidad: `/privacy-policy.html`
- ✅ Términos de Servicio: `/terms-of-service.html`
- ✅ Política de Eliminación de Datos: `/data-deletion.html`

Asegúrate de que estén actualizadas y sean accesibles.

### HTTPS

Requerido para PWA y Play Store.

Verifica:
```bash
# Debe devolver código 200
curl -I https://marianoaliandri.com.ar

# No debe haber mixed content
# DevTools > Console > Sin warnings de HTTP en HTTPS
```

---

## 🎯 Próximos Pasos

1. **Generar Iconos:**
   ```bash
   node scripts/generate-pwa-icons.js
   ```

2. **Capturar Screenshots:**
   - Ver [PLAY-STORE-ASSETS.md](./PLAY-STORE-ASSETS.md)
   - Usar Chrome DevTools en 1080x1920

3. **Crear Feature Graphic:**
   - Usar Canva con template 1024x500
   - Incluir logo + texto descriptivo

4. **Verificar con Lighthouse:**
   - PWA score ≥ 80
   - Performance ≥ 80

5. **Seguir Guía Completa:**
   - [GUIA-PLAY-STORE.md](./GUIA-PLAY-STORE.md)

---

## 📞 Soporte

**Documentación:**
- PWA: https://web.dev/progressive-web-apps/
- Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
- Workbox: https://developers.google.com/web/tools/workbox
- Play Console: https://support.google.com/googleplay/android-developer

**Contacto del Proyecto:**
- Email: marianoaliandri@gmail.com
- Sitio: https://marianoaliandri.com.ar

---

## ✅ Checklist Rápido

Antes de publicar, verifica:

- [ ] PWA score en Lighthouse ≥ 80
- [ ] Iconos generados (72px a 512px)
- [ ] Screenshots capturados (mínimo 2)
- [ ] Feature graphic creado (1024x500)
- [ ] Digital Asset Links configurado
- [ ] APK testeado en dispositivo Android
- [ ] Play Console completado al 100%
- [ ] Políticas de privacidad publicadas

**Ver checklist completo:** [PWA-CHECKLIST.md](./PWA-CHECKLIST.md)

---

**Última actualización:** Enero 2026

**Versión PWA:** 1.0.0

**Estado:** ✅ Listo para implementación
