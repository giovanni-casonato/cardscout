const API_BASE = "https://cardscout-backend-production.up.railway.app";

async function ensureContextMenu() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create(
        { id: "omnidex-search", title: "Search with OmniDex", contexts: ["image"] },
        () => { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message); resolve(); }
      );
    });
  });
}
chrome.runtime.onInstalled.addListener(ensureContextMenu);
chrome.runtime.onStartup.addListener(ensureContextMenu);
ensureContextMenu(); // once when the worker wakes

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
