import { Helmet } from "react-helmet-async";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  buildCanonical,
  buildSeoTitle,
} from "@/constants/seo.constants";

type StoreSEOProps = {
  /** Page-specific title. Brand suffix and default fallback are applied automatically. */
  title?: string;
  description?: string;
  /** Path only (e.g. "/product/chicken-curry-cut") — origin is added automatically. */
  path: string;
  image?: string;
  /** Keeps the page out of search results (checkout, account, auth flows, etc.). */
  noindex?: boolean;
  /** One or more JSON-LD objects to inject as <script type="application/ld+json">. */
  jsonLd?: object | object[];
};

export function StoreSEO({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: StoreSEOProps) {
  const resolvedTitle = buildSeoTitle(title);
  const canonical = buildCanonical(path);
  const jsonLdBlocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdBlocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
