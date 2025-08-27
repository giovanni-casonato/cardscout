const cardImage = document.getElementById('card-image');
const cardTitle = document.getElementById('card-title');
const cardInfo = document.getElementById('card-info');
const marketResults = document.getElementById('market-results');
const loadMoreBtn = document.getElementById('load-more');

let allPrices = [];
let visibleCount = 0;

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

  const identity = data?.identity || {};
  allPrices = data?.pricing?.list || [];

  cardTitle.textContent = identity.canonical_name || 'Unknown Card';

  cardInfo.innerHTML = `
    <em>${identity.set || ''} · ${identity.year || ''}</em><br/>
    <small>Query: ${data?.pricing?.query || ''}</small>
  `;

  visibleCount = 3; // show 3 to start
  renderPrices();
}

function renderPrices() {
  const slice = allPrices.slice(0, visibleCount);
  marketResults.innerHTML = slice.length
    ? slice.map(p => `
        <div class="market">
          <strong>${p.source}</strong> — ${p.title || ''}<br/>
          Price: $${(p.price ?? 0).toFixed(2)}${p.shipping ? ` + $${p.shipping.toFixed(2)} ship` : ''}<br/>
          <a href="${p.item_link}" target="_blank" rel="noopener">View</a>
        </div>
      `).join("")
    : "<p>No prices found.</p>";

  if (allPrices.length > visibleCount) {
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.onclick = () => {
      visibleCount += 5; // 👈 show 5 more each click
      renderPrices();
    };
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

init();
