export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  joinDate: Date;
  followers: number;
  following: number;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  posts?: number[];
}
