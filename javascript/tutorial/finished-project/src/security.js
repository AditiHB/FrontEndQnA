// Turn text into HTML-safe text. Use it on the rare day you MUST build an HTML string.
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Only allow real web addresses. Anything else (javascript:, data:, nonsense) becomes null.
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Merge `source` INTO a copy of `target`, deeply, but refuse the keys that can poison every object.
export function safeMerge(target, source) {
  const result = structuredClone(target);
  for (const [key, value] of Object.entries(source)) {
    if (dangerousKeys.has(key)) continue;
    result[key] =
      isPlainObject(value) && isPlainObject(result[key]) ? safeMerge(result[key], value) : value;
  }
  return result;
}
