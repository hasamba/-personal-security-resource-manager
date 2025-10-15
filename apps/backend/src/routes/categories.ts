import { Router } from 'express';
import type { APIResponse, Category, CreateCategoryInput } from '@monorepo/shared';

export const categoryRouter = Router();

const categories: Category[] = [];

categoryRouter.get('/', (_req, res) => {
  const response: APIResponse<Category[]> = {
    success: true,
    data: categories,
  };
  res.json(response);
});

categoryRouter.get('/:id', (req, res) => {
  const category = categories.find((c) => c.id === req.params.id);
  const response: APIResponse<Category> = category
    ? { success: true, data: category }
    : { success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } };
  res.status(category ? 200 : 404).json(response);
});

categoryRouter.post('/', (req, res) => {
  const input = req.body as CreateCategoryInput;
  const category: Category = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  categories.push(category);
  const response: APIResponse<Category> = {
    success: true,
    data: category,
  };
  res.status(201).json(response);
});

categoryRouter.put('/:id', (req, res) => {
  const index = categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<Category> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Category not found' },
    };
    res.status(404).json(response);
    return;
  }
  categories[index] = {
    ...categories[index]!,
    ...req.body,
    updatedAt: new Date(),
  };
  const response: APIResponse<Category> = {
    success: true,
    data: categories[index]!,
  };
  res.json(response);
});

categoryRouter.delete('/:id', (req, res) => {
  const index = categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<void> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Category not found' },
    };
    res.status(404).json(response);
    return;
  }
  categories.splice(index, 1);
  const response: APIResponse<void> = { success: true };
  res.json(response);
});
