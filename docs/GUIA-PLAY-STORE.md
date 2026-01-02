# 📱 Guía Completa: PWA a Google Play Store

Esta guía te llevará paso a paso desde tu PWA hasta tener la app publicada en Google Play Store.

---

## ✅ Parte 1: Preparación de la PWA

### 1.1 Verificar que la PWA funciona correctamente

```bash
# Compilar el proyecto
npm run build

# Previsualizar la build
npm run preview
```

Abre tu navegador en `http://localhost:4173` y verifica:
- ✅ El sitio carga correctamente
- ✅ Todas las funcionalidades funcionan
- ✅ No hay errores en la consola

### 1.2 Ejecutar auditoría de Lighthouse

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Progressive Web App"
4. Click en "Analyze page load"

**Requisitos mínimos:**
- ✅ PWA score > 80
- ✅ "Installable" debe estar en verde
- ✅ Service worker registrado
- ✅ Manifest válido
- ✅ HTTPS habilitado

### 1.3 Generar iconos PWA

Si aún no generaste los iconos:

```bash
# Instalar sharp
npm install -D sharp

# 1. Coloca tu logo en public/icon-base.png (mínimo 512x512px)
# 2. Ejecuta el script
node scripts/generate-pwa-icons.js
```

Esto generará todos los iconos en `public/icons/`.

### 1.4 Capturar screenshots

Necesitas screenshots para el manifest y para Play Store:

**Screenshots móvil (1080x1920):**
1. Abre Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Selecciona "Responsive" y configura: 1080 x 1920
4. Captura pantalla de:
   - Página principal
   - Sección de proyectos
   - Cualquier otra sección importante

Guárdalas como:
- `public/screenshots/mobile-1.png`
- `public/screenshots/mobile-2.png`

**Screenshots desktop (1920x1080):**
- `public/screenshots/desktop-1.png`

### 1.5 Desplegar en producción

```bash
# Si usas Netlify, Vercel, etc.
git add .
git commit -m "feat: implementar PWA completa para Google Play Store"
git push origin main
```

Espera a que se despliegue y verifica que **marianoaliandri.com.ar** tenga todos los cambios.

---

## 🔧 Parte 2: Configurar Digital Asset Links

### 2.1 Verificar assetlinks.json

El archivo ya está en `public/.well-known/assetlinks.json` pero necesitas actualizar el SHA256 fingerprint.

**Aún NO edites el fingerprint.** Lo haremos después de crear el signing key.

### 2.2 Verificar que el archivo sea accesible

Después del deploy, verifica que este archivo sea accesible en:
```
https://marianoaliandri.com.ar/.well-known/assetlinks.json
```

**Importante:** Si usas Netlify, crea un archivo `public/_redirects` con:
```
/.well-known/assetlinks.json  /.well-known/assetlinks.json  200
```

---

## 📦 Parte 3: Generar APK/AAB con Bubblewrap

### 3.1 Instalar dependencias

```bash
# Instalar Node.js 18+ (si no lo tienes)
# https://nodejs.org/

# Instalar JDK 17
# Windows: https://adoptium.net/
# Verifica la instalación
java -version

# Instalar Android SDK
# Opción 1: Android Studio (recomendado)
# https://developer.android.com/studio

# Opción 2: Solo command-line tools
# https://developer.android.com/studio#command-tools
```

### 3.2 Configurar variables de entorno

**Windows:**
```powershell
# Agregar al PATH (usa tu ruta de instalación)
setx ANDROID_HOME "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"
```

**Linux/Mac:**
```bash
# Agregar a ~/.bashrc o ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

Reinicia la terminal después de configurar.

### 3.3 Instalar Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

Verifica la instalación:
```bash
bubblewrap help
```

### 3.4 Inicializar proyecto TWA

```bash
# Crear carpeta para el proyecto Android
mkdir twa-marianoaliandri
cd twa-marianoaliandri

# Inicializar proyecto
bubblewrap init --manifest=https://marianoaliandri.com.ar/manifest.json
```

**Responde las preguntas:**
- Domain being opened: `marianoaliandri.com.ar`
- Package name: `ar.com.marianoaliandri.twa`
- App name: `Mariano Aliandri`
- Launcher name: `Mariano Dev`
- Display mode: `standalone`
- Orientation: `portrait`
- Theme color: `#4f46e5`
- Background color: `#ffffff`
- Start URL: `/`
- Icon URL: `https://marianoaliandri.com.ar/icons/icon-512x512.png`
- Maskable Icon URL: `https://marianoaliandri.com.ar/icons/icon-512x512-maskable.png`
- Signing key: **Selecciona "Create new"**
- Key alias: `marianoaliandri`
- Key password: `[TU_PASSWORD_SEGURO]`
- Keystore password: `[TU_PASSWORD_SEGURO]`

