import { extractText } from 'unpdf';

export interface ExtractedChapter {
  chapterNumber: number;
  title: string;
  content: string;
  startPage?: number;
  endPage?: number;
}

export interface PDFProcessResult {
  fullText: string;
  pageCount: number;
  chapters: ExtractedChapter[];
  pageTexts: string[];
}

/**
 * Server-side PDF parser using unpdf.
 * Does NOT require canvas, web workers, or pdf.worker.mjs assets.
 * Compatible with Next.js Turbopack, npm run dev, npm run build, and Vercel serverless.
 */
export async function processPDFBuffer(buffer: Buffer, fileName: string): Promise<PDFProcessResult> {
  try {
    const uint8Array = new Uint8Array(buffer);
    
    // Extract text page by page
    const { text: pagesText, totalPages } = await extractText(uint8Array, { mergePages: false });
    
    const pageCount = totalPages || (Array.isArray(pagesText) ? pagesText.length : 1);
    const pageTexts = Array.isArray(pagesText) ? pagesText.map((p, idx) => `[Page ${idx + 1}]\n${p.trim()}`) : [];
    
    const fullText = pageTexts.length > 0 
      ? pageTexts.join('\n\n') 
      : (typeof pagesText === 'string' ? pagesText : '').trim();

    if (!fullText || fullText.replace(/\[Page \d+\]/g, '').trim().length === 0) {
      throw new Error('No readable text could be extracted from this PDF. The document may be scanned or image-only.');
    }

    const chapters = detectChapters(fullText, pageTexts, fileName);

    return {
      fullText,
      pageCount,
      chapters,
      pageTexts,
    };
  } catch (err: any) {
    console.error(`[PDF PROCESSOR ERROR] Failed to process ${fileName}:`, err?.message || err);
    if (err.message && err.message.includes('scanned')) {
      throw err;
    }
    throw new Error(`PDF Processing Error: ${err?.message || 'Failed to extract text from PDF document'}`);
  }
}

/**
 * Semantic chapter and section detection preserving page context
 */
function detectChapters(fullText: string, pageTexts: string[], fileName: string): ExtractedChapter[] {
  const lines = fullText.split('\n');
  const detected: { title: string; lineIndex: number; pageNumber: number }[] = [];

  const chapterRegex = /^(?:CHAPTER|Chapter|SECTION|Section|MODULE|Module|PART|Part)\s+(\d+|[IVXLCDM]+)[\s:.\-—]+(.*)$/i;
  const numberedHeadingRegex = /^(?:\d+\.\d*|\d+)\s+([A-Z][A-Za-z0-9\s,.\-—:]{3,60})$/;
  const markdownHeadingRegex = /^#{1,3}\s+([^\n]+)$/;
  const uppercaseHeaderRegex = /^[A-Z0-9\s—:-]{4,60}$/;

  let currentPage = 1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const pageMatch = line.match(/^\[Page (\d+)\]$/);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }

    if (line.length > 80) continue;

    if (chapterRegex.test(line)) {
      detected.push({ title: line, lineIndex: i, pageNumber: currentPage });
    } else if (markdownHeadingRegex.test(line)) {
      const match = line.match(markdownHeadingRegex);
      detected.push({ title: match ? match[1].trim() : line, lineIndex: i, pageNumber: currentPage });
    } else if (numberedHeadingRegex.test(line) && line.length < 60) {
      detected.push({ title: line, lineIndex: i, pageNumber: currentPage });
    } else if (uppercaseHeaderRegex.test(line) && line.length > 5 && line.length < 50 && isLikelyHeader(lines, i)) {
      detected.push({ title: line, lineIndex: i, pageNumber: currentPage });
    }
  }

  // Filter headings that are too close (closer than 15 lines)
  const filteredHeadings: { title: string; lineIndex: number; pageNumber: number }[] = [];
  for (const h of detected) {
    if (filteredHeadings.length === 0 || h.lineIndex - filteredHeadings[filteredHeadings.length - 1].lineIndex >= 15) {
      filteredHeadings.push(h);
    }
  }

  // If explicit chapters exist, split content by headings
  if (filteredHeadings.length >= 2) {
    const chapters: ExtractedChapter[] = [];
    for (let idx = 0; idx < filteredHeadings.length; idx++) {
      const startLine = filteredHeadings[idx].lineIndex;
      const endLine = idx < filteredHeadings.length - 1 ? filteredHeadings[idx + 1].lineIndex : lines.length;
      const content = lines.slice(startLine, endLine).join('\n').trim();

      if (content.length > 50) {
        chapters.push({
          chapterNumber: chapters.length + 1,
          title: cleanTitle(filteredHeadings[idx].title, chapters.length + 1),
          content,
          startPage: filteredHeadings[idx].pageNumber,
          endPage: idx < filteredHeadings.length - 1 ? filteredHeadings[idx + 1].pageNumber : pageTexts.length,
        });
      }
    }

    if (chapters.length >= 2) {
      return chapters;
    }
  }

  // Fallback: Intelligently group by paragraphs into 3 to 5 sections
  return fallbackSectioning(fullText, fileName, pageTexts.length);
}

function isLikelyHeader(lines: string[], index: number): boolean {
  const prev = index > 0 ? lines[index - 1].trim() : '';
  const next = index < lines.length - 1 ? lines[index + 1].trim() : '';
  return prev === '' && next !== '';
}

function cleanTitle(title: string, fallbackNum: number): string {
  let cleaned = title.replace(/^#{1,3}\s+/, '').trim();
  if (cleaned.length > 60) cleaned = cleaned.slice(0, 57) + '...';
  if (!cleaned) return `Chapter ${fallbackNum}`;
  return cleaned;
}

/**
 * Fallback semantic sectioning for unchaptered PDFs or short papers
 */
function fallbackSectioning(text: string, fileName: string, totalPages: number): ExtractedChapter[] {
  const docTitle = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);

  if (paragraphs.length <= 3) {
    return [
      {
        chapterNumber: 1,
        title: `${docTitle} — Full Overview`,
        content: text,
        startPage: 1,
        endPage: Math.max(1, totalPages),
      }
    ];
  }

  const numChunks = Math.min(5, Math.max(3, Math.ceil(paragraphs.length / 4)));
  const chunkSize = Math.ceil(paragraphs.length / numChunks);
  const chapters: ExtractedChapter[] = [];

  const defaultTitles = [
    'Introduction & Fundamental Concepts',
    'Core Methodology & Analysis',
    'Advanced Topics & Detailed Breakdown',
    'Key Findings & Practical Applications',
    'Summary & Conclusions',
  ];

  for (let i = 0; i < numChunks; i++) {
    const chunkParagraphs = paragraphs.slice(i * chunkSize, (i + 1) * chunkSize);
    const content = chunkParagraphs.join('\n\n').trim();

    if (content.length > 0) {
      chapters.push({
        chapterNumber: i + 1,
        title: `Chapter ${i + 1} — ${defaultTitles[i] || `Section ${i + 1}`}`,
        content,
        startPage: Math.max(1, Math.floor((i / numChunks) * totalPages) + 1),
        endPage: Math.min(totalPages, Math.floor(((i + 1) / numChunks) * totalPages) || 1),
      });
    }
  }

  return chapters;
}
