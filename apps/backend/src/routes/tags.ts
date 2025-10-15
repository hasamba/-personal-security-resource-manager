import { Router } from 'express';
import type { APIResponse, Tag, CreateTagInput } from '@monorepo/shared';

export const tagRouter = Router();

const tags: Tag[] = [];

tagRouter.get('/', (_req, res) => {
  const response: APIResponse<Tag[]> = {
    success: true,
    data: tags,
  };
  res.json(response);
});

tagRouter.get('/:id', (req, res) => {
  const tag = tags.find((t) => t.id === req.params.id);
  const response: APIResponse<Tag> = tag
    ? { success: true, data: tag }
    : { success: false, error: { code: 'NOT_FOUND', message: 'Tag not found' } };
  res.status(tag ? 200 : 404).json(response);
});

tagRouter.post('/', (req, res) => {
  const input = req.body as CreateTagInput;
  const tag: Tag = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tags.push(tag);
  const response: APIResponse<Tag> = {
    success: true,
    data: tag,
  };
  res.status(201).json(response);
});

tagRouter.put('/:id', (req, res) => {
  const index = tags.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<Tag> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Tag not found' },
    };
    res.status(404).json(response);
    return;
  }
  tags[index] = {
    ...tags[index]!,
    ...req.body,
    updatedAt: new Date(),
  };
  const response: APIResponse<Tag> = {
    success: true,
    data: tags[index]!,
  };
  res.json(response);
});

tagRouter.delete('/:id', (req, res) => {
  const index = tags.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<void> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Tag not found' },
    };
    res.status(404).json(response);
    return;
  }
  tags.splice(index, 1);
  const response: APIResponse<void> = { success: true };
  res.json(response);
});
