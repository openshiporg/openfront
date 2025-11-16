export function formatStoreName(name: string): { first: string; second?: string } {
  const parts = name.split(' ');
  if (parts.length === 1) {
    return { first: parts[0] };
  }
  return {
    first: parts.slice(0, -1).join(' '),
    second: parts[parts.length - 1],
  };
}
