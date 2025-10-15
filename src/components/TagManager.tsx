import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export const TagManager = () => {
  const { tags, bookmarks } = useBookmarkStore();
  const [newTag, setNewTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const getTagCount = (tag: string) => {
    return bookmarks.filter((b) => b.tags.includes(tag)).length;
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNewTag('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h3>
          <Tag size={20} />
          Tag Management
        </h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={18} />
          New Tag
        </button>
      </div>

      {showAddForm && (
        <div className="tag-add-form">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter new tag name"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
          />
          <button onClick={handleAddTag} className="btn-primary">
            Add
          </button>
          <button onClick={() => setShowAddForm(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
      )}

      <div className="tag-grid">
        {tags.map((tag) => (
          <div key={tag} className="tag-item">
            <span className="tag-name">{tag}</span>
            <span className="tag-count">{getTagCount(tag)} bookmarks</span>
          </div>
        ))}
      </div>
    </div>
  );
};
