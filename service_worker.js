const CACHE_NAME = 'lipi-v1.1.3';

const APP_SHELL_ASSETS = [
    './manifest.json',
    './app/app.html',
    './app/css/main.css',
    './app/css/layout.css',
    './app/js/app.js',
    './app/js/sw-register.js',
    './app/icons/icon-192.png',
    './app/icons/icon-512.png',
    './app/icons/icon.png',
    './app/icons/icon.svg',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;700&family=Supermercado+One&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0',
    'https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js'
];

// --- SW Lifecycle: Install ---
self.addEventListener('install', (event) => {
    // console.log('[Service Worker] Installed.');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // console.log('[Service Worker] Caching App Shell...');
            // using map & catch so one failed file doesn't fail the whole cache
            return Promise.allSettled(
                APP_SHELL_ASSETS.map((url) => {
                    return fetch(url)
                        .then((response) => {
                            if (response.ok) {
                                return cache.put(url, response);
                            }
                        })
                        .catch((err) => {
                            // console.warn('[Service Worker] Failed to cache asset:', url, err);
                        });
                })
            );
        })
    );
    self.skipWaiting();
});

// --- SW Lifecycle: Activate ---
self.addEventListener('activate', (event) => {
    // console.log('[Service Worker] Activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        // console.log('[Service Worker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// --- Cache Management Message Handler ---
self.addEventListener('message', (event) => {
    if (!event.data || !event.data.type) return;

    if (event.data.type === 'PURGE_CACHE') {
        // console.log('[Service Worker] PURGE_CACHE triggered - Clearing all caches...');
        event.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(keys.map((key) => caches.delete(key)));
            }).then(() => {
                // console.log('[Service Worker] All caches purged.');
            })
        );
    }
});

// --- Fetch Handler ---
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    let pathname = url.pathname;
    if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }

    if (event.request.method === 'POST' && pathname.endsWith('/app/handle-share')) {
        event.respondWith((async () => {
            try {
                const formData = await event.request.formData();
                const files = formData.getAll('files');
                const shareId = `share-${Date.now()}`;
                const cache = await caches.open('lipi-shared-files');
                const fileMetadata = [];
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const cacheKey = `/shared-file/${shareId}/${i}`;
                    await cache.put(cacheKey, new Response(file, {
                        headers: {
                            'Content-Type': file.type,
                            'X-File-Name': encodeURIComponent(file.name)
                        }
                    }));
                    fileMetadata.push({
                        name: file.name,
                        url: cacheKey
                    });
                }
                
                await cache.put(`/shared-metadata/${shareId}`, new Response(JSON.stringify(fileMetadata), {
                    headers: { 'Content-Type': 'application/json' }
                }));

                const redirectUrl = new URL('app/app.html', self.registration.scope);
                redirectUrl.searchParams.set('shareId', shareId);
                return Response.redirect(redirectUrl.href, 303);
            } catch (e) {
                console.error('Error handling share target POST:', e);
                const redirectUrl = new URL('app/app.html', self.registration.scope);
                redirectUrl.searchParams.set('shareError', 'true');
                return Response.redirect(redirectUrl.href, 303);
            }
        })());
        return;
    }

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Ignore browser extension requests or non-http scheme requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version immediately, update in background if online (Stale-While-Revalidate)
                fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    })
                    .catch(() => { /* Silent network fail when offline */ });

                return cachedResponse;
            }

            // If not in cache, perform network request
            return fetch(event.request)
                .then((networkResponse) => {
                    return networkResponse;
                })
                .catch((err) => {
                    // If offline and request is for a navigation page, serve offline app shell
                    if (event.request.mode === 'navigate') {
                        return caches.match('./app/app.html').then(res => {
                            if (res) return res;
                            // Return a fallback 200 response to satisfy PWA install criteria before caching
                            return new Response(
                                '<!DOCTYPE html><html><head><title>Offline - Lipi</title></head><body><h1>Lipi Offline</h1><p>Please connect to the internet to load Lipi, or install it as an app.</p></body></html>',
                                { status: 200, headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                    }
                    throw err;
                });
        })
    );
});
