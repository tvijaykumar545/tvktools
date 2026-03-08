import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "TVK Tools";
const BASE_URL = "https://tvktools.lovable.app";
const DEFAULT_DESC = "Free AI-powered tools for SEO, developers, and creators. Convert, analyze, generate, and optimize with 50+ tools.";

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = "",
  type = "website",
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — 50+ AI Tools for SEO, Developers & Creators`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
