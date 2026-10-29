"use strict";
// ---------- DATA ----------
const HESLO = "MLSKY";
const DEFAULT_TREASURE = { lat: 50.636021, lon: 15.708948 }; // oranzova bedna (Truhla)
const AGE = { s: "nejmenší", m: "prostřední", l: "nejstarší" };

const TASKS = [
  { id: "probuzeni", e: "🧟", title: "Probuzení strašidel", type: "profiles", pos: [50.636083, 15.708642] },
  { id: "zvonek", e: "🔔", title: "Strašidelný zvonek", img: "zvonky", pos: [50.636083, 15.708642],
    where: "U vchodu do chaty, vedle dveří.",
    story: "U dveří visí kouzelný zvonek. Duchové si podle něj počítají, kolik bytů dneska můžou strašit.",
    type: "answer", q: "Kolik je u dveří zvonkových tlačítek?", a: ["5"] },
  { id: "skret", e: "🕳️", title: "Kanálový skřet", img: "mriz", pos: [50.636152, 15.708506], letter: "M",
    where: "Kousek od vchodu, na kraji silnice u obrubníku.",
    story: "Pod železnou mříží bydlí kanálový skřet. Posviťte mu baterkou do pelechu, ať ví, že se nebojíte!",
    type: "photo", q: "Najděte mříž a vyfoťte ji." },
  { id: "kopec", e: "⛰️", title: "Ďáblův kopec", img: "kopec", pos: [50.636038, 15.708725],
    where: "Dopravní značky na trávníku u příjezdové cesty.",
    story: "Na trojúhelníkové značce je kopec. Po něm v noci sjíždějí kostlivci na saních.",
    type: "answer", q: "Kolik procent má kopec na značce?", a: ["10", "10%"] },
  { id: "trpaslik", e: "🧯", title: "Červený trpaslík", img: "hydrant", pos: [50.636026, 15.708928],
    where: "Na trávě vedle parkoviště stojí červený hydrant.",
    story: "Červený trpaslík s kovovou čepicí hlídá parkoviště. Pustí vás dál, jen když posílíte nohy!",
    type: "quota", q: "Udělejte dohromady 100 dřepů.", total: 100, min: { s: 20, m: 30, l: 40 }, unit: "dřepů" },
  { id: "truhla", e: "📦", title: "Tajemná truhla", img: "truhla", pos: [50.636021, 15.708948],
    where: "Oranžová bedna pod cedulí VÝJEZD.",
    story: "Tahle oranžová truhla vypadá podezřele... Co v ní asi je? Zapamatujte si ji dobře!",
    type: "photo", q: "Vyfoťte truhlu i s cedulí nad ní." },
  { id: "cedule", e: "🙃", title: "Cedule na hlavě", img: "cedule", pos: [50.636096, 15.708843],
    where: "U cesty kousek nad chatou, cedule na sloupku.",
    story: "Jedna cedule se tak lekla ducha, že se obrátila vzhůru nohama!",
    type: "answer", q: "Kolik minut tu smíš stát podle cedule?", a: ["10"] },
  { id: "kotlik", e: "🧪", title: "Kotlík čarodějnice", img: "kotlik", pos: [50.636314, 15.709069], letter: "L",
    where: "Betonový kruh v trávě u cesty nahoru.",
    story: "V tomhle kotlíku vaří čarodějnice lektvar. Aby se uvařil, musíte kolem něj pořádně skákat!",
    type: "quota", q: "Udělejte dohromady 60 výskoků.", total: 60, min: { s: 10, m: 15, l: 20 }, unit: "výskoků" },
  { id: "monstra", e: "👾", title: "Spící monstra", img: "monstra", pos: [50.637017, 15.708243], letter: "S",
    where: "Nahoře na velkém parkovišti pod sjezdovkou.",
    story: "Na kraji sjezdovky spí obří žlutá monstra. V zimě chrlí sníh! Potichu, ať je nevzbudíte...",
    type: "photo", q: "Po špičkách se připlížte a vyfoťte monstra." },
  { id: "duch", e: "👻", title: "Duch na sloupu", img: "d_boo", hint: true, pos: [50.636365, 15.708048],
    where: "Hledejte podle obrázku! Je to u sítě u hřiště, cestou dolů.",
    story: "Na jednom sloupu sedí opravdový duch. Najdete ho?",
    type: "photo", q: "Najděte ducha a vyfoťte se s ním." },
  { id: "hroch", e: "☕", title: "Hroch v hrnku", img: "d_hroch", hint: true, pos: [50.636488, 15.707422], letter: "K",
    where: "Hledejte podle obrázku! Je to vysoko na štítu dřevěného domu.",
    story: "Někde na domě se hroch koupe v obřím hrnku kafe. Posviťte nahoru!",
    type: "photo", q: "Najděte dům s hrochem a vyfoťte ho." },
  { id: "zachranari", e: "⛑️", title: "Horští záchranáři", img: "d_sluzba", hint: true, pos: [50.636613, 15.707165],
    where: "Hledejte podle obrázku! Znak visí na hnědém dřevěném domě.",
    story: "Horská služba zachraňuje lidi v horách. Každý záchranář musí být silný!",
    type: "quota", q: "Udělejte dohromady 30 kliků.", total: 30, min: { s: 5, m: 8, l: 10 }, unit: "kliků" },
  { id: "pirat", e: "🏴‍☠️", title: "Zelenovlasý chlapík", img: "d_pirat", hint: true, pos: [50.636613, 15.707175],
    where: "Hledejte podle obrázku! Malý dřevěný stánek hned vedle.",
    story: "Na ceduli jednoho stánku je namalovaný chlapík se zelenými vlasy.",
    type: "photo", q: "Najděte ho a vyfoťte ceduli." },
  { id: "popelnice", e: "🗑️", title: "Odpadkový troll", img: "kontejner", pos: [50.636261, 15.707465],
    where: "Velká černá popelnice u cesty pod kavárnou.",
    story: "V obří černé popelnici bydlí odpadkový troll. Ukažte mu, že se ho nebojíte!",
    type: "photo", q: "Postavte se k popelnici, udělejte strašidelný obličej a vyfoťte se." },
  { id: "parkoviste", e: "🅿️", title: "Parkoviště duchů", img: "park8", pos: [50.635928, 15.707495], letter: "Y",
    where: "Na kraji dolního parkoviště u lesa, modrá cedule na sloupu.",
    story: "Tady mají duchové vyhrazená místa pro svá strašidelná auta.",
    type: "answer", q: "Pro kolik aut je vyhrazené místo? (číslo na ceduli)", a: ["8", "8x"] },
  { id: "vyti", e: "🐺", title: "Vlčí vytí", img: "lavicky", pos: [50.636079, 15.708258],
    where: "Dřevěné lavičky před sítí hřiště.",
    story: "U laviček se o půlnoci scházejí vlkodlaci. Sedněte si a zavyjte na měsíc!",
    type: "photo", q: "Všichni si sedněte na lavičku, třikrát zavyjte a vyfoťte se. Dospělý řekne, jestli to bylo dost strašidelné!" }
];
const REVEAL = [5, 10, 0, 15, 6, 3, 12, 9, 1, 14, 7, 8, 2, 13, 4, 11]; // poradi odkryvani kousku mapy

