#!/usr/bin/env python3
"""
HTTP server for Bookmark Manager browser extension.
This provides an alternative to native messaging via a local HTTP endpoint.
"""

import json
import sqlite3
import logging
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

DB_PATH = Path.home() / '.bookmarks' / 'bookmarks.db'
PORT = 8765

class BookmarkHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers(204)
    
    def do_GET(self):
        if self.path == '/health':
            self._set_headers()
            response = {'status': 'ok', 'message': 'Desktop app is running'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_POST(self):
        if self.path == '/bookmarks':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                bookmark_data = json.loads(body.decode('utf-8'))
                result = save_bookmark(bookmark_data)
                
                if result['success']:
                    self._set_headers(201)
                    self.wfile.write(json.dumps(result).encode())
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                logging.error(f'Error processing request: {e}')
                self._set_headers(500)
                error_response = {'success': False, 'error': str(e)}
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def log_message(self, format, *args):
        logging.info(f'{self.client_address[0]} - {format % args}')

def init_database():
    """Initialize the SQLite database"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            notes TEXT,
            code_snippet TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookmark_tags (
            bookmark_id INTEGER,
            tag_id INTEGER,
            FOREIGN KEY (bookmark_id) REFERENCES bookmarks (id),
            FOREIGN KEY (tag_id) REFERENCES tags (id),
            PRIMARY KEY (bookmark_id, tag_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logging.info('Database initialized')

def save_bookmark(bookmark_data):
    """Save a bookmark to the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO bookmarks (url, title, notes, code_snippet, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            bookmark_data['url'],
            bookmark_data['title'],
            bookmark_data.get('notes', ''),
            bookmark_data.get('codeSnippet', ''),
            bookmark_data.get('createdAt', now),
            now
        ))
        
        bookmark_id = cursor.lastrowid
        
        for tag_name in bookmark_data.get('tags', []):
            cursor.execute('INSERT OR IGNORE INTO tags (name) VALUES (?)', (tag_name,))
            cursor.execute('SELECT id FROM tags WHERE name = ?', (tag_name,))
            tag_id = cursor.fetchone()[0]
            cursor.execute('INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
                         (bookmark_id, tag_id))
        
        conn.commit()
        conn.close()
        
        logging.info(f'Saved bookmark: {bookmark_data["title"]} (ID: {bookmark_id})')
        return {'success': True, 'bookmark_id': bookmark_id}
    except Exception as e:
        logging.error(f'Failed to save bookmark: {e}')
        return {'success': False, 'error': str(e)}

def main():
    """Start the HTTP server"""
    init_database()
    
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, BookmarkHandler)
    
    logging.info(f'Starting HTTP server on http://127.0.0.1:{PORT}')
    logging.info('Press Ctrl+C to stop the server')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info('Server stopped')
        httpd.shutdown()

if __name__ == '__main__':
    main()
