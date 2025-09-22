import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Return a simplified token for lenient matching
export function normalizeIngredient(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(whole|sliced|diced|fillet|filet|fresh|freshly|white|mixed|large|small)\b/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');
}

// Lenient match: returns true when tokens overlap or one contains the other
export function ingredientMatches(a, b) {
  const na = normalizeIngredient(a);
  const nb = normalizeIngredient(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na) || na.split(' ').some(t => nb.includes(t)) || nb.split(' ').some(t => na.includes(t));
}
