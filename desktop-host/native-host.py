#!/usr/bin/env python3
"""
Native messaging host for Bookmark Manager browser extension.
This script handles communication between the browser extension and desktop app.
"""

import sys
import json
import struct
import sqlite3
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    filename='/tmp/bookmark-native-host.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

DB_PATH = Path.home() / '.bookmarks' / 'bookmarks.db'

def send_message(message):
    """Send a message to the browser extension"""
    try:
        encoded_message = json.dumps(message).encode('utf-8')
        sys.stdout.buffer.write(struct.pack('I', len(encoded_message)))
        sys.stdout.buffer.write(encoded_message)
        sys.stdout.buffer.flush()
        logging.debug(f'Sent message: {message}')
    except Exception as e:
        logging.error(f'Failed to send message: {e}')

def receive_message():
    """Receive a message from the browser extension"""
    try:
        raw_length = sys.stdin.buffer.read(4)
        if not raw_length:
            logging.debug('No message received (EOF)')
            return None
        
        message_length = struct.unpack('I', raw_length)[0]
        message_data = sys.stdin.buffer.read(message_length).decode('utf-8')
        message = json.loads(message_data)
        logging.debug(f'Received message: {message}')
        return message
    except Exception as e:
        logging.error(f'Failed to receive message: {e}')
        return None

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
        
        logging.info(f'Saved bookmark: {bookmark_data["title"]}')
        return {'success': True, 'bookmark_id': bookmark_id}
    except Exception as e:
        logging.error(f'Failed to save bookmark: {e}')
        return {'success': False, 'error': str(e)}

def handle_message(message):
    """Handle incoming messages from the extension"""
    message_type = message.get('type')
    
    if message_type == 'ping':
        return {'type': 'pong', 'success': True}
    
    elif message_type == 'save_bookmark':
        result = save_bookmark(message.get('data', {}))
        return result
    
    else:
        return {'success': False, 'error': f'Unknown message type: {message_type}'}

def main():
    """Main function"""
    logging.info('Native host started')
    
    try:
        init_database()
        
        while True:
            message = receive_message()
            
            if message is None:
                break
            
            response = handle_message(message)
            send_message(response)
    
    except Exception as e:
        logging.error(f'Fatal error: {e}')
        sys.exit(1)
    
    logging.info('Native host stopped')

if __name__ == '__main__':
    main()
