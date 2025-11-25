import React from 'react';

const SEO = ({ title, description, canonical, robots }) => {
  const siteUrl = 'https://www.marianoaliandri.com.ar';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {robots && <meta name="robots" content={robots} />}
    </>
  );
};

export default SEO;
