import Database from 'better-sqlite3';
import { BookmarksDAL } from './bookmarks.js';
import { CategoriesDAL } from './categories.js';
import { TagsDAL } from './tags.js';
import { NotesDAL } from './notes.js';
import { CodeSnippetsDAL } from './code-snippets.js';
import { SearchDAL } from './search.js';

export { BookmarksDAL } from './bookmarks.js';
export { CategoriesDAL } from './categories.js';
export { TagsDAL } from './tags.js';
export { NotesDAL } from './notes.js';
export { CodeSnippetsDAL } from './code-snippets.js';
export { SearchDAL } from './search.js';

export class DatabaseAccessLayer {
  public bookmarks: BookmarksDAL;
  public categories: CategoriesDAL;
  public tags: TagsDAL;
  public notes: NotesDAL;
  public codeSnippets: CodeSnippetsDAL;
  public search: SearchDAL;

  constructor(private db: Database.Database) {
    this.bookmarks = new BookmarksDAL(db);
    this.categories = new CategoriesDAL(db);
    this.tags = new TagsDAL(db);
    this.notes = new NotesDAL(db);
    this.codeSnippets = new CodeSnippetsDAL(db);
    this.search = new SearchDAL(db);
  }

  close(): void {
    this.db.close();
  }

  getDatabase(): Database.Database {
    return this.db;
  }
}
