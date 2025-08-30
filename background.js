const API_BASE = "https://cardscout-backend-production.up.railway.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "omnidex-search",
    title: "Search with OmniDex",
    contexts: ["image"]
  });
});

// Small helper to store state and make sure popup sees it
async function setState(obj) {
  return chrome.storage.local.set(obj);
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "omnidex-search") return;

  const imageUrl = info.srcUrl || "";

  // Show loading state immediately
  await setState({ imageUrl, status: "loading", data: null, error: null });
  try { await chrome.action.openPopup(); } catch {}

  try {
    const res = await fetch(`${API_BASE}/openai-analyze-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl })
    });

    const data = await res.json();
    await setState({ status: "done", data, error: null });

    try { await chrome.action.openPopup(); } catch {} // Open Popup
  } catch (e) {
    await chrome.storage.local.set({ status: "error", error: String(e.message || e) });
  }
});
