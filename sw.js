const CACHE='krtw-2026-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const req=e.request; if(req.method!=='GET')return;
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(isHTML){
    // network-first: always get the latest itinerary when online, fall back to cache offline
    e.respondWith(fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;})
      .catch(()=>caches.match(req).then(h=>h||caches.match('./index.html'))));
  } else {
    // cache-first for images/fonts/icons: fast + offline, they don't change
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
      return res;})));
  }
});
