const cardImage = document.getElementById("card-image");
const cardInfo = document.getElementById("card-info");
const marketResults = document.getElementById("market-results");

async function init() {
  const { imageUrl } = await chrome.storage.local.get("imageUrl");
  if (!imageUrl) {
    cardInfo.textContent = "No image selected.";
    return;
  }

  cardImage.src = imageUrl;

  // FAKE card data
  const fakeCard = {
    name: "2020 Topps Chrome Shohei Ohtani #123",
    variant: "Refractor",
    prices: [
      { market: "eBay", low: "$14.50", median: "$17.00", url: "https://ebay.com" },
      { market: "COMC", low: "$15.00", median: "$18.25", url: "https://comc.com" },
      { market: "TCGPlayer", low: "$13.75", median: "$16.50", url: "https://tcgplayer.com" }
    ]
  };

  cardInfo.innerHTML = `
    <strong>${fakeCard.name}</strong><br />
    <em>${fakeCard.variant}</em>
  `;

  marketResults.innerHTML = fakeCard.prices.map(p =>
    `<div class="market">
      <strong>${p.market}</strong><br />
      Low: ${p.low} · Median: ${p.median}<br />
      <a href="${p.url}" target="_blank">View</a>
    </div>`
  ).join('');
}

init();
