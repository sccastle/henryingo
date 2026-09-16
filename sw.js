/* Henryingo 离线缓存
   改版本号就会触发更新：换了 index.html 之后把 CACHE 改成新的名字即可 */
const CACHE = "henryingo-v8";
const FILES = [
  "./",
  "./index.html",
  "./assets.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-192.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())     // 某个文件缺失也不要卡住安装
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // DeepSeek 之类的外部请求一律直连，不进缓存
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 先给缓存里的，同时后台悄悄更新
  e.respondWith(
    caches.match(req).then(hit => {
      const live = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || live;
    })
  );
});
