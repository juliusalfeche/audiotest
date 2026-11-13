'use strict';

// Change this number whenever you publish an update.
const CACHE_NAME = 'audio-test-v3';

// Relative paths so it works under /audiotest/ on GitHub Pages.
const APP_FILES = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/js/script.js',
    './assets/icons/icon.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/icon-maskable-512.png',
    './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Online: always fetch the newest files and refresh the cache.
// Offline: fall back to the saved copy.
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then((cached) =>
                    cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
                )
            )
    );
});
