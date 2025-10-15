export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_predefined: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string | null;
}

export interface Note {
  id: number;
  bookmark_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CodeSnippet {
  id: number;
  bookmark_id: number;
  language: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface BookmarkCategory {
  bookmark_id: number;
  category_id: number;
}

export interface BookmarkTag {
  bookmark_id: number;
  tag_id: number;
}

export interface SearchResult {
  id: number;
  type: 'bookmark' | 'note' | 'code_snippet';
  title?: string;
  content?: string;
  snippet?: string;
  rank: number;
}

export interface NewBookmark {
  title: string;
  url: string;
  description?: string;
}

export interface UpdateBookmark {
  title?: string;
  url?: string;
  description?: string;
}

export interface NewCategory {
  name: string;
  description?: string;
  is_predefined?: boolean;
}

export interface NewTag {
  name: string;
  color?: string;
}

export interface NewNote {
  bookmark_id: number;
  content: string;
}

export interface UpdateNote {
  content?: string;
}

export interface NewCodeSnippet {
  bookmark_id: number;
  language: string;
  code: string;
  description?: string;
}

export interface UpdateCodeSnippet {
  language?: string;
  code?: string;
  description?: string;
}
