import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useBookmarkStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder="Search bookmarks..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
      {localQuery && (
        <button className="clear-button" onClick={handleClear}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
