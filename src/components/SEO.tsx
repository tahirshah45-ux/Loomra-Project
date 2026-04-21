import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { GlobalSettings, SEOData } from '../types';

interface SEOProps {
  data: SEOData;
  settings: GlobalSettings;
}

export const SEO: React.FC<SEOProps> = ({ data, settings }) => {
  const title = data.title || settings.siteTitle;
  const description = data.description || settings.siteDescription;
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${data.slug}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {data.image && <meta property="og:image" content={data.image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
