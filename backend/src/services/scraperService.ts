export interface ScrapedMetadata {
  title?: string;
  description?: string;
  text?: string;
  link: string;
  type?: 'youtube' | 'twitter' | 'article' | 'document' | 'link';
  heroImage?: string;
  siteName?: string;
}

/**
 * Scrapes metadata and readable content from a given web URL.
 */
export async function scrapeUrl(targetUrl: string): Promise<ScrapedMetadata> {
  const url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL protocol. Must start with http:// or https://');
  }

  // Handle YouTube & Twitter links specifically
  const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(url);
  const isTwitter = /(?:twitter\.com|x\.com)/i.test(url);

  let defaultType: ScrapedMetadata['type'] = 'link';
  if (isYoutube) defaultType = 'youtube';
  if (isTwitter) defaultType = 'twitter';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        link: url,
        type: defaultType,
        title: extractFallbackTitleFromUrl(url),
        text: `Link URL: ${url}`,
      };
    }

    const html = await response.text();

    // Extract OpenGraph / Twitter / Standard HTML Meta Tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitleMatch ? decodeHTMLEntities(ogTitleMatch[1].trim()) : extractFallbackTitleFromUrl(url);

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
    const description = ogDescMatch ? decodeHTMLEntities(ogDescMatch[1].trim()) : '';

    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    const heroImage = ogImageMatch ? ogImageMatch[1].trim() : '';

    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    const siteName = siteNameMatch ? decodeHTMLEntities(siteNameMatch[1].trim()) : '';

    // Extract main text content by removing scripts, styles, tags
    let bodyText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit body text snippet to 3000 chars
    const cleanedText = bodyText.length > 3000 ? bodyText.slice(0, 3000) + '...' : bodyText;

    const fullContent = description ? `${description}\n\n${cleanedText}` : cleanedText;

    return {
      title,
      description,
      text: fullContent || `Clipped from ${url}`,
      link: url,
      type: defaultType,
      heroImage,
      siteName,
    };
  } catch (error: any) {
    console.warn(`⚠️ URL Scraping warning for ${url}:`, error.message);
    return {
      link: url,
      type: defaultType,
      title: extractFallbackTitleFromUrl(url),
      text: `Saved Web Link: ${url}`,
    };
  }
}

function extractFallbackTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const last = pathSegments[pathSegments.length - 1];
      return last.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
    }
    return parsed.hostname;
  } catch {
    return url;
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
