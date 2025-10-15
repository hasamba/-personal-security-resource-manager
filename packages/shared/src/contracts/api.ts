import type {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  Tag,
  CreateTagInput,
  UpdateTagInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Note,
  CreateNoteInput,
  UpdateNoteInput,
} from '../types/index.js';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface APIBookmarkEndpoints {
  'POST /api/bookmarks': {
    body: CreateBookmarkInput;
    response: APIResponse<Bookmark>;
  };
  'GET /api/bookmarks': {
    response: APIResponse<Bookmark[]>;
  };
  'GET /api/bookmarks/:id': {
    response: APIResponse<Bookmark>;
  };
  'PUT /api/bookmarks/:id': {
    body: UpdateBookmarkInput;
    response: APIResponse<Bookmark>;
  };
  'DELETE /api/bookmarks/:id': {
    response: APIResponse<void>;
  };
}

export interface APITagEndpoints {
  'POST /api/tags': {
    body: CreateTagInput;
    response: APIResponse<Tag>;
  };
  'GET /api/tags': {
    response: APIResponse<Tag[]>;
  };
  'GET /api/tags/:id': {
    response: APIResponse<Tag>;
  };
  'PUT /api/tags/:id': {
    body: UpdateTagInput;
    response: APIResponse<Tag>;
  };
  'DELETE /api/tags/:id': {
    response: APIResponse<void>;
  };
}

export interface APICategoryEndpoints {
  'POST /api/categories': {
    body: CreateCategoryInput;
    response: APIResponse<Category>;
  };
  'GET /api/categories': {
    response: APIResponse<Category[]>;
  };
  'GET /api/categories/:id': {
    response: APIResponse<Category>;
  };
  'PUT /api/categories/:id': {
    body: UpdateCategoryInput;
    response: APIResponse<Category>;
  };
  'DELETE /api/categories/:id': {
    response: APIResponse<void>;
  };
}

export interface APINoteEndpoints {
  'POST /api/notes': {
    body: CreateNoteInput;
    response: APIResponse<Note>;
  };
  'GET /api/notes/:id': {
    response: APIResponse<Note>;
  };
  'PUT /api/notes/:id': {
    body: UpdateNoteInput;
    response: APIResponse<Note>;
  };
  'DELETE /api/notes/:id': {
    response: APIResponse<void>;
  };
}

export type APIEndpoints = APIBookmarkEndpoints &
  APITagEndpoints &
  APICategoryEndpoints &
  APINoteEndpoints;
