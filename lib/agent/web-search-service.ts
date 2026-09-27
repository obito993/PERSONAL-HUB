/**
 * DEION HUB — Web Search Service
 * Performs real server-side web research via DDG + Wikipedia API fallback.
 * Works in Vercel Node.js server environment with 8s timeout protection.
 */

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export class WebSearchService {
  static async search(query: string, limit = 5): Promise<{ results: SearchResult[]; sources: { title: string; url: string }[] }> {
    const results: SearchResult[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      // 1. DuckDuckGo HTML Search
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      if (response.ok) {
        const html = await response.text();
        const titleRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

        const parsed: { title: string; url: string; snippet: string }[] = [];
        let titleMatch;

        while ((titleMatch = titleRegex.exec(html)) !== null && parsed.length < limit) {
          const rawUrl = titleMatch[1];
          const rawTitle = titleMatch[2].replace(/<[^>]+>/g, '').trim();

          let url = rawUrl;
          if (rawUrl.includes('uddg=')) {
            const match = rawUrl.match(/uddg=([^&]+)/);
            if (match) url = decodeURIComponent(match[1]);
          }
          if (url.startsWith('//')) url = 'https:' + url;

          if (rawTitle && url.startsWith('http')) {
            parsed.push({ title: rawTitle, url, snippet: '' });
          }
        }

        let snippetMatch;
        let idx = 0;
        while ((snippetMatch = snippetRegex.exec(html)) !== null && idx < parsed.length) {
          const rawSnippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
          parsed[idx].snippet = rawSnippet;
          idx++;
        }

        for (const item of parsed) {
          if (item.title && item.url) {
            results.push({
              title: item.title,
              snippet: item.snippet || item.title,
              url: item.url,
            });
          }
        }
      }
    } catch (e) {
      console.warn('[WEB SEARCH] DDG search failed or timed out:', e);
    } finally {
      clearTimeout(timeout);
    }

    // 2. Wikipedia Fallback if DDG returned 0 results
    if (results.length === 0) {
      try {
        const wikiController = new AbortController();
        const wikiTimeout = setTimeout(() => wikiController.abort(), 6000);
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1`;

        const res = await fetch(wikiUrl, { signal: wikiController.signal });
        clearTimeout(wikiTimeout);

        if (res.ok) {
          const data = await res.json();
          const searchList = data?.query?.search || [];
          for (const item of searchList.slice(0, limit)) {
            const cleanTitle = item.title;
            const cleanSnippet = (item.snippet || '').replace(/<[^>]+>/g, '').trim();
            const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle.replace(/ /g, '_'))}`;
            results.push({
              title: cleanTitle,
              snippet: cleanSnippet,
              url,
            });
          }
        }
      } catch (wikiErr) {
        console.warn('[WEB SEARCH] Wikipedia fallback failed:', wikiErr);
      }
    }

    const sources = results.map((r) => ({ title: r.title, url: r.url }));
    return { results, sources };
  }
}
