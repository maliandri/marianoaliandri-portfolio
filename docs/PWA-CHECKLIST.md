# ✅ PWA & Play Store - Checklist de Verificación

Este checklist te ayudará a verificar que tu PWA cumple todos los requisitos antes de publicar en Google Play Store.

---

## 🎯 Fase 1: Requisitos PWA Básicos

### Manifest.json
- [ ] Archivo `manifest.json` existe en `/public/`
- [ ] `name` completado (nombre completo de la app)
- [ ] `short_name` completado (≤ 12 caracteres)
- [ ] `description` completada (descripción clara)
- [ ] `start_url` configurado (generalmente `/`)
- [ ] `scope` configurado (generalmente `/`)
- [ ] `display` es `standalone` o `fullscreen`
- [ ] `theme_color` configurado (color de la barra de estado)
- [ ] `background_color` configurado (color de splash screen)
- [ ] `orientation` configurado (`portrait`, `landscape`, o `any`)
- [ ] `lang` configurado (`es-AR`)
- [ ] `dir` configurado (`ltr` o `rtl`)

### Iconos en Manifest
- [ ] Icono 72x72 declarado
- [ ] Icono 96x96 declarado
- [ ] Icono 128x128 declarado
- [ ] Icono 144x144 declarado
- [ ] Icono 152x152 declarado
- [ ] Icono 192x192 declarado con `purpose: "any"`
- [ ] Icono 384x384 declarado
- [ ] Icono 512x512 declarado con `purpose: "any"`
- [ ] Icono 192x192 maskable declarado con `purpose: "maskable"`
- [ ] Icono 512x512 maskable declarado con `purpose: "maskable"`
- [ ] Todos los iconos existen físicamente en `/public/icons/`
- [ ] Todos los iconos cargan correctamente (sin 404)

### Screenshots en Manifest
- [ ] Al menos 1 screenshot de móvil (1080x1920)
- [ ] Screenshots tienen `form_factor: "narrow"`
- [ ] Screenshots tienen `label` descriptivo
- [ ] Screenshots existen en `/public/screenshots/`
- [ ] Screenshots cargan correctamente

### Shortcuts (Opcional pero recomendado)
- [ ] Al menos 1 shortcut definido
- [ ] Shortcuts tienen `name`, `url`, e `icons`
- [ ] URLs de shortcuts son válidas
- [ ] Iconos de shortcuts existen (96x96)

---

## 🔧 Fase 2: Service Worker

### Implementación
- [ ] `vite-plugin-pwa` instalado
- [ ] Service Worker configurado en `vite.config.js`
- [ ] `registerType: 'autoUpdate'` habilitado
- [ ] Estrategias de cache definidas (CacheFirst, NetworkFirst, etc.)
- [ ] Assets críticos en precache
- [ ] `cleanupOutdatedCaches: true`
- [ ] `skipWaiting: true`
- [ ] `clientsClaim: true`

### Verificación
- [ ] Service Worker se registra correctamente
- [ ] DevTools > Application > Service Workers muestra "Activated"
- [ ] Cache Storage contiene archivos
- [ ] Funciona offline (modo avión)
- [ ] Se actualiza automáticamente cuando hay cambios

**Cómo verificar:**
```javascript
// Abre DevTools Console y ejecuta:
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg.active.state);
});
```

---

## 🌐 Fase 3: HTML y Meta Tags

### Meta Tags Esenciales
- [ ] `<meta name="viewport">` configurado
- [ ] `<meta name="theme-color">` configurado
- [ ] `<meta name="description">` completado
- [ ] `<title>` descriptivo y único

### PWA Meta Tags
- [ ] `<meta name="mobile-web-app-capable" content="yes">`
- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">`
- [ ] `<meta name="apple-mobile-web-app-status-bar-style">`
- [ ] `<meta name="apple-mobile-web-app-title">`
- [ ] `<meta name="application-name">`

### Enlaces
- [ ] `<link rel="manifest" href="/manifest.json">` presente
- [ ] `<link rel="icon">` configurado
- [ ] `<link rel="apple-touch-icon">` configurado
- [ ] Favicon existe y carga correctamente