const STICKERS = ["😈", "👹", "🎃", "👻", "🦇", "🕷️", "🕸️", "💀", "🧛", "🧙", "🦷", "👁️", "🔥", "⚡", "🌙", "🧟"];
const NAMES = {
  b: { t: ["Hrabě", "Baron", "Rytíř", "Strýček", "Princ", "Kapitán", "Mistr", "Vévoda", "Doktor"],
       n: ["Kostěj", "Drákulík", "Mlhoslav", "Chroust", "Netopýrek", "Bubák", "Šklebík", "Kostík", "Upírek", "Strašpytel", "Vlkodlak"],
       a: ["Chrastivý", "z Temné hory", "Půlnoční", "Křivý Zub", "Mlžný", "Kvílivý", "od Kanálu", "Bez hlavy", "Pavučinový", "Dýňový", "Hrozivý"] },
  g: { t: ["Hraběnka", "Baronka", "Kněžna", "Teta", "Princezna", "Čarodějka", "Paní", "Doktorka"],
       n: ["Bludička", "Mlhoslava", "Kostěnka", "Netopýrka", "Pavučinka", "Šklebína", "Upírka", "Čarymůra", "Vlkodlačka"],
       a: ["Chrastivá", "z Temné hory", "Půlnoční", "Mlžná", "Kvílivá", "Pavučinová", "Dýňová", "od Kanálu", "Hrozivá"] }
};

// ---------- STAV ----------
const KEY = "hw26";
let S = load();
function fresh() { return { kids: [], done: {}, letters: {}, quota: {}, pin: "5879", treasure: null, note: "", finished: false, scare: "obcas", voice: true, amb: true }; }
function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && j.kids) return Object.assign(fresh(), j); } catch (e) {}
  return fresh();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Telefon nemá místo na uložení!"); } }
function savePhoto(id, data) { try { localStorage.setItem("hw26p_" + id, data); } catch (e) { toast("Fotka se nevešla do paměti, ale úkol platí."); } }
function getPhoto(id) { try { return localStorage.getItem("hw26p_" + id); } catch (e) { return null; } }

// ---------- POMOCNICI ----------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let cur = "intro";
function go(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
  $("#s-" + name).classList.add("on");
  if (cur === "cam" && name !== "cam") stopCamView();
  if (cur === "task" && name !== "task") stopSpeak();
  if (cur === "hunt" && name !== "hunt") stopHunt();
  cur = name; window.scrollTo(0, 0);
  if (name === "main") renderMain();
  if (name === "map") { $("#mapscroll").classList.remove("zoom"); $("#b-zoom").textContent = "🔍 Přiblížit"; renderMap(); }
  if (name === "gallery") renderGallery();
  if (name === "profiles") renderKids();
  if (name === "diplom") renderDiplom();
}
document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
let toastT;
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3200); }
function vib(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
const doneCount = () => TASKS.filter(t => S.done[t.id]).length;
const curIndex = () => { const i = TASKS.findIndex(t => !S.done[t.id]); return i < 0 ? TASKS.length : i; };
const kidsSorted = () => S.kids.slice().sort((a, b) => "sml".indexOf(a.age) - "sml".indexOf(b.age));
// u otazek by fotka prozradila odpoved -> ukazat az po splneni
const showImg = t => t.img && (t.type !== "answer" || S.done[t.id]);
const kusu = n => n === 1 ? "kousek" : n >= 2 && n <= 4 ? "kousky" : "kousků";
const captainFor =i => { const k = kidsSorted(); return k.length ? k[i % k.length] : null; };

// ---------- ZVUKY ----------
let AC;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === "suspended") AC.resume(); return AC; }
function tone(f, t0, d, type, vol, f2) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(); o.type = type || "sine";
  o.frequency.setValueAtTime(f, a.currentTime + t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + t0 + d);
  g.gain.setValueAtTime(0.0001, a.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, a.currentTime + t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + d);
  o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + 0.05);
}
const sndWin = () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle", 0.25)); };
const sndBoo = () => { tone(220, 0, 1.2, "sawtooth", 0.08, 110); tone(330, 0.1, 1.1, "sine", 0.12, 160); };
const sndBad = () => { tone(300, 0, 0.25, "square", 0.08, 150); tone(200, 0.25, 0.35, "square", 0.08, 90); };
const sndTap = () => tone(880, 0, 0.06, "sine", 0.08);

