const API_BASE = "https://cardscout-backend-production.up.railway.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cardscout-search",
    title: "Search this card",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  console.log("Context info:", info); // See what you're getting

  if (info.menuItemId !== "cardscout-search") return;
  const imageUrl = info.srcUrl;

  // Show loading state
  chrome.storage.local.set({ imageUrl, status: "loading" });

  try {
    const res = await fetch(`${API_BASE}/openai-analyze-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl })
    });

    const data = await res.json();
    chrome.storage.local.set({ status: "done", data });
  } catch (e) {
    chrome.storage.local.set({ status: "error", error: e.message });
  }

  chrome.action.openPopup();
});
