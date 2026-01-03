# 🔧 Configuración de Make.com - Guía Paso a Paso

## 📋 Tu Webhook URL
```
https://hook.us2.make.com/qo6w3by4t4fatm8utatt2c54krtyx5nl
```

---

## 🎯 Estructura del Scenario

Tu scenario debe verse así:

```
Webhook → Router → LinkedIn
               ├→ Twitter
               ├→ Facebook
               └→ Instagram (opcional)
```

---

## 1️⃣ Webhook (Ya está creado)

✅ **Custom Webhook** ya configurado con la URL de arriba.

El webhook recibe este JSON:
```json
{
  "text": "Texto del post...",
  "networks": ["linkedin", "twitter", "facebook"],
  "type": "custom",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "imageUrl": null,
  "metadata": {}
}
```

---

## 2️⃣ Router

Después del webhook, agrega un **Router** para dividir el flujo a cada red social.

1. Click en el **+** después del webhook
2. Busca "Flow control"
3. Selecciona **Router**

---

## 3️⃣ Configurar LinkedIn

### Ruta 1 del Router:

1. **Filter**:
   - Nombre: "Solo LinkedIn"
   - Condición: `{{1.networks}}` contains `linkedin`

2. **Módulo LinkedIn**:
   - Busca: "LinkedIn"
   - Selecciona: "Create a Share Update" o "Create a Text Share"
   - Conecta tu cuenta de LinkedIn

3. **Mapeo de campos**:
   - **Text/Comment**: `{{1.text}}`
   - **Visibility**: `PUBLIC`

---

## 4️⃣ Configurar Twitter

### Ruta 2 del Router:

1. **Filter**:
   - Nombre: "Solo Twitter"
   - Condición: `{{1.networks}}` contains `twitter`

2. **Módulo Twitter**:
   - Busca: "Twitter" o "X (Twitter)"
   - Selecciona: "Create a Tweet"
   - Conecta tu cuenta de Twitter

3. **Mapeo de campos**:
   - **Text**: `{{1.text}}`

**⚠️ Nota:** Twitter tiene límite de 280 caracteres. Make.com te avisará si el texto es muy largo.

---

## 5️⃣ Configurar Facebook

### Ruta 3 del Router:

1. **Filter**:
   - Nombre: "Solo Facebook"
   - Condición: `{{1.networks}}` contains `facebook`

2. **Módulo Facebook**:
   - Busca: "Facebook Pages"
   - Selecciona: "Create a Post"
   - Conecta tu página de Facebook (no tu perfil personal)

3. **Mapeo de campos**:
   - **Message**: `{{1.text}}`
   - **Page**: Selecciona tu página

**💡 Tip:** Necesitas tener una Página de Facebook, no puedes publicar en perfiles personales via API.

---

## 6️⃣ Instagram via Facebook (Automático) ✅

### 💡 Solución Simple: Facebook → Instagram

Si ya tienes Facebook conectado a Instagram para compartir automáticamente, **no necesitas configurar nada más**.

Cuando publiques en Facebook desde Make.com:
1. El post se publica en tu Página de Facebook
2. Facebook automáticamente lo comparte en Instagram
3. ✅ ¡Listo! Sin configuración adicional

### Cómo activar Facebook → Instagram (si no lo tienes):

1. Ve a tu Página de Facebook
2. **Configuración** → **Instagram**
3. Conecta tu cuenta de Instagram
4. Activa **"Compartir automáticamente en Instagram"**

**✅ Ventajas:**
- No necesitas configurar Instagram en Make.com
- No requiere imágenes obligatorias
- Una sola publicación llega a ambas redes
- Menos operaciones consumidas en Make.com

**⚠️ Limitación:**
- Solo publica en tu Página de Facebook (que luego va a Instagram)
- No puedes publicar solo en Instagram sin Facebook

---

## 7️⃣ Activar el Scenario

1. Click en el botón **Save** (abajo a la derecha)
2. Activa el toggle **ON** (arriba a la izquierda)
3. ¡Listo!

---

## ✅ Probar la Integración

### Desde tu panel de admin:

1. Ve a `/admin`
2. Tab "Redes Sociales"
3. Click "🔌 Test Conexión"
4. Si ves "Conexión exitosa", todo funciona

### Desde Make.com:

1. Ve a "Scenario" → "History"
2. Deberías ver una ejecución exitosa
3. Cada ruta debe mostrar éxito (verde)

---

## 🐛 Troubleshooting

### "The request failed due to failure of a previous request"

**Causa:** Una de las redes falló y detuvo las demás.

**Solución:**
1. Ve a cada ruta del router
2. Click derecho en cada módulo de red social
3. "Advanced settings"
4. Activa "Continue the execution even if this module returns an error"

### "Account error (invalid_client)" en LinkedIn/Twitter/Facebook

**Causa:** Necesitas reconectar la cuenta.

**Solución:**
1. Click en el módulo que falla
2. "Change" en la conexión
3. Re-autoriza la cuenta

### "No account found" en Instagram

**Causa:** Necesitas Instagram Business, no cuenta personal.

**Solución:**
1. Convierte tu Instagram a Business
2. Conecta con una Página de Facebook
3. Re-intenta la conexión

### El webhook no recibe nada

**Causa:** Variable de entorno no configurada.

**Solución:**
1. Verifica que `.env` tenga: `VITE_MAKE_WEBHOOK_PUBLISH=https://hook.us2.make.com/qo6w3by4t4fatm8utatt2c54krtyx5nl`
2. Reinicia el servidor: `npm run dev`

---

## 📊 Límites del Plan Gratuito

Make.com plan gratuito incluye:
- ✅ 1,000 operaciones/mes
- ✅ Scenarios ilimitados
- ✅ 2 scenarios activos simultáneamente
- ✅ Ejecución cada 15 minutos (para scheduled scenarios)

**Cada publicación = 1 operación por red social**

Ejemplo: Publicar en 3 redes = 3 operaciones

---

## 🚀 Próximos Pasos

Una vez configurado:

1. ✅ Publica desde `/admin` → "Redes Sociales"
2. ✅ Usa templates rápidos para contenido
3. ✅ Publica productos de tu tienda
4. ✅ Comparte estadísticas del sitio

---

## 📸 Diagrama Visual del Scenario

```
┌─────────────┐
│   Webhook   │ (recibe desde tu web)
└──────┬──────┘
       │
       ▼
   ┌────────┐
   │ Router │
   └───┬────┘
       │
       ├─► [Filter: linkedin] ──► LinkedIn (Create Share)
       │
       ├─► [Filter: twitter] ───► Twitter (Create Tweet)
       │
       ├─► [Filter: facebook] ──► Facebook (Create Post)
       │
       └─► [Filter: instagram] ─► Instagram (opcional)
```

---

**¿Dudas?** Revisa [SOCIAL-MEDIA-README.md](SOCIAL-MEDIA-README.md) para más info sobre el uso del panel.