// ---------- KAMERA + BATERKA ----------
let stream = null, facing = null, torchOn = false;
async function getCam(face) {
  if (stream && facing === face && stream.getVideoTracks()[0].readyState === "live") return stream;
  stopStream();
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: face }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
  facing = face;
  $("#torch-video").srcObject = stream;
  return stream;
}
function stopStream() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; facing = null; }
async function setTorch(on) {
  try {
    const tr = stream && stream.getVideoTracks()[0];
    const caps = tr && tr.getCapabilities ? tr.getCapabilities() : {};
    if (!caps.torch) return false;
    await tr.applyConstraints({ advanced: [{ torch: on }] });
    return true;
  } catch (e) { return false; }
}
function paintTorch() { $("#torch").classList.toggle("on", torchOn); }
$("#torch").onclick = async () => {
  ac();
  if (torchOn) {
    torchOn = false; paintTorch(); await setTorch(false);
    if (cur !== "cam" && cur !== "editor") stopStream();
    return;
  }
  try {
    if (facing !== "environment") await getCam("environment");
    const ok = await setTorch(true);
    if (ok) { torchOn = true; paintTorch(); vib(30); }
    else toast("Tady baterka z appky nejde. Zapni ji v horní liště telefonu.");
  } catch (e) { toast("Povol appce fotoaparát, jinak baterka nepůjde."); }
};
function grab(video, maxSide, mirror) {
  const w = video.videoWidth, h = video.videoHeight, k = Math.min(1, maxSide / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const x = c.getContext("2d"); if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
  x.drawImage(video, 0, 0, c.width, c.height); return c;
}

// fotak pro ukoly
let camDone = null, camShot = null;
async function openCam(cb) {
  camDone = cb; camShot = null; go("cam");
  $("#cam-preview").hidden = true; $("#cam-video").hidden = false; $("#cam-live").hidden = false; $("#cam-after").hidden = true;
  try {
    await getCam("environment");
    $("#cam-video").srcObject = stream;
    if (torchOn) setTorch(true);
  } catch (e) { toast("Povol appce fotoaparát (klepni na zámek vedle adresy)."); go("task"); }
}
function stopCamView() { $("#cam-video").srcObject = null; if (!torchOn) stopStream(); }
$("#cam-shot").onclick = () => {
  const v = $("#cam-video"); if (!v.videoWidth) return;
  camShot = grab(v, 900).toDataURL("image/jpeg", 0.62);
  $("#cam-preview").src = camShot; $("#cam-preview").hidden = false; $("#cam-video").hidden = true;
  $("#cam-live").hidden = true; $("#cam-after").hidden = false; sndTap(); vib(20);
};
$("#cam-again").onclick = () => { $("#cam-preview").hidden = true; $("#cam-video").hidden = false; $("#cam-live").hidden = false; $("#cam-after").hidden = true; };
$("#cam-cancel").onclick = () => go("task");
$("#cam-ok").onclick = () => { const cb = camDone, p = camShot; go("task"); cb && cb(p); };

// ---------- PIN ----------
let pinCb = null, pinVal = "";
function askPin(title, cb) {
  pinCb = cb; pinVal = ""; $("#pin-title").textContent = title || "Dospělý, potvrď PINem"; dots(); $("#pin").hidden = false;
}
function dots() { document.querySelectorAll("#pin-dots i").forEach((d, i) => d.classList.toggle("f", i < pinVal.length)); }
(function buildPad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  $("#pad").innerHTML = keys.map(k => k ? `<button data-k="${k}">${k}</button>` : "<span></span>").join("");
  $("#pad").onclick = e => {
    const k = e.target.dataset.k; if (!k) return; sndTap();
    if (k === "⌫") pinVal = pinVal.slice(0, -1); else if (pinVal.length < 4) pinVal += k;
    dots();
    if (pinVal.length === 4) {
      if (pinVal === S.pin) { $("#pin").hidden = true; const cb = pinCb; pinCb = null; setTimeout(() => cb && cb(), 50); }
      else { sndBad(); vib([60, 40, 60]); $("#pin-dots").classList.add("shake"); setTimeout(() => { $("#pin-dots").classList.remove("shake"); pinVal = ""; dots(); }, 450); }
    }
  };
})();
$("#pin-cancel").onclick = () => { $("#pin").hidden = true; pinCb = null; };

// ---------- ODZNAK ----------
let awardCb = null;
function award(t, cb) {
  S.done[t.id] = Date.now(); save();
  $("#aw-emoji").textContent = t.e;
  $("#aw-title").textContent = t.title;
  const n = doneCount();
  $("#aw-txt").innerHTML = n >= TASKS.length
    ? "Máte <b>všech 16 kousků mapy</b>! Otevřete mapu pokladu a zadejte tajné heslo."
    : `Odznak získán! Přibyl <b>${n}. kousek mapy</b> z 16.`;
  if (S.haunted && S.haunted[t.id]) $("#aw-txt").innerHTML += `<br><br>👀 Počkat… na vaší fotce je <b>něco divného</b>! Mrkněte do Úlovků.`;
  $("#award").hidden = false; sndWin(); vib([80, 60, 160]);
  awardCb = cb;
}
$("#aw-ok").onclick = () => { $("#award").hidden = true; const cb = awardCb; awardCb = null; cb ? cb() : go(doneCount() >= TASKS.length ? "map" : "main"); };

// ---------- UVOD + PROFILY ----------
$("#b-start").onclick = () => { ac(); sndBoo(); go(S.kids.length ? "main" : "profiles"); };
function renderKids() {
  $("#kid-list").innerHTML = S.kids.map((k, i) => `
    <div class="kid"><img src="${k.avatar}" alt="">
      <div><div class="nm">${esc(k.name)}</div><div class="ag">${AGE[k.age]}</div></div>
      <button class="btn ghost small" data-edit="${i}">Upravit</button></div>`).join("") ||
    `<p class="muted center">Zatím tu nikdo není. Přidej první strašidlo!</p>`;
  $("#kid-list").querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEditor(+b.dataset.edit));
  $("#b-profiles-done").disabled = S.kids.length < 1;
  $("#b-profiles-done").textContent = S.done.probuzeni ? "Hotovo ✔" : "Jdeme na to! 🎃";
}
$("#b-addkid").onclick = () => openEditor(-1);
$("#b-profiles-done").onclick = () => {
  if (!S.done.probuzeni) award(TASKS[0], () => go("main")); else go("main");
};

