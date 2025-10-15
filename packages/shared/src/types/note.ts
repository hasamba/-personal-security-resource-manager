export interface Note {
  id: string;
  content: string;
  format: 'plain' | 'markdown' | 'html';
  createdAt: Date;
  updatedAt: Date;
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;
