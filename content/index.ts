import type { ComponentType } from "react";
import type { TocItem } from "@/components/article-aside";
import TmsTherapyArticle, { toc as tmsToc } from "./tms-therapy";

/**
 * Long-form bodies live here, keyed by post slug. Posts without an entry fall
 * back to a summary layout on the article page — add a module and register it
 * to publish the full write-up.
 */
export const ARTICLE_BODIES: Record<string, { Body: ComponentType; toc: TocItem[] }> = {
  "tms-therapy-drug-free-depression-treatment-san-antonio": {
    Body: TmsTherapyArticle,
    toc: tmsToc,
  },
};
