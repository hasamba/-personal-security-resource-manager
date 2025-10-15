import { Router } from 'express';
import type { APIResponse, Bookmark, CreateBookmarkInput } from '@monorepo/shared';

export const bookmarkRouter = Router();

const bookmarks: Bookmark[] = [];

bookmarkRouter.get('/', (_req, res) => {
  const response: APIResponse<Bookmark[]> = {
    success: true,
    data: bookmarks,
  };
  res.json(response);
});

bookmarkRouter.get('/:id', (req, res) => {
  const bookmark = bookmarks.find((b) => b.id === req.params.id);
  const response: APIResponse<Bookmark> = bookmark
    ? { success: true, data: bookmark }
    : { success: false, error: { code: 'NOT_FOUND', message: 'Bookmark not found' } };
  res.status(bookmark ? 200 : 404).json(response);
});

bookmarkRouter.post('/', (req, res) => {
  const input = req.body as CreateBookmarkInput;
  const bookmark: Bookmark = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  bookmarks.push(bookmark);
  const response: APIResponse<Bookmark> = {
    success: true,
    data: bookmark,
  };
  res.status(201).json(response);
});

bookmarkRouter.put('/:id', (req, res) => {
  const index = bookmarks.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<Bookmark> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Bookmark not found' },
    };
    res.status(404).json(response);
    return;
  }
  bookmarks[index] = {
    ...bookmarks[index]!,
    ...req.body,
    updatedAt: new Date(),
  };
  const response: APIResponse<Bookmark> = {
    success: true,
    data: bookmarks[index]!,
  };
  res.json(response);
});

bookmarkRouter.delete('/:id', (req, res) => {
  const index = bookmarks.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<void> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Bookmark not found' },
    };
    res.status(404).json(response);
    return;
  }
  bookmarks.splice(index, 1);
  const response: APIResponse<void> = { success: true };
  res.json(response);
});
