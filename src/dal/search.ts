import Database from 'better-sqlite3';
import type { SearchResult } from '../types/index.js';

export class SearchDAL {
  constructor(private db: Database.Database) {}

  searchBookmarks(query: string, limit: number = 20): SearchResult[] {
    const stmt = this.db.prepare(`
      SELECT 
        b.id,
        'bookmark' as type,
        b.title,
        b.description as content,
        snippet(bookmarks_fts, 0, '<mark>', '</mark>', '...', 32) as snippet,
        bm25(bookmarks_fts) as rank
      FROM bookmarks_fts
      INNER JOIN bookmarks b ON bookmarks_fts.rowid = b.id
      WHERE bookmarks_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);
    
    return stmt.all(query, limit) as SearchResult[];
  }

  searchNotes(query: string, limit: number = 20): SearchResult[] {
    const stmt = this.db.prepare(`
      SELECT 
        n.id,
        'note' as type,
        NULL as title,
        n.content,
        snippet(notes_fts, 0, '<mark>', '</mark>', '...', 32) as snippet,
        bm25(notes_fts) as rank
      FROM notes_fts
      INNER JOIN notes n ON notes_fts.rowid = n.id
      WHERE notes_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);
    
    return stmt.all(query, limit) as SearchResult[];
  }

  searchCodeSnippets(query: string, limit: number = 20): SearchResult[] {
    const stmt = this.db.prepare(`
      SELECT 
        cs.id,
        'code_snippet' as type,
        cs.language as title,
        cs.code as content,
        snippet(code_snippets_fts, 0, '<mark>', '</mark>', '...', 32) as snippet,
        bm25(code_snippets_fts) as rank
      FROM code_snippets_fts
      INNER JOIN code_snippets cs ON code_snippets_fts.rowid = cs.id
      WHERE code_snippets_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);
    
    return stmt.all(query, limit) as SearchResult[];
  }

  searchAll(query: string, limit: number = 50): SearchResult[] {
    const bookmarks = this.searchBookmarks(query, Math.ceil(limit / 3));
    const notes = this.searchNotes(query, Math.ceil(limit / 3));
    const codeSnippets = this.searchCodeSnippets(query, Math.ceil(limit / 3));
    
    const allResults = [...bookmarks, ...notes, ...codeSnippets];
    allResults.sort((a, b) => a.rank - b.rank);
    
    return allResults.slice(0, limit);
  }
}
