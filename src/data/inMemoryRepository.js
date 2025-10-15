const { v4: uuidv4 } = require('uuid');

class InMemoryRepository {
  constructor() {
    this.bookmarks = new Map();
    this.tags = new Map();
    this.categories = new Map();
    this.notes = new Map();
    this.snippets = new Map();
  }

  _timestamp() {
    return new Date().toISOString();
  }

  _normalize(value) {
    return value.trim().toLowerCase();
  }

  _toBookmarkDTO(bookmark) {
    return {
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      tags: [...bookmark.tags],
      category: bookmark.category,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt
    };
  }

  _toTagDTO(tag) {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    };
  }

  _toCategoryDTO(category) {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }

  _toNoteDTO(note) {
    return {
      id: note.id,
      content: note.content,
      bookmarkId: note.bookmarkId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    };
  }

  _toSnippetDTO(snippet) {
    return {
      id: snippet.id,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description,
      bookmarkId: snippet.bookmarkId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    };
  }

  listBookmarks() {
    return Array.from(this.bookmarks.values()).map((bookmark) =>
      this._toBookmarkDTO(bookmark)
    );
  }

  getBookmark(id) {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      return null;
    }
    return this._toBookmarkDTO(bookmark);
  }

  createBookmark(data) {
    const id = uuidv4();
    const now = this._timestamp();
    const bookmark = {
      id,
      title: data.title,
      url: data.url,
      description: data.description,
      tags: Array.from(new Set(data.tags || [])).map((tag) => tag.trim()),
      category: data.category ? data.category.trim() : null,
      noteIds: [],
      snippetIds: [],
      createdAt: now,
      updatedAt: now
    };

    this.bookmarks.set(id, bookmark);

    bookmark.tags.forEach((tagName) => this.ensureTag(tagName));
    if (bookmark.category) {
      this.ensureCategory(bookmark.category);
    }

    return this._toBookmarkDTO(bookmark);
  }

  updateBookmark(id, data) {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      return null;
    }

    const now = this._timestamp();

    if (Object.prototype.hasOwnProperty.call(data, 'title')) {
      bookmark.title = data.title;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'url')) {
      bookmark.url = data.url;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      bookmark.description = data.description;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'tags')) {
      bookmark.tags = Array.from(new Set(data.tags || [])).map((tag) =>
        tag.trim()
      );
      bookmark.tags.forEach((tagName) => this.ensureTag(tagName));
    }

    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
      bookmark.category = data.category ? data.category.trim() : null;
      if (bookmark.category) {
        this.ensureCategory(bookmark.category);
      }
    }

    bookmark.updatedAt = now;

    return this._toBookmarkDTO(bookmark);
  }

  deleteBookmark(id) {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) {
      return false;
    }

    bookmark.noteIds.forEach((noteId) => {
      this.notes.delete(noteId);
    });

    bookmark.snippetIds.forEach((snippetId) => {
      this.snippets.delete(snippetId);
    });

    this.bookmarks.delete(id);
    return true;
  }

  listTags() {
    return Array.from(this.tags.values())
      .map((tag) => this._toTagDTO(tag))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getTagByName(name) {
    const normalized = this._normalize(name);
    const tag = this.tags.get(normalized);
    return tag ? this._toTagDTO(tag) : null;
  }

  createTag(name) {
    const normalized = this._normalize(name);
    if (this.tags.has(normalized)) {
      return null;
    }
    const now = this._timestamp();
    const tag = {
      id: uuidv4(),
      name: name.trim(),
      normalized,
      createdAt: now,
      updatedAt: now
    };
    this.tags.set(normalized, tag);
    return this._toTagDTO(tag);
  }

  ensureTag(name) {
    const normalized = this._normalize(name);
    if (this.tags.has(normalized)) {
      const existing = this.tags.get(normalized);
      return this._toTagDTO(existing);
    }
    return this.createTag(name);
  }

  listCategories() {
    return Array.from(this.categories.values())
      .map((category) => this._toCategoryDTO(category))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getCategoryByName(name) {
    const normalized = this._normalize(name);
    const category = this.categories.get(normalized);
    return category ? this._toCategoryDTO(category) : null;
  }

  createCategory(name) {
    const normalized = this._normalize(name);
    if (this.categories.has(normalized)) {
      return null;
    }
    const now = this._timestamp();
    const category = {
      id: uuidv4(),
      name: name.trim(),
      normalized,
      createdAt: now,
      updatedAt: now
    };
    this.categories.set(normalized, category);
    return this._toCategoryDTO(category);
  }

  ensureCategory(name) {
    const normalized = this._normalize(name);
    if (this.categories.has(normalized)) {
      return this._toCategoryDTO(this.categories.get(normalized));
    }
    return this.createCategory(name);
  }

  listNotes(filter = {}) {
    const { bookmarkId } = filter;
    return Array.from(this.notes.values())
      .filter((note) => !bookmarkId || note.bookmarkId === bookmarkId)
      .map((note) => this._toNoteDTO(note));
  }

  getNote(id) {
    const note = this.notes.get(id);
    return note ? this._toNoteDTO(note) : null;
  }

  createNote(data) {
    const id = uuidv4();
    const now = this._timestamp();
    const note = {
      id,
      content: data.content,
      bookmarkId: data.bookmarkId,
      createdAt: now,
      updatedAt: now
    };
    this.notes.set(id, note);

    if (note.bookmarkId && this.bookmarks.has(note.bookmarkId)) {
      const bookmark = this.bookmarks.get(note.bookmarkId);
      bookmark.noteIds.push(id);
      bookmark.updatedAt = now;
    }

    return this._toNoteDTO(note);
  }

  updateNote(id, data) {
    const note = this.notes.get(id);
    if (!note) {
      return null;
    }
    const now = this._timestamp();
    if (Object.prototype.hasOwnProperty.call(data, 'content')) {
      note.content = data.content;
    }
    note.updatedAt = now;
    return this._toNoteDTO(note);
  }

  deleteNote(id) {
    const note = this.notes.get(id);
    if (!note) {
      return false;
    }

    if (note.bookmarkId && this.bookmarks.has(note.bookmarkId)) {
      const bookmark = this.bookmarks.get(note.bookmarkId);
      bookmark.noteIds = bookmark.noteIds.filter((noteId) => noteId !== id);
      bookmark.updatedAt = this._timestamp();
    }

    this.notes.delete(id);
    return true;
  }

  listSnippets(filter = {}) {
    const { bookmarkId } = filter;
    return Array.from(this.snippets.values())
      .filter((snippet) => !bookmarkId || snippet.bookmarkId === bookmarkId)
      .map((snippet) => this._toSnippetDTO(snippet));
  }

  getSnippet(id) {
    const snippet = this.snippets.get(id);
    return snippet ? this._toSnippetDTO(snippet) : null;
  }

  createSnippet(data) {
    const id = uuidv4();
    const now = this._timestamp();
    const snippet = {
      id,
      code: data.code,
      language: data.language,
      description: data.description,
      bookmarkId: data.bookmarkId,
      createdAt: now,
      updatedAt: now
    };
    this.snippets.set(id, snippet);

    if (snippet.bookmarkId && this.bookmarks.has(snippet.bookmarkId)) {
      const bookmark = this.bookmarks.get(snippet.bookmarkId);
      bookmark.snippetIds.push(id);
      bookmark.updatedAt = now;
    }

    return this._toSnippetDTO(snippet);
  }

  updateSnippet(id, data) {
    const snippet = this.snippets.get(id);
    if (!snippet) {
      return null;
    }
    const now = this._timestamp();

    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      snippet.code = data.code;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'language')) {
      snippet.language = data.language;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      snippet.description = data.description;
    }

    snippet.updatedAt = now;

    return this._toSnippetDTO(snippet);
  }

  deleteSnippet(id) {
    const snippet = this.snippets.get(id);
    if (!snippet) {
      return false;
    }

    if (snippet.bookmarkId && this.bookmarks.has(snippet.bookmarkId)) {
      const bookmark = this.bookmarks.get(snippet.bookmarkId);
      bookmark.snippetIds = bookmark.snippetIds.filter(
        (snippetId) => snippetId !== id
      );
      bookmark.updatedAt = this._timestamp();
    }

    this.snippets.delete(id);
    return true;
  }
}

module.exports = {
  InMemoryRepository
};
