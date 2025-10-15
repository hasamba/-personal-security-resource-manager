import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  codeSnippet?: string;
  tags: string[];
  category: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export class BookmarkService {
  private bookmarksFile: string;
  private bookmarks: Bookmark[] = [];

  constructor() {
    const userDataPath = app.getPath('userData');
    this.bookmarksFile = path.join(userDataPath, 'bookmarks.json');
    this.loadBookmarks();
  }

  private loadBookmarks() {
    try {
      if (fs.existsSync(this.bookmarksFile)) {
        const data = fs.readFileSync(this.bookmarksFile, 'utf-8');
        this.bookmarks = JSON.parse(data);
      } else {
        this.bookmarks = this.getDefaultBookmarks();
        this.saveBookmarks();
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      this.bookmarks = this.getDefaultBookmarks();
    }
  }

  private saveBookmarks() {
    try {
      fs.writeFileSync(this.bookmarksFile, JSON.stringify(this.bookmarks, null, 2));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  private getDefaultBookmarks(): Bookmark[] {
    return [
      {
        id: '1',
        title: 'React Documentation',
        url: 'https://react.dev',
        description: 'Official React documentation',
        notes: 'Great resource for learning React hooks and patterns',
        codeSnippet: '```jsx\nfunction App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}\n```',
        tags: ['react', 'javascript', 'frontend'],
        category: 'Development',
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs',
        description: 'TypeScript official handbook',
        notes: 'Reference for TypeScript types and advanced patterns',
        codeSnippet: '```typescript\ntype User = {\n  id: string;\n  name: string;\n};\n```',
        tags: ['typescript', 'javascript'],
        category: 'Development',
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Electron Documentation',
        url: 'https://www.electronjs.org/docs',
        description: 'Build cross-platform desktop apps',
        notes: 'Main and renderer process communication patterns',
        tags: ['electron', 'desktop'],
        category: 'Development',
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  getAllBookmarks(): Bookmark[] {
    return this.bookmarks;
  }

  getBookmarkById(id: string): Bookmark | undefined {
    return this.bookmarks.find((b) => b.id === id);
  }

  createBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.bookmarks.push(newBookmark);
    this.saveBookmarks();
    return newBookmark;
  }

  updateBookmark(id: string, updates: Partial<Bookmark>): Bookmark | null {
    const index = this.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return null;

    this.bookmarks[index] = {
      ...this.bookmarks[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.saveBookmarks();
    return this.bookmarks[index];
  }

  deleteBookmark(id: string): boolean {
    const index = this.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return false;

    this.bookmarks.splice(index, 1);
    this.saveBookmarks();
    return true;
  }

  searchBookmarks(query: string): Bookmark[] {
    const lowerQuery = query.toLowerCase();
    return this.bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.url.toLowerCase().includes(lowerQuery) ||
        b.description?.toLowerCase().includes(lowerQuery) ||
        b.notes?.toLowerCase().includes(lowerQuery) ||
        b.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        b.category.toLowerCase().includes(lowerQuery)
    );
  }

  exportBookmarks(format: string): string {
    if (format === 'json') {
      return JSON.stringify(this.bookmarks, null, 2);
    } else if (format === 'html') {
      let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<HTML>\n<HEAD>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n</HEAD>\n<BODY>\n<H1>Bookmarks</H1>\n<DL><p>\n';
      this.bookmarks.forEach((bookmark) => {
        html += `    <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
        if (bookmark.description) {
          html += `    <DD>${bookmark.description}\n`;
        }
      });
      html += '</DL></p>\n</BODY>\n</HTML>';
      return html;
    }
    return '';
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.bookmarks.forEach((b) => b.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.bookmarks.forEach((b) => categories.add(b.category));
    return Array.from(categories).sort();
  }
}
