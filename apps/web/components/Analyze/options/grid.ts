export function topBottomLayoutGrid() {
  return [
    { id: 'main', left: 8, right: 8, top: 64, bottom: 48, containLabel: true },
    { id: 'vs', left: 8, right: 8, top: '55%', bottom: 48, containLabel: true },
  ];
}

export function leftRightLayoutGrid() {
  return [
    { id: 'main', left: 8, right: '52%', top: 64, bottom: 48, containLabel: true },
    { id: 'vs', left: '52%', right: 8, top: 64, bottom: 48, containLabel: true },
  ];
}
