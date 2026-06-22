// Minimal service worker. Its only job is to make the app installable
// (Android Chrome requires a registered SW with a fetch handler before it
// will offer "Add to Home Screen"). It passes every request straight through
// to the network — no offline caching, nothing to invalidate.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // No-op fetch handler — required for installability; lets the browser handle
  // the request normally.
});
