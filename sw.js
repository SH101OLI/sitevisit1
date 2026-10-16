// Offline cache for the Igloo Site Visit app. Bump VERSION when index.html changes.
const VERSION='sv-v7';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Sign-in and OneDrive calls always go to the network.
  if(/login\.microsoftonline|graph\.microsoft/.test(u.host))return;
  if(u.origin===location.origin){
    // App files: network first so updates arrive, cache when offline.
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c));return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))));
  }else if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c));return res;})));
  }
});
