chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cardscout-search",
    title: "Search this card",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "cardscout-search") {
    await chrome.storage.local.set({ imageUrl: info.srcUrl });
    chrome.action.openPopup();
  }
});