// editor
let ED = null; // {idx, photo(canvas), stickers:[{e,x,y,s}], sel, age, sex, name}
function rollName(sex) { const L = NAMES[sex || "b"], r = a => a[Math.floor(Math.random() * a.length)]; return `${r(L.t)} ${r(L.n)} ${r(L.a)}`; }
async function openEditor(idx) {
  const k = S.kids[idx];
  ED = { idx, photo: null, stickers: k ? JSON.parse(JSON.stringify(k.stickers || [])) : [], sel: -1,
    age: k ? k.age : (["s", "m", "l"].find(a => !S.kids.some(x => x.age === a)) || "m"),
    sex: k ? k.sex : "b", name: k ? k.name : "" };
  if (!ED.name) ED.name = rollName(ED.sex);
  $("#ed-title").textContent = k ? "Upravit strašidlo" : "Nové strašidlo";
  go("editor"); paintEdForm();
  if (k && k.raw) {
    const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 600; c.getContext("2d").drawImage(img, 0, 0, 600, 600); ED.photo = c; showEdit(); }; img.src = k.raw;
  } else startEdCam();
}
async function startEdCam() {
  $("#ed-cam").hidden = false; $("#ed-edit").hidden = true;
  try { if (torchOn) { torchOn = false; paintTorch(); } await getCam("user"); $("#ed-video").srcObject = stream; }
  catch (e) { toast("Povol appce fotoaparát."); }
}
$("#ed-shot").onclick = () => {
  const v = $("#ed-video"); if (!v.videoWidth) return;
  const s = Math.min(v.videoWidth, v.videoHeight), c = document.createElement("canvas"); c.width = c.height = 600;
  const x = c.getContext("2d"); x.translate(600, 0); x.scale(-1, 1);
  x.drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, 600, 600);
  ED.photo = c; $("#ed-video").srcObject = null; stopStream(); sndBoo(); vib(40); showEdit();
};
$("#ed-retake").onclick = startEdCam;
function spooky(src) { // horror filtr
  const c = document.createElement("canvas"); c.width = c.height = 600; const x = c.getContext("2d");
  x.drawImage(src, 0, 0); const d = x.getImageData(0, 0, 600, 600), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    let g = 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
    g = Math.max(0, Math.min(255, (g - 128) * 1.45 + 128)) / 255;
    const n = (Math.random() - 0.5) * 0.08; g = Math.max(0, Math.min(1, g + n));
    p[i] = 20 + g * 150; p[i + 1] = 8 + g * 235; p[i + 2] = 40 + g * 120; // zelenofialovy duotone
  }
  x.putImageData(d, 0, 0);
  return c;
}
function spookyOver() { // vineta + skrabance, kresli se az pres make-up, at splyne s fotkou
  const c = document.createElement("canvas"); c.width = c.height = 600; const x = c.getContext("2d");
  const rg = x.createRadialGradient(300, 280, 140, 300, 300, 330); rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(10,0,25,.92)");
  x.fillStyle = rg; x.fillRect(0, 0, 600, 600);
  x.strokeStyle = "rgba(255,255,255,.13)"; x.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) { x.beginPath(); const sx = Math.random() * 600; x.moveTo(sx, 0); x.lineTo(sx + (Math.random() - 0.5) * 60, 600); x.stroke(); }
  return c;
}
function showEdit() {
  $("#ed-cam").hidden = true; $("#ed-edit").hidden = false;
  ED.base = spooky(ED.photo); ED.over = spookyOver();
  paintStickers();
}
function composeEd(x, withEmoji) {
  x.globalCompositeOperation = "source-over"; x.drawImage(ED.base, 0, 0);
  ED.stickers.forEach(s => { if (s.f) drawItem(x, s, 600); });
  x.globalCompositeOperation = "source-over"; x.drawImage(ED.over, 0, 0);
  if (withEmoji) ED.stickers.forEach(s => { if (!s.f) drawItem(x, s, 600); });
}
let edRaf = 0;
function renderEd() { if (edRaf || !ED || !ED.base) return; edRaf = requestAnimationFrame(() => { edRaf = 0; composeEd($("#ed-canvas").getContext("2d"), false); }); }
// nahledy make-upu do tlacitek
$("#fxbar").innerHTML = Object.keys(FX).map(k => {
  const c = document.createElement("canvas"); c.width = c.height = 120; const x = c.getContext("2d");
  x.fillStyle = "#7fc48a"; x.fillRect(0, 0, 120, 120);
  drawItem(x, { f: k, x: 0.5, y: k === "zuby" || k === "krev" ? 0.3 : 0.5, s: k === "sroub" ? 0.75 : 0.85, seed: 7 }, 120);
  return `<button data-f="${k}"><img src="${c.toDataURL()}" alt=""><span>${FX[k].n}</span></button>`;
}).join("");
$("#fxbar").onclick = e => {
  const b = e.target.closest("button"); if (!b || !ED) return; const f = FX[b.dataset.f];
  ED.stickers.push({ f: b.dataset.f, x: f.x || 0.5, y: f.y || 0.5, s: f.s, r: 0, m: false, seed: 1 + Math.floor(Math.random() * 1e6) });
  ED.sel = ED.stickers.length - 1; sndTap(); paintStickers();
};
$("#stickbar").innerHTML = STICKERS.map(s => `<button data-s="${s}">${s}</button>`).join("");
$("#stickbar").onclick = e => {
  const s = e.target.closest("button"); if (!s || !ED) return;
  ED.stickers.push({ e: s.dataset.s, x: 0.5, y: 0.25 + Math.random() * 0.1, s: 0.22 }); ED.sel = ED.stickers.length - 1; sndTap(); paintStickers();
};
function paintStickers() {
  const box = $("#ed-stickers"), W = box.clientWidth || 340;
  const tf = s => `transform:translate(-50%,-50%) rotate(${s.r || 0}rad)${s.m ? " scaleX(-1)" : ""}`;
  const html = (s, i) => s.f
    ? `<div class="stk fxh${i === ED.sel ? " sel" : ""}" data-i="${i}" style="left:${s.x * 100}%;top:${s.y * 100}%;width:${s.s * W}px;height:${s.s * W * 0.6}px;${tf(s)}"></div>`
    : `<div class="stk${i === ED.sel ? " sel" : ""}" data-i="${i}" style="left:${s.x * 100}%;top:${s.y * 100}%;font-size:${s.s * W}px;${tf(s)}">${s.e}</div>`;
  // make-up pod nalepkami, at jdou nalepky chytit
  box.innerHTML = ED.stickers.map((s, i) => s.f ? html(s, i) : "").join("") + ED.stickers.map((s, i) => s.f ? "" : html(s, i)).join("");
  $("#ed-sizebar").hidden = ED.sel < 0;
  renderEd();
}
(function dragStickers() {
  const box = $("#ed-stickers"); let drag = -1;
  box.addEventListener("pointerdown", e => {
    const el = e.target.closest(".stk"); if (!el) { ED.sel = -1; paintStickers(); return; }
    drag = +el.dataset.i; ED.sel = drag; paintStickers(); box.setPointerCapture(e.pointerId); e.preventDefault();
  });
  box.addEventListener("pointermove", e => {
    if (drag < 0) return; const r = box.getBoundingClientRect();
    ED.stickers[drag].x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    ED.stickers[drag].y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    const el = box.querySelector(`[data-i="${drag}"]`); if (el) { el.style.left = ED.stickers[drag].x * 100 + "%"; el.style.top = ED.stickers[drag].y * 100 + "%"; }
    if (ED.stickers[drag].f) renderEd();
  });
  const end = () => drag = -1; box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
})();
$("#ed-bigger").onclick = () => { if (ED.sel >= 0) { ED.stickers[ED.sel].s = Math.min(1.2, ED.stickers[ED.sel].s * 1.2); paintStickers(); } };
$("#ed-smaller").onclick = () => { if (ED.sel >= 0) { ED.stickers[ED.sel].s = Math.max(0.06, ED.stickers[ED.sel].s / 1.2); paintStickers(); } };
$("#ed-rot").onclick = () => { if (ED.sel >= 0) { const s = ED.stickers[ED.sel]; s.r = (s.r || 0) + Math.PI / 12; paintStickers(); } };
$("#ed-flip").onclick = () => { if (ED.sel >= 0) { const s = ED.stickers[ED.sel]; s.m = !s.m; paintStickers(); } };
$("#ed-del").onclick = () => { if (ED.sel >= 0) { ED.stickers.splice(ED.sel, 1); ED.sel = -1; paintStickers(); } };
function paintEdForm() {
  document.querySelectorAll("#ed-age button").forEach(b => b.classList.toggle("on", b.dataset.a === ED.age));
  document.querySelectorAll("#ed-sex button").forEach(b => b.classList.toggle("on", b.dataset.s === ED.sex));
  $("#ed-name").textContent = ED.name;
}
$("#ed-age").onclick = e => { const b = e.target.closest("button"); if (b) { ED.age = b.dataset.a; paintEdForm(); } };
$("#ed-sex").onclick = e => { const b = e.target.closest("button"); if (b) { ED.sex = b.dataset.s; ED.name = rollName(ED.sex); paintEdForm(); } };
$("#ed-roll").onclick = () => { ED.name = rollName(ED.sex); sndTap(); paintEdForm(); };
$("#ed-cancel").onclick = () => { $("#ed-video").srcObject = null; stopStream(); go("profiles"); };
$("#ed-save").onclick = () => {
  if (!ED.photo) { toast("Nejdřív se vyfoť! 📸"); return; }
  const c = document.createElement("canvas"); c.width = c.height = 600; const x = c.getContext("2d");
  composeEd(x, true);
  const small = document.createElement("canvas"); small.width = small.height = 300; small.getContext("2d").drawImage(c, 0, 0, 300, 300);
  const raw = document.createElement("canvas"); raw.width = raw.height = 300; raw.getContext("2d").drawImage(ED.photo, 0, 0, 300, 300);
  const kid = { name: ED.name, age: ED.age, sex: ED.sex, stickers: ED.stickers, avatar: small.toDataURL("image/jpeg", 0.75), raw: raw.toDataURL("image/jpeg", 0.7) };
  if (ED.idx >= 0) S.kids[ED.idx] = kid; else S.kids.push(kid);
  save(); $("#ed-video").srcObject = null; stopStream(); morph(ED.photo, c, ED.name, () => go("profiles"));
};