**⚠️ IMPORTANTE:** Guarda las contraseñas en un lugar seguro. Las necesitarás para actualizar la app.

### 3.5 Verificar twa-manifest.json

Bubblewrap creó un archivo `twa-manifest.json`. Verifica que tenga:

```json
{
  "packageId": "ar.com.marianoaliandri.twa",
  "host": "marianoaliandri.com.ar",
  "name": "Mariano Aliandri",
  "launcherName": "Mariano Dev",
  "display": "standalone",
  "themeColor": "#4f46e5",
  "backgroundColor": "#ffffff",
  "startUrl": "/",
  "iconUrl": "https://marianoaliandri.com.ar/icons/icon-512x512.png",
  "maskableIconUrl": "https://marianoaliandri.com.ar/icons/icon-512x512-maskable.png",
  "shortcuts": [
    {
      "name": "Contacto",
      "short_name": "Contacto",
      "url": "/#contacto",
      "icon": "https://marianoaliandri.com.ar/icons/shortcut-contact.png"
    },
    {
      "name": "Proyectos",
      "short_name": "Proyectos",
      "url": "/#proyectos",
      "icon": "https://marianoaliandri.com.ar/icons/shortcut-projects.png"
    },
    {
      "name": "Calculadoras",
      "short_name": "Calculadoras",
      "url": "/calculadoras",
      "icon": "https://marianoaliandri.com.ar/icons/shortcut-tools.png"
    }
  ],
  "signingKey": {
    "path": "./android.keystore",
    "alias": "marianoaliandri"
  }
}
```

### 3.6 Obtener SHA256 Fingerprint

```bash
# Desde la carpeta twa-marianoaliandri
bubblewrap fingerprint
```

Copia el SHA256 fingerprint que aparece.

### 3.7 Actualizar assetlinks.json

Edita `public/.well-known/assetlinks.json` en tu proyecto principal y reemplaza:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ar.com.marianoaliandri.twa",
      "sha256_cert_fingerprints": [
        "AQUI_PEGA_EL_SHA256_FINGERPRINT_DEL_PASO_ANTERIOR"
      ]
    }
  }
]
```

**Importante:** Haz commit y push de este cambio para que esté disponible en producción.

### 3.8 Verificar Digital Asset Links

Después de hacer deploy, verifica en:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://marianoaliandri.com.ar&relation=delegate_permission/common.handle_all_urls
```

Deberías ver tu configuración en formato JSON.

### 3.9 Compilar APK para pruebas

```bash
# Desde la carpeta twa-marianoaliandri
bubblewrap build
```

Esto genera:
- `app-release-signed.apk` - APK para instalación directa
- `app-release-bundle.aab` - AAB para Google Play Store

El APK estará en: `./app-release-signed.apk`

### 3.10 Probar APK en dispositivo Android

**Opción 1: Dispositivo físico**
```bash
# Habilita "Depuración USB" en tu Android
# Conecta el dispositivo por USB

# Instalar APK
adb install app-release-signed.apk
```

**Opción 2: Emulador Android Studio**
1. Abre Android Studio
2. Ve a "Device Manager"
3. Crea un emulador (Pixel 5, Android 13+)
4. Arrastra el APK al emulador

**Verifica:**
- ✅ La app abre tu sitio web
- ✅ No aparece la barra de navegación del navegador
- ✅ Los enlaces internos abren dentro de la app
- ✅ Los enlaces externos abren en el navegador
- ✅ Los shortcuts funcionan (mantén presionado el ícono)

---

## 🚀 Parte 4: Publicar en Google Play Store

### 4.1 Crear cuenta de Google Play Console

1. Ve a https://play.google.com/console
2. Paga la tarifa única de $25 USD
3. Completa la información de tu cuenta

### 4.2 Preparar assets para Play Store

**Iconos:**
- ✅ Icono de app (512x512) - Ya lo tienes en `public/icons/icon-512x512.png`
- ✅ Feature graphic (1024x500) - Necesitas crearlo

