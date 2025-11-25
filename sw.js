/* --- Global Variables and Constants --- */
const CACHE_NAME = 'audio-test-pwa-v1';
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icon-192.png',
    'icon-512.png'
];

/* --- Service Worker Events --- */

// Install Event (Caching the App Shell)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache, adding app shell assets.');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate Event (Cleaning up old caches)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event (Cache-First Strategy)
self.addEventListener('fetch', event => {
    // We only want to cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request);
            })
    );
});