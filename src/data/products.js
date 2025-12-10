// src/data/products.js
// Catálogo de productos/servicios de Mariano Aliandri

export const productCategories = {
  CONSULTING: 'consulting',
  WEB_DEVELOPMENT: 'web-development',
  DATA_ANALYTICS: 'data-analytics',
  CUSTOM: 'custom'
};

export const products = [
  // ========== CONSULTORÍA Y ROI ==========
  {
    id: 'roi-consulting-basic',
    category: productCategories.CONSULTING,
    name: 'Consultoría ROI Básica',
    shortDescription: 'Análisis de retorno de inversión para tu empresa',
    description: 'Análisis completo de ROI con Power BI, identificación de oportunidades de automatización y recomendaciones personalizadas para optimizar tus procesos de datos.',
    features: [
      'Análisis detallado de costos actuales',
      'Cálculo de ROI proyectado',
      'Dashboard de Power BI personalizado',
      'Reporte ejecutivo en PDF',
      'Sesión de presentación de resultados (1 hora)',
      'Recomendaciones de implementación'
    ],
    price: 100000, // ARS
    priceUSD: 100,
    duration: '2-3 semanas',
    deliverables: [
      'Dashboard interactivo de Power BI',
      'Reporte ejecutivo',
      'Plan de acción recomendado'
    ],
    image: '/images/products/roi-consulting.jpg', // Placeholder
    demo: null,
    tags: ['ROI', 'Power BI', 'Consultoría', 'Data Analytics']
  },

  // ========== DESARROLLO WEB ==========
  {
    id: 'landing-page-professional',
    category: productCategories.WEB_DEVELOPMENT,
    name: 'Landing Page Profesional',
    shortDescription: 'Página de aterrizaje optimizada para conversión',
    description: 'Landing page profesional con diseño moderno, optimizada para SEO y conversión. Incluye formulario de contacto, integración con Google Analytics y hosting por 1 año.',
    features: [
      'Diseño responsive (mobile-first)',
      'SEO optimizado',
      'Formulario de contacto',
      'Integración con Google Analytics',
      'Velocidad de carga optimizada',
      'Hosting y dominio incluido (1 año)',
      '3 revisiones de diseño',
      'Capacitación para actualizaciones'
    ],
    price: 50000, // ARS
    priceUSD: 50,
    duration: '1-2 semanas',
    deliverables: [
      'Landing page completa',
      'Panel de administración',
      'Documentación técnica'
    ],
    image: '/images/products/landing-page.jpg',
    demo: 'https://example-landing.marianoaliandri.com.ar',
    tags: ['Landing Page', 'React', 'SEO', 'Responsive']
  },
  {
    id: 'website-corporate',
    category: productCategories.WEB_DEVELOPMENT,
    name: 'Sitio Web Corporativo',
    shortDescription: 'Sitio web completo para tu empresa',
    description: 'Sitio web corporativo completo con múltiples páginas, blog integrado, formulario de contacto avanzado y panel de administración. Diseño profesional y moderno.',
    features: [
      'Hasta 8 páginas',
      'Blog/Noticias integrado',
      'Formularios de contacto múltiples',
      'Panel de administración CMS',
      'SEO avanzado',
      'Integración con redes sociales',
      'Google Analytics y Search Console',
      'Hosting y dominio (1 año)',
      '5 revisiones de diseño',
      'Capacitación completa'
    ],
    price: 150000, // ARS
    priceUSD: 150,
    duration: '3-4 semanas',
    deliverables: [
      'Sitio web completo',
      'Panel CMS',
      'Manual de usuario',
      'Documentación técnica'
    ],
    image: '/images/products/corporate-website.jpg',
    demo: null,
    tags: ['Sitio Web', 'CMS', 'React', 'SEO', 'Blog']
  },
  {
    id: 'ecommerce-basic',
    category: productCategories.WEB_DEVELOPMENT,
    name: 'E-commerce Básico',
    shortDescription: 'Tienda online lista para vender',
    description: 'E-commerce completo con carrito de compras, integración con Mercado Pago, gestión de productos y panel de administración. Ideal para empezar a vender online.',
    features: [
      'Hasta 50 productos',
      'Carrito de compras',
      'Integración Mercado Pago',
      'Panel de administración',
      'Gestión de stock',
      'Sistema de órdenes',
      'Email notifications',
      'SEO optimizado',
      'Responsive design',
      'Hosting (1 año)'
    ],
    price: 250000, // ARS
    priceUSD: 250,
    duration: '4-6 semanas',
    deliverables: [
      'Tienda online completa',
      'Panel de administración',
      'Sistema de pagos configurado',
      'Manual de usuario'
    ],
    image: '/images/products/ecommerce.jpg',
    demo: null,
    tags: ['E-commerce', 'Mercado Pago', 'React', 'Tienda Online']
  },

  // ========== DATA ANALYTICS ==========
  {
    id: 'dashboard-powerbi-basic',
    category: productCategories.DATA_ANALYTICS,
    name: 'Dashboard Power BI Básico',
    shortDescription: 'Dashboard interactivo personalizado',
    description: 'Dashboard de Power BI personalizado para visualizar tus datos de negocio. Incluye conexión a fuentes de datos, visualizaciones interactivas y automatización de reportes.',
    features: [
      'Conexión a 2 fuentes de datos',
      'Hasta 10 visualizaciones',
      'Diseño personalizado',
      'Filtros interactivos',
      'Actualización automática',
      'Capacitación de uso (2 horas)',
      'Documentación completa',
      'Soporte por 1 mes'
    ],
    price: 80000, // ARS
    priceUSD: 80,
    duration: '2-3 semanas',
    deliverables: [
      'Dashboard Power BI',
      'Archivo .pbix',
      'Guía de uso',
      'Documentación técnica'
    ],
    image: '/images/products/powerbi-dashboard.jpg',
    demo: null,
    tags: ['Power BI', 'Dashboard', 'Data Analytics', 'Visualización']
  },
  {
    id: 'automation-python',
    category: productCategories.DATA_ANALYTICS,
    name: 'Automatización con Python',
    shortDescription: 'Automatiza tus procesos repetitivos',
    description: 'Script de automatización en Python para optimizar tus procesos de datos. Ideal para reportes automatizados, procesamiento de archivos, web scraping o integraciones.',
    features: [
      'Script personalizado en Python',
      'Automatización de tareas repetitivas',
      'Procesamiento de datos',
      'Generación de reportes',
      'Integración con APIs',
      'Documentación del código',
      'Capacitación de uso',
      'Soporte por 1 mes'
    ],
    price: 60000, // ARS
    priceUSD: 60,
    duration: '1-2 semanas',
    deliverables: [
      'Script Python completo',
      'Documentación',
      'Guía de instalación',
      'Manual de uso'
    ],
    image: '/images/products/python-automation.jpg',
    demo: null,
    tags: ['Python', 'Automatización', 'Scripts', 'Data Processing']
  },

  // ========== SERVICIOS PERSONALIZADOS ==========
  {
    id: 'custom-development',
    category: productCategories.CUSTOM,
    name: 'Desarrollo Personalizado',
    shortDescription: 'Proyecto a medida para tus necesidades',
    description: '¿Tenés un proyecto específico en mente? Cotización personalizada basada en tus necesidades exactas. Usá las calculadoras para obtener un estimado o contactame directamente.',
    features: [
      'Reunión de análisis de requerimientos',
      'Propuesta técnica detallada',
      'Cotización personalizada',
      'Sin compromiso'
    ],
    price: null, // Precio personalizado
    priceUSD: null,
    duration: 'Variable',
    deliverables: [
      'Propuesta técnica',
      'Cotización detallada'
    ],
    image: '/images/products/custom.jpg',
    demo: null,
    tags: ['Personalizado', 'Cotización', 'A Medida'],
    isCustom: true // Flag para identificar productos personalizados
  }
];

// Función para obtener productos por categoría
export function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

// Función para obtener un producto por ID
export function getProductById(id) {
  return products.find(p => p.id === id);
}

// Función para buscar productos
export function searchProducts(query) {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(tag => tag.toLowerCase().includes(q))
  );
}
