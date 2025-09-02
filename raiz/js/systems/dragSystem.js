// Sistema responsável por criar elementos arrastáveis.
// Retorna uma lista/estado dos itens.
export function createDragSystem(scene, itemsData) {
  // Placeholder simples
  const items = itemsData.map((d, i) => ({ id: i, data: d, placed: false }));
  // TODO: criar sprites e habilitar input.setDraggable
  return items;
}
