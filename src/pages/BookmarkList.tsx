import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { BookmarkCard } from '../components/BookmarkCard';
import { BookmarkDetailPane } from '../components/BookmarkDetailPane';
import { BookmarkEditor } from '../components/BookmarkEditor';
import { Bookmark } from '../types';

export const BookmarkList = () => {
  const {
    filteredBookmarks,
    selectedBookmark,
    loading,
    setSelectedBookmark,
    createBookmark,
    updateBookmark,
    deleteBookmark,
  } = useBookmarks();

  const [showEditor, setShowEditor] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const handleCreateNew = () => {
    setEditingBookmark(null);
    setShowEditor(true);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setShowEditor(true);
  };

  const handleSave = async (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, bookmarkData);
    } else {
      await createBookmark(bookmarkData);
    }
    setShowEditor(false);
    setEditingBookmark(null);
  };

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    await updateBookmark(id, { favorite });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container bookmarks-page">
      <header className="page-header">
        <div>
          <h1>Bookmarks</h1>
          <p>{filteredBookmarks.length} bookmarks found</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNew}>
          <Plus size={20} />
          New Bookmark
        </button>
      </header>

      <div className="bookmarks-layout">
        <aside className="bookmarks-sidebar">
          <SearchBar />
          <FilterPanel />
        </aside>

        <div className="bookmarks-main">
          <div className="bookmarks-grid">
            {filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onSelect={setSelectedBookmark}
                  onEdit={handleEdit}
                  onDelete={deleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No bookmarks found</p>
                <button className="btn-primary" onClick={handleCreateNew}>
                  <Plus size={20} />
                  Create First Bookmark
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedBookmark && (
          <BookmarkDetailPane
            bookmark={selectedBookmark}
            onClose={() => setSelectedBookmark(null)}
          />
        )}
      </div>

      {showEditor && (
        <BookmarkEditor
          bookmark={editingBookmark}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingBookmark(null);
          }}
        />
      )}
    </div>
  );
};
