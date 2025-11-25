import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, canonical, robots }) => {
  const siteUrl = 'https://www.marianoaliandri.com.ar';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {robots && <meta name="robots" content={robots} />}
    </Helmet>
  );
};

export default SEO;
