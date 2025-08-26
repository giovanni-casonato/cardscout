const cardImage = document.getElementById('card-image');
const cardInfo = document.getElementById('card-info');
const marketResults = document.getElementById('market-results');

async function init() {
  const { imageUrl, status, data, error } = await chrome.storage.local.get([
    'imageUrl',
    'status',
    'data',
    'error'
  ]);

  if (!imageUrl) {
    cardInfo.textContent = 'Right-click a card image to start.';
    return;
  }

  cardImage.src = imageUrl;

  if (status === 'loading') {
    cardInfo.textContent = 'Looking up card…';
    return;
  }

  if (status === 'error') {
    cardInfo.textContent = `Error: ${error}`;
    return;
  }

  // Get the 'Card' object
  const identity = data?.identity || {};
  const list = data?.pricing?.list || [];

  cardInfo.innerHTML = `
    <strong>${identity.canonical_name || 'Unknown Card'}</strong><br/>
    <em>${identity.set || ''} · ${identity.year || ''}</em><br/>
    <small>Query: ${data?.pricing?.query || ''}</small>
  `;

  marketResults.innerHTML = list.length
    ? list.map(p => `
        <div class="market">
          <strong>${p.source}</strong> — ${p.title || ''}<br/>
          Price: $${(p.price ?? 0).toFixed(2)}${p.shipping ? ` + $${p.shipping.toFixed(2)} ship` : ''}<br/>
          <a href="${p.item_link}" target="_blank" rel="noopener">View</a>
        </div>
      `).join("")
    : "<p>No prices found.</p>";
}

init();