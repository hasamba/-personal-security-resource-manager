import { useState, useEffect } from 'react';

export function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    setMessage('Welcome to the Desktop App!');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Desktop Application</h1>
        <p>{message}</p>
      </header>
      <main className="app-main">
        <section className="info-section">
          <h2>Features</h2>
          <ul>
            <li>Bookmark Management</li>
            <li>Tag Organization</li>
            <li>Category Grouping</li>
            <li>Note Taking</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