---

## 🚀 Fase 4: Desempeño y Optimización

### Lighthouse Audit
Ejecuta Lighthouse en Chrome DevTools:

**PWA Category:**
- [ ] Score ≥ 80 (idealmente ≥ 90)
- [ ] "Installable" badge verde
- [ ] "Service worker" check verde
- [ ] "HTTPS" check verde
- [ ] "Manifest" check verde

**Performance Category:**
- [ ] Score ≥ 80
- [ ] First Contentful Paint (FCP) < 2s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Total Blocking Time (TBT) < 300ms

**Best Practices:**
- [ ] Score ≥ 80
- [ ] HTTPS habilitado
- [ ] Sin errores de consola
- [ ] Imágenes optimizadas

**SEO:**
- [ ] Score ≥ 80
- [ ] Meta description presente
- [ ] Viewport configurado
- [ ] Font sizes legibles

### Web Vitals
- [ ] Core Web Vitals configurados
- [ ] Métricas enviadas a Analytics
- [ ] LCP, FID/INP, CLS monitorizados

**Verificar en consola:**
```javascript
// Deberías ver logs de Web Vitals
// Si configuraste correctamente src/utils/webVitals.js
```

---

## 📱 Fase 5: Instalabilidad

### Prueba de Instalación en Desktop
- [ ] Banner "Instalar app" aparece en Chrome
- [ ] App se instala correctamente
- [ ] Icono aparece en desktop
- [ ] App abre en ventana standalone
- [ ] Sin barra de navegador visible
- [ ] Enlaces internos funcionan dentro de la app
- [ ] Enlaces externos abren en navegador

### Prueba de Instalación en Mobile
- [ ] Banner "Agregar a pantalla de inicio" aparece
- [ ] App se agrega correctamente
- [ ] Icono aparece en home screen
- [ ] Splash screen se muestra al abrir
- [ ] App funciona en modo standalone
- [ ] Barra de estado usa theme_color
- [ ] Orientación respeta el manifest

### Verificar en DevTools
```
DevTools > Application > Manifest
  - ✅ Sin warnings ni errors
  - ✅ Preview del icono se ve bien
  - ✅ Todos los campos son válidos

DevTools > Application > Service Workers
  - ✅ Estado: Activated and running
  - ✅ Update on reload habilitado (para testing)
```

---

## 🔐 Fase 6: HTTPS y Seguridad

### Certificado SSL
- [ ] Sitio accesible vía HTTPS
- [ ] Certificado válido (no expirado)
- [ ] Sin warnings de mixed content
- [ ] Todas las imágenes/scripts usan HTTPS
- [ ] APIs externas usan HTTPS

### Content Security Policy (Opcional)
- [ ] CSP headers configurados
- [ ] Sin vulnerabilidades XSS
- [ ] Scripts inline permitidos solo si es necesario

### Verificar HTTPS
```bash
# Abre tu sitio y verifica
# 1. Candado verde en la barra de direcciones
# 2. DevTools Console sin warnings de mixed content
```

---

## 🌍 Fase 7: Digital Asset Links (para TWA)

### Archivo assetlinks.json
- [ ] Archivo existe en `/public/.well-known/assetlinks.json`
- [ ] `package_name` es `ar.com.marianoaliandri.twa`
- [ ] `sha256_cert_fingerprints` tiene el fingerprint correcto
- [ ] `relation` es `["delegate_permission/common.handle_all_urls"]`

### Accesibilidad
- [ ] Archivo accesible en `https://marianoaliandri.com.ar/.well-known/assetlinks.json`
- [ ] Devuelve código 200 (no 404)
- [ ] Content-Type es `application/json`
- [ ] Sin errores de CORS

### Verificación con Google API
```bash
# Verifica usando la API de Google
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://marianoaliandri.com.ar&relation=delegate_permission/common.handle_all_urls"
```

Debe devolver:
- [ ] JSON con tu configuración
- [ ] Sin errores
- [ ] `target.package_name` correcto

---

## 📦 Fase 8: APK/AAB Testing

