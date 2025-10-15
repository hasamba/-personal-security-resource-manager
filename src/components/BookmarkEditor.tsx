import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Bookmark } from '../types';
import { MarkdownEditor } from './MarkdownEditor';

interface BookmarkEditorProps {
  bookmark?: Bookmark | null;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const BookmarkEditor = ({ bookmark, onSave, onClose }: BookmarkEditorProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setDescription(bookmark.description || '');
      setNotes(bookmark.notes || '');
      setCodeSnippet(bookmark.codeSnippet || '');
      setTags(bookmark.tags);
      setCategory(bookmark.category);
      setFavorite(bookmark.favorite);
    }
  }, [bookmark]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      url,
      description,
      notes,
      codeSnippet,
      tags,
      category,
      favorite,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bookmark ? 'Edit Bookmark' : 'New Bookmark'}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Bookmark title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">URL *</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="Development, Design, etc."
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
              />
              <button type="button" onClick={handleAddTag}>
                Add
              </button>
            </div>
            <div className="tag-list">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Markdown supported)</label>
            <MarkdownEditor
              value={notes}
              onChange={setNotes}
              placeholder="Add your notes here..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="codeSnippet">Code Snippet (Markdown supported)</label>
            <MarkdownEditor
              value={codeSnippet}
              onChange={setCodeSnippet}
              placeholder="```javascript&#10;// Your code here&#10;```"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              <span>Mark as favorite</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
