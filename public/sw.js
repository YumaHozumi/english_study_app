/// <reference lib="webworker" />

// Service Worker for English Study App PWA
// Handles push notifications and offline caching

const SW_VERSION = '1.0.0';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker v' + SW_VERSION);
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker v' + SW_VERSION);
    event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    let data = {
        title: '📚 English Study App',
        body: '今日の復習があります！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        url: '/study',
    };

    // Try to parse push data
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
            url: data.url,
            dateOfArrival: Date.now(),
        },
        actions: [
            {
                action: 'open',
                title: '復習する',
            },
            {
                action: 'close',
                title: '後で',
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/study';

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open a new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
