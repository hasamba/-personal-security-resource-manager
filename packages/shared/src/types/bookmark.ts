export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  categoryId?: string;
  tagIds: string[];
  noteId?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export type CreateBookmarkInput = Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBookmarkInput = Partial<Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>>;
