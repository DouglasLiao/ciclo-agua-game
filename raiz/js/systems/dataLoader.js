// Carrega dados JSON do jogo usando fetch.
export async function loadGameData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
  return res.json();
}