// ---------- HLAVNI ----------
function renderMain() {
  $("#team").innerHTML = kidsSorted().map(k => `<img src="${k.avatar}" alt="${esc(k.name)}">`).join("");
  const n = doneCount(); $("#prog-bar").style.width = (n / TASKS.length * 100) + "%";
  $("#prog-txt").textContent = `${n} z ${TASKS.length} odznaků · ${n} ${kusu(n)} mapy`;
  const ci = curIndex();
  if (ci >= TASKS.length) {
    $("#next-card").innerHTML = `<div class="next center"><div class="tag">Všechny úkoly splněny!</div><h2>🗺️ Mapa je celá!</h2><p>Otevřete mapu a zadejte heslo ze svítících písmen.</p><button class="btn big" id="go-map2">Otevřít mapu</button></div>`;
    $("#go-map2").onclick = () => go("map");
  } else {
    const t = TASKS[ci], cap = captainFor(ci);
    $("#next-card").innerHTML = `<div class="next"><div class="tag">Úkol ${ci + 1} z ${TASKS.length}</div>
      <h2>${t.e} ${esc(t.title)}</h2>
      ${showImg(t) ? `<img class="place" src="img/${t.img}.jpg" alt="">` : ""}
      <p>📍 ${esc(t.where || "U chaty")}</p>
      ${cap ? `<div class="capt"><img src="${cap.avatar}" alt=""><div><small>Kapitán úkolu nese telefon</small>${esc(cap.name)}</div></div>` : ""}
      <button class="btn big" id="go-task">Jdeme na to!</button></div>`;
    $("#go-task").onclick = () => openTask(ci);
  }
  $("#task-list").innerHTML = TASKS.map((t, i) => {
    const d = S.done[t.id], c = i === ci, l = i > ci;
    return `<button class="tl ${d ? "done" : c ? "cur" : "lock"}" data-i="${i}" ${l ? "disabled" : ""}><span class="e">${l ? "🔒" : t.e}</span><span class="t">${esc(t.title)}</span><span>${d ? "✅" : c ? "👉" : ""}</span></button>`;
  }).join("");
  $("#task-list").querySelectorAll(".tl:not(.lock)").forEach(b => b.onclick = () => openTask(+b.dataset.i));
}
$("#b-map").onclick = () => go("map");
$("#b-gallery").onclick = () => go("gallery");
$("#g-show").onclick = () => startShow();
$("#g-dip").onclick = () => go("diplom");

