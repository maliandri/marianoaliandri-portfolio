/**
 * Post-build script: genera HTML estático para cada producto con meta tags SEO.
 * Se ejecuta después de `vite build` para inyectar meta tags en archivos HTML
 * individuales por producto, permitiendo que los crawlers lean los meta tags
 * sin necesidad de ejecutar JavaScript.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://marianoaliandri.com.ar';

// Productos (IDs consistentes con Firebase)
const products = [
  {
    id: 'roi-consulting',
    name: 'Consulta Personalizada ROI',
    shortDescription: 'Análisis de retorno de inversión para tu empresa',
    description: 'Análisis completo de ROI con Power BI, identificación de oportunidades de automatización y recomendaciones personalizadas.',
    priceUSD: 100,
    image: '/images/products/roi-consulting.jpg',
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    shortDescription: 'Página de aterrizaje optimizada para conversión',
    description: 'Landing page profesional con diseño moderno, optimizada para SEO y conversión. Incluye formulario de contacto e integración con Google Analytics.',
    priceUSD: 400,
    image: '/images/products/landing-page.jpg',
  },
  {
    id: 'business-website',
    name: 'Sitio Web Empresarial',
    shortDescription: 'Sitio web completo para tu empresa',
    description: 'Sitio web corporativo completo con múltiples páginas, blog integrado, formulario de contacto avanzado y panel de administración.',
    priceUSD: 1000,
    image: '/images/products/corporate-website.jpg',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    shortDescription: 'Tienda online lista para vender',
    description: 'E-commerce completo con carrito de compras, integración con Mercado Pago, gestión de productos y panel de administración.',
    priceUSD: 2000,
    image: '/images/products/ecommerce.jpg',
  },
  {
    id: 'ai-chatbot-website',
    name: 'Página Web con Atención IA',
    shortDescription: 'Sitio web con chatbot inteligente integrado',
    description: 'Página web profesional con chatbot de inteligencia artificial integrado usando Google Gemini. Atención 24/7 y captura automática de leads.',
    priceUSD: 800,
    image: '/images/products/ai-chatbot-website.jpg',
  },
  {
    id: 'powerbi-dashboard',
    name: 'Dashboard Power BI',
    shortDescription: 'Dashboard interactivo personalizado',
    description: 'Dashboard de Power BI personalizado para visualizar tus datos de negocio con conexión a fuentes de datos y visualizaciones interactivas.',
    priceUSD: 1200,
    image: '/images/products/powerbi-dashboard.jpg',
  },
  {
    id: 'portfolio',
    name: 'Portfolio/Catálogo',
    shortDescription: 'Portfolio profesional para mostrar tu trabajo',
    description: 'Portfolio o catálogo digital profesional para mostrar tus proyectos, productos o servicios de manera atractiva.',
    priceUSD: 1200,
    image: '/images/products/portfolio.jpg',
  },
  {
    id: 'blog',
    name: 'Blog/Noticias',
    shortDescription: 'Blog profesional con gestión de contenido',
    description: 'Blog o sitio de noticias con sistema de gestión de contenido, categorías, búsqueda y optimización SEO.',
    priceUSD: 1500,
    image: '/images/products/blog.jpg',
  },
  {
    id: 'webapp',
    name: 'Aplicación Web',
    shortDescription: 'Aplicación web personalizada',
    description: 'Aplicación web a medida con funcionalidades avanzadas, autenticación de usuarios y panel de administración.',
    priceUSD: 6000,
    image: '/images/products/webapp.jpg',
  },
  {
    id: 'membership',
    name: 'Sitio de Membresías',
    shortDescription: 'Plataforma con sistema de membresías',
    description: 'Sitio web con sistema de membresías, planes de suscripción, contenido exclusivo y gestión de usuarios.',
    priceUSD: 2500,
    image: '/images/products/membership.jpg',
  },
];

function generateProductHTML(templateHTML, product) {
  const productUrl = `${SITE_URL}/tienda/${product.id}`;
  const imageUrl = product.image ? `${SITE_URL}${product.image}` : `${SITE_URL}/og-image.jpg`;
  const title = `${product.name} | Mariano Aliandri`;
  const description = product.shortDescription;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl,
    url: productUrl,
    brand: { '@type': 'Brand', name: 'Mariano Aliandri' },
    ...(product.priceUSD && {
      offers: {
        '@type': 'Offer',
        price: product.priceUSD,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Person', name: 'Mariano Aliandri' },
      },
    }),
  };

  // Reemplazar meta tags en el HTML
  let html = templateHTML;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  // Meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${description}"`
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${productUrl}"`
  );

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${description}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${productUrl}"`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${imageUrl}"`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*"/,
    `<meta property="og:type" content="product"`
  );

  // Twitter Card
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${description}"`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${imageUrl}"`
  );

  // Inyectar JSON-LD antes del cierre de </head>
  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`
  );

  return html;
}

function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html no encontrado. Ejecuta vite build primero.');
    process.exit(1);
  }

  const templateHTML = fs.readFileSync(indexPath, 'utf-8');
  let count = 0;

  for (const product of products) {
    const productDir = path.join(DIST_DIR, 'tienda', product.id);
    fs.mkdirSync(productDir, { recursive: true });

    const productHTML = generateProductHTML(templateHTML, product);
    fs.writeFileSync(path.join(productDir, 'index.html'), productHTML);
    count++;
    console.log(`  ${product.id}/index.html`);
  }

  // Tambien crear tienda/index.html para /tienda
  const tiendaDir = path.join(DIST_DIR, 'tienda');
  if (!fs.existsSync(path.join(tiendaDir, 'index.html'))) {
    const tiendaHTML = templateHTML
      .replace(/<title>[^<]*<\/title>/, '<title>Tienda | Mariano Aliandri - Servicios de Desarrollo Web y Data</title>')
      .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Tienda de servicios de desarrollo web, consultoría BI y automatización. Landing pages, e-commerce, dashboards Power BI y más."')
      .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${SITE_URL}/tienda"`)
      .replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="Tienda | Mariano Aliandri"')
      .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${SITE_URL}/tienda"`);
    fs.writeFileSync(path.join(tiendaDir, 'index.html'), tiendaHTML);
    console.log('  tienda/index.html');
    count++;
  }

  console.log(`\nPrerendering completado: ${count} paginas generadas.`);
}

main();
