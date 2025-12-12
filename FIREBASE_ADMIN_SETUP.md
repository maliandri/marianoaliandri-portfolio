# Configuración de Firebase Admin para Webhooks

Para que el webhook pueda guardar órdenes de CV en Firestore, necesitás agregar las credenciales de Firebase Admin en Netlify.

## 1. Obtener las credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Seleccioná tu proyecto
3. **Project Settings** (ícono de engranaje) → **Service accounts**
4. Click en **"Generate new private key"**
5. Se descargará un archivo JSON con las credenciales

## 2. Extraer los valores del JSON

El archivo descargado tiene esta estructura:

```json
{
  "type": "service_account",
  "project_id": "tu-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

Necesitás extraer estos 3 valores:
- `project_id`
- `client_email`
- `private_key`

## 3. Agregar las variables de entorno en Netlify

Ve a tu sitio en Netlify → Site settings → Environment variables

Agregá estas 3 variables:

### FIREBASE_PROJECT_ID
```
Valor: (copia el valor de "project_id" del JSON)
Scope: Functions
```

### FIREBASE_CLIENT_EMAIL
```
Valor: (copia el valor de "client_email" del JSON)
Scope: Functions
```

### FIREBASE_PRIVATE_KEY
```
Valor: (copia TODO el valor de "private_key" del JSON, incluyendo los saltos de línea)
Scope: Functions
```

**IMPORTANTE para FIREBASE_PRIVATE_KEY:**
- Debe incluir `-----BEGIN PRIVATE KEY-----` al principio
- Debe incluir `-----END PRIVATE KEY-----` al final
- Debe mantener todos los `\n` (saltos de línea)
- Debe estar entre comillas dobles si lo pegás en la terminal

Ejemplo:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n"
```

## 4. Re-desplegar

Después de agregar las variables, hacé un nuevo deploy para que las funciones las reconozcan:

```bash
git commit --allow-empty -m "chore: trigger redeploy after adding Firebase Admin credentials"
git push
```

## 5. Verificar

Una vez deployado, cuando alguien compre un análisis de CV:
1. Se enviará el email con el análisis (via Resend)
2. Se guardará la orden en Firestore
3. La orden aparecerá en "Mis Compras" si el usuario inicia sesión con el mismo email

## Firestore Índices Requeridos

Necesitás crear estos índices en Firestore para las queries:

1. **Índice para órdenes por userId:**
   - Collection: `orders`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)

2. **Índice para órdenes por email:**
   - Collection: `orders`
   - Fields:
     - `customerEmail` (Ascending)
     - `createdAt` (Descending)

Firebase te mostrará los links para crear estos índices automáticamente cuando intentes hacer las queries por primera vez.
