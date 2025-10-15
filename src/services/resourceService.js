const {
  ValidationError,
  NotFoundError,
  ConflictError
} = require('../errors');
const {
  validateBookmarkCreate,
  validateBookmarkUpdate,
  validateTagPayload,
  validateNoteCreate,
  validateNoteUpdate,
  validateSnippetCreate,
  validateSnippetUpdate,
  validateSearchQuery,
  validateExportRequest
} = require('../validation');
const { toCSV } = require('../utils/csv');

class ResourceService {
  constructor(repository) {
    if (!repository) {
      throw new Error('Repository instance is required');
    }
    this.repository = repository;
  }

  _hydrateBookmark(bookmark) {
    if (!bookmark) {
      return null;
    }
    const notes = this.repository.listNotes({ bookmarkId: bookmark.id });
    const snippets = this.repository.listSnippets({ bookmarkId: bookmark.id });
    return {
      ...bookmark,
      notes,
      snippets
    };
  }

  listBookmarks() {
    return this.repository
      .listBookmarks()
      .map((bookmark) => this._hydrateBookmark(bookmark));
  }

  getBookmark(id) {
    if (!id) {
      throw new ValidationError('Bookmark identifier is required');
    }
    const bookmark = this.repository.getBookmark(id);
    if (!bookmark) {
      throw new NotFoundError('Bookmark', id);
    }
    return this._hydrateBookmark(bookmark);
  }

  createBookmark(payload) {
    const data = validateBookmarkCreate(payload);
    const created = this.repository.createBookmark(data);
    return this._hydrateBookmark(created);
  }

  updateBookmark(id, payload) {
    if (!id) {
      throw new ValidationError('Bookmark identifier is required');
    }
    const updateData = validateBookmarkUpdate(payload);
    const updated = this.repository.updateBookmark(id, updateData);
    if (!updated) {
      throw new NotFoundError('Bookmark', id);
    }
    return this._hydrateBookmark(updated);
  }

  deleteBookmark(id) {
    if (!id) {
      throw new ValidationError('Bookmark identifier is required');
    }
    const deleted = this.repository.deleteBookmark(id);
    if (!deleted) {
      throw new NotFoundError('Bookmark', id);
    }
    return { success: true };
  }

  listTags() {
    return this.repository.listTags();
  }

  createTag(payload) {
    const { name } = validateTagPayload(payload);
    const existing = this.repository.getTagByName(name);
    if (existing) {
      throw new ConflictError(`Tag '${name}' already exists`, existing);
    }
    const created = this.repository.createTag(name);
    if (!created) {
      throw new ConflictError(`Tag '${name}' already exists`);
    }
    return created;
  }

  listCategories() {
    return this.repository.listCategories();
  }

  listNotes(filter = {}) {
    const bookmarkId =
      typeof filter.bookmarkId === 'string'
        ? filter.bookmarkId.trim()
        : filter.bookmarkId ?? null;

    if (bookmarkId) {
      const bookmark = this.repository.getBookmark(bookmarkId);
      if (!bookmark) {
        throw new NotFoundError('Bookmark', bookmarkId);
      }
    }

    return this.repository.listNotes({
      bookmarkId: bookmarkId || undefined
    });
  }

  createNote(payload) {
    const data = validateNoteCreate(payload);

    if (data.bookmarkId) {
      const bookmark = this.repository.getBookmark(data.bookmarkId);
      if (!bookmark) {
        throw new NotFoundError('Bookmark', data.bookmarkId);
      }
    }

    return this.repository.createNote(data);
  }

  updateNote(id, payload) {
    if (!id) {
      throw new ValidationError('Note identifier is required');
    }
    const updateData = validateNoteUpdate(payload);
    const existing = this.repository.getNote(id);
    if (!existing) {
      throw new NotFoundError('Note', id);
    }
    return this.repository.updateNote(id, updateData);
  }

