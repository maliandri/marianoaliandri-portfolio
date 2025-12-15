# 🔧 Configuración de Variables de Entorno en Netlify

## Error Actual
```
Failed to parse private key: Error: Too few bytes to parse DER
```

Esto significa que `FIREBASE_PRIVATE_KEY` no está correctamente configurada en Netlify.

## ✅ Solución: Configurar Variables de Entorno en Netlify

### Paso 1: Ir a Netlify Dashboard
1. Abrí https://app.netlify.com
2. Seleccioná tu sitio (marianoaliandri-portfolio)
3. Ir a **Site configuration** → **Environment variables**

### Paso 2: Verificar/Agregar Variables de Firebase

Necesitás estas 3 variables (las obtenés del archivo JSON de Firebase Service Account):

#### FIREBASE_PROJECT_ID
```
marianoaliandri-c2f0c
```

#### FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-xxxxx@marianoaliandri-c2f0c.iam.gserviceaccount.com
```

#### FIREBASE_PRIVATE_KEY (⚠️ IMPORTANTE)

**FORMA CORRECTA** de configurar la clave privada en Netlify:

1. Copiá la clave privada COMPLETA del archivo JSON de Firebase (incluye `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)

2. La clave debe tener `\n` literales (dos caracteres: barra invertida y n), NO saltos de línea reales

3. Ejemplo de formato CORRECTO:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...más texto...\n-----END PRIVATE KEY-----\n
```

4. **En Netlify UI**: Pegá la clave CON los `\n` literales (dos caracteres, no saltos de línea)

### Paso 3: Scopes (Ámbito de las Variables)

Para cada variable, configurá:
- **Scopes**: Seleccionar **All**
  - ✅ Builds
  - ✅ Functions
  - ✅ Post-processing

### Paso 4: Variables Opcionales para Admin

Podés agregar estas para cambiar las credenciales de admin:

```
ADMIN_USERNAME=maliandri
ADMIN_PASSWORD=Maliandri$#652542026
```

### Paso 5: Deploy

Después de configurar las variables:
1. Guardá los cambios en Netlify
2. Hacé un nuevo deploy (o esperá al próximo deploy automático)
3. Las funciones deberían funcionar correctamente

---

## 🔍 Verificar que está bien configurado

Después del deploy, probá acceder a:
```
https://marianoaliandri.com/.netlify/functions/admin-get-data
```

Deberías ver un error 405 (Method not allowed) - esto es BUENO, significa que la función cargó correctamente.

Si ves "Failed to parse private key", la clave aún está mal configurada.

---

## 📋 Cómo obtener las credenciales de Firebase

Si necesitás obtener nuevamente las credenciales:

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar tu proyecto "marianoaliandri-c2f0c"
3. Ir a **Project Settings** (⚙️) → **Service accounts**
4. Click en "Generate new private key"
5. Se descarga un archivo JSON con todas las credenciales
6. Copiá los valores a Netlify siguiendo el formato de arriba

---

## ⚠️ Importante

- NUNCA commitees el archivo JSON de Firebase al repositorio
- Las credenciales solo se configuran en Netlify (variables de entorno)
- El código usa `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')` para convertir los `\n` literales a saltos de línea reales
