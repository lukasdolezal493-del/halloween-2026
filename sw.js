const C="halloween-2026-v1";
const A=["./","./index.html","./style.css","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./griffy0.woff2","./griffy1.woff2",
"./img/mapa.jpg","./img/zvonky.jpg","./img/mriz.jpg","./img/kopec.jpg","./img/hydrant.jpg","./img/truhla.jpg","./img/cedule.jpg","./img/kotlik.jpg","./img/monstra.jpg","./img/d_boo.jpg","./img/d_hroch.jpg","./img/d_sluzba.jpg","./img/d_pirat.jpg","./img/kontejner.jpg","./img/park8.jpg","./img/lavicky.jpg"];
// cache:"reload" = stahnout ze site, ne ze stare pameti prohlizece
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(new URL(e.request.url).origin!==self.location.origin)return;
  // vse: nejdriv internet (cerstva verze), bez signalu ulozena kopie
  e.respondWith(fetch(e.request,{cache:"no-cache"}).then(resp=>{
    if(resp.ok){const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));}
    return resp;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"))));
});
