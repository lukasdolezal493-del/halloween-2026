const C="halloween-2026-v14";
const A=["./","./index.html","./style.css","./app.js","./fx.js","./extra.js","./noc-duchu.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./griffy0.woff2","./griffy1.woff2",
"./img/mapa.jpg","./img/zvonky.jpg","./img/mriz.jpg","./img/kopec.jpg","./img/hydrant.jpg","./img/truhla.jpg","./img/cedule.jpg","./img/kotlik.jpg","./img/monstra.jpg","./img/d_boo.jpg","./img/d_hroch.jpg","./img/d_sluzba.jpg","./img/d_pirat.jpg","./img/kontejner.jpg","./img/park8.jpg","./img/lavicky.jpg","./img/qr.png","./voice/zvonek.mp3","./voice/skret.mp3","./voice/kopec.mp3","./voice/trpaslik.mp3","./voice/truhla.mp3","./voice/cedule.mp3","./voice/kotlik.mp3","./voice/monstra.mp3","./voice/duch.mp3","./voice/hroch.mp3","./voice/zachranari.mp3","./voice/pirat.mp3","./voice/popelnice.mp3","./voice/parkoviste.mp3","./voice/vyti.mp3","./sfx/smich1.mp3","./sfx/smich2.mp3","./sfx/smich3.mp3","./sfx/sepot1.mp3","./sfx/sepot2.mp3","./sfx/sepot3.mp3","./sfx/sepot4.mp3"];
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
