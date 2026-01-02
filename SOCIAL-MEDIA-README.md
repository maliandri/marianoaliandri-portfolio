# 📱 Integración de Redes Sociales via Make.com

## ✨ Resumen

Publica en tus redes sociales (LinkedIn, Twitter, Facebook, Instagram) directamente desde el panel de administración usando Make.com webhooks.

---

## ⚡ Configuración Rápida (5 minutos)

### 1. Ya tienes el webhook configurado
```bash
VITE_MAKE_WEBHOOK_PUBLISH=https://hook.us2.make.com/qo6w3by4t4fatm8utatt2c54krtyx5nl
```

### 2. Configurar Make.com Scenario

1. Ve a [make.com](https://make.com) y abre tu scenario
2. Tu webhook ya está creado (Custom Webhook)
3. Ahora agrega los módulos de redes sociales:

#### Para LinkedIn:
- Agrega módulo "LinkedIn" → "Create a Share Update"
- Conecta tu cuenta de LinkedIn
- Mapea los campos:
  - Text: `{{1.text}}` (del webhook)
  - Visibility: Public

#### Para Twitter:
- Agrega módulo "Twitter" → "Create a Tweet"
- Conecta tu cuenta de Twitter
- Mapea el campo:
  - Text: `{{1.text}}` (del webhook)

#### Para Facebook:
- Agrega módulo "Facebook" → "Create a Post"
- Conecta tu página de Facebook
- Mapea los campos:
  - Message: `{{1.text}}` (del webhook)

#### Para Instagram:
- Agrega módulo "Instagram Business" → "Create a Post"
- Conecta tu cuenta de Instagram Business
- Mapea los campos:
  - Caption: `{{1.text}}` (del webhook)

### 3. Filtrar por Red Social

Entre el webhook y cada módulo de red social, agrega un "Filter":
- **Condición para LinkedIn**: `{{1.networks}}` contains `linkedin`
- **Condición para Twitter**: `{{1.networks}}` contains `twitter`
- **Condición para Facebook**: `{{1.networks}}` contains `facebook`
- **Condición para Instagram**: `{{1.networks}}` contains `instagram`

Esto permite que el usuario seleccione en qué redes publicar.

### 4. ¡Listo!

Guarda el scenario en Make.com y ya está funcionando.

---

## 🚀 Uso del Panel de Admin

### Acceder al Dashboard

1. Ve a `https://marianoaliandri.com.ar/admin`
2. Inicia sesión
3. Click en tab "📱 Redes Sociales"

### Publicar Contenido Libre

1. Tab "✍️ Publicación Libre"
2. Selecciona las redes sociales (LinkedIn, Twitter, Facebook, Instagram)
3. Usa un template rápido o escribe tu propio texto
4. Click "🚀 Publicar Ahora"

**Templates disponibles:**
- 💼 Servicio
- 💡 Tip
- 🎉 Logro

### Publicar Producto/Servicio

1. Tab "🎯 Productos/Servicios"
2. Selecciona un producto de tu tienda
3. Preview automático del post
4. Click "🚀 Publicar Producto"

**Formato del post:**
```
🎯 Nuevo servicio disponible: [Nombre]

[Descripción]

💰 Precio: $[Precio]

¿Te interesa? Contactame:
https://marianoaliandri.com.ar/#contact

#Servicios #DesarrolloWeb #PowerBI #Python
```

### Publicar Estadística

1. Tab "📊 Estadísticas"
2. Escribe título (ej: "Alcanzamos 10,000 visitantes")
3. Escribe descripción
4. Agrega métricas (opcional):
   - Escribe "Visitantes: 10,000" y presiona Enter
   - Agrega más métricas si quieres
5. Click "🚀 Publicar Estadística"

**Formato del post:**
```
📊 [Título]

[Descripción]

✅ [Métrica 1]
✅ [Métrica 2]

Conocé más sobre mi trabajo:
https://marianoaliandri.com.ar

#Analytics #DesarrolloWeb #Resultados
```

---

## 🔧 Funciones del makeService

El servicio `src/utils/makeService.js` expone estos métodos:

### Publicar Contenido Personalizado
```javascript
import makeService from '../utils/makeService';

await makeService.publishCustom(
  'Texto del post',
  ['linkedin', 'twitter'] // Opcional, por defecto todas
);
```

### Publicar Producto
```javascript
await makeService.publishProduct({
  id: '123',
  name: 'Consultoría Power BI',
  description: 'Transformá tus datos en insights...',
  price: 15000
});
```

### Publicar Estadística
```javascript
await makeService.publishStatistic({
  title: 'Alcanzamos 10,000 visitantes',
  description: 'Gracias a todos por el apoyo...',
  metrics: {
    'Visitantes': '10,000',
    'Conversión': '5%'
  }
});
```

### Publicar Servicio
```javascript
await makeService.publishService({
  id: 'seo',
  title: 'SEO Optimization',
  description: 'Mejorá el posicionamiento de tu sitio',
  benefits: [
    'Más tráfico orgánico',
    'Mejor ranking en Google',
    'ROI comprobado'
  ]
});
```

### Test de Conexión
```javascript
const result = await makeService.testConnection();
console.log(result); // { success: true, status: 200, message: 'Conexión exitosa' }
```

---

## 📊 Datos Enviados al Webhook

Cuando publicas desde el panel, Make.com recibe este JSON:

```json
{
  "text": "Texto del post...",
  "networks": ["linkedin", "twitter", "facebook", "instagram"],
  "type": "custom",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metadata": {
    // Datos adicionales según el tipo
  }
}
```

**Tipos de contenido:**
- `custom` - Publicación libre
- `product` - Producto/servicio
- `statistic` - Estadística del sitio
- `service` - Servicio específico
- `test` - Test de conexión

---

## 🎯 Ideas de Contenido

### Posts de Productos
- Cuando agregues un nuevo servicio a la tienda
- Ofertas especiales o descuentos
- Paquetes de servicios

### Posts de Estadísticas
- Hitos alcanzados (10K visitantes, 100 clientes, etc.)
- Métricas mensuales del sitio
- Resultados de proyectos (ROI, conversiones, etc.)

### Posts de Servicios
- Consejos profesionales
- Casos de éxito
- Tendencias en tu industria

### Posts Personalizados
- Anuncios importantes
- Actualizaciones del portfolio
- Eventos o webinars

---

## 🛠️ Troubleshooting

### Error: "Error al publicar"

**Posibles causas:**
1. Webhook URL incorrecta en `.env`
2. Make.com scenario no está activado
3. Redes sociales no conectadas en Make.com

**Solución:**
1. Verifica que `VITE_MAKE_WEBHOOK_PUBLISH` esté en `.env`
2. Ve a Make.com y activa el scenario
3. Conecta tus cuentas de redes sociales en cada módulo

### El post se publica solo en algunas redes

**Causa:** Filtros mal configurados en Make.com

**Solución:**
1. Revisa los filtros entre el webhook y cada módulo de red social
2. Asegúrate de que la condición sea: `{{1.networks}}` contains `nombre-red`

### "Conexión exitosa" pero no se publica

**Causa:** El test de conexión solo verifica que Make.com recibe el webhook, no que publique

**Solución:**
1. Revisa el historial de ejecuciones en Make.com
2. Verifica que las cuentas estén autorizadas
3. Mira los logs de errores en cada módulo

---

## 💡 Automatizaciones Futuras

Puedes extender el sistema para:

- ✅ Auto-publicar cuando se crea un nuevo proyecto
- ✅ Compartir testimonios de clientes
- ✅ Publicar cuando se agenda una reunión (webhook de Marian Bot)
- ✅ Repostear contenido evergreen automáticamente
- ✅ Programar posts recurrentes

---

## 📚 Archivos Creados

- `src/utils/makeService.js` - Servicio de webhooks de Make.com
- `src/components/SocialMediaDashboard.jsx` - Dashboard de redes sociales
- Integrado en `src/pages/AdminPage.jsx` - Tab "Redes Sociales"

---

## 🔒 Seguridad

✅ Dashboard solo accesible desde panel de administración
✅ Requiere autenticación de admin
✅ Webhook URL en variable de entorno
✅ No hay rutas públicas expuestas

---

**¿Preguntas?** Todo está configurado y listo para usar desde `/admin` 🚀
