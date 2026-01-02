# 🧪 Testing PWA en Desarrollo Local

Tu PWA está lista para probar. El servidor ya está corriendo en **http://localhost:4173**

---

## ✅ Lo que se ha generado

### 1. Iconos PWA (13 archivos)
- ✅ `public/icons/icon-72x72.png`
- ✅ `public/icons/icon-96x96.png`
- ✅ `public/icons/icon-128x128.png`
- ✅ `public/icons/icon-144x144.png`
- ✅ `public/icons/icon-152x152.png`
- ✅ `public/icons/icon-192x192.png`
- ✅ `public/icons/icon-384x384.png`
- ✅ `public/icons/icon-512x512.png`
- ✅ `public/icons/icon-192x192-maskable.png`
- ✅ `public/icons/icon-512x512-maskable.png`
- ✅ `public/icons/shortcut-contact.png`
- ✅ `public/icons/shortcut-projects.png`
- ✅ `public/icons/shortcut-tools.png`

### 2. Screenshots Placeholder (3 archivos)
- ✅ `public/screenshots/mobile-1.png` (1080x1920)
- ✅ `public/screenshots/mobile-2.png` (1080x1920)
- ✅ `public/screenshots/desktop-1.png` (1920x1080)

### 3. Service Worker
- ✅ `dist/sw.js` - Service Worker generado
- ✅ `dist/workbox-*.js` - Runtime de Workbox
- ✅ `dist/manifest.webmanifest` - Manifest generado

### 4. Assets Precached
- ✅ 53 archivos en cache (2.4 MB)
- ✅ Todos los JS, CSS, HTML, iconos

---

## 🧪 Cómo Probar la PWA

### Paso 1: Abrir en Chrome

1. Abre Chrome
2. Ve a: **http://localhost:4173**
3. La página debe cargar normalmente

### Paso 2: Verificar Service Worker

1. Abre DevTools (F12)
2. Ve a la pestaña **Application**
3. En el sidebar, click en **Service Workers**

**✅ Deberías ver:**
- Status: **Activated and is running**
- Source: `sw.js`
- Update on reload: ☑️ (opcional)

### Paso 3: Verificar Manifest

1. En DevTools > Application
2. Click en **Manifest**

**✅ Deberías ver:**
- Name: "Mariano Aliandri | Desarrollador Full Stack & BI"
- Short name: "Mariano Dev"
- Start URL: "/"
- Theme color: "#4f46e5"
- Icons: 10 iconos listados
- Screenshots: 3 screenshots listados

**⚠️ Si ves warnings:**
- "No matching service worker detected" - Refresh la página
- "Icons URL not found" - Normal en dev, funcionará en producción

### Paso 4: Verificar Cache Storage

1. En DevTools > Application
2. Click en **Cache Storage**

**✅ Deberías ver varios caches:**
- `workbox-precache-v2-...` - Assets precached
- `google-fonts-cache` - Google Fonts
- `images-cache` - Imágenes
- `static-resources` - JS/CSS

### Paso 5: Probar Offline

1. En DevTools > Application > Service Workers
2. ☑️ Check "Offline"
3. Refresh la página (F5)

**✅ La página debe cargar desde cache**
- Sin errores
- Contenido visible
- Puede que algunas APIs fallen (normal)

### Paso 6: Probar Instalación

**En Desktop:**
1. Mira la barra de direcciones
2. Debería aparecer un icono de ➕ "Install"
3. Click en "Install"
4. Acepta la instalación

**✅ Resultado:**
- App se abre en ventana standalone
- Sin barra de navegador
- Icono en desktop/start menu

**En Mobile (si tienes Android conectado):**
1. Abre Chrome en tu Android
2. Ve a `http://[TU-IP]:4173`
3. Menu > "Add to Home screen"
4. Acepta

**✅ Resultado:**
- Icono en home screen
- Splash screen al abrir
- Fullscreen mode

---

## 🔍 Lighthouse Testing

### Ejecutar Lighthouse

1. En DevTools, click en pestaña **Lighthouse**
2. Selecciona solo: ☑️ **Progressive Web App**
3. Device: Mobile
4. Click **Analyze page load**

### Resultados Esperados

**PWA Score:** 80-100 ✅

