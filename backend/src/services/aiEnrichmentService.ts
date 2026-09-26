import { scrapeUrl, ScrapedMetadata } from './scraperService.js';
import { generateOpenRouterResponse } from './ragService.js';
import { ContentType } from '../types/index.js';

export interface EnrichedContentResult {
  title: string;
  summary: string;
  text: string;
  link?: string;
  type: ContentType;
  tags: string[];
  heroImage?: string;
}

export async function enrichContentData({
  url,
  rawText,
  userTitle,
  typeHint,
}: {
  url?: string;
  rawText?: string;
  userTitle?: string;
  typeHint?: ContentType;
}): Promise<EnrichedContentResult> {
  let scraped: ScrapedMetadata | null = null;

  if (url && url.trim()) {
    try {
      scraped = await scrapeUrl(url.trim());
    } catch (err: any) {
      console.warn("⚠️ URL Scrape failed, proceeding with raw inputs:", err.message);
    }
  }

  const baseTitle = userTitle || scraped?.title || 'Knowledge Note';
  const baseText = scraped?.text || rawText || '';
  const baseLink = url || scraped?.link || '';

  // Infer initial type
  let inferredType: ContentType = typeHint || scraped?.type || 'document';
  if (url) {
    if (/(?:youtube\.com|youtu\.be)/i.test(url)) inferredType = 'youtube';
    else if (/(?:twitter\.com|x\.com)/i.test(url)) inferredType = 'twitter';
    else if (!typeHint || typeHint === 'document') inferredType = 'link';
  }

  // Construct AI prompt for structured JSON enrichment
  const prompt = `You are SecondBrain AI, an intelligent knowledge assistant.
Analyze the following web content or user note, and return a clean JSON object with auto-generated metadata.

Input Content:
- Provided Title: ${baseTitle}
- URL: ${baseLink || 'N/A'}
- Content Body/Snippet:
${baseText.slice(0, 2000)}

Instructions:
1. Provide a clear, polished, and concise "title" (max 10 words).
2. Generate a 2-4 sentence intelligent "summary" of key takeaways.
3. Suggest 3 to 6 relevant single-word or short lowercase "tags" (no '#' symbol).
4. Identify the best "contentType" from: ["youtube", "twitter", "document", "link", "article"].

Return ONLY valid JSON matching this exact structure, with no extra markdown formatting or backticks:
{
  "title": "Clean Title Here",
  "summary": "Concise 2-4 sentence summary of key takeaways...",
  "tags": ["react", "webdev", "frontend"],
  "contentType": "${inferredType}"
}
`;

  try {
    const aiResponse = await generateOpenRouterResponse(prompt);
    
    // Clean response of potential markdown code fences
    const cleanJson = aiResponse
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    const title = parsed.title?.trim() || baseTitle;
    const summary = parsed.summary?.trim() || baseText.slice(0, 300) || 'No summary available.';
    const tags = Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.toLowerCase().trim().replace(/^#/, '')).filter(Boolean) : [];
    
    let finalType: ContentType = inferredType;
    if (parsed.contentType && ['youtube', 'twitter', 'document', 'link', 'article'].includes(parsed.contentType)) {
      finalType = parsed.contentType as ContentType;
    }

    return {
      title,
      summary,
      text: summary ? `**AI Summary & Key Takeaways:**\n${summary}\n\n**Full Content / Snippet:**\n${baseText.slice(0, 1500)}` : baseText,
      link: baseLink,
      type: finalType,
      tags,
      heroImage: scraped?.heroImage,
    };
  } catch (err: any) {
    console.warn("⚠️ AI JSON enrichment fallback triggered:", err.message);

    // Fallback if AI JSON parse fails
    return {
      title: baseTitle,
      summary: baseText.slice(0, 250),
      text: baseText,
      link: baseLink,
      type: inferredType,
      tags: ['web-clip'],
      heroImage: scraped?.heroImage,
    };
  }
}
