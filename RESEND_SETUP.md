# Configuración de Resend para Emails

## 1. Crear cuenta en Resend

1. Ve a https://resend.com
2. Registrate con tu email
3. Verifica tu cuenta por email

## 2. Agregar dominio personalizado

1. En el dashboard de Resend, ve a **Domains**
2. Click en "Add Domain"
3. Ingresa: `marianoaliandri.com.ar`
4. Resend te dará 3 registros DNS que debes agregar:

### Registros DNS a agregar en tu proveedor de dominio:

**SPF Record (TXT):**
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record (TXT):**
```
Name: resend._domainkey
Type: TXT
Value: [Valor específico que te da Resend]
```

**DMARC Record (TXT):**
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none;
```

5. Espera 24-48 horas para que los DNS se propaguen
6. Verifica el dominio en Resend

## 3. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Click en "Create API Key"
3. Dale un nombre: "Portfolio Production"
4. Selecciona permisos: "Sending access"
5. **COPIA LA API KEY** (solo se muestra una vez)

La API key se verá algo así: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 4. Configurar en Netlify

### Opción A: Desde el dashboard web de Netlify

1. Ve a tu sitio en Netlify
2. Site settings → Environment variables
3. Click en "Add a variable"
4. Agrega:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Tu API key de Resend (re_xxx...)
   - **Scopes:** Marcar "Functions"

### Opción B: Usando Netlify CLI

```bash
netlify env:set RESEND_API_KEY "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 5. Re-desplegar el sitio

Después de agregar la variable de entorno, necesitas hacer un nuevo deploy:

```bash
git commit --allow-empty -m "chore: trigger redeploy after adding Resend API key"
git push
```

O desde el dashboard de Netlify:
- Deploys → Trigger deploy → Deploy site

## 6. Probar el envío de emails

1. Haz una compra de análisis de CV de prueba
2. Revisa los logs de la función en Netlify
3. Deberías ver: `✅ Email de análisis enviado exitosamente`
4. Verifica que el email llegó a tu bandeja de entrada

## Emails desde dominios no verificados (desarrollo)

Mientras tu dominio se verifica, puedes usar el email de prueba de Resend:
- Cambia temporalmente el `from` en `send-cv-analysis.js`:
  ```javascript
  from: 'onboarding@resend.dev'
  ```
- Los emails solo llegarán a emails que agregues como "verified" en Resend

## Monitoreo

Revisa el dashboard de Resend para:
- Ver emails enviados
- Tasa de entrega
- Bounces y errores
- Logs de envío

## Límites del plan gratuito

- 100 emails por día
- 3,000 emails por mes
- Dominio personalizado incluido

Si necesitas más, considera actualizar al plan Pro ($20/mes):
- 50,000 emails por mes
- $1 por cada 1,000 emails adicionales
