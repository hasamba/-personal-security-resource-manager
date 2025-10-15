export interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;
