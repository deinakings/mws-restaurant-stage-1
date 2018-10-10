/**
 * Service Worker code.
 */
const imageCacheName = 'mws-restaurant-images-v1';
const cacheName = 'mws-restaurant-v1';
const cacheUrls = [
    '/',
    '/restaurant.html',
    '/css/styles.css',
    '/js/core.js',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/data/restaurants.json',
    // leaflet
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            // add page resources to the cache on Service worker install.
            .then(cache => cache.addAll(cacheUrls))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    // delete old caches
                    keys
                        .filter(key => {
                            return key.startsWith('mws-restaurant') &&
                                key !== cacheName &&
                                key !== imageCacheName;
                        })
                        .map(key => caches.delete(key))
                );
            })
    );
});


self.addEventListener('fetch', event => {
    var requestUrl = new URL(event.request.url);

    // if an image is not in the cache fetch it and cache it.
    if (isImage(requestUrl.pathname)) {
            event.respondWith(
                caches.match(event.request)
                    .then(response => response || addToImageCache(event.request))
            );
    }
    else if (requestUrl.pathname === '/restaurant.html') {
        event.respondWith(
            caches.match(requestUrl.pathname)
                .then(response => response || fetch(requestUrl.pathname))
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});

self.addEventListener('message', event => {
    // if we recive a message from the user to update the app
    // we skipWaiting to activate the new service worker.
    if (event.data && event.data.skipWaiting) {
        self.skipWaiting();
    }
});

/**
 * Adds an image to the image cache.
 * @param {object} request - the request object.
 * @resturn Promise
 */
addToImageCache = request => {
    return caches.open(imageCacheName)
        .then(cache => {
            return fetch(request).then(response => {
                cache.put(request.url, response.clone());
                return response;
            });
        });
};

/**
 * Checks if the url is for an image.
 * @param {string} url - the url.
 * @returns boolean
 */
isImage = url => {
    return url.endsWith('.jpg') ||
    url.endsWith('.jpg70') ||
    url.endsWith('.png');
};
