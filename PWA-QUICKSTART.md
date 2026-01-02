# 🚀 PWA a Play Store - Quick Start

**Resumen ejecutivo:** Tu portfolio está 80% listo para convertirse en app de Play Store. Solo necesitas completar algunos pasos.

---

## ✅ Ya Está Configurado

- ✅ `manifest.json` completo con toda la metadata
- ✅ Service Worker con Workbox y estrategias de cache
- ✅ Meta tags PWA en HTML
- ✅ `vite-plugin-pwa` instalado y configurado
- ✅ Digital Asset Links preparado (`.well-known/assetlinks.json`)
- ✅ Scripts de generación de iconos
- ✅ Documentación completa (3 guías + 1 checklist)

---

## ⚠️ Pendiente (Debes Hacer Antes de Publicar)

### 1. Generar Iconos PWA (5 minutos)

```bash
# 1. Coloca tu logo en public/icon-base.png (512x512px mínimo)
# 2. Instala sharp
npm install -D sharp

# 3. Genera todos los iconos
npm run pwa:icons
```

Esto creará automáticamente:
- 8 tamaños de iconos (72px a 512px)
- 2 iconos maskable para Android
- 3 iconos para shortcuts

**Ubicación:** `public/icons/`

---

### 2. Capturar Screenshots (10 minutos)

**Necesitas mínimo 2 screenshots de móvil (1080x1920px)**

**Cómo hacerlo:**
1. Abre Chrome DevTools (F12)
2. Ctrl+Shift+M (toggle device mode)
3. Configura: Width 1080px, Height 1920px
4. Navega a secciones importantes de tu sitio
5. Ctrl+Shift+P → "Capture screenshot"

**Screenshots recomendados:**
- Página principal (hero + servicios)
- Portfolio de proyectos
- Calculadoras

**Guardar en:** `public/screenshots/mobile-1.png`, `mobile-2.png`, etc.

---

### 3. Crear Feature Graphic (15 minutos)

**Necesitas: 1 imagen de 1024x500px**

