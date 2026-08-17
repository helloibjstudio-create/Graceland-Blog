import { marked, type Tokens } from "marked";
import { slugify } from "./posts";
import type { TocItem } from "@/components/article-aside";

/**
 * Renders CMS markdown into the same visual language as the hand-coded
 * articles: H2s get anchors so the sidebar can scroll-spy them, tables get the
 * `.compare` treatment, and blockquotes become pull quotes.
 */
export function renderMarkdown(markdown: string): { html: string; toc: TocItem[] } {
  if (!markdown.trim()) return { html: "", toc: [] };

  const toc: TocItem[] = [];
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
    const text = this.parser.parseInline(tokens);
    const plain = text.replace(/<[^>]+>/g, "");
    const id = slugify(plain);
    if (depth === 2) toc.push({ id, label: plain });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  renderer.table = function (token: Tokens.Table) {
    const header = token.header
      .map((cell) => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`)
      .join("");
    const body = token.rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<div class="table-wrap"><table class="compare"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  renderer.blockquote = function (token: Tokens.Blockquote) {
    return `<blockquote class="pullquote">${this.parser.parse(token.tokens)}</blockquote>`;
  };

  const html = marked.parse(markdown, { renderer, async: false, gfm: true, breaks: false });

  return { html: html as string, toc };
}

/** Rough reading time so editors do not have to guess. Works with markdown or HTML. */
export function estimateReadTime(content: string) {
  const text = /<[a-z][\s\S]*>/i.test(content) ? content.replace(/<[^>]+>/g, " ") : content;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Processes HTML from the rich-text editor: injects id attributes into H2
 * elements so the sidebar TOC scroll-spy still works.
 */
export function processHtml(html: string): { html: string; toc: TocItem[] } {
  if (!html.trim()) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const processed = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs: string, inner: string) => {
    const plain = inner.replace(/<[^>]+>/g, "").trim();
    const id = plain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    toc.push({ id, label: plain });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: processed, toc };
}
