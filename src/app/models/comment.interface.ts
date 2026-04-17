export interface Comment {
  id: number;
  postId: number;
  content: string;
  publishedDate: Date;
  likes: number;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  parentId?: number; // For replies to comments
}
