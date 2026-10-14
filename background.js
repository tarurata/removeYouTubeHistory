// Background script for YouTube History Remover

const HISTORY_URLS = [
  "https://myactivity.google.com/product/youtube",
  "https://www.youtube.com/feed/history"
];

// Start removal when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && HISTORY_URLS.some((url) => tab.url.startsWith(url))) {
    // Content script is already loaded on this page; tell it to start
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'startRemoval' });
      return;
    } catch (error) {
      // Content script not loaded yet (page opened before install); reload it
      chrome.tabs.reload(tab.id);
      return;
    }
  }

  // Not on a history page: open them (scripts start on load via autoStart)
  HISTORY_URLS.forEach((url) => chrome.tabs.create({ url }));
});

// Create context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openConfig',
    title: 'Open Configuration',
    contexts: ['action']
  });

  chrome.contextMenus.create({
    id: 'openHistoryPages',
    title: 'Open YouTube History Pages and Remove History',
    contexts: ['action']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openConfig') {
    chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
  } else if (info.menuItemId === 'openHistoryPages') {
    HISTORY_URLS.forEach((url) => chrome.tabs.create({ url }));
  }
});
