# 📱 Buffer Integration - Documentación Completa

## Índice
1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Componentes Implementados](#componentes-implementados)
4. [Uso del Dashboard](#uso-del-dashboard)
5. [Automatizaciones](#automatizaciones)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Introducción

La integración de Buffer te permite gestionar todas tus redes sociales desde tu portfolio. Incluye:

✅ **Dashboard completo** de gestión de redes sociales
✅ **Publicación automática** de nuevos proyectos
✅ **Botones de compartir** en proyectos y calculadoras
✅ **Generador de imágenes** para posts
✅ **Webhooks** desde Marian Bot
✅ **Contenido reciclado** inteligente
✅ **Analytics** de rendimiento

---

## Configuración Inicial

### 1. Obtener API Token de Buffer

1. Ve a [https://buffer.com/developers/api](https://buffer.com/developers/api)
2. Inicia sesión con tu cuenta de Buffer
3. Haz clic en "Create a New App"
4. Completa los datos:
   - **App Name**: Mariano Portfolio
   - **Description**: Integración de redes sociales para portfolio
   - **Website**: https://marianoaliandri.com.ar
5. Copia tu **Access Token**

### 2. Configurar Variables de Entorno

Edita tu archivo `.env`:

```bash
# Buffer API Configuration
VITE_BUFFER_ACCESS_TOKEN=1/tu-access-token-aqui
```

**⚠️ IMPORTANTE**: Nunca subas este archivo a Git. Asegúrate de que `.env` esté en `.gitignore`.

### 3. Conectar Redes Sociales a Buffer

1. Ve a [https://buffer.com/app](https://buffer.com/app)
2. Haz clic en "Connect Accounts"
3. Conecta tus cuentas de:
   - LinkedIn
   - Twitter
   - Facebook
   - Instagram (requiere cuenta business)

### 4. Verificar Instalación

Ejecuta en consola:

```bash
npm install
npm run dev
```

Navega a `http://localhost:5173/buffer` y deberías ver el dashboard.

---

## Componentes Implementados

### 1. BufferService (`src/utils/bufferService.js`)

Servicio principal para interactuar con la API de Buffer.

**Métodos principales:**

```javascript
import bufferService from '../utils/bufferService';

// Obtener perfiles conectados
const profiles = await bufferService.getProfiles();

// Publicar inmediatamente
await bufferService.publishNow(
  profileIds,      // Array de IDs de perfiles
  'Texto del post',
  { shorten: true } // Opciones
);

// Programar publicación
await bufferService.schedulePost(
  profileIds,
  'Texto del post',
  timestamp        // Unix timestamp
);

// Agregar a la cola
await bufferService.addToQueue(profileIds, 'Texto del post');

// Publicar con imagen
await bufferService.publishWithMedia(
  profileIds,
  'Texto del post',
  'https://url-de-imagen.jpg'
);
```

### 2. ShareButton (`src/components/ShareButton.jsx`)

Componente reutilizable para compartir contenido.

**Uso:**

```jsx
import ShareButton from './ShareButton';

<ShareButton
  content={{
    title: 'Título del contenido',
    description: 'Descripción',
    text: 'Texto completo del post'
  }}
  type="project"  // project, calculator, general
  variant="primary"  // primary, secondary, minimal
  onShare={(data) => console.log('Compartido:', data)}
/>
```

### 3. ImageGenerator (`src/utils/imageGenerator.js`)

Genera imágenes automáticas para compartir en redes.

**Uso:**

```javascript
import imageGenerator from '../utils/imageGenerator';

// Generar imagen de proyecto
const imageUrl = await imageGenerator.generateProjectImage({
  title: 'Mi Proyecto',
  description: 'Descripción del proyecto',
  technologies: ['React', 'Python']
});

// Generar imagen de calculadora
const calcImage = await imageGenerator.generateCalculatorImage('roi', {
  totalCalculations: 1250
});

// Descargar imagen
imageGenerator.downloadImage(imageUrl, 'mi-proyecto.png');
```

### 4. BufferDashboard (`src/components/BufferDashboard.jsx`)

Dashboard completo de gestión.

**Acceso:** `http://localhost:5173/buffer`

**Pestañas:**
- **Crear**: Composer para nuevas publicaciones
- **Programadas**: Lista de posts pendientes
- **Analytics**: Estadísticas de rendimiento
- **Configuración**: Perfiles conectados

---

## Uso del Dashboard

### Crear Nueva Publicación

1. Ve al Dashboard (`/buffer`)
2. Pestaña "Crear"
3. Usa templates rápidos o escribe tu propio texto
4. Selecciona redes sociales
5. Elige cuándo publicar:
   - **Ahora**: Publicación inmediata
   - **Programar**: Selecciona fecha y hora
   - **Agregar a cola**: Buffer decide cuándo publicar
6. Haz clic en "Publicar"

### Templates Rápidos

#### Proyecto
```
🚀 Nuevo proyecto terminado

[Descripción del proyecto]

#DesarrolloWeb #PowerBI #Python #React

Ver más en mi portfolio 👇
https://marianoaliandri.com.ar
```

#### Tip
```
💡 Tip: [Tu consejo aquí]

¿Necesitás ayuda con [tema]?
Hablemos 👇
https://marianoaliandri.com.ar/#contact

#Tech #Programming #WebDev
```

#### Servicio
```
🎯 ¿Sabías que puedo ayudarte con [servicio]?

✅ [Beneficio 1]
✅ [Beneficio 2]
✅ [Beneficio 3]

Conocé más sobre mis servicios 👇
https://marianoaliandri.com.ar
```

### Ver Analytics

1. Pestaña "Analytics"
2. Espera a que cargue (puede tardar unos segundos)
3. Verás:
   - Total de posts publicados
   - Clicks totales
   - Alcance total
   - Engagement total

---

## Automatizaciones

### 1. Auto-publicación de Proyectos

Cuando agregues un proyecto nuevo en [Proyectos.jsx](src/components/Proyectos.jsx):

```jsx
const proyectos = [
  {
    id: 3,
    title: 'Nuevo Dashboard de Ventas',
    description: 'Dashboard interactivo con Power BI...',
    technologies: ['Power BI', 'DAX', 'SQL']
  }
];
```

**El botón "Compartir" automáticamente:**
1. Genera el texto del post con emojis
2. Agrega hashtags relevantes
3. Incluye link a tu portfolio
4. Permite publicar en todas tus redes

**Texto generado:**

```
📊 Nuevo proyecto: Nuevo Dashboard de Ventas

Dashboard interactivo con Power BI...

#DesarrolloWeb #PowerBI #Python #React #FullStack #DataAnalytics

Ver más en mi portfolio 👇
```

### 2. Webhook desde Marian Bot

Cuando alguien agenda una reunión vía chatbot, automáticamente:

```javascript
// Se ejecuta automáticamente en AIChatBot.jsx
await bufferService.publishMeetingScheduled({
  clientName: 'Juan Pérez',
  service: 'Consultoría Power BI'
});
```

**Post generado (se publica en 1 hora):**

```
🎯 Nueva reunión agendada

Gracias Juan Pérez por confiar en mi servicio de Consultoría Power BI.

¿Necesitás asesoramiento en desarrollo web, Power BI o análisis de datos?

Agendá tu reunión gratuita 👇
https://marianoaliandri.com.ar/#contact
```

### 3. Contenido Reciclado

Ejecuta manualmente:

```javascript
await bufferService.recycleContent();
```

**Repostea automáticamente** contenido evergreen como:
- Tips de Power BI
- Ventajas de React + Python
- Señales de que necesitas dashboards
- Y más...

**Frecuencia recomendada:** Cada 30-60 días

### 4. Compartir Calculadoras

Cuando alguien usa una calculadora:

```javascript
import bufferService from '../utils/bufferService';

await bufferService.shareCalculator('roi', {
  totalCalculations: 1250
});
```

**Post generado:**

```
📈 ¿Cuánto vale realmente tu proyecto web?

Probé mi Calculadora de ROI interactiva y descubrí insights increíbles.

Ya hay 1250 empresas calculando su retorno de inversión.

¿Querés calcular el tuyo? Es gratis 👇
https://marianoaliandri.com.ar/roi

#ROI #DesarrolloWeb #Emprendedores
```

---

## API Reference

### bufferService

#### `getProfiles(forceRefresh)`
Obtiene perfiles de redes sociales conectados.

```javascript
const profiles = await bufferService.getProfiles();
// Retorna: [{ id, service, username, ... }]
```

#### `publishNow(profileIds, text, options)`
Publica inmediatamente en las redes seleccionadas.

```javascript
await bufferService.publishNow(
  ['5f9b...', '5f9c...'],
  'Texto del post',
  {
    shorten: true,  // Acortar links
    media: {
      photo: 'https://...'
    }
  }
);
```

#### `schedulePost(profileIds, text, scheduledAt, options)`
Programa una publicación para fecha/hora específica.

```javascript
const timestamp = bufferService.formatDate(new Date('2024-12-25 10:00'));
await bufferService.schedulePost(profileIds, text, timestamp);
```

#### `addToQueue(profileIds, text, options)`
Agrega a la cola de Buffer (Buffer decide cuándo publicar).

```javascript
await bufferService.addToQueue(profileIds, 'Texto del post');
```

#### `getPendingUpdates(profileId)`
Obtiene publicaciones programadas pendientes.

```javascript
const pending = await bufferService.getPendingUpdates(profileId);
```

#### `getProfileAnalytics(profileId)`
Obtiene analytics de un perfil (últimos 100 posts).

```javascript
const analytics = await bufferService.getProfileAnalytics(profileId);
// Retorna: { totalPosts, totalClicks, totalReaches, totalEngagements, posts: [...] }
```

#### `publishNewProject(project)`
Helper para publicar proyectos automáticamente.

```javascript
await bufferService.publishNewProject({
  title: 'Mi Proyecto',
  description: 'Descripción...',
  technologies: ['React', 'Python']
});
```

#### `shareCalculator(calculatorType, stats)`
Helper para compartir calculadoras.

```javascript
await bufferService.shareCalculator('roi', {
  totalCalculations: 1250
});
```

#### `publishMeetingScheduled(meetingData)`
Webhook para reuniones agendadas.

```javascript
await bufferService.publishMeetingScheduled({
  clientName: 'Juan Pérez',
  service: 'Consultoría BI'
});
```

#### `recycleContent()`
Repostea contenido evergreen automáticamente.

```javascript
await bufferService.recycleContent();
```

### imageGenerator

#### `generateProjectImage(project)`
Genera imagen de proyecto para redes sociales.

```javascript
const imageUrl = await imageGenerator.generateProjectImage({
  title: 'Mi Proyecto',
  description: 'Descripción...',
  technologies: ['React', 'Python', 'Power BI']
});
```

**Resultado:** Imagen 1200x630px con gradiente purple, título grande, tecnologías.

#### `generateCalculatorImage(calculatorType, stats)`
Genera imagen de calculadora.

```javascript
const imageUrl = await imageGenerator.generateCalculatorImage('roi', {
  totalCalculations: 1250
});
```

**Tipos:** `'roi'`, `'web'`, `'ats'`

#### `generateTestimonialImage(testimonial)`
Genera quote card de testimonio.

```javascript
const imageUrl = await imageGenerator.generateTestimonialImage({
  text: 'Excelente trabajo, muy profesional...',
  author: 'Juan Pérez',
  role: 'CEO',
  company: 'Tech SA',
  image: 'https://...'  // Opcional
});
```

#### `generateQuoteImage(quote, author)`
Genera imagen de quote genérica.

```javascript
const imageUrl = await imageGenerator.generateQuoteImage(
  'La mejor manera de predecir el futuro es crearlo',
  'Mariano Aliandri'
);
```

#### `downloadImage(dataUrl, filename)`
Descarga la imagen generada.

```javascript
imageGenerator.downloadImage(imageUrl, 'mi-proyecto.png');
```

---

## Troubleshooting

### Error: "Buffer API Error: 401"

**Causa:** Token de acceso inválido o expirado.

**Solución:**
1. Verifica que `VITE_BUFFER_ACCESS_TOKEN` esté en `.env`
2. Genera un nuevo token en [Buffer Developers](https://buffer.com/developers/api)
3. Reinicia el servidor de desarrollo

### Error: "No profiles found"

**Causa:** No hay redes sociales conectadas a Buffer.

**Solución:**
1. Ve a [buffer.com/app](https://buffer.com/app)
2. Conecta al menos una red social
3. Recarga el dashboard

### Las publicaciones no aparecen

**Causa:** Límite de plan gratuito alcanzado (10 posts programados).

**Solución:**
1. Elimina publicaciones antiguas programadas
2. Usa "Publicar ahora" en lugar de programar
3. Considera upgrade a plan Pro

### Error al generar imágenes

**Causa:** `html-to-image` requiere DOM.

**Solución:**
- Las imágenes solo se generan en el navegador
- No funcionan en SSR o backend
- Asegúrate de llamar `generateImage` solo desde componentes React

### Analytics no carga

**Causa:** Demasiados perfiles o posts, timeout.

**Solución:**
1. Reduce el número de perfiles analizados
2. Limita los posts en `getProfileAnalytics` (línea 280 de bufferService.js)
3. Aumenta el timeout si es necesario

---

## Límites de Buffer (Plan Gratuito)

- **Perfiles conectados**: 3
- **Posts programados**: 10
- **Posts por día**: Ilimitados (si publicas "Ahora")
- **Analytics**: Últimos 30 días

**Recomendación:** Para uso profesional, considera Buffer Pro ($15/mes) que ofrece:
- ✅ 8 perfiles conectados
- ✅ 100 posts programados
- ✅ Analytics avanzados
- ✅ Soporte prioritario

---

## Próximas Mejoras

- [ ] Subir imágenes directamente a Buffer
- [ ] Programación recurrente (diaria, semanal)
- [ ] A/B testing de posts
- [ ] Integración con Analytics de Google
- [ ] Vista de calendario visual
- [ ] Borrador colaborativo
- [ ] Hashtag research automático

---

## Soporte

Si encontrás algún problema:

1. Revisa esta documentación
2. Chequea la [documentación oficial de Buffer API](https://buffer.com/developers/api)
3. Abre un issue en el repositorio
4. Contacta a soporte@marianoaliandri.com.ar

---

**¡Felicidades! Ahora podés gestionar todas tus redes sociales desde tu portfolio** 🎉
