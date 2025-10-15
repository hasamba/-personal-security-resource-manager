import { Filter, Star, X } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export const FilterPanel = () => {
  const {
    tags,
    categories,
    filterTags,
    filterCategory,
    showFavoritesOnly,
    setFilterTags,
    setFilterCategory,
    setShowFavoritesOnly,
  } = useBookmarkStore();

  const toggleTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  const clearFilters = () => {
    setFilterTags([]);
    setFilterCategory(null);
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters = filterTags.length > 0 || filterCategory || showFavoritesOnly;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={18} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      <div className="filter-section">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
          />
          <Star size={16} className={showFavoritesOnly ? 'favorite-active' : ''} />
          <span>Favorites Only</span>
        </label>
      </div>

      <div className="filter-section">
        <h4>Category</h4>
        <div className="category-list">
          {categories.map((category) => (
            <label key={category} className="filter-checkbox">
              <input
                type="radio"
                name="category"
                checked={filterCategory === category}
                onChange={() => setFilterCategory(category)}
              />
              <span>{category}</span>
            </label>
          ))}
          {filterCategory && (
            <button
              className="clear-category-btn"
              onClick={() => setFilterCategory(null)}
            >
              Clear category
            </button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <h4>Tags</h4>
        <div className="tag-list">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter ${filterTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
