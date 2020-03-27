/*
 * const CACHE = {
 *     key_prefix: "string",
 *     key: "string",
 *     files ["array of string"]
 * }
 * */

const _cache = Object.assign({}, CACHE)

const _cacheKey = _cache["key_prefix"] + "-" + _cache["key"]
const _cachePrefix = _cache["key_prefix"]
const _cacheFiles = _cache["files"]

self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(_cacheKey)
            .then(cache => {
                return cache.addAll(_cacheFiles);
            })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.resolve(
                cacheNames
                    .filter(cacheName => {
                        return cacheName != _cacheKey && cacheName.startsWith(_cachePrefix);
                    }).map(cacheName => {
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.open(_cacheKey)
            .then(cache => {
                return cache.match(event.request);
            })
            .then(cacheResponse => {
                return cacheResponse || fetch(event.request)
            })
    );
});
