# 📱 Buffer Integration - Quick Start

## ⚡ Configuración Rápida (5 minutos)

### 1. Obtener Token
1. Ve a [buffer.com/developers/api](https://buffer.com/developers/api)
2. Copia tu Access Token

### 2. Configurar
```bash
# Agrega a .env
VITE_BUFFER_ACCESS_TOKEN=tu-token-aqui
```

### 3. Conectar Redes
1. Ve a [buffer.com/app](https://buffer.com/app)
2. Conecta LinkedIn, Twitter, Facebook, Instagram

### 4. ¡Listo!
```bash
npm install
npm run dev
```

Navega a `http://localhost:5173/buffer`

---

## 🚀 Funcionalidades

### Dashboard Completo
✅ Crear y programar publicaciones
✅ Ver posts programados
✅ Analytics de rendimiento
✅ Gestión de perfiles conectados

### Automatizaciones
✅ **Auto-post de proyectos**: Botón "Compartir" en cada proyecto
✅ **Webhook de Marian Bot**: Auto-publica cuando se agenda reunión
✅ **Generador de imágenes**: Crea imágenes para posts automáticamente
✅ **Contenido reciclado**: Repostea contenido evergreen

---

## 📍 Accesos Rápidos

| Función | Ubicación | URL |
|---------|-----------|-----|
| Dashboard Principal | Botón flotante o directo | `/buffer` |
| Compartir Proyectos | Componente Proyectos | Botón en cada card |
| Settings | Dashboard → Configuración | - |
| Analytics | Dashboard → Analytics | - |

---

## 💡 Uso Rápido

### Publicar Ahora
```javascript
import bufferService from './utils/bufferService';

await bufferService.publishNow(
  profileIds,
  'Texto del post'
);
```

### Programar Post
```javascript
const timestamp = bufferService.formatDate(new Date('2024-12-25 10:00'));
await bufferService.schedulePost(profileIds, 'Texto', timestamp);
```

### Compartir Proyecto
```javascript
await bufferService.publishNewProject({
  title: 'Mi Proyecto',
  description: 'Descripción...',
  technologies: ['React', 'Python']
});
```

### Generar Imagen
```javascript
import imageGenerator from './utils/imageGenerator';

const imageUrl = await imageGenerator.generateProjectImage({
  title: 'Mi Proyecto',
  description: 'Descripción...',
  technologies: ['React', 'Python', 'PowerBI']
});
```

---

## 🎯 Templates Rápidos

### Nuevo Proyecto
```
🚀 Nuevo proyecto: [Título]

[Descripción]

#DesarrolloWeb #PowerBI #Python #React

Ver más 👇
https://marianoaliandri.com.ar
```

### Tip Profesional
```
💡 Tip: [Consejo]

¿Necesitás ayuda?
https://marianoaliandri.com.ar/#contact

#Tech #Programming
```

### Servicio
```
🎯 ¿Sabías que puedo ayudarte con [X]?

✅ [Beneficio 1]
✅ [Beneficio 2]
✅ [Beneficio 3]

Más info 👇
https://marianoaliandri.com.ar
```

---

## 🛠️ Troubleshooting

| Error | Solución |
|-------|----------|
| 401 Unauthorized | Verifica tu token en `.env` |
| No profiles | Conecta redes en buffer.com/app |
| Límite alcanzado | Plan gratuito: 10 posts max |
| Imagen no genera | Solo funciona en browser, no SSR |

---

## 📚 Documentación Completa

Ver [docs/BUFFER-INTEGRATION.md](docs/BUFFER-INTEGRATION.md) para:
- API Reference completa
- Automatizaciones avanzadas
- Ejemplos de código
- Límites y pricing
- Roadmap de mejoras

---

## 🎨 Componentes Creados

- `src/utils/bufferService.js` - Servicio principal de Buffer API
- `src/utils/imageGenerator.js` - Generador de imágenes para posts
- `src/components/BufferDashboard.jsx` - Dashboard completo
- `src/components/ShareButton.jsx` - Botón reutilizable de compartir
- Integración en `AIChatBot.jsx` - Webhook automático
- Integración en `Proyectos.jsx` - Compartir proyectos

---

## 🔥 Próximamente

- [ ] Subir imágenes a Buffer directamente
- [ ] Programación recurrente
- [ ] A/B testing
- [ ] Calendario visual
- [ ] Hashtag research

---

**¿Preguntas?** Revisa [docs/BUFFER-INTEGRATION.md](docs/BUFFER-INTEGRATION.md)
