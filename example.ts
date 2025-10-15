import { initializeDatabase, DatabaseAccessLayer } from './src/index.js';

const db = initializeDatabase('example.db');
const dal = new DatabaseAccessLayer(db);

console.log('=== Bookmarks Manager Example ===\n');

console.log('1. Creating a bookmark...');
const bookmark = dal.bookmarks.create({
  title: 'OWASP Top 10 Web Application Security Risks',
  url: 'https://owasp.org/www-project-top-ten/',
  description: 'The OWASP Top 10 is a standard awareness document for developers and web application security'
});
console.log(`   Created bookmark: ${bookmark.title}\n`);

console.log('2. Adding to predefined category...');
const webSecurityCategory = dal.categories.getByName('Web Security');
if (webSecurityCategory) {
  dal.bookmarks.addCategory(bookmark.id, webSecurityCategory.id);
  console.log(`   Added to category: ${webSecurityCategory.name}\n`);
}

console.log('3. Creating a tag...');
const tag = dal.tags.create({ name: 'owasp', color: '#FF5733' });
dal.bookmarks.addTag(bookmark.id, tag.id);
console.log(`   Created and added tag: ${tag.name}\n`);

console.log('4. Adding a note...');
const note = dal.notes.create({
  bookmark_id: bookmark.id,
  content: 'Must review this regularly. The top 10 list includes: Injection, Broken Authentication, Sensitive Data Exposure, XML External Entities, Broken Access Control, Security Misconfiguration, Cross-Site Scripting, Insecure Deserialization, Using Components with Known Vulnerabilities, and Insufficient Logging & Monitoring.'
});
console.log(`   Added note with ${note.content.length} characters\n`);

console.log('5. Adding a code snippet...');
const snippet = dal.codeSnippets.create({
  bookmark_id: bookmark.id,
  language: 'javascript',
  code: `// XSS Prevention Example
const DOMPurify = require('dompurify');
const cleanHTML = DOMPurify.sanitize(userInput);
document.getElementById('output').innerHTML = cleanHTML;`,
  description: 'Example of preventing XSS attacks using DOMPurify'
});
console.log(`   Added ${snippet.language} code snippet\n`);

console.log('6. Creating another bookmark for search demo...');
dal.bookmarks.create({
  title: 'SQL Injection Prevention Guide',
  url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
  description: 'Comprehensive guide on preventing SQL injection attacks using prepared statements and parameterized queries'
});

console.log('7. Performing full-text search...');
console.log('   Searching for "injection"...');
const searchResults = dal.search.searchAll('injection', 10);
console.log(`   Found ${searchResults.length} results:`);
searchResults.forEach((result, index) => {
  console.log(`   ${index + 1}. [${result.type}] ${result.title || 'Untitled'}`);
  if (result.snippet) {
    console.log(`      Snippet: ${result.snippet.substring(0, 60)}...`);
  }
});

console.log('\n8. Listing all predefined security categories...');
const categories = dal.categories.getPredefined();
console.log(`   Found ${categories.length} predefined categories:`);
categories.slice(0, 5).forEach((cat) => {
  console.log(`   - ${cat.name}`);
});
console.log(`   ... and ${categories.length - 5} more\n`);

console.log('9. Getting bookmarks by category...');
const webSecurityBookmarks = webSecurityCategory ? dal.bookmarks.getByCategory(webSecurityCategory.id) : [];
console.log(`   Web Security category has ${webSecurityBookmarks.length} bookmark(s)\n`);

console.log('=== Example Complete ===');
console.log('Database saved to: example.db');

db.close();
