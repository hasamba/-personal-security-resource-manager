import { getEnvConfig } from '@monorepo/shared';

const config = getEnvConfig();

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  console.log('API Base URL:', config.API_BASE_URL);
});

browser.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === 'GET_CONFIG') {
    return Promise.resolve({ config });
  }
  return Promise.resolve();
});

browser.bookmarks.onCreated.addListener((id, bookmark) => {
  console.log('Bookmark created:', id, bookmark);
});
