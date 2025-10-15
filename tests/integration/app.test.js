const request = require('supertest');
const { createApp } = require('../../src/app');
const { InMemoryRepository } = require('../../src/data/inMemoryRepository');
const { ResourceService } = require('../../src/services/resourceService');

describe('Application integration tests', () => {
  let app;
  let repository;
  let service;

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new ResourceService(repository);
    app = createApp(service);
  });

  test('creates and retrieves a bookmark with tags and category metadata', async () => {
    const createResponse = await request(app)
      .post('/bookmarks')
      .send({
        title: 'Example Resource',
        url: 'https://example.com',
        tags: ['Tech', 'JavaScript'],
        category: 'Reading',
        description: 'A useful example'
      })
      .expect(201);

    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.tags).toEqual(['Tech', 'JavaScript']);
    expect(createResponse.body.category).toBe('Reading');
    expect(createResponse.body.notes).toEqual([]);
    expect(createResponse.body.snippets).toEqual([]);

    const bookmarkId = createResponse.body.id;

    const getResponse = await request(app)
      .get(`/bookmarks/${bookmarkId}`)
      .expect(200);

    expect(getResponse.body.title).toBe('Example Resource');
    expect(getResponse.body.notes).toHaveLength(0);
    expect(getResponse.body.snippets).toHaveLength(0);

    const tagsResponse = await request(app).get('/tags').expect(200);
    expect(tagsResponse.body.map((tag) => tag.name)).toEqual([
      'JavaScript',
      'Tech'
    ]);

    const categoriesResponse = await request(app)
      .get('/categories')
      .expect(200);
    expect(categoriesResponse.body.map((category) => category.name)).toEqual([
      'Reading'
    ]);
  });

  test('rejects invalid bookmark payloads', async () => {
    const response = await request(app)
      .post('/bookmarks')
      .send({
        title: '',
        url: 'invalid-url'
      })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  test('creates notes and snippets associated to a bookmark', async () => {
    const { body: bookmark } = await request(app)
      .post('/bookmarks')
      .send({
        title: 'Notes Target',
        url: 'https://example.org/notes',
        tags: ['Docs'],
        category: 'Work'
      })
      .expect(201);

    const noteResponse = await request(app)
      .post('/notes')
      .send({
        content: 'Remember to review this resource',
        bookmarkId: bookmark.id
      })
      .expect(201);

    expect(noteResponse.body.bookmarkId).toBe(bookmark.id);

    const snippetResponse = await request(app)
      .post('/snippets')
      .send({
        code: 'console.log("hello world");',
        language: 'javascript',
        description: 'Friendly greeting',
        bookmarkId: bookmark.id
      })
      .expect(201);

    expect(snippetResponse.body.bookmarkId).toBe(bookmark.id);

    const bookmarkResponse = await request(app)
      .get(`/bookmarks/${bookmark.id}`)
      .expect(200);

    expect(bookmarkResponse.body.notes).toHaveLength(1);
    expect(bookmarkResponse.body.snippets).toHaveLength(1);

    const filteredNotes = await request(app)
      .get('/notes')
      .query({ bookmarkId: bookmark.id })
      .expect(200);
    expect(filteredNotes.body).toHaveLength(1);

    const filteredSnippets = await request(app)
      .get('/snippets')
      .query({ bookmarkId: bookmark.id })
      .expect(200);
    expect(filteredSnippets.body).toHaveLength(1);
  });

  test('performs search across bookmarks, notes, and snippets', async () => {
    const { body: bookmark } = await request(app)
      .post('/bookmarks')
      .send({
        title: 'Searchable Bookmark',
        url: 'https://example.dev/search',
        description: 'Contains special keyword',
        tags: ['Search'],
        category: 'Research'
      })
      .expect(201);

    const { body: note } = await request(app)
      .post('/notes')
      .send({
        content: 'This note references the searchable keyword',
        bookmarkId: bookmark.id
      })
      .expect(201);

    const { body: snippet } = await request(app)
      .post('/snippets')
      .send({
        code: 'const keyword = true;',
        language: 'javascript',
        description: 'Snippet with keyword search'
      })
      .expect(201);

    const searchResponse = await request(app)
      .get('/search')
      .query({ q: 'keyword' })
      .expect(200);

    expect(searchResponse.body.bookmarks.map((b) => b.id)).toContain(
      bookmark.id
    );
    expect(searchResponse.body.notes.map((n) => n.id)).toContain(note.id);
    expect(searchResponse.body.snippets.map((s) => s.id)).toContain(
      snippet.id
    );
  });

  test('exports bookmark data in JSON and CSV formats', async () => {
    await request(app)
      .post('/bookmarks')
      .send({
        title: 'Exportable Resource',
        url: 'https://export.example',
        tags: ['Export'],
        category: 'Archive'
      })
      .expect(201);

    const jsonExport = await request(app).get('/export/bookmarks').expect(200);
    expect(jsonExport.headers['content-type']).toContain('application/json');
    const jsonPayload = JSON.parse(jsonExport.text);
    expect(Array.isArray(jsonPayload)).toBe(true);
    expect(jsonPayload).toHaveLength(1);

    const csvExport = await request(app)
      .get('/export/bookmarks')
      .query({ format: 'csv' })
      .expect(200);
    expect(csvExport.headers['content-type']).toContain('text/csv');
    expect(csvExport.text).toContain('Exportable Resource');
  });
});
