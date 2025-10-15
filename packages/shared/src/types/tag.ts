export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTagInput = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTagInput = Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>;