### Compilación
- [ ] Bubblewrap instalado correctamente
- [ ] JDK 17 instalado
- [ ] Android SDK configurado
- [ ] Variables de entorno configuradas (ANDROID_HOME, JAVA_HOME)
- [ ] `twa-manifest.json` existe y es válido
- [ ] Keystore generado y guardado de forma segura

### APK Build
- [ ] `bubblewrap build` completa sin errores
- [ ] `app-release-signed.apk` generado
- [ ] `app-release-bundle.aab` generado
- [ ] Tamaño del APK razonable (< 50MB)

### Testing en Dispositivo
- [ ] APK instala correctamente
- [ ] App abre sin crashes
- [ ] Sitio web carga dentro de la app
- [ ] Sin barra de navegador visible
- [ ] Enlaces internos abren en la app
- [ ] Enlaces externos abren en navegador
- [ ] Botón "Back" funciona correctamente
- [ ] Shortcuts funcionan (long-press en icono)
- [ ] Splash screen se muestra
- [ ] Orientación correcta (portrait/landscape)

### Verificar Linking
```bash
# Instalar y probar
adb install app-release-signed.apk
adb shell am start -a android.intent.action.VIEW -d "https://marianoaliandri.com.ar"

# Debe abrir en la app, no en Chrome
```

---

## 🎨 Fase 9: Assets para Play Store

### Gráficos Obligatorios
- [ ] Icono de app 512x512 (PNG con transparencia)
- [ ] Feature graphic 1024x500 (PNG o JPG)
- [ ] Mínimo 2 screenshots de teléfono 1080x1920

### Gráficos Opcionales
- [ ] 4-8 screenshots de teléfono para mejor presentación
- [ ] Screenshots de tablet (si optimizaste para tablet)
- [ ] Video promocional en YouTube

### Textos
- [ ] Título de app ≤ 50 caracteres
- [ ] Descripción corta ≤ 80 caracteres
- [ ] Descripción completa ≤ 4000 caracteres
- [ ] Descripción completa incluye keywords relevantes
- [ ] Notas de versión escritas

### Documentos Legales
- [ ] Política de privacidad publicada y accesible
- [ ] URL de política de privacidad agregada
- [ ] Términos de servicio publicados (si aplica)
- [ ] Política de eliminación de datos (si recoges datos de usuario)

---

## 📋 Fase 10: Play Console Setup

### Cuenta
- [ ] Cuenta de Google Play Console creada
- [ ] Tarifa de $25 USD pagada
- [ ] Información de desarrollador completada
- [ ] Cuenta de desarrollador verificada

### Aplicación Creada
- [ ] Nueva aplicación creada en Play Console
- [ ] Nombre de app establecido
- [ ] Idioma predeterminado: Español (Argentina)
- [ ] Tipo: App (no Juego)
- [ ] Categoría: Negocios

### Ficha de Play Store
- [ ] Título configurado
- [ ] Descripción corta agregada
- [ ] Descripción completa agregada
- [ ] Icono de app subido
- [ ] Feature graphic subido
- [ ] Screenshots subidos (mínimo 2)
- [ ] Categoría seleccionada
- [ ] Tags/keywords agregados

### Clasificación de Contenido
- [ ] Cuestionario de clasificación completado
- [ ] Rating asignado (ej: Para todos)
- [ ] Certificado generado

### Público Objetivo
- [ ] Rango de edad especificado
- [ ] No dirigido a niños (si aplica)

### Seguridad de Datos
- [ ] Formulario de seguridad de datos completado
- [ ] Prácticas de privacidad declaradas
- [ ] Tipos de datos recopilados especificados
- [ ] Uso de datos explicado

### Información de Contacto
- [ ] Email de contacto agregado
- [ ] Sitio web agregado
- [ ] Teléfono agregado (opcional)

---

## 🚀 Fase 11: Lanzamiento

### Pre-Lanzamiento
- [ ] Todas las secciones de Play Console completas (100%)
- [ ] AAB subido a canal de producción
- [ ] Versión code y name configurados
- [ ] Notas de versión agregadas
- [ ] Revisión interna aprobada (si aplica)