// ---------- UKOL ----------
let TI = 0;
function openTask(i) {
  TI = i; const t = TASKS[i];
  if (t.type === "profiles") { go("profiles"); return; }
  go("task"); renderTask();
  if (S.voice && !S.done[t.id]) setTimeout(() => { if (cur === "task" && TI === i) speakTask(t); }, 350);
}
function renderTask() {
  const t = TASKS[TI], cap = captainFor(TI), done = S.done[t.id];
  let h = `<div class="task-hero"><div class="e">${t.e}</div><h2>${esc(t.title)}</h2></div>
    <button class="btn ghost small say" id="say">🔊 Přečíst nahlas</button>
    <p class="story">${esc(t.story)}</p>
    ${t.hint ? `<p class="muted small">🔎 Kde jsme tohle viděli?</p>` : ""}
    ${showImg(t) ? `<img class="hintimg" src="img/${t.img}.jpg" alt="">` : ""}
    <div class="where">📍<span>${esc(t.where)}</span></div>
    ${cap && !done ? `<div class="capt"><img src="${cap.avatar}" alt=""><div><small>Kapitán úkolu</small>${esc(cap.name)}</div></div>` : ""}`;
  if (done) {
    const ph = getPhoto(t.id);
    h += `<div class="donebox">✅ Splněno!${t.letter ? `<br>Svítící písmeno: <b style="font-size:28px">${t.letter}</b>` : ""}${ph ? `<img src="${ph}" alt="">` : ""}</div>`;
  } else if (t.letter && stepDone(t)) {
    h += letterHtml();
  } else {
    h += `<div class="q">${esc(t.q)}</div>`;
    if (t.type === "answer") h += `<input id="ans" inputmode="numeric" autocomplete="off" placeholder="?"><button class="btn big" id="chk">Zkontrolovat</button>`;
    if (t.type === "photo") h += (t.id === "vyti" ? howlHtml() : "") + `<button class="btn big" id="ph">📸 Vyfotit</button><p class="muted small center">Baterka 🔦 vpravo dole svítí i při focení.</p>`;
    if (t.type === "quota") h += quotaHtml(t);
  }
  $("#task-body").innerHTML = h;
  bindTask(t);
}
// ulozeny mezikrok: hlavni cast hotova, chybi pismeno
function stepDone(t) { return S.letters["step_" + t.id]; }
function finishMain(t) {
  if (t.letter) { S.letters["step_" + t.id] = 1; save(); sndWin(); vib(60); renderTask(); }
  else award(t);
}
function letterHtml() {
  return `<div class="letterbox"><h3>🔦 Svítící stopa!</h3>
    <p>Někde tady je schované <b>tajné písmeno</b>. Posviťte baterkou kolem sebe a najděte ho!</p>
    <input id="let" maxlength="1" autocomplete="off" autocapitalize="characters">
    <button class="btn" id="letok">Máme ho!</button>
    <button class="btn ghost small" id="letskip">Nemůžeme ho najít (dospělý)</button></div>`;
}
function bindTask(t) {
  $("#say").onclick = () => speakTask(t, true);
  const chk = $("#chk");
  if (chk) chk.onclick = () => {
    const v = $("#ans").value.trim().toLowerCase().replace(/\s/g, "");
    if (t.a.includes(v)) { finishMain(t); }
    else { sndBad(); vib([60, 40, 60]); $("#ans").classList.add("shake"); setTimeout(() => $("#ans").classList.remove("shake"), 450); toast("Brrr, to není ono. Podívejte se znovu!"); }
  };
  const ph = $("#ph");
  if (ph) ph.onclick = () => openCam(p => {
    if (!p) return;
    photoCheck(t, p);
  });
  const lo = $("#letok");
  if (lo) lo.onclick = () => {
    const v = $("#let").value.trim().toUpperCase();
    if (v === t.letter) { S.letters[t.id] = t.letter; save(); award(t); }
    else { sndBad(); vib([60, 40, 60]); toast(v ? "Tohle písmeno to není. Hledejte dál!" : "Napište písmeno, které jste našli."); }
  };
  const ls = $("#letskip");
  if (ls) ls.onclick = () => askPin("Dospělý: prozradit písmeno?", () => { S.letters[t.id] = t.letter; save(); toast("Písmeno je " + t.letter); award(t); });
  if (t.type === "quota" && !S.done[t.id] && !(t.letter && stepDone(t))) bindQuota(t);
  bindHowl();
}
// kvoty
function qget(t) { return S.quota[t.id] || (S.quota[t.id] = {}); }
function quotaHtml(t) {
  const q = qget(t);
  const rows = kidsSorted().map((k, i) => {
    const key = S.kids.indexOf(k), v = q[key] || 0, m = t.min[k.age] || 0;
    return `<div class="qrow"><img src="${k.avatar}" alt=""><div class="info"><div class="n">${esc(k.name)}</div><div class="m ${v >= m ? "ok" : ""}" data-m="${key}">minimum ${m} ${v >= m ? "✔" : ""}</div></div>
      <div class="ctl"><button data-k="${key}" data-d="-1">−1</button><div class="cnt" data-c="${key}">${v}</div><button class="plus" data-k="${key}" data-d="1">+1</button><button class="plus" data-k="${key}" data-d="5">+5</button></div></div>`;
  }).join("");
  return `<p class="muted small">Rozdělte si to, jak chcete. Každý ale musí udělat aspoň svoje minimum. Počítejte nahlas!</p>${rows}<div class="qsum" id="qsum"></div><button class="btn big" id="qok" disabled>Hotovo! (dospělý potvrdí)</button>`;
}
function qcheck(t) {
  const q = qget(t), ks = kidsSorted();
  const sum = ks.reduce((a, k) => a + (q[S.kids.indexOf(k)] || 0), 0);
  const mins = ks.every(k => (q[S.kids.indexOf(k)] || 0) >= (t.min[k.age] || 0));
  const ok = sum >= t.total && mins;
  const owe = ks.filter(k => (q[S.kids.indexOf(k)] || 0) < (t.min[k.age] || 0)).map(k => `${k.name.split(" ")[1] || k.name} ještě ${(t.min[k.age] || 0) - (q[S.kids.indexOf(k)] || 0)}`);
  $("#qsum").innerHTML = `Dohromady: ${sum} / ${t.total} ${t.unit}` + (owe.length && sum >= t.total ? `<div class="muted small">Minimum chybí: ${esc(owe.join(", "))}</div>` : ""); $("#qsum").classList.toggle("ok", ok);
  $("#qok").disabled = !ok; return ok;
}
function bindQuota(t) {
  qcheck(t);
  $("#task-body").querySelectorAll("button[data-k]").forEach(b => b.onclick = () => {
    const q = qget(t), k = +b.dataset.k, d = +b.dataset.d; q[k] = Math.max(0, (q[k] || 0) + d); save(); sndTap();
    $(`[data-c="${k}"]`).textContent = q[k];
    const kid = S.kids[k], m = t.min[kid.age] || 0, me = $(`[data-m="${k}"]`);
    me.textContent = `minimum ${m} ${q[k] >= m ? "✔" : ""}`; me.classList.toggle("ok", q[k] >= m);
    qcheck(t);
  });
  $("#qok").onclick = () => askPin("Dospělý: makali poctivě?", () => finishMain(t));
}

