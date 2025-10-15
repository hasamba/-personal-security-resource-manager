import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, Tag, FolderOpen } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useBookmarkStore } from '../store/bookmarkStore';

export const Dashboard = () => {
  const { bookmarks, loading } = useBookmarks();
  const { tags, categories } = useBookmarkStore();

  const favoriteCount = bookmarks.filter((b) => b.favorite).length;
  const recentBookmarks = [...bookmarks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to your bookmark manager</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Bookmark size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Bookmarks</h3>
            <p className="stat-value">{bookmarks.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon favorite">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>Favorites</h3>
            <p className="stat-value">{favoriteCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Tag size={24} />
          </div>
          <div className="stat-content">
            <h3>Tags</h3>
            <p className="stat-value">{tags.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FolderOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Bookmarks</h2>
          <Link to="/bookmarks" className="view-all-link">
            View All
          </Link>
        </div>
        <div className="recent-list">
          {recentBookmarks.length > 0 ? (
            recentBookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                to="/bookmarks"
                className="recent-item"
              >
                <div className="recent-item-content">
                  <h4>{bookmark.title}</h4>
                  <p className="recent-url">{bookmark.url}</p>
                </div>
                {bookmark.favorite && (
                  <Star size={16} className="favorite-active" fill="currentColor" />
                )}
              </Link>
            ))
          ) : (
            <p className="empty-state">No bookmarks yet. Create your first bookmark!</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Popular Tags</h2>
        <div className="tag-cloud">
          {tags.slice(0, 10).map((tag) => (
            <span key={tag} className="tag-cloud-item">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
