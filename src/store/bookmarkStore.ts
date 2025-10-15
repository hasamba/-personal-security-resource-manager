import { create } from 'zustand';
import { Bookmark } from '../types';

interface BookmarkStore {
  bookmarks: Bookmark[];
  selectedBookmark: Bookmark | null;
  searchQuery: string;
  filterTags: string[];
  filterCategory: string | null;
  showFavoritesOnly: boolean;
  tags: string[];
  categories: string[];
  loading: boolean;
  
  setBookmarks: (bookmarks: Bookmark[]) => void;
  setSelectedBookmark: (bookmark: Bookmark | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterCategory: (category: string | null) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setTags: (tags: string[]) => void;
  setCategories: (categories: string[]) => void;
  setLoading: (loading: boolean) => void;
  
  addBookmark: (bookmark: Bookmark) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  
  getFilteredBookmarks: () => Bookmark[];
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  selectedBookmark: null,
  searchQuery: '',
  filterTags: [],
  filterCategory: null,
  showFavoritesOnly: false,
  tags: [],
  categories: [],
  loading: false,

  setBookmarks: (bookmarks) => set({ bookmarks }),
  setSelectedBookmark: (bookmark) => set({ selectedBookmark: bookmark }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterTags: (tags) => set({ filterTags: tags }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  setTags: (tags) => set({ tags }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),

  addBookmark: (bookmark) =>
    set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  
  updateBookmark: (id, updates) =>
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
      selectedBookmark:
        state.selectedBookmark?.id === id
          ? { ...state.selectedBookmark, ...updates }
          : state.selectedBookmark,
    })),
  
  removeBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
      selectedBookmark:
        state.selectedBookmark?.id === id ? null : state.selectedBookmark,
    })),

  getFilteredBookmarks: () => {
    const state = get();
    let filtered = state.bookmarks;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query) ||
          b.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (state.filterTags.length > 0) {
      filtered = filtered.filter((b) =>
        state.filterTags.every((tag) => b.tags.includes(tag))
      );
    }

    if (state.filterCategory) {
      filtered = filtered.filter((b) => b.category === state.filterCategory);
    }

    if (state.showFavoritesOnly) {
      filtered = filtered.filter((b) => b.favorite);
    }

    return filtered;
  },
}));
