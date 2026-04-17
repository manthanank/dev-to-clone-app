export interface Post {
  id: number;
  title: string;
  content: string;
  coverImage?: string;
  excerpt: string;
  tags: string[];
  publishedDate: Date;
  readingTime: number;  // in minutes
  likes: number;
  comments: number;
  bookmarks: number;
  author: {
    id: number;
    name: string;
    avatar: string;
    bio?: string;
    username?: string;
  };
}
