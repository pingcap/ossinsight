const m = new Map();



export default function loadEndpoint(name) {
  return m.get(name)();
}

export function hasEndpoint(name) {
  return m.has(name);
}
