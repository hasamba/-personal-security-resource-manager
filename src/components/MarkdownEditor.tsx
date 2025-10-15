import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Eye, Edit } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MarkdownEditor = ({ value, onChange, placeholder }: MarkdownEditorProps) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => setMode('edit')}
        >
          <Edit size={16} />
          Edit
        </button>
        <button
          type="button"
          className={`toolbar-btn ${mode === 'preview' ? 'active' : ''}`}
          onClick={() => setMode('preview')}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      {mode === 'edit' ? (
        <textarea
          className="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={10}
        />
      ) : (
        <div className="markdown-preview">
          {value ? (
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
              {value}
            </ReactMarkdown>
          ) : (
            <p className="preview-empty">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
};
