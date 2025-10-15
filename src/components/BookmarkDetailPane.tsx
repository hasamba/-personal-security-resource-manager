import { X, ExternalLink, Calendar, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Bookmark } from '../types';

interface BookmarkDetailPaneProps {
  bookmark: Bookmark | null;
  onClose: () => void;
}

export const BookmarkDetailPane = ({ bookmark, onClose }: BookmarkDetailPaneProps) => {
  if (!bookmark) return null;

  return (
    <div className="detail-pane">
      <div className="detail-header">
        <h2>{bookmark.title}</h2>
        <button className="icon-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <label>URL</label>
          <a
            href={bookmark.url}
            className="detail-url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {bookmark.url}
            <ExternalLink size={16} />
          </a>
        </div>

        {bookmark.description && (
          <div className="detail-section">
            <label>Description</label>
            <p>{bookmark.description}</p>
          </div>
        )}

        <div className="detail-section">
          <label>Category</label>
          <span className="detail-category">{bookmark.category}</span>
        </div>

        <div className="detail-section">
          <label>Tags</label>
          <div className="detail-tags">
            {bookmark.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {bookmark.notes && (
          <div className="detail-section">
            <label>Notes</label>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {bookmark.notes}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {bookmark.codeSnippet && (
          <div className="detail-section">
            <label>Code Snippet</label>
            <div className="code-snippet">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {bookmark.codeSnippet}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="detail-section">
          <label>Metadata</label>
          <div className="detail-metadata">
            <div className="metadata-item">
              <Calendar size={16} />
              <span>Created: {new Date(bookmark.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="metadata-item">
              <Calendar size={16} />
              <span>Updated: {new Date(bookmark.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="metadata-item">
              <Star
                size={16}
                className={bookmark.favorite ? 'favorite-active' : ''}
                fill={bookmark.favorite ? 'currentColor' : 'none'}
              />
              <span>{bookmark.favorite ? 'Favorite' : 'Not a favorite'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
