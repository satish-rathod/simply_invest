// Service Worker for Simply Invest PWA
const CACHE_NAME = 'simply-invest-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses for portfolio, market data
          if (response.ok && (
            event.request.url.includes('/api/portfolio') ||
            event.request.url.includes('/api/stocks') ||
            event.request.url.includes('/api/realtime')
          )) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(event.request);
        })
    );
  } else {
    // Handle static resources
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
        .catch(() => {
          // Fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'portfolio-sync') {
    event.waitUntil(syncPortfolioData());
  }
  if (event.tag === 'alerts-sync') {
    event.waitUntil(syncAlerts());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 'default'
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/logo192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/logo192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/alerts')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (experimental)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'portfolio-update') {
    event.waitUntil(updatePortfolioData());
  }
});

// Helper functions
async function syncPortfolioData() {
  try {
    // Sync any pending portfolio changes
    console.log('Syncing portfolio data...');
    // Implementation would go here
  } catch (error) {
    console.error('Portfolio sync failed:', error);
  }
}

async function syncAlerts() {
  try {
    // Sync any pending alerts
    console.log('Syncing alerts...');
    // Implementation would go here
  } catch (error) {
    console.error('Alerts sync failed:', error);
  }
}

async function updatePortfolioData() {
  try {
    // Update portfolio data in the background
    console.log('Updating portfolio data...');
    // Implementation would go here
  } catch (error) {
    console.error('Portfolio update failed:', error);
  }
}