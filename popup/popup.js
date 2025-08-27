const cardImage = document.getElementById('card-image');
const cardTitle = document.getElementById('card-title');
const rarityChip = document.getElementById('rarity-chip');
const cardInfo = document.getElementById('card-info');
const marketResults = document.getElementById('market-results');
const loadMoreBtn = document.getElementById('load-more');
const progressLabel = document.getElementById('progress-label');
const progressFill = document.getElementById('progress-fill');

let allPrices = [];
let visibleCount = 0;

function totalCost(p){ return Number(p.price||0) + Number(p.shipping||0); }
function medalClass(i){ return i===0?'gold':i===1?'silver':i===2?'bronze':''; }
function dealScore(p, min=5, max=1000){
  const t = Math.min(Math.max(totalCost(p), min), max);
  const s = 100 - ((t - min)/(max - min))*100;
  return Math.round(Math.max(0, Math.min(100, s)));
}
function iconFor(src){
  // Tiny inline SVGs—keeps it dependency-free
  const ebay = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9Zm9-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z"/></svg>`;
  const tcg  = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 14l10 5 10-5-10-5Z"/></svg>`;
  return src?.toLowerCase().includes('ebay') ? ebay : tcg;
}

async function init(){
  const { imageUrl, status, data, error } = await chrome.storage.local.get([
    'imageUrl','status','data','error'
  ]);

  if (!imageUrl){ cardInfo.textContent='Right-click a card image to start.'; return; }
  cardImage.src = imageUrl;

  if (status==='loading'){ cardInfo.textContent='Looking up card…'; return; }
  if (status==='error'){ cardInfo.textContent=`Error: ${error}`; return; }

  const identity = data?.identity || {};
  allPrices = (data?.pricing?.list || []).slice();

  // Sort cheapest first
  allPrices.sort((a,b)=> totalCost(a)-totalCost(b));

  // Title + chip
  cardTitle.textContent = identity.canonical_name || 'Unknown Card';
  const chip = identity.variant || (identity.grading && identity.grading!=='raw' ? identity.grading : '');
  if (chip){ rarityChip.style.display='inline-block'; rarityChip.textContent=chip; }
  else { rarityChip.style.display='none'; }

  // Meta
  cardInfo.innerHTML = `
    <em>${identity.set || ''} · ${identity.year || ''}</em><br/>
    <small style="color:#8ea4d8">Query: ${data?.pricing?.query || ''}</small>
  `;

  // Show 3, then +5
  visibleCount = Math.min(3, allPrices.length);
  render();
}

function render(){
  const slice = allPrices.slice(0, visibleCount);
  const total = allPrices.length;

  // Progress HUD
  progressLabel.textContent = `Showing ${slice.length} of ${total}`;
  progressFill.style.width = total ? `${Math.round((slice.length/total)*100)}%` : '0%';

  // Items
  marketResults.innerHTML = slice.length ? slice.map((p, i)=>{
    const totalUSD = totalCost(p).toFixed(2);
    const score = dealScore(p);
    const m = medalClass(i);
    const medal = m ? `<span class="badge ${m}">${i===0?'🥇':i===1?'🥈':'🥉'}</span>` : '';
    return `
      <div class="market">
        <div class="row">
          <span class="src">${iconFor(p.source)} ${p.source}</span>
          <span class="badges">${medal}<span class="badge score">Score ${score}</span></span>
        </div>
        <div class="title">${p.title || ''}</div>
        <div class="price">
          <strong>$${(p.price??0).toFixed(2)}</strong>${p.shipping?` + $${p.shipping.toFixed(2)} ship`:''}
          <small> · $${totalUSD} total · <a href="${p.item_link}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;">View</a></small>
        </div>
      </div>
    `;
  }).join('') : '<p style="color:#8ea4d8">No prices found.</p>';

  // Pagination
  if (visibleCount < total){
    const step = Math.min(5, total - visibleCount);
    loadMoreBtn.style.display='block';
    loadMoreBtn.textContent = `+${step} more deals`;
    loadMoreBtn.onclick = ()=>{ visibleCount = Math.min(total, visibleCount + 5); render(); };
  } else {
    loadMoreBtn.style.display='none';
  }
}

init();