**Opción fácil - Canva:**
1. Ve a https://www.canva.com/
2. Crea diseño personalizado: 1024x500px
3. Agrega:
   - Tu logo
   - Texto: "MARIANO ALIANDRI"
   - Subtexto: "Desarrollador Full Stack & BI"
   - Fondo con tu color brand (#4f46e5)
4. Descarga como PNG

**Guardar en:** `public/assets/feature-graphic.png`

---

### 4. Verificar PWA con Lighthouse (2 minutos)

```bash
# Opción 1: Build local
npm run build
npm run preview

# Abre http://localhost:4173
# F12 > Lighthouse > PWA > Analyze

# Opción 2: Producción (después del deploy)
npm run pwa:verify
```

**Objetivo:** Score ≥ 80 en categoría PWA

---

### 5. Deploy a Producción (5 minutos)

```bash
git add .
git commit -m "feat: configurar PWA completa para Google Play Store"
git push origin main
```

Espera a que Netlify/Vercel despliegue.

**Verifica que estos archivos sean accesibles:**
- https://marianoaliandri.com.ar/manifest.json
- https://marianoaliandri.com.ar/.well-known/assetlinks.json
- https://marianoaliandri.com.ar/icons/icon-512x512.png

---

## 📱 Proceso Play Store (Después de lo anterior)

### Paso 1: Instalar Herramientas

**Windows:**
```bash
# 1. Node.js 18+ (ya lo tienes)

# 2. Instalar JDK 17
# Descarga: https://adoptium.net/
# Instala y agrega al PATH

# 3. Instalar Android SDK
# Opción A: Android Studio (más fácil)
# https://developer.android.com/studio

# 4. Bubblewrap CLI
npm install -g @bubblewrap/cli
```

**Verificar:**
```bash
java -version  # Debe ser 17
bubblewrap help
```

---

### Paso 2: Generar APK/AAB (10 minutos)

```bash
# 1. Crear carpeta para el proyecto Android
mkdir twa-marianoaliandri
cd twa-marianoaliandri

# 2. Inicializar TWA
bubblewrap init --manifest=https://marianoaliandri.com.ar/manifest.json

# 3. Responder preguntas (ver guía completa si dudas)
# Package: ar.com.marianoaliandri.twa
# App name: Mariano Aliandri
# Launcher: Mariano Dev
# Signing key: Create new
# Password: [TU_PASSWORD_SEGURO] ⚠️ GUÁRDALO!

# 4. Obtener SHA256 fingerprint
bubblewrap fingerprint
# COPIA ESTE HASH - lo necesitas en el siguiente paso
```

---

### Paso 3: Actualizar Digital Asset Links (5 minutos)

```bash
# 1. Ve a tu proyecto principal
cd ..

# 2. Edita public/.well-known/assetlinks.json
# Reemplaza "REPLACE_WITH_YOUR_SHA256_FINGERPRINT"
# con el hash del paso anterior

# 3. Commit y push
git add public/.well-known/assetlinks.json
git commit -m "chore: actualizar SHA256 fingerprint para TWA"
git push origin main

# 4. Espera 5-10 minutos para que despliegue

# 5. Verifica
curl https://marianoaliandri.com.ar/.well-known/assetlinks.json
```

---

### Paso 4: Compilar APK (5 minutos)

```bash
# Desde la carpeta twa-marianoaliandri
cd twa-marianoaliandri
bubblewrap build

# Esto genera:
# - app-release-signed.apk (para probar)
# - app-release-bundle.aab (para Play Store)
```

---

### Paso 5: Probar APK en Android (Opcional pero recomendado)

```bash
# Conecta tu teléfono Android por USB
# Habilita "Depuración USB" en el teléfono

# Instalar
bubblewrap install

# O manualmente:
adb install app-release-signed.apk
```

**Verifica:**
- ✅ App abre tu sitio
- ✅ Sin barra de navegador
- ✅ Enlaces funcionan
- ✅ Shortcuts funcionan (mantén presionado el icono)

---

### Paso 6: Publicar en Play Store (30 minutos)

1. **Crear cuenta:**
   - https://play.google.com/console
   - Paga $25 USD (una sola vez, para siempre)

2. **Crear aplicación:**
   - Nombre: "Mariano Aliandri"
   - Idioma: Español (Argentina)
   - Tipo: App
   - Categoría: Negocios

3. **Completar ficha:**
   - **Título:** Mariano Aliandri | Full Stack & BI
   - **Descripción corta:** Portfolio profesional: Desarrollo web, análisis de datos y soluciones BI
   - **Descripción completa:** (Ver `docs/GUIA-PLAY-STORE.md` sección 4.2)
   - **Icono:** `public/icons/icon-512x512.png`
   - **Feature graphic:** `public/assets/feature-graphic.png`
   - **Screenshots:** Los que capturaste en el Paso 2

4. **Clasificación de contenido:**
   - Completar cuestionario
   - Es contenido profesional/educativo
   - Para todos los públicos

5. **Políticas:**
   - Política de privacidad: https://marianoaliandri.com.ar/privacy-policy.html
   - Seguridad de datos: Completar formulario

6. **Subir AAB:**
   - Producción > Crear versión
   - Subir `app-release-bundle.aab`
   - Versión: 1.0.0
   - Notas: "Primera versión oficial"

7. **Enviar a revisión:**
   - Verificar checklist al 100%
   - Click "Iniciar lanzamiento"

**⏳ Tiempo de revisión:** 1-7 días (primera vez), horas (updates)

---

## 📚 Documentación Completa

Si necesitas más detalles en cualquier paso:

1. **[docs/PWA-README.md](docs/PWA-README.md)** - Resumen técnico completo
2. **[docs/GUIA-PLAY-STORE.md](docs/GUIA-PLAY-STORE.md)** - Guía paso a paso detallada (5 partes)
3. **[docs/PLAY-STORE-ASSETS.md](docs/PLAY-STORE-ASSETS.md)** - Lista de assets gráficos
4. **[docs/PWA-CHECKLIST.md](docs/PWA-CHECKLIST.md)** - Checklist de verificación (12 fases)

---

## 🆘 Ayuda Rápida

### "No tengo Android para probar"
**Solución:** Usa Android Studio Emulator
1. Instala Android Studio
2. AVD Manager > Create Virtual Device
3. Pixel 5, Android 13
4. Arrastra el APK al emulador

### "Bubblewrap build falla"
**Solución:**
```bash
# Verifica Java 17
java -version

# Verifica Android SDK
echo $ANDROID_HOME  # Linux/Mac
echo %ANDROID_HOME%  # Windows

# Reinstala Bubblewrap
npm install -g @bubblewrap/cli@latest
```

### "Lighthouse score bajo"
**Solución:**
1. Optimiza imágenes (WebP, compresión)
2. Reduce tamaño de JavaScript (code splitting)
3. Usa lazy loading
4. Mejora Core Web Vitals

### "Digital Asset Links no funciona"
**Solución:**
1. Verifica SHA256 con `bubblewrap fingerprint`
2. Confirma que assetlinks.json sea accesible
3. Espera 15 minutos después de actualizar
4. Reinstala la app

---

## ⏱️ Tiempo Total Estimado

| Tarea | Tiempo |
|-------|--------|
| Generar iconos | 5 min |
| Capturar screenshots | 10 min |
| Crear feature graphic | 15 min |
| Deploy a producción | 5 min |
| Instalar herramientas | 30 min |
| Generar AAB | 10 min |
| Probar en Android | 10 min |
| Configurar Play Store | 30 min |
| **TOTAL** | **~2 horas** |

Tiempo de revisión de Google: 1-7 días

---

## ✅ Checklist Rápido

**Antes de empezar con Play Store:**
- [ ] Iconos generados (`npm run pwa:icons`)
- [ ] Screenshots capturados (mínimo 2)
- [ ] Feature graphic creado (1024x500)
- [ ] Lighthouse PWA ≥ 80
- [ ] Sitio en producción con HTTPS

**Para generar AAB:**
- [ ] JDK 17 instalado
- [ ] Android SDK instalado
- [ ] Bubblewrap instalado
- [ ] SHA256 en assetlinks.json actualizado

**Para publicar:**
- [ ] Cuenta Play Console creada ($25)
- [ ] Todos los assets listos
- [ ] Políticas legales accesibles
- [ ] AAB compilado sin errores

---

## 🎯 Siguiente Paso

**Comienza aquí:**
```bash
# 1. Coloca tu logo en public/icon-base.png
# 2. Ejecuta:
npm install -D sharp
npm run pwa:icons
```

Después de esto, sigue con el **Paso 2: Capturar Screenshots** arriba.

**¿Dudas?** Consulta la documentación completa en `docs/`

---

**Última actualización:** Enero 2026

**Contacto:** marianoaliandri@gmail.com
