const input = document.getElementById("searchInput");
const cardsWrap = document.getElementById("cards");
const cards = cardsWrap ? Array.from(cardsWrap.querySelectorAll("[data-name]")) : [];
const empty = document.getElementById("empty");
const countLine = document.getElementById("countLine");

function normalize(s) {
  return (s || "").toString().trim().toLowerCase();
}

function applyFilter(q) {
  const query = normalize(q);
  let visible = 0;

  cards.forEach((card) => {
    const haystack = [
      card.dataset.name,
      card.dataset.city,
      card.dataset.styles,
    ].join(" ").toLowerCase(); // ✅ important

    const match = query === "" || haystack.includes(query);
    card.hidden = !match;
    if (match) visible++;
  });

  if (countLine) countLine.textContent = String(visible);
  if (empty) empty.hidden = visible !== 0;
}

if (input) {
  input.addEventListener("input", () => applyFilter(input.value));
  applyFilter(input.value);
}
