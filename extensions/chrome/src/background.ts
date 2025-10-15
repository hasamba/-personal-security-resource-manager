import { getEnvConfig } from '@monorepo/shared';

const config = getEnvConfig();

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  console.log('API Base URL:', config.API_BASE_URL);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CONFIG') {
    sendResponse({ config });
  }
  return true;
});

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  console.log('Bookmark created:', id, bookmark);
});
