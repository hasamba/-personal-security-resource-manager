const { ValidationError } = require('../errors');

function ensureObject(payload, entity) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError(`${entity} payload must be an object`);
  }
}

function ensureNonEmptyString(value, field) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} is required`);
  }
  return trimmed;
}

function ensureOptionalString(value, field) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  return value.trim() || null;
}

function ensureUrl(value, field) {
  const urlString = ensureNonEmptyString(value, field);
  try {
    const parsed = new URL(urlString);
    if (!parsed.protocol || !parsed.hostname) {
      throw new Error('Invalid URL');
    }
    return parsed.toString();
  } catch (error) {
    throw new ValidationError(`${field} must be a valid URL`);
  }
}

function ensureTags(value) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new ValidationError('tags must be an array of strings');
  }
  const sanitized = value
    .map((tag) => ensureNonEmptyString(tag, 'tag name'))
    .map((tag) => tag.trim());
  return Array.from(new Set(sanitized));
}

function ensureOptionalIdentifier(value, field) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} must be a non-empty string`);
  }
  return trimmed;
}

function validateBookmarkCreate(payload) {
  ensureObject(payload, 'Bookmark');

  const title = ensureNonEmptyString(payload.title, 'title');
  const url = ensureUrl(payload.url, 'url');
  const description = ensureOptionalString(payload.description, 'description');
  const tags = ensureTags(payload.tags);
  const category = ensureOptionalString(payload.category, 'category');

  return {
    title,
    url,
    description,
    tags,
    category
  };
}

function validateBookmarkUpdate(payload) {
  ensureObject(payload, 'Bookmark update');
  const keys = Object.keys(payload || {});
  if (keys.length === 0) {
    throw new ValidationError('Bookmark update payload cannot be empty');
  }

  const update = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    update.title = ensureNonEmptyString(payload.title, 'title');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'url')) {
    update.url = ensureUrl(payload.url, 'url');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    update.description = ensureOptionalString(payload.description, 'description');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'tags')) {
    update.tags = ensureTags(payload.tags);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
    update.category = ensureOptionalString(payload.category, 'category');
  }

  return update;
}

function validateTagPayload(payload) {
  if (typeof payload === 'string') {
    return { name: ensureNonEmptyString(payload, 'tag name') };
  }
  ensureObject(payload, 'Tag');
  return {
    name: ensureNonEmptyString(payload.name, 'tag name')
  };
}

function validateNoteCreate(payload) {
  ensureObject(payload, 'Note');
  const content = ensureNonEmptyString(payload.content, 'content');
  const bookmarkId = ensureOptionalIdentifier(payload.bookmarkId, 'bookmarkId');

  return {
    content,
    bookmarkId
  };
}

function validateNoteUpdate(payload) {
  ensureObject(payload, 'Note update');
  const keys = Object.keys(payload || {});
  if (keys.length === 0) {
    throw new ValidationError('Note update payload cannot be empty');
  }

  const update = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'content')) {
    update.content = ensureNonEmptyString(payload.content, 'content');
  }

  return update;
}

function validateSnippetCreate(payload) {
  ensureObject(payload, 'Snippet');
  const code = ensureNonEmptyString(payload.code, 'code');
  const language = ensureOptionalString(payload.language, 'language');
  const description = ensureOptionalString(payload.description, 'description');
  const bookmarkId = ensureOptionalIdentifier(payload.bookmarkId, 'bookmarkId');

  return {
    code,
    language,
    description,
    bookmarkId
  };
}

function validateSnippetUpdate(payload) {
  ensureObject(payload, 'Snippet update');
  const keys = Object.keys(payload || {});
  if (keys.length === 0) {
    throw new ValidationError('Snippet update payload cannot be empty');
  }

  const update = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'code')) {
    update.code = ensureNonEmptyString(payload.code, 'code');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'language')) {
    update.language = ensureOptionalString(payload.language, 'language');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    update.description = ensureOptionalString(payload.description, 'description');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'bookmarkId')) {
    update.bookmarkId = ensureOptionalIdentifier(payload.bookmarkId, 'bookmarkId');
  }

  return update;
}

function validateSearchQuery(query) {
  if (typeof query !== 'string') {
    throw new ValidationError('Search query must be a string');
  }
  const trimmed = query.trim();
  if (!trimmed) {
    throw new ValidationError('Search query cannot be empty');
  }
  return trimmed;
}

function validateExportRequest(resource, format = 'json') {
  const allowedResources = ['bookmarks', 'notes', 'snippets', 'tags', 'categories'];
  if (!allowedResources.includes(resource)) {
    throw new ValidationError(`Unsupported export resource '${resource}'`);
  }

  const allowedFormats = ['json', 'csv'];
  const normalizedFormat = (format || 'json').toLowerCase();

  if (!allowedFormats.includes(normalizedFormat)) {
    throw new ValidationError(`Unsupported export format '${format}'`);
  }

  return {
    resource,
    format: normalizedFormat
  };
}

module.exports = {
  validateBookmarkCreate,
  validateBookmarkUpdate,
  validateTagPayload,
  validateNoteCreate,
  validateNoteUpdate,
  validateSnippetCreate,
  validateSnippetUpdate,
  validateSearchQuery,
  validateExportRequest
};
