/**
 * Format store name for display with X logic
 * If the name has exactly 2 words, insert X between them
 * Otherwise, display as-is
 */
export function formatStoreName(name: string): { first: string; second?: string } {
  if (!name) return { first: 'Store' };
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 2) {
    return { first: words[0], second: words[1] };
  }
  
  return { first: name };
}