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

/** Rough reading time so editors do not have to guess. */
export function estimateReadTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
