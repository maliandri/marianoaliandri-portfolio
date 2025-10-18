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
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Mariano Aliandri",
          "jobTitle": "Desarrollador Full Stack & Analista de Datos",
          "url": "https://marianoaliandri.com.ar",
          "sameAs": [
            "https://www.linkedin.com/in/mariano-aliandri-816b4024/",
            "https://github.com/marianoaliandri" // Si tenés
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
            "Desarrollo Web"
          ],
          "offers": {
            "@type": "Offer",
            "itemOffered": [
              {
                "@type": "Service",
                "name": "Desarrollo Web",
                "description": "Sitios web modernos y responsivos"
              },
              {
                "@type": "Service",
                "name": "Análisis de Datos",
                "description": "Dashboards con Power BI y Excel avanzado"
              },
              {
                "@type": "Service",
                "name": "Consultoría BI",
                "description": "Inteligencia empresarial y KPIs estratégicos"
              }
            ]
          }
        })}
      </script>
    </Helmet>
  );
}