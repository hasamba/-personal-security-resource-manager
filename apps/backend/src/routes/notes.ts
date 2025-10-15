import { Router } from 'express';
import type { APIResponse, Note, CreateNoteInput } from '@monorepo/shared';

export const noteRouter = Router();

const notes: Note[] = [];

noteRouter.get('/:id', (req, res) => {
  const note = notes.find((n) => n.id === req.params.id);
  const response: APIResponse<Note> = note
    ? { success: true, data: note }
    : { success: false, error: { code: 'NOT_FOUND', message: 'Note not found' } };
  res.status(note ? 200 : 404).json(response);
});

noteRouter.post('/', (req, res) => {
  const input = req.body as CreateNoteInput;
  const note: Note = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(note);
  const response: APIResponse<Note> = {
    success: true,
    data: note,
  };
  res.status(201).json(response);
});

noteRouter.put('/:id', (req, res) => {
  const index = notes.findIndex((n) => n.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<Note> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Note not found' },
    };
    res.status(404).json(response);
    return;
  }
  notes[index] = {
    ...notes[index]!,
    ...req.body,
    updatedAt: new Date(),
  };
  const response: APIResponse<Note> = {
    success: true,
    data: notes[index]!,
  };
  res.json(response);
});

noteRouter.delete('/:id', (req, res) => {
  const index = notes.findIndex((n) => n.id === req.params.id);
  if (index === -1) {
    const response: APIResponse<void> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Note not found' },
    };
    res.status(404).json(response);
    return;
  }
  notes.splice(index, 1);
  const response: APIResponse<void> = { success: true };
  res.json(response);
});