**Checks que deben pasar:**
- ✅ Installable
- ✅ Service worker registered
- ✅ HTTPS (puede fallar en localhost, ok)
- ✅ Configured for custom splash screen
- ✅ Sets a theme color
- ✅ Manifest has icons
- ✅ Viewport is set

**Checks que pueden fallar (OK en dev):**
- ⚠️ "Does not redirect HTTP to HTTPS" - Normal en localhost
- ⚠️ "Is not configured for a custom splash screen" - Puede pasar
- ⚠️ Some assets not cached - Algunos externos

**Si el score es < 80:**
- Verifica que el Service Worker esté activado
- Refresh y vuelve a correr Lighthouse
- Asegúrate de estar en `http://localhost:4173` (no en dev server)

---

## 🎯 Testing Checklist

### Funcionalidad Básica
- [ ] Página carga correctamente
- [ ] Service Worker activado
- [ ] Manifest detectado
- [ ] Iconos cargan (sin 404)
- [ ] Screenshots visibles en manifest

### Service Worker
- [ ] Status "Activated and running"
- [ ] Cache Storage creado
- [ ] Assets en precache
- [ ] Funciona offline

### Instalación
- [ ] Botón "Install" aparece
- [ ] App se instala en desktop
- [ ] Abre en ventana standalone
- [ ] Icono correcto

### Performance
- [ ] Lighthouse PWA ≥ 80
- [ ] Tiempo de carga rápido
- [ ] Sin errores en consola críticos

---

## 🐛 Problemas Comunes

### "Service Worker not found"
**Solución:**
```bash
# Rebuild
npm run build

# Restart preview
npm run preview
```

### "Manifest errors"
**Solución:**
- Verifica que `public/manifest.json` existe
- Verifica que todos los iconos existen en `public/icons/`
- Refresh la página (Ctrl+Shift+R)

### "Failed to fetch"
**Solución:**
- Verifica que el servidor preview está corriendo
- Verifica la URL: `http://localhost:4173`
- No uses `npm run dev` - usa `npm run preview`

### "Icons 404"
**Solución:**
```bash
# Regenerar iconos
npm run pwa:icons

# Rebuild
npm run build
npm run preview
```

---

## 📊 Next Steps

### Para Desarrollo:
1. ✅ Reemplaza `public/icon-base.png` con tu logo real
2. ✅ Ejecuta `npm run pwa:icons` de nuevo
3. ✅ Captura screenshots reales del sitio
4. ✅ Rebuild: `npm run build`

### Para Producción:
1. ✅ Completa todos los pasos de desarrollo
2. ✅ Deploy a Netlify/Vercel
3. ✅ Verifica que HTTPS funcione
4. ✅ Ejecuta Lighthouse en producción
5. ✅ Sigue la guía: `docs/GUIA-PLAY-STORE.md`

---

## 🎨 Personalización

### Cambiar Color del Tema

Edita `public/manifest.json`:
```json
{
  "theme_color": "#TU_COLOR",
  "background_color": "#TU_COLOR"
}
```

Edita `index.html`:
```html
<meta name="theme-color" content="#TU_COLOR" />
```

Rebuild:
```bash
npm run build
npm run preview
```

### Cambiar Nombre de la App

Edita `public/manifest.json`:
```json
{
  "name": "Tu Nombre Completo",
  "short_name": "TuApp"
}
```

Edita `vite.config.js` (busca `VitePWA` y actualiza `manifest.name` y `manifest.short_name`)

Rebuild y preview.

---

## 📝 Comandos Útiles

```bash
# Regenerar iconos (después de cambiar icon-base.png)
npm run pwa:icons

# Build de producción
npm run build

# Preview (para testing PWA)
npm run preview

# Desarrollo normal (NO para PWA testing)
npm run dev

# Verificar Lighthouse (requiere producción)
npm run pwa:verify
```

---

## ✅ ¿Todo Funciona?

Si todos los checks pasaron:
1. ✅ Service Worker activado
2. ✅ Manifest válido
3. ✅ Instalable en desktop
4. ✅ Funciona offline
5. ✅ Lighthouse ≥ 80

**🎉 ¡Tu PWA está lista para desarrollo!**

**Siguientes pasos:**
- Personaliza los assets
- Captura screenshots reales
- Deploy a producción
- Sigue `docs/GUIA-PLAY-STORE.md`

---

**Servidor corriendo en:** http://localhost:4173

**Para detener el servidor:** Ctrl+C en la terminal
