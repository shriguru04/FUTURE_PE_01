// Immutable deep set: setIn(obj, ['services', 0, 'name'], 'x')
export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[head] = setIn(obj?.[head], rest, value);
  return copy;
}
