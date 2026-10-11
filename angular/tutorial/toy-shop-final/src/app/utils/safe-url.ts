// The login page gets "where to go next" from the address bar (?returnUrl=...).
// Anybody can type anything there, so we only accept a path INSIDE our own shop.
// "/cart" is fine. "https://evil.example" and "//evil.example" are not.
export function safeReturnUrl(url: string | null | undefined): string {
  if (!url) return '/';
  const isInsideTheShop = url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  return isInsideTheShop ? url : '/';
}
