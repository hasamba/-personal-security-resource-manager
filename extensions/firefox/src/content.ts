console.log('Content script loaded for:', window.location.href);

browser.runtime.sendMessage({ type: 'GET_CONFIG' }).then((response) => {
  console.log('Config received:', response);
});