  deleteNote(id) {
    if (!id) {
      throw new ValidationError('Note identifier is required');
    }
    const deleted = this.repository.deleteNote(id);
    if (!deleted) {
      throw new NotFoundError('Note', id);
    }
    return { success: true };
  }

  listSnippets(filter = {}) {
    const bookmarkId =
      typeof filter.bookmarkId === 'string'
        ? filter.bookmarkId.trim()
        : filter.bookmarkId ?? null;

    if (bookmarkId) {
      const bookmark = this.repository.getBookmark(bookmarkId);
      if (!bookmark) {
        throw new NotFoundError('Bookmark', bookmarkId);
      }
    }

    return this.repository.listSnippets({
      bookmarkId: bookmarkId || undefined
    });
  }

  createSnippet(payload) {
    const data = validateSnippetCreate(payload);

    if (data.bookmarkId) {
      const bookmark = this.repository.getBookmark(data.bookmarkId);
      if (!bookmark) {
        throw new NotFoundError('Bookmark', data.bookmarkId);
      }
    }

    return this.repository.createSnippet(data);
  }

  updateSnippet(id, payload) {
    if (!id) {
      throw new ValidationError('Snippet identifier is required');
    }
    const updateData = validateSnippetUpdate(payload);
    const existing = this.repository.getSnippet(id);
    if (!existing) {
      throw new NotFoundError('Snippet', id);
    }
    return this.repository.updateSnippet(id, updateData);
  }

  deleteSnippet(id) {
    if (!id) {
      throw new ValidationError('Snippet identifier is required');
    }
    const deleted = this.repository.deleteSnippet(id);
    if (!deleted) {
      throw new NotFoundError('Snippet', id);
    }
    return { success: true };
  }

  search(query) {
    const normalized = validateSearchQuery(query);
    const needle = normalized.toLowerCase();

    const bookmarkResults = this.repository
      .listBookmarks()
      .filter((bookmark) => {
        return (
          bookmark.title.toLowerCase().includes(needle) ||
          bookmark.url.toLowerCase().includes(needle) ||
          (bookmark.description &&
            bookmark.description.toLowerCase().includes(needle)) ||
          bookmark.tags.some((tag) => tag.toLowerCase().includes(needle))
        );
      })
      .map((bookmark) => this._hydrateBookmark(bookmark));

    const noteResults = this.repository
      .listNotes()
      .filter((note) =>
        note.content && note.content.toLowerCase().includes(needle)
      );

    const snippetResults = this.repository
      .listSnippets()
      .filter((snippet) => {
        return (
          (snippet.code && snippet.code.toLowerCase().includes(needle)) ||
          (snippet.description &&
            snippet.description.toLowerCase().includes(needle)) ||
          (snippet.language &&
            snippet.language.toLowerCase().includes(needle))
        );
      });

    return {
      query: normalized,
      bookmarks: bookmarkResults,
      notes: noteResults,
      snippets: snippetResults
    };
  }

  exportData(resource, format = 'json') {
    const { resource: exportResource, format: exportFormat } =
      validateExportRequest(resource, format);

    let data;
    switch (exportResource) {
      case 'bookmarks':
        data = this.listBookmarks();
        break;
      case 'notes':
        data = this.listNotes();
        break;
      case 'snippets':
        data = this.listSnippets();
        break;
      case 'tags':
        data = this.listTags();
        break;
      case 'categories':
        data = this.listCategories();
        break;
      default:
        data = [];
    }

    if (exportFormat === 'json') {
      return {
        resource: exportResource,
        format: exportFormat,
        contentType: 'application/json',
        content: JSON.stringify(data, null, 2)
      };
    }

    const arrayData = Array.isArray(data) ? data : [data];

    return {
      resource: exportResource,
      format: exportFormat,
      contentType: 'text/csv',
      content: toCSV(arrayData)
    };
  }
}

module.exports = {
  ResourceService
};
