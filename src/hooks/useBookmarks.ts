import { useEffect } from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Bookmark } from '../types';

const mockAPI = {
  bookmarks: {
    getAll: async () => {
      return [
        {
          id: '1',
          title: 'React Documentation',
          url: 'https://react.dev',
          description: 'Official React documentation',
          notes: 'Great resource for learning React hooks and patterns',
          codeSnippet: '```jsx\nfunction App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}\n```',
          tags: ['react', 'javascript', 'frontend'],
          category: 'Development',
          favorite: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'TypeScript Handbook',
          url: 'https://www.typescriptlang.org/docs',
          description: 'TypeScript official handbook',
          notes: 'Reference for TypeScript types and advanced patterns',
          codeSnippet: '```typescript\ntype User = {\n  id: string;\n  name: string;\n};\n```',
          tags: ['typescript', 'javascript'],
          category: 'Development',
          favorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Electron Documentation',
          url: 'https://www.electronjs.org/docs',
          description: 'Build cross-platform desktop apps',
          notes: 'Main and renderer process communication patterns',
          tags: ['electron', 'desktop'],
          category: 'Development',
          favorite: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as Bookmark[];
    },
    getById: async (id: string) => {
      const bookmarks = await mockAPI.bookmarks.getAll();
      return bookmarks.find((b) => b.id === id);
    },
    create: async (bookmark: any) => {
      return {
        ...bookmark,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Bookmark;
    },
    update: async (id: string, bookmark: any) => {
      return { ...bookmark, id, updatedAt: new Date().toISOString() } as Bookmark;
    },
    delete: async (_id: string) => {
      return true;
    },
    search: async (query: string) => {
      const bookmarks = await mockAPI.bookmarks.getAll();
      return bookmarks.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );
    },
    export: async (format: string) => {
      const bookmarks = await mockAPI.bookmarks.getAll();
      if (format === 'json') {
        return JSON.stringify(bookmarks, null, 2);
      }
      return '';
    },
  },
  tags: {
    getAll: async () => {
      return ['react', 'javascript', 'typescript', 'frontend', 'electron', 'desktop'];
    },
  },
  categories: {
    getAll: async () => {
      return ['Development', 'Design', 'Productivity', 'Other'];
    },
  },
};

const api = typeof window !== 'undefined' && window.electronAPI ? window.electronAPI : mockAPI;

export const useBookmarks = () => {
  const {
    bookmarks,
    selectedBookmark,
    searchQuery,
    loading,
    setBookmarks,
    setSelectedBookmark,
    setSearchQuery,
    setLoading,
    addBookmark: addBookmarkToStore,
    updateBookmark: updateBookmarkInStore,
    removeBookmark: removeBookmarkFromStore,
    getFilteredBookmarks,
    setTags,
    setCategories,
  } = useBookmarkStore();

  useEffect(() => {
    loadBookmarks();
    loadTags();
    loadCategories();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.bookmarks.getAll();
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await api.tags.getAll();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const createBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBookmark = await api.bookmarks.create(bookmark);
      addBookmarkToStore(newBookmark);
      return newBookmark;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      const updated = await api.bookmarks.update(id, updates);
      if (updated) {
        updateBookmarkInStore(id, updates);
      }
      return updated;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await api.bookmarks.delete(id);
      removeBookmarkFromStore(id);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  };

  const searchBookmarks = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      return;
    }
    try {
      const results = await api.bookmarks.search(query);
      setBookmarks(results);
    } catch (error) {
      console.error('Error searching bookmarks:', error);
    }
  };

  const exportBookmarks = async (format: string) => {
    try {
      return await api.bookmarks.export(format);
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      throw error;
    }
  };

  return {
    bookmarks,
    filteredBookmarks: getFilteredBookmarks(),
    selectedBookmark,
    searchQuery,
    loading,
    setSelectedBookmark,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    searchBookmarks,
    exportBookmarks,
    refreshBookmarks: loadBookmarks,
  };
};
