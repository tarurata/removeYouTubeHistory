chrome.action.onClicked.addListener((tab) => {
  const urlsToOpen = [
    "https://myactivity.google.com/product/youtube?hl=en&utm_medium=web&utm_source=youtube",
    "https://www.youtube.com/feed/history"
  ];

  urlsToOpen.forEach((url) => {
    chrome.tabs.create({ url: url }, (newTab) => {
      const scriptFile = url.includes("youtube") ? "removeHistoryInActivity.js" : "removeHistoryInFeed.js";
      
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        files: [scriptFile]
      });
    });
  });
});
