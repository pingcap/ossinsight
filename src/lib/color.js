
export function getRandomColor() {
  const r = Math.floor(Math.random() * 255).toString(16);
  const g = Math.floor(Math.random() * 255).toString(16)
  const b = Math.floor(Math.random() * 255).toString(16)
  return `#${r}${g}${b}`;
}
