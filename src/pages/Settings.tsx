import { useState } from 'react';
import { Download, Upload, Trash2, Save } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { TagManager } from '../components/TagManager';

export const Settings = () => {
  const { exportBookmarks } = useBookmarks();
  const [exportFormat, setExportFormat] = useState<'json' | 'html'>('json');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportBookmarks(exportFormat);
      const blob = new Blob([data], {
        type: exportFormat === 'json' ? 'application/json' : 'text/html',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarks.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export bookmarks');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.html';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert('Import functionality will be implemented in the backend');
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all bookmarks? This action cannot be undone.')) {
      alert('Clear all functionality will be implemented');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Manage your bookmarks and preferences</p>
      </header>

      {showSuccess && (
        <div className="alert alert-success">
          Bookmarks exported successfully!
        </div>
      )}

      <div className="settings-section">
        <h2>Export & Import</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-info">
              <h3>Export Bookmarks</h3>
              <p>Download your bookmarks as JSON or HTML</p>
            </div>
            <div className="settings-actions">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'html')}
                className="select-input"
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
              <button className="btn-primary" onClick={handleExport}>
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <h3>Import Bookmarks</h3>
              <p>Import bookmarks from a file</p>
            </div>
            <div className="settings-actions">
              <button className="btn-secondary" onClick={handleImport}>
                <Upload size={18} />
                Import
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <TagManager />
      </div>

      <div className="settings-section">
        <h2>Data Management</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-info">
              <h3>Clear All Bookmarks</h3>
              <p className="text-danger">
                This will permanently delete all your bookmarks. This action cannot be undone.
              </p>
            </div>
            <div className="settings-actions">
              <button className="btn-danger" onClick={handleClearAll}>
                <Trash2 size={18} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="settings-card">
          <div className="about-info">
            <h3>Bookmark Manager</h3>
            <p>Version 1.0.0</p>
            <p>A desktop application for managing your bookmarks with notes and code snippets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
