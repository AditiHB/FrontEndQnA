// Extra headers added to EVERY answer the server gives.
export const baseHeaders = {
  'Cache-Control': 'no-store', // while developing, never reuse an old copy of a file

  // Content Security Policy: a rulebook for what this page may load and run.
  'Content-Security-Policy': [
    "default-src 'self'", // by default, only load things from our own site
    "script-src 'self'", // scripts only from our own FILES: no inline <script>, no onerror="..."
    "style-src 'self'", // styles only from our own files
    "img-src 'self' data:", // images from our site (and tiny data: icons)
    "connect-src 'self'", // fetch() only to our own site
    "worker-src 'self'", // Web Workers only from our own files
    "base-uri 'none'", // nobody can change where relative links point
    "form-action 'self'", // forms may only send data to our own site
    "frame-ancestors 'none'", // nobody may put our page inside their frame (clickjacking)
  ].join('; '),

  'X-Content-Type-Options': 'nosniff', // browsers must not guess a file's type
  'Referrer-Policy': 'no-referrer', // do not tell other sites where the visitor came from
};
