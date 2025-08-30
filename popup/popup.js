const cardImage     = document.getElementById('card-image');
const cardTitle     = document.getElementById('card-title');
const rarityChip    = document.getElementById('rarity-chip');
const cardInfo      = document.getElementById('card-info');
const marketResults = document.getElementById('market-results');
const loadMoreBtn   = document.getElementById('load-more');
const progressLabel = document.getElementById('progress-label');
const progressFill  = document.getElementById('progress-fill');

let allPrices = [];
let visibleCount = 0;

function totalCost(p){ return Number(p.price||0) + Number(p.shipping||0); }
function medalClass(i){ return i===0?'gold':i===1?'silver':i===2?'bronze':''; }
function iconFor(src){
  const ebay = `<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Zm9-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z"/></svg>`;
  const tcg  = `<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 14l10 5 10-5-10-5Z"/></svg>`;
  return (src || '').toLowerCase().includes('ebay') ? ebay : tcg;
}

function render(state){
  const { imageUrl, status, data, error } = state || {};

  if (!imageUrl){
    cardInfo.textContent = 'Right-click a card image to start.';
    return;
  }
  cardImage.src = imageUrl;

  if (status === 'loading'){
    cardInfo.textContent = 'Looking up card…';
    return;
  }
  if (status === 'error'){
    cardInfo.textContent = `Error: ${error}`;
    return;
  }

  const identity = data?.identity || {};
  allPrices = Array.isArray(data?.pricing?.list) ? data.pricing.list.slice() : [];
  allPrices.sort((a,b)=> totalCost(a)-totalCost(b));

  cardTitle.textContent = identity.canonical_name || 'Unknown Card';
  const chip = identity.variant || (identity.grading && identity.grading !== 'raw' ? identity.grading : '');
  if (chip){ rarityChip.style.display='inline-block'; rarityChip.textContent=chip; }
  else { rarityChip.style.display='none'; }

  cardInfo.innerHTML = `
    <em>${identity.set || ''} · ${identity.year || ''}</em><br/>
    <small style="color:#8ea4d8">Query: ${data?.pricing?.query || ''}</small>
  `;

  visibleCount = Math.min(3, allPrices.length);
  renderPrices();
}

function renderPrices(){
  const slice = allPrices.slice(0, visibleCount);
  const total = allPrices.length;

  progressLabel.textContent = `Showing ${slice.length} of ${total}`;
  progressFill.style.width = total ? `${Math.round((slice.length/total)*100)}%` : '0%';

  marketResults.innerHTML = slice.length ? slice.map((p,i)=>{
    const totalUSD = totalCost(p).toFixed(2);
    const m = medalClass(i);
    const medal = m ? `<span class="badge ${m}">${i===0?'🥇':i===1?'🥈':'🥉'}</span>` : '';
    return `
      <div class="market">
        <a class="stretched-link" href="${p.item_link}" target="_blank" rel="noopener"></a>
        <div class="row">
          <span class="src">${iconFor(p.source)} ${p.source}</span>
          <span class="badges">${medal}</span>
        </div>
        <div class="title">${p.title || ''}</div>
        <div class="price">
          <strong>$${(p.price??0).toFixed(2)}</strong>${p.shipping?` + $${p.shipping.toFixed(2)} ship`:''}
          <small> · $${totalUSD} total</small>
        </div>
      </div>
    `;
  }).join('') : '<p style="color:#8ea4d8">No prices found.</p>';

  if (visibleCount < total){
    const step = Math.min(5, total - visibleCount);
    loadMoreBtn.style.display='block';
    loadMoreBtn.textContent = `+${step} more deals`;
  } else {
    loadMoreBtn.style.display='none';
  }
}

loadMoreBtn.addEventListener('click', () => {
  visibleCount = Math.min(allPrices.length, visibleCount + 5);
  renderPrices();
});

// Initial render when popup opens
chrome.storage.local.get(['imageUrl','status','data','error']).then(render);

// Live update if background changes state while popup is open
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  chrome.storage.local.get(['imageUrl','status','data','error']).then(render);
});
