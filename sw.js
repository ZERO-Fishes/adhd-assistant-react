const CACHE_NAME = 'adhd-assistant-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/dataManager.js',
  '/js/timer.js',
  '/js/taskChain.js',
  '/js/ui.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，返回缓存版本
        if (response) {
          return response;
        }
        // 否则从网络获取
        return fetch(event.request);
      }
    )
  );
});
