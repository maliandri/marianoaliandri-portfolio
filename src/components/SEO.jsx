import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = "Mariano Aliandri | Portfolio",
  description = "Portfolio profesional de Mariano Aliandri. Desarrollador Full Stack especializado en React, Next.js y tecnologías web modernas. Análisis de datos, Power BI, Python y consultoría BI.",
  keywords = "Mariano Aliandri, desarrollador full stack, React, Next.js, portfolio, web developer, JavaScript, análisis de datos, Power BI, Python, consultoría BI, desarrollo web",
  image = "https://marianoaliandri.com.ar/assets/image_12a02c-D4CCjDrI.jpg",
  url = typeof window !== 'undefined' ? window.location.href : "https://marianoaliandri.com.ar",
  type = "website",
  author = "Mariano Aliandri",
  twitterHandle = "@marianoaliandri" // Cambiá por tu @
}) {
  const fullTitle = title.includes('Mariano Aliandri') ? title : `${title} | Mariano Aliandri`;

  return (
    <Helmet>
      {/* ========================================
          META TAGS BÁSICOS
      ========================================= */}
      <html lang="es" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* ========================================
          OPEN GRAPH (Facebook, LinkedIn, WhatsApp)
      ========================================= */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Mariano Aliandri Portfolio" />
      <meta property="og:locale" content="es_AR" />

      {/* ========================================
          TWITTER CARD (X)
      ========================================= */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ========================================
          CANONICAL URL (evita contenido duplicado)
      ========================================= */}
      <link rel="canonical" href={url} />

      {/* ========================================
          ROBOTS & CRAWLING
      ========================================= */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* ========================================
          IAs - PERMITIR INDEXACIÓN
      ========================================= */}
      <meta name="GPTBot" content="index, follow" />
      <meta name="ChatGPT-User" content="index, follow" />
      <meta name="anthropic-ai" content="index, follow" />
      <meta name="Claude-Web" content="index, follow" />

      {/* ========================================
          GEO LOCALIZACIÓN (Argentina)
      ========================================= */}
      <meta name="geo.region" content="AR-NQN" />
      <meta name="geo.placename" content="Neuquén, Argentina" />

      {/* ========================================
          MOBILE & RESPONSIVE
      ========================================= */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#4f46e5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* ========================================
          STRUCTURED DATA (JSON-LD para Google)
      ========================================= */}

      {/* Schema Person */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Mariano Aliandri",
          "jobTitle": "Desarrollador Full Stack & Analista de Datos",
          "url": "https://marianoaliandri.com.ar",
          "image": "https://marianoaliandri.com.ar/assets/image_12a02c-D4CCjDrI.jpg",
          "sameAs": [
            "https://www.linkedin.com/in/mariano-aliandri-816b4024/",
            "https://github.com/marianoaliandri"
          ],
          "email": "marianoaliandri@gmail.com",
          "telephone": "+54-299-541-4422",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Neuquén",
            "addressRegion": "NQN",
            "addressCountry": "AR"
          },
          "knowsAbout": [
            "React",
            "Next.js",
            "JavaScript",
            "Python",
            "Power BI",
            "Excel",
            "Análisis de Datos",
            "Desarrollo Web",
            "Business Intelligence",
            "Data Visualization"
          ]
        })}
      </script>

      {/* Schema Professional Service */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Mariano Aliandri - Servicios de Desarrollo y Análisis",
          "image": "https://marianoaliandri.com.ar/assets/image_12a02c-D4CCjDrI.jpg",
          "url": "https://marianoaliandri.com.ar",
          "telephone": "+54-299-541-4422",
          "email": "marianoaliandri@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Neuquén",
            "addressRegion": "Neuquén",
            "addressCountry": "AR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-38.9516",
            "longitude": "-68.0591"
          },
          "priceRange": "$$",
          "areaServed": {
            "@type": "Country",
            "name": "Argentina"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Servicios Profesionales",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Desarrollo Web Full Stack",
                  "description": "Desarrollo de aplicaciones web modernas con React, Next.js y tecnologías actuales"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Análisis de Datos y Business Intelligence",
                  "description": "Dashboards interactivos con Power BI, análisis de datos con Python y Excel avanzado"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Consultoría en Inteligencia Empresarial",
                  "description": "Definición de KPIs estratégicos y optimización de procesos de negocio"
                }
              }
            ]
          }
        })}
      </script>

      {/* Schema WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Mariano Aliandri Portfolio",
          "url": "https://marianoaliandri.com.ar",
          "description": "Portfolio profesional de Mariano Aliandri - Desarrollador Full Stack y Analista de Datos",
          "author": {
            "@type": "Person",
            "name": "Mariano Aliandri"
          },
          "inLanguage": "es-AR"
        })}
      </script>

      {/* Schema Breadcrumb */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Inicio",
              "item": "https://marianoaliandri.com.ar"
            }
          ]
        })}
      </script>
    </Helmet>
  );
}