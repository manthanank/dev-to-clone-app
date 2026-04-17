import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Post } from '../models/post.interface';
import { User } from '../models/user.interface';
import { Comment } from '../models/comment.interface';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly bookmarkStorageKey = 'devto_bookmarks';

  private get apiUrl(): string {
    return this.apiConfig.apiUrl;
  }

  private getHeaders() {
    return this.apiConfig.getHeaders();
  }

  private posts: Post[] = [];
  private users: User[] = [];
  private comments: Comment[] = [];

  private bookmarkedIds: number[] = [];

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.loadBookmarksFromStorage();
  }

  private loadBookmarksFromStorage(): void {
    const stored = localStorage.getItem(this.bookmarkStorageKey);
    if (stored) {
      try {
        this.bookmarkedIds = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored bookmarks', e);
        this.bookmarkedIds = [];
      }
    }
  }

  private saveBookmarksToStorage(): void {
    localStorage.setItem(this.bookmarkStorageKey, JSON.stringify(this.bookmarkedIds));
  }

  // Get blog details by name/username (to fix the error in AppComponent)
  getBlogDetails(name: string | null): Observable<any> {
    if (!name) {
      return of({ error: 'No name provided' });
    }

    // Try to find a user with this name or username
    return this.http.get<any>(`${this.apiUrl}/users/by_username?url=${name}`, { headers: this.getHeaders() }).pipe(
      map(userData => {
        return {
          user: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            avatar: userData.profile_image,
            bio: userData.summary || '',
            followers: userData.followers_count || 0,
            following: userData.following_count || 0,
            location: userData.location || '',
            website: userData.website_url || ''
          },
          posts: [] // We could fetch posts here as well if needed
        };
      }),
      catchError(error => {
        console.error(`Error fetching user data for ${name} from DEV.TO API:`, error);
        return of({ error: 'User not found' });
      })
    );
  }

  // Search posts
  searchPosts(query: string): Observable<Post[]> {
    if (!query) {
      return this.getPosts();
    }

    return this.getPosts().pipe(
      map(posts => posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ))
    );
  }

  // Post methods
  getPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/articles`, { headers: this.getHeaders() }).pipe(
      map(articles => articles.map(article => this.mapArticleToPost(article))),
      map(posts => {
        this.posts = posts;
        return posts;
      }),
      catchError(error => {
        console.error('Error fetching posts from DEV.TO API:', error);
        return of(this.posts);
      })
    );
  }

  getPostById(id: number): Observable<Post | undefined> {
    return this.http.get<any>(`${this.apiUrl}/articles/${id}`, { headers: this.getHeaders() }).pipe(
      map(article => this.mapArticleToPost(article)),
      map(post => {
        const idx = this.posts.findIndex(p => p.id === post.id);
        if (idx !== -1) {
          this.posts[idx] = post;
        } else {
          this.posts.push(post);
        }
        return post;
      }),
      catchError(error => {
        console.error(`Error fetching post ${id} from DEV.TO API:`, error);
        return of(this.posts.find(post => post.id === id));
      })
    );
  }

  getPostsByUser(username: string): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/articles?username=${username}`, { headers: this.getHeaders() }).pipe(
      map(articles => articles.map(article => this.mapArticleToPost(article))),
      catchError(error => {
        console.error(`Error fetching posts for user ${username} from DEV.TO API:`, error);
        return of(this.posts.filter(post => post.author.username === username));
      })
    );
  }

  // Helper method to map DEV.TO API response to our Post interface
  private mapArticleToPost(article: any): Post {
    return {
      id: article.id,
      title: article.title,
      content: this.rewriteInternalLinks(article.body_html || article.description),
      coverImage: article.cover_image,
      excerpt: article.description,
      tags: (function(t: any): string[] {
        if (Array.isArray(t)) return t;
        if (typeof t === 'string') return t.split(',').map(tag => tag.trim());
        return [];
      })(article.tags || article.tag_list || article.tags_list || []),
      publishedDate: new Date(article.published_at),
      readingTime: article.reading_time_minutes || 5,
      likes: article.positive_reactions_count || 0,
      comments: article.comments_count || 0,
      bookmarks: article.public_reactions_count || 0,
      author: {
        id: article.user?.id || 0,
        name: article.user?.name || '',
        avatar: article.user?.profile_image || '',
        bio: article.user?.summary || '',
        username: article.user?.username || ''
      }
    };
  }

  private rewriteInternalLinks(html: string): string {
    if (!html) return '';
    
    // Replace absolute Dev.to post links with internal ones
    // Pattern: https://dev.to/username/post-slug-id -> /post/id
    let rewrittenHtml = html.replace(/href="https:\/\/dev\.to\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+-([0-9]+)"/g, 'href="/post/$1"');
    
    // Replace absolute Dev.to user links with internal ones
    // Pattern: https://dev.to/username -> /user/username
    rewrittenHtml = rewrittenHtml.replace(/href="https:\/\/dev\.to\/([a-zA-Z0-9_-]+)"/g, (match, username) => {
      // Avoid replacing common paths as usernames
      const reserved = ['t', 'enter', 'new', 'notifications', 'settings', 'search', 'top', 'latest', 'listings', 'pod', 'videos', 'tags', 'faq'];
      if (reserved.includes(username)) return match;
      return `href="/user/${username}"`;
    });

    return rewrittenHtml;
  }

  createPost(post: Omit<Post, 'id'>): Observable<Post> {
    if (this.apiConfig.getApiKey()) {
      const body = {
        article: {
          title: post.title,
          body_markdown: post.content,
          published: true,
          tags: post.tags
        }
      };
      
      return this.http.post<any>(`${this.apiUrl}/articles`, body, { headers: this.getHeaders() }).pipe(
        map(article => this.mapArticleToPost(article)),
        catchError(error => {
          console.error('Error creating post on DEV.TO:', error);
          return this.createMockPost(post);
        })
      );
    }
    
    return this.createMockPost(post);
  }

  private createMockPost(post: Omit<Post, 'id'>): Observable<Post> {
    const newId = Date.now();
    const newPost: Post = { ...post, id: newId };
    this.posts.push(newPost);

    return of(newPost);
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post | undefined> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...post };
      return of(this.posts[index]);
    }
    return of(undefined);
  }

  deletePost(id: number): Observable<boolean> {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.comments = this.comments.filter(c => c.postId !== id);
      this.posts.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  likePost(id: number): Observable<Post | undefined> {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.likes += 1;
      return of(post);
    }
    return of(undefined);
  }

  bookmarkPost(id: number): Observable<Post | undefined> {
    const isBookmarked = this.bookmarkedIds.includes(id);
    
    if (isBookmarked) {
      this.bookmarkedIds = this.bookmarkedIds.filter(bid => bid !== id);
    } else {
      this.bookmarkedIds.push(id);
    }
    this.saveBookmarksToStorage();

    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.bookmarks = isBookmarked ? Math.max(0, post.bookmarks - 1) : post.bookmarks + 1;
      return of(post);
    }
    // If not in local posts, we still track the bookmark
    return of(undefined);
  }

  isBookmarked(postId: number): boolean {
    return this.bookmarkedIds.includes(postId);
  }

  getBookmarkedPosts(): Observable<Post[]> {
    const bookmarkedPosts = this.posts.filter(post => this.bookmarkedIds.includes(post.id));
    return of(bookmarkedPosts);
  }

  // New method to fetch articles by tag
  getPostsByTag(tag: string): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/articles?tag=${tag}`, { headers: this.getHeaders() }).pipe(
      map(articles => articles.map(article => this.mapArticleToPost(article))),
      catchError(error => {
        console.error(`Error fetching posts with tag ${tag} from DEV.TO API:`, error);
        return of(this.posts.filter(post => post.tags && post.tags.includes(tag)));
      })
    );
  }

  // User methods
  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUserById(id: number): Observable<User | undefined> {
    return of(this.users.find(user => user.id === id));
  }

  getUserByUsername(username: string): Observable<User | undefined> {
    return this.http.get<any>(`${this.apiUrl}/users/by_username?url=${username}`, { headers: this.getHeaders() }).pipe(
      map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: '',
        avatar: user.profile_image,
        bio: user.summary || '',
        joinDate: new Date(user.joined_at),
        followers: user.followers_count || 0,
        following: user.following_count || 0,
        location: user.location || '',
        website: user.website_url || '',
        work: '',
        posts: []
      })),
      map(user => {
        const existingIndex = this.users.findIndex(u => u.username === user.username);
        if (existingIndex !== -1) {
          this.users[existingIndex] = user;
        } else {
          this.users.push(user);
        }
        return user;
      }),
      catchError(error => {
        console.error(`Error fetching user ${username} from DEV.TO API:`, error);
        return of(this.users.find(user => user.username === username));
      })
    );
  }

  updateUser(id: number, userData: Partial<User>): Observable<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };
      return of(this.users[index]);
    }
    return of(undefined);
  }

  followUser(userId: number, followerUserId: number): Observable<User | undefined> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.followers += 1;
      return of(user);
    }
    return of(undefined);
  }

  unfollowUser(userId: number, followerUserId: number): Observable<User | undefined> {
    const user = this.users.find(u => u.id === userId);
    if (user && user.followers > 0) {
      user.followers -= 1;
      return of(user);
    }
    return of(undefined);
  }

  // Comment methods
  getCommentsByPost(postId: number): Observable<Comment[]> {
    return of(this.comments.filter(comment => comment.postId === postId));
  }

  createComment(comment: Omit<Comment, 'id'>): Observable<Comment> {
    const newId = this.comments.length ? Math.max(...this.comments.map(c => c.id)) + 1 : 1;
    const newComment: Comment = { ...comment, id: newId };
    this.comments.push(newComment);

    // Update post's comment count
    const post = this.posts.find(p => p.id === comment.postId);
    if (post) {
      post.comments += 1;
    }

    return of(newComment);
  }

  updateComment(id: number, content: string): Observable<Comment | undefined> {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.content = content;
      return of(comment);
    }
    return of(undefined);
  }

  deleteComment(id: number): Observable<boolean> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index !== -1) {
      const comment = this.comments[index];

      // Update post's comment count
      const post = this.posts.find(p => p.id === comment.postId);
      if (post && post.comments > 0) {
        post.comments -= 1;
      }

      this.comments.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  likeComment(id: number): Observable<Comment | undefined> {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.likes += 1;
      return of(comment);
    }
    return of(undefined);
  }
}