**Feature Graphic:**
Crea una imagen 1024x500 en Canva/Photoshop con:
- Tu nombre
- "Desarrollador Full Stack & BI"
- Diseño atractivo con tu brand color (#4f46e5)

Guárdala como `feature-graphic.png`.

**Screenshots:**
Mínimo 2, máximo 8 por tipo de dispositivo:
- ✅ Teléfono (1080x1920) - Ya los tienes en `public/screenshots/`
- Tablet (opcional, 7" y 10")

**Descripción corta (80 caracteres):**
```
Portfolio profesional: Desarrollo web, análisis de datos y soluciones BI
```

**Descripción larga (4000 caracteres):**
```
Desarrollador Full Stack y Analista de Datos

Bienvenido a mi portfolio profesional. Aquí encontrarás:

🚀 Servicios Profesionales:
• Desarrollo Web Full Stack (React, Next.js, Node.js)
• Análisis de Datos y Business Intelligence
• Dashboards interactivos con Power BI
• Consultoría en Inteligencia Empresarial
• Excel Avanzado y Automatización

💼 Proyectos Destacados:
Explora mi portafolio completo de proyectos reales en desarrollo web, análisis de datos y soluciones empresariales implementadas.

🧮 Calculadoras Interactivas:
• ROI de Implementación BI
• Cotizador de Desarrollo Web
• Ahorro de Tiempo con Automatización

📊 Especialidades:
• React y Next.js
• Python para Data Analysis
• Power BI y Excel
• SQL y Bases de Datos
• APIs y Microservicios
• Firebase y Cloud

📍 Ubicación:
Neuquén, Argentina
Atendiendo clientes en toda Latinoamérica

📧 Contacto Directo:
Desde la app puedes contactarme directamente por WhatsApp, email o agendar una reunión.

🎯 Características de la App:
✓ Acceso offline a contenido principal
✓ Navegación rápida y optimizada
✓ Portfolio completo de proyectos
✓ Herramientas de cálculo interactivas
✓ Información de contacto actualizada
✓ Blog técnico con artículos

Ideal para:
• Empresas buscando servicios de desarrollo
• Reclutadores evaluando candidatos
• Clientes potenciales de consultoría BI
• Profesionales del sector tecnológico

Tecnologías utilizadas en esta PWA:
React, Vite, Tailwind CSS, Firebase, Google Analytics, React Query, Zod, React Hook Form, Web Vitals, Playwright

Desarrollado con las últimas tecnologías web para garantizar la mejor experiencia de usuario.
```

### 4.3 Crear aplicación en Play Console

1. En Play Console, click en "Crear aplicación"
2. Completa el formulario:
   - Nombre de la app: `Mariano Aliandri`
   - Idioma predeterminado: `Español (Argentina)`
   - Tipo de app: `App`
   - Categoría: `Negocios`
   - ¿Es gratuita?: `Sí`

### 4.4 Completar ficha de Play Store

**Panel > Presencia en Play Store > Ficha principal:**

1. **Detalles de la aplicación:**
   - Nombre de la app: `Mariano Aliandri | Full Stack & BI`
   - Descripción corta: [la de arriba]
   - Descripción completa: [la de arriba]

2. **Recursos gráficos:**
   - Icono de app: `icon-512x512.png`
   - Feature graphic: `feature-graphic.png`
   - Screenshots de teléfono: Sube 2-4 screenshots

3. **Categorización:**
   - Categoría: `Negocios`
   - Tags: `portfolio`, `desarrollo web`, `business intelligence`

4. **Información de contacto:**
   - Email: `marianoaliandri@gmail.com`
   - Sitio web: `https://marianoaliandri.com.ar`
   - Teléfono: `+54-299-541-4422`

### 4.5 Configurar privacidad y contenido

1. **Política de privacidad:**
   - URL: `https://marianoaliandri.com.ar/privacy-policy.html`

2. **Clasificación de contenido:**
   - Completa el cuestionario
   - Selecciona: No contiene violencia, sexo, lenguaje inapropiado, etc.

3. **Público objetivo:**
   - Edad: 18+
   - Tipo de usuario: Profesionales y empresas

4. **Permisos de datos:**
   - Completa el formulario de seguridad de datos
   - Indica qué datos recopilas (Analytics, Firestore)

### 4.6 Subir AAB a producción

1. Ve a **Producción > Crear versión**

2. **Subir AAB:**
   - Click en "Subir"
   - Selecciona `app-release-bundle.aab`
   - Espera a que se procese

3. **Nombre de la versión:**
   - Código de versión: `1` (auto-generado)
   - Nombre de la versión: `1.0.0`

4. **Notas de la versión:**
```
Primera versión oficial

• Portfolio completo de proyectos
• Calculadoras interactivas (ROI BI, Cotizador Web)
• Información de servicios profesionales
• Contacto directo por WhatsApp
• Optimización PWA para acceso offline
• Diseño responsive y moderna UX
```

5. Click en **Guardar** y luego **Revisar versión**

### 4.7 Revisar y enviar

1. Verifica que todo esté completo (checklist verde)
2. Click en **Iniciar lanzamiento en producción**
3. Confirma el envío

**⏳ Tiempo de revisión:**
- Primera app: 1-7 días
- Actualizaciones: Pocas horas

---

## 🔄 Parte 5: Actualizar la App

Cuando hagas cambios en tu sitio web y quieras actualizar la app:

### 5.1 Incrementar versión

Edita `twa-manifest.json`:
```json
{
  "versionCode": 2,  // Incrementar
  "versionName": "1.0.1"  // Actualizar
}
```

### 5.2 Recompilar

```bash
cd twa-marianoaliandri
bubblewrap build
```

### 5.3 Subir nueva versión

1. Ve a Play Console > Producción
2. Crear versión
3. Subir el nuevo AAB
4. Agregar notas de versión
5. Enviar

---

## 📋 Checklist Pre-Publicación

Antes de enviar a revisión, verifica:

### PWA:
- [ ] Lighthouse PWA score > 80
- [ ] Service worker funcionando
- [ ] Manifest válido con todos los campos
- [ ] Iconos en todos los tamaños (72-512)
- [ ] Screenshots capturados
- [ ] HTTPS habilitado
- [ ] Sin errores en consola

### Digital Asset Links:
- [ ] assetlinks.json accesible en `/.well-known/`
- [ ] SHA256 fingerprint correcto
- [ ] Verificación en Google API funciona

### APK/AAB:
- [ ] APK instalable y funcional
- [ ] Enlaces internos abren en la app
- [ ] Enlaces externos abren en navegador
- [ ] Shortcuts funcionan correctamente
- [ ] Sin crashes o errores

### Play Store:
- [ ] Cuenta de Play Console activa
- [ ] Ficha completa (nombre, descripción, categoría)
- [ ] Todos los recursos gráficos subidos
- [ ] Política de privacidad publicada
- [ ] Clasificación de contenido completada
- [ ] Formulario de seguridad de datos completado

---

## 🆘 Solución de Problemas Comunes

### Error: "Digital Asset Links verification failed"
**Solución:**
1. Verifica que `assetlinks.json` sea accesible
2. Confirma que el SHA256 sea correcto: `bubblewrap fingerprint`
3. Espera 10-15 minutos después de actualizar el archivo
4. Usa la herramienta de verificación de Google

### Error: "App not installable"
**Solución:**
1. Verifica que el manifest tenga `start_url` y `scope`
2. Confirma que el sitio sea HTTPS
3. Revisa que los iconos existan y sean accesibles

### Error: Build failed
**Solución:**
1. Verifica versiones: `java -version` (debe ser 17)
2. Confirma ANDROID_HOME: `echo $ANDROID_HOME`
3. Reinstala Bubblewrap: `npm install -g @bubblewrap/cli@latest`

### La app abre enlaces externos dentro de la app
**Solución:**
Edita `twa-manifest.json` y agrega `enableUrlBarHiding: false` temporalmente, o asegúrate de que Digital Asset Links esté configurado correctamente.

---

## 📚 Recursos Adicionales

- [Bubblewrap CLI Docs](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Builder](https://www.pwabuilder.com/) - Alternativa visual
- [Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [TWA Quality Criteria](https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide)

---

## 📝 Notas Finales

1. **Backups:** Guarda `android.keystore` en un lugar seguro. Sin él, no podrás actualizar la app.

2. **Updates:** La app se actualiza automáticamente cuando actualizas tu sitio web (beneficio de TWA).

3. **Analytics:** Los eventos de Google Analytics funcionan normalmente dentro de la TWA.

4. **Monetización:** Puedes agregar pagos in-app después de publicar.

5. **Multi-idioma:** Puedes agregar traducciones en Play Console sin reconstruir el AAB.

---

**¿Necesitas ayuda?** Contacta con marianoaliandri@gmail.com

Última actualización: Enero 2026
