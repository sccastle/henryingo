/* Henryingo v20: phonics study cards. */
const PREFIX="henryingo-";
const CACHE="henryingo-v20-phonics-"+encodeURIComponent(self.registration.scope);
const FILES=["./","./index.html","./assets.js","./manifest.json","./icon-192.png","./icon-512.png","./icon-maskable-192.png","./icon-maskable-512.png"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:"reload"})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&(key==="henryingo-v18"||key.endsWith(encodeURIComponent(self.registration.scope))&&key.startsWith(PREFIX))).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 // Fresh pages online; a complete cached copy when offline.
 if(req.mode==="navigate"){
  event.respondWith(fetch(req).then(res=>{
   if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
   return res;
  }).catch(async()=>await caches.match(req)||await caches.match(new URL("./index.html",self.registration.scope))||Response.error()));return;
 }
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const hit=await cache.match(req);if(hit)return hit;
  const res=await fetch(req);if(res.ok)await cache.put(req,res.clone());return res;
 }));
});