// ---------- MAPA ----------
const MAP = { w: 1044, h: 1058, lat0: 50.63725, lon0: 15.70665 }, N = 256 * Math.pow(2, 19);
function merc(lat, lon) { return [(lon + 180) / 360 * N, (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * N]; }
const ORG = merc(MAP.lat0, MAP.lon0);
function toPct(lat, lon) { const [x, y] = merc(lat, lon); return [(x - ORG[0]) / MAP.w * 100, (y - ORG[1]) / MAP.h * 100]; }
function fromPct(px, py) {
  const x = ORG[0] + px / 100 * MAP.w, y = ORG[1] + py / 100 * MAP.h;
  return { lon: x / N * 360 - 180, lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / N))) * 180 / Math.PI };
}
let picking = false;
function renderMap() {
  const n = doneCount(), all = n >= TASKS.length, open = new Set(REVEAL.slice(0, picking ? 16 : n));
  $("#map-fog").innerHTML = Array.from({ length: 16 }, (_, i) => `<div class="${open.has(i) ? "open" : ""}">?</div>`).join("");
  let mk = TASKS.filter(t => S.done[t.id] || picking).map(t => { const [x, y] = toPct(t.pos[0], t.pos[1]); return `<span class="mk" style="left:${x}%;top:${y}%">${t.e}</span>`; }).join("");
  const [cx, cy] = toPct(50.63600, 15.70868); mk += `<span class="mk lbl" style="left:${cx}%;top:${cy}%">🏠 chata</span>`;
  const tr = S.treasure || DEFAULT_TREASURE;
  if (S.finished || picking) { const [x, y] = toPct(tr.lat, tr.lon); mk += `<span class="mk x ${picking ? "edit" : ""}" style="left:${x}%;top:${y}%">X</span>`; }
  $("#map-marks").innerHTML = mk;
  $("#mapbox").classList.toggle("picking", picking);
  if (picking) {
    $("#map-title").textContent = "Schovat poklad"; $("#map-sub").textContent = "Klepni na mapu tam, kde budou mlsky. Pak dej Zpět.";
    $("#map-final").innerHTML = "";
    return;
  }
  $("#map-title").textContent = "Mapa pokladu";
  $("#map-sub").textContent = all ? "Mapa je celá! Zadejte heslo." : `Máte ${n} z 16 kousků. Plňte úkoly a mapa se poskládá.`;
  if (S.finished) {
    $("#map-sub").textContent = "Poklad je odemčený! Běžte k červenému X!";
    $("#map-final").innerHTML = `<div class="next center"><h2>💰 Poklad!</h2><p>Mlsky jsou schované u červeného <b>X</b>.</p>${S.note ? `<p class="q">${esc(S.note)}</p>` : ""}<p class="muted small">Posviťte si baterkou a hledejte!</p></div>
      <button class="btn big hunt-go" id="mf-hunt">🔥 Přihořívá – hledat poklad</button>
      <div class="row"><button class="btn" id="mf-dip">🏆 Diplom</button><button class="btn ghost" id="mf-show">🎬 Promítání</button></div>`;
    $("#mf-hunt").onclick = startHunt; $("#mf-dip").onclick = () => go("diplom"); $("#mf-show").onclick = startShow;
  } else if (all) {
    const got = TASKS.filter(t => t.letter).map(t => S.letters[t.id] || "_").join(" ");
    $("#map-final").innerHTML = `<div class="next center"><h3>🔒 Tajné heslo</h3><p>Svítící písmena, která jste našli:</p><div class="found">${got}</div>
      <div class="pw">${[0, 1, 2, 3, 4].map(i => `<input maxlength="1" data-p="${i}" autocapitalize="characters" autocomplete="off">`).join("")}</div>
      <button class="btn big" id="pw-ok">Odemknout poklad</button></div>`;
    const ins = [...document.querySelectorAll(".pw input")];
    ins.forEach((el, i) => el.oninput = () => { el.value = el.value.toUpperCase(); if (el.value && ins[i + 1]) ins[i + 1].focus(); });
    $("#pw-ok").onclick = () => {
      const v = ins.map(i => i.value.trim().toUpperCase()).join("");
      if (v === HESLO) { S.finished = true; S.endAt = Date.now(); save(); renderMap(); window.scrollTo(0, 0); finale(); }
      else { sndBad(); vib([60, 40, 60]); toast("Špatné heslo! Zkuste písmena poskládat správně."); }
    };
  } else $("#map-final").innerHTML = "";
}
$("#mapbox").onclick = e => {
  if (!picking) return;
  const r = $("#mapbox").getBoundingClientRect();
  S.treasure = fromPct((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); save(); sndTap(); renderMap();
};
$("#b-zoom").onclick = () => { const z = $("#mapscroll").classList.toggle("zoom"); $("#b-zoom").textContent = z ? "🔍 Oddálit" : "🔍 Přiblížit"; };

// ---------- GALERIE ----------
function renderGallery() {
  const items = TASKS.map(t => ({ t, p: getPhoto(t.id) })).filter(x => x.p);
  const kids = S.kids.map(k => `<figure><img src="${k.avatar}" alt=""><figcaption>${esc(k.name)}</figcaption></figure>`).join("");
  $("#gal").innerHTML = kids + items.map(x => `<figure><img src="${x.p}" alt=""><figcaption>${x.t.e} ${esc(x.t.title)}${S.haunted && S.haunted[x.t.id] ? " 👻?!" : ""}</figcaption></figure>`).join("");
  $("#g-dip").hidden = !S.finished;
}

// ---------- RODIC ----------
$("#b-parent").onclick = () => askPin("PIN strážce hry", () => { renderParent(); go("parent"); });
function renderParent() {
  const tr = S.treasure || DEFAULT_TREASURE;
  $("#p-treasure-txt").textContent = S.treasure ? "Poklad je schovaný tam, kde jsi klepnul na mapě." : "Zatím výchozí místo: oranžová bedna (Truhla) pod cedulí VÝJEZD.";
  $("#p-note").value = S.note || ""; paintFxSet();
  $("#p-cheat").innerHTML = `<div class="cheat">${TASKS.slice(1).map((t, i) => `<div>${i + 1}. ${t.e} <b>${esc(t.title)}</b>: ${t.type === "answer" ? "odpověď " + t.a[0] : t.type === "quota" ? t.total + " " + t.unit : "fotka"}${t.letter ? ` · písmeno <b>${t.letter}</b>` : ""}</div>`).join("")}<div>🔑 Heslo: <b>${HESLO}</b></div></div>`;
}
$("#p-note").oninput = e => { S.note = e.target.value; save(); };
$("#p-treasure").onclick = () => { picking = true; go("map"); };
$("#p-skip").onclick = () => {
  const ci = curIndex(); if (ci >= TASKS.length) { toast("Všechno je hotové."); return; }
  const t = TASKS[ci]; if (t.letter) S.letters[t.id] = t.letter;
  if (t.type === "profiles" && !S.kids.length) { toast("Nejdřív aspoň jedno strašidlo."); return; }
  award(t, () => go("main"));
};
$("#p-kids").onclick = () => go("profiles");
$("#p-pin").onclick = () => {
  const v = prompt("Nový čtyřmístný PIN:");
  if (v && /^\d{4}$/.test(v)) { S.pin = v; save(); toast("PIN změněn na " + v); } else if (v !== null) toast("PIN musí mít přesně 4 číslice.");
};
$("#p-update").onclick = async () => {
  try { const regs = await navigator.serviceWorker.getRegistrations(); for (const r of regs) await r.update(); } catch (e) {}
  toast("Stahuju novou verzi..."); setTimeout(() => location.reload(), 1200);
};
$("#p-reset").onclick = () => {
  if (!confirm("Opravdu smazat celou hru (strašidla, fotky, postup)?")) return;
  const pin = S.pin, tr = S.treasure, note = S.note, set = { scare: S.scare, voice: S.voice, amb: S.amb };
  try { Object.keys(localStorage).filter(k => k.startsWith("hw26")).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  S = fresh(); S.pin = pin; S.treasure = tr; S.note = note; Object.assign(S, set); save(); go("intro");
};
// tlacitko Zpet z vyberu pokladu
document.querySelector("#s-map .back").onclick = () => { if (picking) { picking = false; renderParent(); go("parent"); } else go("main"); };

// ---------- NETOPYRI ----------
(function bats() {
  const b = $("#bats");
  for (let i = 0; i < 5; i++) {
    const s = document.createElement("span"); s.textContent = "🦇";
    s.style.top = (5 + Math.random() * 70) + "%"; s.style.animationDuration = (14 + Math.random() * 16) + "s";
    s.style.animationDelay = (-Math.random() * 20) + "s"; s.style.fontSize = (16 + Math.random() * 18) + "px"; b.appendChild(s);
  }
})();

// ---------- START ----------
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
go(S.kids.length ? "main" : "intro");
