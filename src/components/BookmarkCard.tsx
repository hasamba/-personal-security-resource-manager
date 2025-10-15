import { Star, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onSelect: (bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

export const BookmarkCard = ({
  bookmark,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}: BookmarkCardProps) => {
  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookmark.url, '_blank');
  };

  return (
    <div className="bookmark-card" onClick={() => onSelect(bookmark)}>
      <div className="bookmark-card-header">
        <h3 className="bookmark-title">{bookmark.title}</h3>
        <div className="bookmark-actions">
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(bookmark.id, !bookmark.favorite);
            }}
            title={bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={18}
              className={bookmark.favorite ? 'favorite-active' : ''}
              fill={bookmark.favorite ? 'currentColor' : 'none'}
            />
          </button>
          <button
            className="icon-button"
            onClick={handleOpenUrl}
            title="Open in browser"
          >
            <ExternalLink size={18} />
          </button>
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bookmark);
            }}
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            className="icon-button danger"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this bookmark?')) {
                onDelete(bookmark.id);
              }
            }}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <a
        href={bookmark.url}
        className="bookmark-url"
        onClick={(e) => e.preventDefault()}
        title={bookmark.url}
      >
        {bookmark.url}
      </a>

      {bookmark.description && (
        <p className="bookmark-description">{bookmark.description}</p>
      )}

      <div className="bookmark-footer">
        <div className="bookmark-tags">
          {bookmark.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <span className="bookmark-category">{bookmark.category}</span>
      </div>
    </div>
  );
};
