-- Create FTS5 virtual table for bookmarks
CREATE VIRTUAL TABLE bookmarks_fts USING fts5(
  title,
  description,
  content='bookmarks',
  content_rowid='id'
);

-- Create triggers to keep bookmarks_fts in sync
CREATE TRIGGER bookmarks_ai AFTER INSERT ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER bookmarks_ad AFTER DELETE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER bookmarks_au AFTER UPDATE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
  INSERT INTO bookmarks_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

-- Create FTS5 virtual table for notes
CREATE VIRTUAL TABLE notes_fts USING fts5(
  content,
  content='notes',
  content_rowid='id'
);

-- Create triggers to keep notes_fts in sync
CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, content)
  VALUES (new.id, new.content);
END;

CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, content)
  VALUES('delete', old.id, old.content);
END;

CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, content)
  VALUES('delete', old.id, old.content);
  INSERT INTO notes_fts(rowid, content)
  VALUES (new.id, new.content);
END;

-- Create FTS5 virtual table for code snippets
CREATE VIRTUAL TABLE code_snippets_fts USING fts5(
  code,
  description,
  content='code_snippets',
  content_rowid='id'
);

-- Create triggers to keep code_snippets_fts in sync
CREATE TRIGGER code_snippets_ai AFTER INSERT ON code_snippets BEGIN
  INSERT INTO code_snippets_fts(rowid, code, description)
  VALUES (new.id, new.code, new.description);
END;

CREATE TRIGGER code_snippets_ad AFTER DELETE ON code_snippets BEGIN
  INSERT INTO code_snippets_fts(code_snippets_fts, rowid, code, description)
  VALUES('delete', old.id, old.code, old.description);
END;

CREATE TRIGGER code_snippets_au AFTER UPDATE ON code_snippets BEGIN
  INSERT INTO code_snippets_fts(code_snippets_fts, rowid, code, description)
  VALUES('delete', old.id, old.code, old.description);
  INSERT INTO code_snippets_fts(rowid, code, description)
  VALUES (new.id, new.code, new.description);
END;
