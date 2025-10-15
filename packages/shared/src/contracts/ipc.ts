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

export interface IPCBookmarkEvents {
  'bookmark:create': (input: CreateBookmarkInput) => Promise<Bookmark>;
  'bookmark:update': (id: string, input: UpdateBookmarkInput) => Promise<Bookmark>;
  'bookmark:delete': (id: string) => Promise<void>;
  'bookmark:get': (id: string) => Promise<Bookmark | null>;
  'bookmark:list': () => Promise<Bookmark[]>;
}

export interface IPCTagEvents {
  'tag:create': (input: CreateTagInput) => Promise<Tag>;
  'tag:update': (id: string, input: UpdateTagInput) => Promise<Tag>;
  'tag:delete': (id: string) => Promise<void>;
  'tag:get': (id: string) => Promise<Tag | null>;
  'tag:list': () => Promise<Tag[]>;
}

export interface IPCCategoryEvents {
  'category:create': (input: CreateCategoryInput) => Promise<Category>;
  'category:update': (id: string, input: UpdateCategoryInput) => Promise<Category>;
  'category:delete': (id: string) => Promise<void>;
  'category:get': (id: string) => Promise<Category | null>;
  'category:list': () => Promise<Category[]>;
}

export interface IPCNoteEvents {
  'note:create': (input: CreateNoteInput) => Promise<Note>;
  'note:update': (id: string, input: UpdateNoteInput) => Promise<Note>;
  'note:delete': (id: string) => Promise<void>;
  'note:get': (id: string) => Promise<Note | null>;
}

export type IPCEvents = IPCBookmarkEvents & IPCTagEvents & IPCCategoryEvents & IPCNoteEvents;

export type IPCEventName = keyof IPCEvents;
