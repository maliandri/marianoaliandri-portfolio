# 🤖 Configuración de Gemini AI en Make.com

## 📋 Lo que vas a lograr

Cuando publiques desde `/admin`:
1. **Seleccionas** un producto, servicio o estadística
2. **Make.com recibe** la descripción breve
3. **Gemini genera** un post profesional completo
4. **Se publica** automáticamente en LinkedIn y Facebook

---

## 🔑 Paso 1: Obtener API Key de Gemini

### Opción A: Ya la tienes en tu `.env`
```
VITE_GEMINI_KEY=AIzaSyAtq4XYQwqwlwyPbuK6RPBKZ6ieESRXP-A
```

Usa esta misma API Key en Make.com.

### Opción B: Crear una nueva (opcional)
1. Ve a https://aistudio.google.com/app/apikey
2. Click en **"Get API Key"** o **"Create API Key"**
3. Selecciona tu proyecto o crea uno nuevo
4. Copia la API Key

---

## 🏗️ Paso 2: Estructura del Scenario en Make.com

Tu scenario debe verse así:

```
Webhook → Router (por useAI)
           │
           ├─► [useAI=true] → Gemini → Router → LinkedIn
           │                                  └→ Facebook
           │
           └─► [useAI=false] → Router → LinkedIn
                                      └→ Facebook
```

---

## 🔧 Paso 3: Configurar el Scenario

### 3.1 Agregar Router Principal

1. Click en el **+** después del **Webhook**
2. Busca: **"Flow control"**
3. Selecciona: **"Router"**

Este router dividirá el flujo según si `useAI` es true o false.

---

### 3.2 Ruta 1: CON AI (useAI = true)

#### A) Agregar Filter

1. Click en el **+** en la **primera ruta** del Router
2. Busca: **"Flow control"**
3. Selecciona: **"Filter"**
4. Configura:
   - **Label**: "Con AI"
   - **Condition**:
     - Campo: `{{1.useAI}}`
     - Operador: **Equal to**
     - Valor: `true`

#### B) Agregar Google Gemini

1. Click en el **+** después del Filter
2. Busca: **"Google Gemini"** o **"Google AI"**
3. Selecciona: **"Create a Chat Completion"** o **"Generate Content"**

#### C) Crear Conexión con Gemini

1. Click en **"Add"** o **"Create a connection"**
2. Te pedirá:
   - **Connection name**: "My Gemini AI"
   - **API Key**: Pega tu API Key de Gemini
3. Click **"Save"**

#### D) Configurar el Prompt

En el módulo de Gemini, configura estos campos:

**Model**:
```
gemini-1.5-flash
```
(o `gemini-1.5-pro` si quieres mejor calidad pero más lento)

**Prompt** o **User Message**:
```
Eres un copywriter profesional especializado en LinkedIn y Facebook.

INFORMACIÓN RECIBIDA:
- Tipo: {{1.type}}
- Descripción: {{1.text}}
- Redes objetivo: {{1.networks}}

METADATA ADICIONAL:
{{if(1.type = "product"; "PRODUCTO:
Nombre: " + 1.metadata.productName + "
Descripción: " + 1.metadata.productDescription + "
Precio: $" + 1.metadata.price + "
URL: " + 1.metadata.productUrl;
if(1.type = "statistic"; "ESTADÍSTICA:
Título: " + 1.metadata.title + "
Descripción: " + 1.metadata.description + "
Métricas: " + toString(1.metadata.metrics) + "
URL: " + 1.metadata.siteUrl;
if(1.type = "service"; "SERVICIO:
Nombre: " + 1.metadata.serviceName + "
Descripción: " + 1.metadata.serviceDescription + "
URL: " + 1.metadata.serviceUrl;
"PUBLICACIÓN LIBRE")))}}

TAREA:
Genera un post profesional para redes sociales con estas especificaciones:

📝 ESTRUCTURA:
1. GANCHO: Primera línea impactante (pregunta, dato sorprendente, o declaración fuerte)
2. CONTEXTO: Desarrolla el tema en 2-3 párrafos cortos
3. VALOR: Explica qué gana el lector
4. LLAMADO A ACCIÓN: Invita a contactar, visitar el sitio, o comentar

🎨 FORMATO:
- Máximo 250 palabras
- Usa 2-3 emojis relevantes (no más)
- Párrafos cortos (2-3 líneas cada uno)
- Espacios en blanco para legibilidad
- Tono: Profesional pero accesible

📊 SEGÚN EL TIPO:
{{if(1.type = "product"; "- Destaca el valor y el precio
- Incluye un llamado a visitar: " + 1.metadata.productUrl;
if(1.type = "statistic"; "- Presenta las métricas de forma impactante
- Usa números específicos para credibilidad";
if(1.type = "service"; "- Enfoca en los beneficios para el cliente
- Crea urgencia o curiosidad";
"- Sé auténtico y conversacional")))}}

🏷️ HASHTAGS:
Incluye 3-5 hashtags relevantes al final (en español)

⚠️ IMPORTANTE:
- NO uses formato markdown, negritas, ni cursivas
- NO pongas el texto entre comillas
- Escribe SOLO el texto del post, listo para copiar y pegar
- Las URLs deben estar en texto plano
- Primera persona (yo/mi) o tercera persona según el contexto

GENERA EL POST:
```

**Temperature**: `0.7`

**Max Tokens**: `500`

**Top P**: `1` (default)

**Stop Sequences**: (dejar vacío)

5. Click **"OK"** para guardar

