export type TagVariant = "blue" | "green" | "violet" | "amber" | "rose";

export type AuthorId = "popoola" | "team";

export type Author = {
  id: AuthorId;
  name: string;
  initials: string;
  role?: string;
};

export type PostStatus = "published" | "draft";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown authored in the CMS. Empty means the coded article body is used. */
  body: string;
  topic: string;
  tag: string;
  variant: TagVariant;
  author: AuthorId;
  date: string; // ISO yyyy-mm-dd
  readTime: number;
  image: string;
  status: PostStatus;
  featured?: boolean;
  episodeUrl?: string;
  updatedAt: string; // ISO timestamp
};

export type Episode = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tag: string;
  variant: TagVariant;
  date: string;
  image: string;
  gradient: string;
  youtubeUrl: string;
  listenUrl?: string;
  note?: string;
  articleHref?: string;
  status: PostStatus;
  updatedAt: string;
};

export type ContentStore = {
  posts: Post[];
  episodes: Episode[];
};
