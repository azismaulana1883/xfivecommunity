/**
 * Composable for dynamic SEO, Open Graph, Twitter Cards, and Google JSON-LD Schema.
 * Guarantees optimal indexing on Google Search, Google Images, WhatsApp, Discord, and Social Media.
 */

export interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  schema?: Record<string, any>;
}

const SITE_NAME = 'XFIVE AyoDance Community';
const DEFAULT_IMAGE = 'https://www.xfivephoto.com/img/xfive-team2.webp';
const BASE_URL = 'https://www.xfivephoto.com';

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string | undefined) {
  if (!content) return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLdSchema(schemaObj: Record<string, any> | null) {
  const SCRIPT_ID = 'seo-json-ld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!schemaObj) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObj, null, 2);
}

export function useSeo() {
  const updateSeo = (opts: SeoOptions) => {
    // 1. Page Title
    const fullTitle = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const desc = opts.description || 'Pusat warta resmi, panduan turnamen, dan pengumuman komunitas Audition AyoDance XFIVE.';
    const img = opts.image || DEFAULT_IMAGE;
    const pageUrl = opts.url || (typeof window !== 'undefined' ? window.location.href : BASE_URL);

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', desc);
    if (opts.keywords) {
      setMetaTag('name', 'keywords', opts.keywords);
    }
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setCanonicalUrl(pageUrl);

    // 3. Open Graph (Facebook, WhatsApp, Discord, LinkedIn)
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:image', img);
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('property', 'og:type', opts.type || 'website');
    setMetaTag('property', 'og:locale', 'id_ID');

    if (opts.type === 'article') {
      if (opts.publishedTime) setMetaTag('property', 'article:published_time', opts.publishedTime);
      if (opts.modifiedTime) setMetaTag('property', 'article:modified_time', opts.modifiedTime);
      if (opts.author) setMetaTag('property', 'article:author', opts.author);
      if (opts.section) setMetaTag('property', 'article:section', opts.section);
      if (opts.tags && opts.tags.length > 0) {
        opts.tags.forEach(tag => setMetaTag('property', 'article:tag', tag));
      }
    }

    // 4. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', img);

    // 5. Google Rich Results: JSON-LD Structured Data
    if (opts.schema) {
      setJsonLdSchema(opts.schema);
    } else if (opts.type === 'article') {
      const defaultArticleSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: opts.title,
        description: desc,
        image: [img],
        datePublished: opts.publishedTime || new Date().toISOString(),
        dateModified: opts.modifiedTime || opts.publishedTime || new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
        author: {
          '@type': 'Person',
          name: opts.author || 'XFIVE Official',
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_URL}/xfive.svg`,
          },
        },
      };
      setJsonLdSchema(defaultArticleSchema);
    }
  };

  return { updateSeo };
}
