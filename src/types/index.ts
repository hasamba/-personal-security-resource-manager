export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  codeSnippet?: string;
  tags: string[];
  category: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ElectronAPI {
  bookmarks: {
    getAll: () => Promise<Bookmark[]>;
    getById: (id: string) => Promise<Bookmark | undefined>;
    create: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Bookmark>;
    update: (id: string, bookmark: Partial<Bookmark>) => Promise<Bookmark | null>;
    delete: (id: string) => Promise<boolean>;
    search: (query: string) => Promise<Bookmark[]>;
    export: (format: string) => Promise<string>;
  };
  tags: {
    getAll: () => Promise<string[]>;
  };
  categories: {
    getAll: () => Promise<string[]>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
