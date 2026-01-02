# 🎨 Assets para Google Play Store

Este documento lista todos los assets gráficos necesarios para publicar en Google Play Store.

---

## 📱 Iconos de Aplicación

### Icono Principal
- **Tamaño:** 512x512 px
- **Formato:** PNG-24 con transparencia
- **Ubicación:** `public/icons/icon-512x512.png`
- **Uso:** Icono de la app en Play Store
- **✅ Estado:** Generado por `scripts/generate-pwa-icons.js`

**Requisitos:**
- Diseño simple y reconocible
- Fondo transparente o color sólido
- Sin bordes ni sombras
- Debe verse bien en círculo (Android Adaptive Icons)

---

## 🖼️ Feature Graphic

- **Tamaño:** 1024x500 px
- **Formato:** PNG o JPG
- **Ubicación:** Crear en `public/assets/feature-graphic.png`
- **Uso:** Banner principal en Play Store
- **❌ Estado:** Pendiente de crear

**Contenido sugerido:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Logo]   MARIANO ALIANDRI                  │
│           Desarrollador Full Stack & BI     │
│           • React • Python • Power BI       │
│                                             │
└─────────────────────────────────────────────┘
```

**Herramientas para crear:**
- Canva: https://www.canva.com/ (plantilla 1024x500)
- Figma: https://www.figma.com/
- Photoshop/GIMP

**Paleta de colores:**
- Primario: #4f46e5 (Indigo)
- Secundario: #ffffff (Blanco)
- Texto: #1f2937 (Gris oscuro)

---

## 📸 Screenshots

### Screenshots de Teléfono (OBLIGATORIO)

**Requisitos:**
- **Cantidad:** Mínimo 2, máximo 8
- **Tamaño:** 1080x1920 px (ratio 9:16)
- **Formato:** PNG o JPG
- **Ubicación:** `public/screenshots/mobile-*.png`
- **Estado:** ⚠️ Necesitas capturar

**Screenshots recomendados:**
1. **Página principal** - Muestra el hero y tus datos principales
2. **Proyectos** - Portfolio de proyectos destacados
3. **Calculadoras** - Herramientas interactivas
4. **Servicios** - Lista de servicios profesionales
5. **Contacto** - Formulario de contacto

**Cómo capturar:**

1. **Opción 1: Chrome DevTools (Recomendado)**
   ```
   1. Abre tu sitio en Chrome
   2. F12 para abrir DevTools
   3. Ctrl+Shift+M para toggle device mode
   4. Selecciona "Responsive"
   5. Configura: Width: 1080px, Height: 1920px
   6. Navega a la sección que quieres capturar
   7. Ctrl+Shift+P → "Capture screenshot"
   ```

2. **Opción 2: Dispositivo Android Real**
   - Conecta tu Android por USB
   - Abre la app instalada
   - Captura pantalla (Power + Volume Down)
   - Transfiere imágenes a la PC

3. **Opción 3: Emulador Android Studio**
   - Abre el emulador
   - Instala el APK
   - Captura desde el emulador
   - Exporta las capturas

**Frame opcional:**
Si quieres agregar un frame de dispositivo alrededor:
- https://screenshots.pro/
- https://www.screely.com/

### Screenshots de Tablet (OPCIONAL)

Si quieres que tu app esté optimizada para tablets:

**7 pulgadas:**
- **Tamaño:** 1200x1920 px
- **Cantidad:** 2-8

**10 pulgadas:**
- **Tamaño:** 1600x2560 px
- **Cantidad:** 2-8

---

## 🎥 Video Promocional (OPCIONAL)

- **Duración:** 30 segundos - 2 minutos
- **Formato:** MP4, WebM
- **Tamaño máximo:** 100 MB
- **URL:** Subir a YouTube

**No es obligatorio pero aumenta conversiones en un 20-30%**

---

## 📝 Textos para Play Store

### Título de la App
**Límite:** 50 caracteres

```
Mariano Aliandri | Full Stack & BI
```
(44 caracteres) ✅

### Descripción Corta
**Límite:** 80 caracteres

```
Portfolio profesional: Desarrollo web, análisis de datos y soluciones BI
```
(73 caracteres) ✅

### Descripción Completa
**Límite:** 4000 caracteres

Ver contenido completo en `GUIA-PLAY-STORE.md` (Sección 4.2)

**Elementos clave:**
- ✅ Descripción clara del propósito
- ✅ Lista de características principales
- ✅ Tecnologías utilizadas
- ✅ Beneficios para el usuario
- ✅ Call to action
- ✅ Información de contacto

---

## 🏷️ Metadata Adicional

### Categoría
**Seleccionada:** Negocios

**Otras opciones relevantes:**
- Productividad
- Educación

### Tags/Keywords
```
portfolio, desarrollador, full stack, business intelligence,
power bi, react, python, neuquen, argentina, web development,
data analysis, consultoría
```

### Clasificación de Contenido
- **IARC rating:** Para todos
- **Contenido:** Profesional/Educativo
- **No contiene:** Violencia, sexo, lenguaje inapropiado, etc.

---

## 📄 Documentos Legales

### Política de Privacidad
- **URL:** https://marianoaliandri.com.ar/privacy-policy.html
- **✅ Estado:** Ya existe en `public/privacy-policy.html`

**Debe incluir:**
- ✅ Qué datos recopilas (Analytics, Firestore)
- ✅ Cómo los usas
- ✅ Derechos del usuario
- ✅ Información de contacto

### Términos de Servicio
- **URL:** https://marianoaliandri.com.ar/terms-of-service.html
- **✅ Estado:** Ya existe en `public/terms-of-service.html`

### Política de Eliminación de Datos
- **URL:** https://marianoaliandri.com.ar/data-deletion.html
- **✅ Estado:** Ya existe en `public/data-deletion.html`

---

## ✅ Checklist de Assets

Antes de subir a Play Store, verifica que tengas:

### Gráficos Obligatorios:
- [ ] Icono de app 512x512 (PNG)
- [ ] Feature graphic 1024x500 (PNG/JPG)
- [ ] Mínimo 2 screenshots de teléfono 1080x1920

### Gráficos Opcionales:
- [ ] Screenshots de tablet 7"
- [ ] Screenshots de tablet 10"
- [ ] Video promocional

### Textos:
- [ ] Título de la app (≤ 50 caracteres)
- [ ] Descripción corta (≤ 80 caracteres)
- [ ] Descripción completa (≤ 4000 caracteres)
- [ ] Notas de la versión

### Legales:
- [ ] Política de privacidad publicada
- [ ] Términos de servicio publicados
- [ ] Política de eliminación de datos

### Configuración:
- [ ] Categoría seleccionada
- [ ] Clasificación de contenido completada
- [ ] Información de contacto
- [ ] Formulario de seguridad de datos

---

## 🎨 Plantillas y Recursos

### Generadores de Assets:
1. **PWA Asset Generator**
   ```bash
   npx pwa-asset-generator public/icon-base.png public/icons
   ```

2. **App Icon Generator**
   - https://www.appicon.co/
   - https://icon.kitchen/

3. **Screenshot Framer**
   - https://screenshots.pro/
   - https://www.screely.com/

### Paleta de Colores del Proyecto:
```css
--primary: #4f46e5;     /* Indigo */
--secondary: #8b5cf6;   /* Purple */
--accent: #ec4899;      /* Pink */
--dark: #1f2937;        /* Gray 800 */
--light: #f9fafb;       /* Gray 50 */
```

### Fuentes:
- **Principal:** Inter (Google Fonts)
- **Fallback:** sans-serif

---

## 📊 Tamaños de Referencia Rápida

| Asset | Tamaño | Formato | Cantidad |
|-------|--------|---------|----------|
| Icono app | 512x512 | PNG | 1 |
| Feature graphic | 1024x500 | PNG/JPG | 1 |
| Screenshot móvil | 1080x1920 | PNG/JPG | 2-8 |
| Screenshot tablet 7" | 1200x1920 | PNG/JPG | 0-8 |
| Screenshot tablet 10" | 1600x2560 | PNG/JPG | 0-8 |

---

## 🚀 Siguientes Pasos

1. **Crear Feature Graphic:**
   - Usar Canva con template 1024x500
   - Exportar como PNG de alta calidad
   - Guardar en `public/assets/feature-graphic.png`

2. **Capturar Screenshots:**
   - Seguir instrucciones de Chrome DevTools
   - Capturar mínimo 2, idealmente 4-5
   - Guardar en `public/screenshots/`

3. **Revisar Textos:**
   - Verificar que cumplan límites de caracteres
   - Optimizar para SEO de Play Store
   - Incluir keywords relevantes

4. **Verificar Documentos Legales:**
   - Confirmar que las URLs sean accesibles
   - Revisar contenido actualizado
   - Asegurar compliance con políticas de Google

---

**Última actualización:** Enero 2026

**Contacto:** marianoaliandri@gmail.com
