# 🚀 Stack Tecnológico - Portfolio Mariano Aliandri

Este documento describe todas las tecnologías implementadas en el portfolio y cómo usarlas.

## 📦 Tecnologías Implementadas

<div align="center">

![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Web Vitals](https://img.shields.io/badge/Web_Vitals-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

### 1. 🔄 React Query - Data Fetching

![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Version](https://img.shields.io/badge/v5.90.12-green?style=flat-square)

**¿Qué hace?** Maneja cache, sincronización y actualizaciones de datos de Firebase.

**Archivos:**
- `src/utils/queryClient.js` - Configuración de React Query
- `src/hooks/useFirebaseStats.js` - Hooks personalizados
- `src/main.jsx` - Provider

**Uso:**
```javascript
import { useBasicStats } from './hooks/useFirebaseStats';

function MyComponent() {
  const { data: stats, isLoading, error } = useBasicStats();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Visitas: {stats.totalVisits}</div>;
}
```

**Características:**
- ✅ Cache automático (5 minutos)
- ✅ Reintento automático en errores
- ✅ Actualizaciones en tiempo real con Firebase
- ✅ DevTools en desarrollo
- ✅ Invalidación de cache inteligente

**Hooks disponibles:**
- `useBasicStats()` - Estadísticas con real-time
- `useExtendedStats()` - Estadísticas completas
- `useRecordVisit()` - Registrar visita
- `useTrackPageView()` - Tracking de páginas
- `useLike()` / `useDislike()` - Sistema de likes

---

### 2. 📊 Web Vitals - Performance Monitoring

![Web Vitals](https://img.shields.io/badge/Web_Vitals-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Version](https://img.shields.io/badge/v5.1.0-green?style=flat-square)

**¿Qué hace?** Monitorea métricas de rendimiento de Google (Core Web Vitals).

**Archivos:**
- `src/utils/webVitals.js` - Configuración y monitoreo
- `src/main.jsx` - Inicialización

**Métricas monitoreadas:**
- **CLS** (Cumulative Layout Shift) - Estabilidad visual
- **LCP** (Largest Contentful Paint) - Velocidad de carga
- **FID/INP** (First Input Delay / Interaction to Next Paint) - Interactividad
- **FCP** (First Contentful Paint) - Primer renderizado
- **TTFB** (Time to First Byte) - Respuesta del servidor

**Características:**
- ✅ Guardado en localStorage
- ✅ Envío a Firebase Analytics
- ✅ Logs en consola para métricas pobres
- ✅ Logs detallados en desarrollo

**Ver resultados:**
```javascript
import { getWebVitalsHistory, getOverallRating } from './utils/webVitals';

const history = getWebVitalsHistory();
const rating = getOverallRating(); // 'good', 'needs-improvement', 'poor'
```

---

### 3. 🛡️ Zod - Schema Validation

![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)
![Version](https://img.shields.io/badge/v4.2.1-green?style=flat-square)

**¿Qué hace?** Valida datos de Firebase y formularios con tipos seguros.

**Archivos:**
- `src/schemas/firebaseSchemas.js` - Todos los schemas

**Schemas disponibles:**
- `basicStatsSchema` - Estadísticas básicas
- `extendedStatsSchema` - Estadísticas completas
- `userDataSchema` - Datos de usuario
- `contactFormSchema` - Formulario de contacto
- `webCalculatorSchema` - Calculadora web
- `roiCalculatorSchema` - Calculadora ROI
- `resumeSchema` - CV parseado

**Uso:**
```javascript
import { validateData, safeValidate } from './schemas/firebaseSchemas';
import { contactFormSchema } from './schemas/firebaseSchemas';

// Validación estricta
const result = validateData(contactFormSchema, data);
if (result.success) {
  console.log('Datos válidos:', result.data);
} else {
  console.error('Errores:', result.error);
}

// Validación segura (retorna defaults si falla)
const validatedData = safeValidate(contactFormSchema, data);
```

---

### 4. 📝 React Hook Form - Form Management

![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Version](https://img.shields.io/badge/v7.69.0-green?style=flat-square)

**¿Qué hace?** Maneja formularios con validación automática y mejor rendimiento.

**Archivos:**
- `src/hooks/useFormValidation.js` - Hook personalizado
- `src/components/ContactForm.example.jsx` - Ejemplo completo

**Uso:**
```javascript
import { useFormValidation } from './hooks/useFormValidation';
import { contactFormSchema } from './schemas/firebaseSchemas';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useFormValidation({
    schema: contactFormSchema,
    defaultValues: { name: '', email: '' },
    onSubmit: async (data) => {
      await sendData(data);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Enviar</button>
    </form>
  );
}
```

**Ventajas:**
- ✅ Menos re-renders (mejor performance)
- ✅ Validación automática con Zod
- ✅ Manejo de errores en consola
- ✅ Código más limpio y mantenible

---

### 5. 🎭 Playwright - E2E Testing

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Version](https://img.shields.io/badge/v1.x.x-green?style=flat-square)

**¿Qué hace?** Tests end-to-end para asegurar que todo funciona correctamente.

**Archivos:**
- `playwright.config.js` - Configuración
- `tests/homepage.spec.js` - Tests de homepage
- `tests/calculators.spec.js` - Tests de calculadoras
- `tests/stats.spec.js` - Tests de estadísticas

**Comandos:**
```bash
# Ejecutar todos los tests
npm test

# Ejecutar con interfaz visual
npm run test:ui

# Ejecutar en modo debug
npm run test:debug

# Ver reporte de resultados
npm run test:report
```

**Tests incluidos:**
- ✅ Carga de homepage
- ✅ Navegación entre herramientas
- ✅ Validación de formularios
- ✅ Responsive design
- ✅ Sistema de likes
- ✅ Dashboard de estadísticas

**Escribir nuevos tests:**
```javascript
import { test, expect } from '@playwright/test';

test('mi nuevo test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Hola')).toBeVisible();
});
```

---

## 🎯 Migración de Componentes Existentes

### DashboardStats ✅ MIGRADO

**Antes:**
```javascript
const [stats, setStats] = useState({});
useEffect(() => {
  // Código complejo para cargar datos
}, []);
```

**Después:**
```javascript
const { data: stats, isLoading } = useBasicStats();
// React Query maneja todo automáticamente
```

### Calculadoras 🔜 PENDIENTE

Para migrar las calculadoras a React Hook Form:

1. Reemplazar `useState` con `useFormValidation`
2. Usar schemas de `firebaseSchemas.js`
3. Aplicar `register` a los inputs
4. Ver ejemplo en `ContactForm.example.jsx`

---

## 📈 Monitoreo y Analytics

### Ver estadísticas de rendimiento:

```javascript
import { getWebVitalsHistory, getAverageMetric } from './utils/webVitals';

const avgLCP = getAverageMetric('LCP'); // Promedio de LCP
const history = getWebVitalsHistory(); // Historial completo
```

---

## 🚀 Deploy

### Variables de entorno necesarias:

Crear archivo `.env` con:

```env
# Firebase (ya configurado)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
```

### Build para producción:

```bash
npm run build
```

Esto generará:
- Bundle optimizado con Vite
- Web Vitals monitoring activo
- React Query con cache
- Código minificado y optimizado

---

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Web Vitals](https://web.dev/vitals/)
- [Zod Docs](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Playwright Docs](https://playwright.dev/)
- [Firebase Docs](https://firebase.google.com/docs)

---

## ✅ Checklist de Implementación

- [x] React Query integrado
- [x] Web Vitals monitoreando
- [x] Zod validando datos de Firebase
- [x] React Hook Form con ejemplos
- [x] Playwright con tests E2E
- [x] DashboardStats migrado a React Query
- [ ] Migrar Calculadora Web a React Hook Form
- [ ] Migrar Calculadora ROI a React Hook Form
- [ ] Agregar más tests E2E

---

## 🎨 Stack Completo del Proyecto

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### State Management & Data
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

### Forms & Validation
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Testing & Monitoring
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Web Vitals](https://img.shields.io/badge/Web_Vitals-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

### UI Components & Charts
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white)
![React Leaflet](https://img.shields.io/badge/React_Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### AI & External Services
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=mail.ru&logoColor=white)

### Deployment
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

---

**Implementado por:** Claude Sonnet 4.5
**Fecha:** Diciembre 2024
**Versión:** 1.0.0