---

### 3.3 Agregar Router de Redes Sociales (después de Gemini)

1. Click en el **+** después del módulo Gemini
2. Busca: **"Flow control"**
3. Selecciona: **"Router"**

Este router enviará el contenido generado por Gemini a LinkedIn y Facebook.

#### Ruta A: LinkedIn

1. **Filter**:
   - Label: "A LinkedIn"
   - Condition: `{{1.networks}}` **contains** `linkedin`

2. **Módulo LinkedIn**:
   - Busca: "LinkedIn"
   - Selecciona: "Create a Share Update" o "Share an Article"
   - Connection: Conecta tu cuenta de LinkedIn
   - **Text/Commentary**: `{{2.choices[].message.content}}` o `{{2.response}}` (el texto generado por Gemini)
   - **Visibility**: PUBLIC

#### Ruta B: Facebook

1. **Filter**:
   - Label: "A Facebook"
   - Condition: `{{1.networks}}` **contains** `facebook`

2. **Módulo Facebook**:
   - Busca: "Facebook Pages"
   - Selecciona: "Create a Post"
   - Connection: Conecta tu cuenta de Facebook
   - **Page**: Selecciona tu página
   - **Message**: `{{2.choices[].message.content}}` o `{{2.response}}` (el texto generado por Gemini)

---

### 3.4 Ruta 2: SIN AI (useAI = false)

Vuelve al **Router Principal** (el primero, después del Webhook).

1. Click en el **+** en la **segunda ruta**
2. Agrega **Filter**:
   - Label: "Sin AI"
   - Condition: `{{1.useAI}}` **does not exist** (o `equals false`)

3. Agrega otro **Router** (para redes)
4. Crea las mismas 2 rutas (LinkedIn y Facebook) pero usa:
   - Text: `{{1.text}}` (directo del webhook, sin procesar por Gemini)

---

## ✅ Paso 4: Activar el Scenario

1. Click en **"Save"** (botón abajo a la derecha)
2. Activa el toggle **ON** (arriba a la izquierda)
3. El scenario está listo

---

## 🧪 Paso 5: Probar

### Desde tu web:

1. Ve a `http://localhost:5173/admin`
2. Tab "Redes Sociales"
3. Tab "Productos/Servicios"
4. Selecciona un producto
5. Click "🚀 Publicar Producto"

### En Make.com:

1. Ve a **"Scenario" → "History"**
2. Deberías ver una ejecución reciente
3. Click en ella para ver el flujo completo
4. Verifica que Gemini generó el texto correctamente
5. Verifica que se publicó en LinkedIn/Facebook

---

## 🎯 Ejemplo de Flujo Completo

### Input (desde tu web):
```json
{
  "text": "Producto: Consultoría Power BI. Transformá tus datos en insights...",
  "type": "product",
  "useAI": true,
  "networks": ["linkedin", "facebook"],
  "metadata": {
    "productName": "Consultoría Power BI",
    "productDescription": "Transformá tus datos en insights accionables",
    "price": 15000,
    "productUrl": "https://marianoaliandri.com.ar/#tienda"
  }
}
```

### Output de Gemini:
```
¿Tus datos están ahí pero no te cuentan nada? 📊

La diferencia entre tener datos y tener insights es saber analizarlos correctamente.

Con mi servicio de Consultoría en Power BI, te ayudo a:
✅ Crear dashboards interactivos que realmente se usen
✅ Automatizar reportes que te quitan horas cada semana
✅ Convertir números en decisiones estratégicas

He ayudado a más de 20 empresas a visualizar mejor su información y tomar decisiones más rápidas.

Inversión: $15,000
Resultados: Inmediatos

¿Querés ver qué podemos hacer con tus datos?
👉 https://marianoaliandri.com.ar/#tienda

#PowerBI #DataAnalytics #BusinessIntelligence #Consultoría #Argentina
```

### Resultado:
Post publicado en LinkedIn y Facebook con ese texto generado por Gemini.

---

## 🐛 Troubleshooting

### Error: "Invalid API Key"
- Verifica que la API Key sea correcta
- Asegúrate de que Gemini API esté habilitado en Google Cloud Console

### Error: "Model not found"
- Usa `gemini-1.5-flash` o `gemini-1.5-pro`
- Verifica que el modelo esté disponible en tu región

### Gemini no genera texto
- Verifica el campo de respuesta: puede ser `{{2.response}}`, `{{2.text}}`, o `{{2.choices[].message.content}}`
- Revisa el historial de ejecución en Make.com para ver qué responde Gemini

### El texto se publica con formato raro
- Asegúrate de que el prompt dice "NO uses markdown"
- Verifica que estés usando el campo correcto de la respuesta de Gemini

---

## 💰 Costos

### Make.com (Free):
- 1,000 operaciones/mes gratis
- Cada publicación = ~3 operaciones (webhook + gemini + publish)
- ~330 publicaciones/mes gratis

### Gemini API:
- **gemini-1.5-flash**: GRATIS hasta 15 requests/min
- **gemini-1.5-pro**: GRATIS hasta 2 requests/min
- Más info: https://ai.google.dev/pricing

---

## 🎓 Próximos Pasos

1. ✅ Configurar Gemini en Make.com
2. ✅ Probar con un producto
3. ✅ Ajustar el prompt según los resultados
4. 🔜 Agregar generación de imágenes (opcional)
5. 🔜 Programar publicaciones recurrentes

---

¿Preguntas? Revisa el historial de ejecuciones en Make.com para debuggear.
