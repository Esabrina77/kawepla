import blogContent from './blog-content.json';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  image: string;
  slug: string;
}

export const hostArticles: BlogPost[] = blogContent.hostArticles;
export const providerArticles: BlogPost[] = blogContent.providerArticles;