### Pruebas Pre-Producción
- [ ] Internal testing completado (opcional pero recomendado)
- [ ] Closed testing con beta testers (opcional)
- [ ] Bugs críticos corregidos
- [ ] Feedback de testers incorporado

### Lanzamiento
- [ ] "Iniciar lanzamiento en producción" clickeado
- [ ] Confirmación enviada
- [ ] Email de confirmación recibido

### Post-Lanzamiento
- [ ] Monitorear Play Console para updates
- [ ] Responder a reseñas de usuarios
- [ ] Monitorear crashes/ANRs en Play Console
- [ ] Actualizar app cuando sea necesario

---

## 🔍 Fase 12: Verificaciones Finales

### Testing Cross-Browser
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Safari (Desktop & Mobile)
- [ ] Edge (Desktop)

### Testing Cross-Device
- [ ] Teléfono Android
- [ ] Teléfono iOS (instalación desde navegador)
- [ ] Tablet Android
- [ ] Desktop Windows
- [ ] Desktop Mac

### Accesibilidad
- [ ] Contraste de colores adecuado (WCAG AA)
- [ ] Navegación por teclado funcional
- [ ] ARIA labels donde sea necesario
- [ ] Alt text en imágenes
- [ ] Font sizes legibles (≥ 16px)

### Analytics y Monitoreo
- [ ] Google Analytics configurado
- [ ] Firebase Analytics configurado (si aplica)
- [ ] Web Vitals reportando correctamente
- [ ] Error tracking funcionando
- [ ] Conversiones trackeadas

---

## ⚠️ Issues Comunes y Soluciones

### "Service Worker no se registra"
```javascript
// Verifica que vite-plugin-pwa esté correctamente configurado
// Verifica que estés en HTTPS (o localhost)
// Limpia cache: DevTools > Application > Clear storage
```

### "Manifest no se detecta"
```html
<!-- Verifica que el link esté en el <head> -->
<link rel="manifest" href="/manifest.json">

<!-- Verifica MIME type en el servidor -->
Content-Type: application/manifest+json
```

### "Digital Asset Links falla"
```bash
# Espera 10-15 minutos después de actualizar
# Verifica SHA256:
bubblewrap fingerprint

# Verifica accesibilidad:
curl https://marianoaliandri.com.ar/.well-known/assetlinks.json
```

### "App rechazada por Google"
- Revisa el email de rechazo
- Corrige issues señalados
- Re-sube AAB con versión code incrementado
- Vuelve a enviar

---

## 📊 Métricas de Éxito

Después del lanzamiento, monitorea:

- [ ] Instalaciones diarias/mensuales
- [ ] Rating promedio (objetivo: ≥ 4.0)
- [ ] Retención de usuarios (D1, D7, D30)
- [ ] Crashes (objetivo: < 0.5%)
- [ ] ANRs (objetivo: < 0.1%)
- [ ] Tiempo de sesión promedio
- [ ] Páginas vistas por sesión

---

## ✅ Resumen: ¿Listo para Publicar?

Verifica que **TODAS** estas secciones estén completas:

- [ ] ✅ Fase 1: Manifest.json completo y válido
- [ ] ✅ Fase 2: Service Worker funcionando
- [ ] ✅ Fase 3: Meta tags PWA configurados
- [ ] ✅ Fase 4: Lighthouse score ≥ 80
- [ ] ✅ Fase 5: App instalable en desktop y mobile
- [ ] ✅ Fase 6: HTTPS habilitado y seguro
- [ ] ✅ Fase 7: Digital Asset Links configurado
- [ ] ✅ Fase 8: APK/AAB testeado en dispositivo
- [ ] ✅ Fase 9: Todos los assets preparados
- [ ] ✅ Fase 10: Play Console completado al 100%
- [ ] ✅ Fase 11: Listo para lanzamiento
- [ ] ✅ Fase 12: Testing final completado

**Si todas las fases están completas: ¡Estás listo para publicar!** 🚀

---

**Última actualización:** Enero 2026
**Contacto:** marianoaliandri@gmail.com
