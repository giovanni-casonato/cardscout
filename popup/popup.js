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
  const cardObj = data.records?.[0]?._objects?.find(obj => obj.name === "Card");
  const match = cardObj?._identification?.best_match;
  const priceList = match?.pricing?.list || [];

  cardInfo.innerHTML = `
    <strong>${match?.full_name || 'Unknown Card'}</strong><br/>
    <em>${match?.set || ''} · ${match?.year || ''}</em>
  `;

  marketResults.innerHTML = priceList.length
    ? priceList
        .map(p => `
          <div class="market">
            <strong>${p.source}</strong><br/>
            Price: ${p.price} ${p.currency}<br/>
            <a href="${p.item_link}" target="_blank">View</a>
          </div>
        `)
        .join('')
    : '<p>No prices found.</p>';
}

init();