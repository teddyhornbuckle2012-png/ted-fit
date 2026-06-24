export function registerSW() {
  if (typeof window === 'undefined') return;

  // vite-plugin-pwa injects this virtual module at build time
  // We use dynamic import to avoid TypeScript errors in dev mode
  import('virtual:pwa-register')
    .then(({ registerSW: vitePwaRegisterSW }) => {
      vitePwaRegisterSW({
        onNeedRefresh() {
          console.log('[Forge SW] New content available. Refresh to update.');
        },
        onOfflineReady() {
          console.log('[Forge SW] App is ready to work offline.');
        },
      });
    })
    .catch(() => {
      console.log('[Forge SW] PWA virtual module not available (expected in dev)');
    });
}
