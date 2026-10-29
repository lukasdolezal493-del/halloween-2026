"use strict";
// Vylepseni verze 7: promena, duch ve fotkach, finale + diplom + promitani, lekacky, cteni nahlas, zvuky v pozadi.
// Napojeno z app.js (sdileny globalni prostor): morph(), hauntPhoto(), finale(), renderDiplom(), startShow(), speakTask().

const rand = (a, b) => a + Math.random() * (b - a);

// ---------- ZVUKY NAVIC ----------
function noise(sec) {
  const a = ac(); if (!a) return null;
  const b = a.createBuffer(1, Math.floor(a.sampleRate * sec), a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function sndThunder(vol) {
  const a = ac(); if (!a) return; const t = a.currentTime;
  [[0, 2.6, 420, vol || 0.9], [0.35, 3.2, 180, (vol || 0.9) * 0.8]].forEach(([d, len, f, v]) => {
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noise(len); fl.type = "lowpass"; fl.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(v, t + d + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d + len);
    s.connect(fl); fl.connect(g); g.connect(a.destination); s.start(t + d); s.stop(t + d + len);
  });
}
function sndScream() {
  const a = ac(); if (!a) return; const t = a.currentTime;
  const o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), g = a.createGain();
  o.type = "sawtooth"; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.25); o.frequency.exponentialRampToValueAtTime(260, t + 1.1);
  lfo.frequency.value = 11; lg.gain.value = 60; lfo.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
  o.connect(g); g.connect(a.destination); o.start(t); lfo.start(t); o.stop(t + 1.2); lfo.stop(t + 1.2);
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g2 = a.createGain();
  s.buffer = noise(0.6); fl.type = "highpass"; fl.frequency.value = 1500;
  g2.gain.setValueAtTime(0.3, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  s.connect(fl); fl.connect(g2); g2.connect(a.destination); s.start(t);
}

// ---------- KRESLENY DUCH (fotky + lekacky) ----------
// kind 0 = duch v prosteradle, 1 = bledy oblicej ve tme; cx,cy = stred, H = vyska
function drawGhost(x, kind, cx, cy, H, alpha) {
  x.save(); x.translate(cx, cy);
  if (kind === 0) {
    const W = H * 0.62;
    x.beginPath(); x.moveTo(-W / 2, 0); x.arc(0, -H * 0.18, W / 2, Math.PI, 0); x.lineTo(W / 2, H * 0.42);
    for (let i = 0; i < 4; i++) { const x0 = W / 2 - W * i / 4; x.quadraticCurveTo(x0 - W / 16, H * 0.52, x0 - W / 8, H * 0.44); x.quadraticCurveTo(x0 - W * 3 / 16, H * 0.36, x0 - W / 4, H * 0.44); }
    x.closePath();
    const g = x.createLinearGradient(0, -H * 0.5, 0, H * 0.5); g.addColorStop(0, `rgba(240,248,255,${alpha})`); g.addColorStop(0.6, `rgba(220,235,255,${alpha * 0.7})`); g.addColorStop(1, `rgba(200,220,255,0)`);
    x.fillStyle = g; x.fill();
    x.fillStyle = `rgba(0,0,10,${Math.min(1, alpha * 1.6)})`;
    [-1, 1].forEach(s => { x.beginPath(); x.ellipse(s * W * 0.16, -H * 0.2, W * 0.07, W * 0.11, 0, 0, 7); x.fill(); });
    x.beginPath(); x.ellipse(0, -H * 0.03, W * 0.07, W * 0.1, 0, 0, 7); x.fill();
  } else {
    const W = H * 0.7, g = x.createRadialGradient(0, 0, W * 0.1, 0, 0, H * 0.55);
    g.addColorStop(0, `rgba(235,240,250,${alpha})`); g.addColorStop(0.7, `rgba(200,210,230,${alpha * 0.6})`); g.addColorStop(1, "rgba(200,210,230,0)");
    x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, W / 2, H / 2, 0, 0, 7); x.fill();
    x.fillStyle = `rgba(0,0,0,${Math.min(1, alpha * 1.8)})`;
    [-1, 1].forEach(s => { x.beginPath(); x.ellipse(s * W * 0.2, -H * 0.08, W * 0.1, H * 0.09, s * 0.2, 0, 7); x.fill(); });
    x.beginPath(); x.ellipse(0, H * 0.22, W * 0.09, H * 0.13, 0, 0, 7); x.fill();
  }
  x.restore();
}

// ---------- 1) PROMENA VE STRASIDLO ----------
function morph(raw, fin, name, done) {
  const m = $("#morph"), c = $("#mo-c"), x = c.getContext("2d"), T = 3.4; let t0 = 0, f1 = false, f2 = false, end = false;
  $("#mo-name").textContent = ""; $("#mo-ok").hidden = true; m.hidden = false;
  const finish = () => { if (end) return; end = true; x.globalAlpha = 1; x.drawImage(fin, 0, 0, 600, 600); $("#mo-name").textContent = name; $("#mo-ok").hidden = false; sndBoo(); vib(60); };
  const frame = ts => {
    if (end) return; if (!t0) t0 = ts; const t = (ts - t0) / 1000;
    const p = Math.max(0, Math.min(1, (t - 0.7) / 2.2)), sh = t > 0.5 && t < 2.6 ? (1 - p) * 10 + 3 : 0;
    x.save(); x.globalAlpha = 1; x.fillStyle = "#000"; x.fillRect(0, 0, 600, 600);
    x.translate(rand(-sh, sh), rand(-sh, sh)); x.drawImage(raw, 0, 0, 600, 600);
    x.globalAlpha = t < 2.8 && Math.random() < 0.12 ? p * 0.3 : p; x.drawImage(fin, 0, 0, 600, 600); x.restore();
    if (!f1 && t > 0.5) { f1 = true; sndThunder(); vib([120, 60, 200]); }
    if (!f2 && t > 1.5) { f2 = true; sndThunder(0.5); vib(150); }
    [0.5, 1.5].forEach(ft => { if (t > ft && t < ft + 0.25) { x.globalAlpha = 1 - (t - ft) / 0.25; x.fillStyle = "#fff"; x.fillRect(0, 0, 600, 600); x.globalAlpha = 1; } });
    if (t >= T) finish(); else requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  c.onclick = finish;
  $("#mo-ok").onclick = () => { m.hidden = true; done && done(); };
}

// ---------- 2) DUCH VE FOTKACH ----------
// Duch se do fotky prida az po schvaleni dospelym, deti ho objevi az v Uloveich.
function hauntPhoto(id, data, cb) {
  S.gh = S.gh || { since: 0 }; S.haunted = S.haunted || {};
  const yes = Math.random() < 0.4 || S.gh.since >= 2; // aspon kazda treti fotka
  if (!yes) { S.gh.since++; save(); cb(data); return; }
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const kind = Math.random() < 0.6 ? 0 : 1, H = c.height * rand(0.3, 0.5), left = Math.random() < 0.5;
    const cx = c.width * (left ? rand(0.1, 0.25) : rand(0.75, 0.9)), cy = c.height * rand(0.3, 0.5), a = rand(0.5, 0.65);
    x.globalCompositeOperation = "screen"; x.filter = "blur(4px)";
    drawGhost(x, kind, cx + (left ? -H * 0.12 : H * 0.12), cy, H, a * 0.35); // stopa pohybu
    x.globalCompositeOperation = "source-over"; x.filter = "blur(2px)";
    x.shadowColor = "rgba(190,230,255,.9)"; x.shadowBlur = H * 0.08; // svatozar, at je duch videt i na svetle fotce
    drawGhost(x, kind, cx, cy, H, a); x.shadowBlur = 0;
    x.filter = "none";
    S.gh.since = 0; S.haunted[id] = 1; save();
    cb(c.toDataURL("image/jpeg", 0.62));
  };
  img.onerror = () => cb(data);
  img.src = data;
}

// ---------- KONTROLA FOTKY: deti porovnaji samy, dospely jen v krajnim pripade ----------
// Hranice zmerene na 51 fotkach okoli: cerna fotka jas 5-8, nocni s baterkou 19+; rozmazana ve svetle ostrost <8, ostra 14+.
// V noci rozmazani schova sum, proto je to jen upozorneni (lze pouzit presto), nikdy zakaz.
// jas (0-255) a ostrost (prumerny rozdil sousednich pixelu ve svetlych mistech; sum ve tme se nepocita)
function photoQuality(img) {
  const W = 200, H = Math.max(1, Math.round(img.height * W / img.width)), c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"); x.drawImage(img, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
  let sum = 0; for (let i = 0; i < W * H; i++) { g[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]; sum += g[i]; }
  let e = 0, n = 0;
  for (let y = 1; y < H - 1; y++) for (let x2 = 1; x2 < W - 1; x2++) { const i = y * W + x2; if (g[i] < 40) continue;
    const lap = Math.abs(4 * g[i] - g[i - 1] - g[i + 1] - g[i - W] - g[i + W]); e += lap; n++; }
  return { mean: sum / (W * H), sharp: n > W * H * 0.03 ? e / n : 0, lit: n / (W * H) };
}

function photoCheck(t, p) {
  const m = $("#pcheck"), img = new Image();
  $("#pc-ref").src = t.img ? `img/${t.img}.jpg` : ""; $("#pc-ref").parentNode.hidden = !t.img; $("#pc-photo").src = p;
  const mode = parent => { $("#pc-kids").hidden = parent; $("#pc-parent").hidden = !parent; $("#pc-sure").hidden = true;
    $("#pc-title").textContent = parent ? "🔐 Strážce hry: sedí to?" : (t.img ? "Je to to samé místo?" : "Povedla se fotka?");
    $("#pc-sub").textContent = parent ? "Porovnej předlohu s fotkou dětí." : "Porovnejte předlohu s vaší fotkou."; };
  mode(false); $("#pc-warn").hidden = true; $("#pc-yes").textContent = "Ano, je to ono! ✅"; $("#pc-yes").classList.remove("ghost"); $("#pc-again").classList.remove("pc-main");
  m.hidden = false;
  img.onload = () => { const q = photoQuality(img); let w = "";
    if (q.mean < 12) w = "🌑 Fotka je skoro celá černá. Posviťte baterkou 🔦 a vyfoťte to znovu.";
    else if (q.mean > 40 && q.sharp < 8) w = "🌫️ Fotka je rozmazaná. Držte telefon v klidu a zkuste to znovu.";
    if (w) { $("#pc-warn").textContent = w; $("#pc-warn").hidden = false; $("#pc-yes").textContent = "Přesto použít"; $("#pc-yes").classList.add("ghost"); $("#pc-again").classList.add("pc-main"); } };
  img.src = p;
  const accept = () => { m.hidden = true; hauntPhoto(t.id, p, q => { savePhoto(t.id, q); finishMain(t); }); };
  $("#pc-yes").onclick = () => { sndBoo(); vib(40); $("#pc-kids").hidden = true; $("#pc-sure").hidden = false; }; // varovani pred podvadenim
  $("#pc-sure-yes").onclick = accept;
  $("#pc-sure-no").onclick = () => { sndTap(); mode(false); };
  $("#pc-again").onclick = () => { m.hidden = true; sndTap(); openCam(ph => ph && photoCheck(t, ph)); };
  $("#pc-adult").onclick = () => { sndTap(); mode(true); };
  $("#pc-ok").onclick = () => askPin("Dospělý: uznat fotku?", accept);
  $("#pc-no").onclick = () => { m.hidden = true; sndBad(); toast("Strážce hry fotku neuznal. Zkuste to znovu! 📸"); openCam(ph => ph && photoCheck(t, ph)); };
}

// ---------- 3) FINALE + DIPLOM + PROMITANI ----------
function finale() {
  const f = $("#finale"), b = $("#fi-bats");
  $("#fi-team").innerHTML = kidsSorted().map(k => `<img src="${k.avatar}" alt="">`).join("");
  b.innerHTML = Array.from({ length: 28 }, () => {
    const a = rand(0, Math.PI * 2), d = rand(45, 75);
    return `<span style="--dx:${Math.cos(a) * d}vmax;--dy:${Math.sin(a) * d}vmax;animation-delay:${rand(0, 0.6)}s;font-size:${rand(22, 46)}px">🦇</span>`;
  }).join("");
  f.hidden = false; sndThunder(); setTimeout(sndWin, 400); setTimeout(sndBoo, 1300); vib([100, 50, 100, 50, 400]);
  $("#fi-ok").onclick = () => { f.hidden = true; b.innerHTML = ""; };
}
const durTxt = () => {
  const a = S.done.probuzeni, z = S.endAt; if (!a || !z || z < a) return "";
  const min = Math.round((z - a) / 60000), h = Math.floor(min / 60);
  return h ? `${h} h ${min % 60} min` : `${min} min`;
};
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
async function makeDiplom() {
  try { await document.fonts.load('80px Griffy', "Strážci Noci duchů"); } catch (e) {}
  const W = 1080, H = 1500, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2a1247"); g.addColorStop(1, "#07030f"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(255,255,255,${rand(0.2, 0.8)})`; x.beginPath(); x.arc(rand(0, W), rand(0, H * 0.6), rand(0.8, 2.5), 0, 7); x.fill(); }
  g = x.createRadialGradient(880, 190, 30, 880, 190, 200); g.addColorStop(0, "rgba(255,240,190,.95)"); g.addColorStop(0.45, "rgba(255,220,150,.5)"); g.addColorStop(1, "rgba(255,200,120,0)");
  x.fillStyle = g; x.beginPath(); x.arc(880, 190, 200, 0, 7); x.fill();
  x.strokeStyle = "#ff8a1f"; x.lineWidth = 10; x.strokeRect(30, 30, W - 60, H - 60); x.lineWidth = 3; x.strokeRect(52, 52, W - 104, H - 104);
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#b9a6d6"; x.font = "600 38px system-ui,sans-serif"; x.fillText("DIPLOM", W / 2, 150);
  x.shadowColor = "#ff8a1f"; x.shadowBlur = 30; x.fillStyle = "#ff8a1f"; x.font = "104px Griffy,serif"; x.fillText("Strážci", W / 2, 270); x.fillText("Noci duchů", W / 2, 385);
  x.shadowBlur = 0; x.fillStyle = "#f4ecff"; x.font = "40px system-ui,sans-serif"; x.fillText("Halloween · 31. 10. 2026", W / 2, 470);
  const ks = kidsSorted(), n = Math.max(1, ks.length), D = n > 3 ? 200 : 260, gap = (W - 120 - n * D) / (n + 1);
  for (let i = 0; i < ks.length; i++) {
    const k = ks[i], cx = 60 + gap + D / 2 + i * (D + gap), cy = 680, im = await loadImg(k.avatar);
    x.save(); x.beginPath(); x.arc(cx, cy, D / 2, 0, 7); x.clip(); if (im) x.drawImage(im, cx - D / 2, cy - D / 2, D, D); x.restore();
    x.strokeStyle = "#ff8a1f"; x.lineWidth = 8; x.beginPath(); x.arc(cx, cy, D / 2, 0, 7); x.stroke();
    const parts = k.name.split(" "), l1 = parts.slice(0, 2).join(" "), l2 = parts.slice(2).join(" ");
    x.fillStyle = "#8dff6a"; x.shadowColor = "#8dff6a"; x.shadowBlur = 12; x.font = `${n > 3 ? 30 : 36}px Griffy,serif`;
    x.fillText(l1, cx, cy + D / 2 + 45); if (l2) x.fillText(l2, cx, cy + D / 2 + 88); x.shadowBlur = 0;
  }
  x.fillStyle = "#f4ecff"; x.font = "42px system-ui,sans-serif";
  const lines = ["splnili všech 16 strašidelných úkolů,", "baterkou našli svítící písmena M L S K Y", "a odemkli poklad Mlsouna Chřestivého!"];
  const dur = durTxt(); if (dur) lines.push(`Celá výprava trvala ${dur}.`);
  lines.forEach((l, i) => x.fillText(l, W / 2, 1000 + i * 62));
  x.font = "64px 'Segoe UI Emoji','Noto Color Emoji',sans-serif"; x.fillText("🎃  🦇  👻  🕷️  💀", W / 2, 1290);
  x.fillStyle = "#b9a6d6"; x.font = "32px system-ui,sans-serif"; x.fillText("Strážce hry: ______________________", W / 2, 1390);
  return c.toDataURL("image/png");
}
let dipUrl = null;
async function renderDiplom() {
  $("#dip-img").removeAttribute("src"); $("#dip-wait").hidden = false;
  dipUrl = await makeDiplom(); $("#dip-img").src = dipUrl; $("#dip-wait").hidden = true;
}
$("#dip-save").onclick = () => { if (!dipUrl) return; const a = document.createElement("a"); a.href = dipUrl; a.download = "diplom-noc-duchu-2026.png"; document.body.appendChild(a); a.click(); a.remove(); toast("Diplom se ukládá do Stažených souborů 💾"); };
$("#dip-share").onclick = async () => {
  if (!dipUrl) return;
  try {
    const blob = await (await fetch(dipUrl)).blob(), file = new File([blob], "diplom-noc-duchu-2026.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: "Diplom – Noc duchů" });
    else toast("Sdílení tady nejde, dej Uložit.");
  } catch (e) {}
};

// promitani: fotky jedna po druhe, s hudbou
let SH = null;
async function startShow() {
  const items = kidsSorted().map(k => ({ src: k.avatar, cap: k.name, round: true }));
  TASKS.forEach(t => { const p = getPhoto(t.id); if (p) items.push({ src: p, cap: `${t.e} ${t.title}${S.haunted && S.haunted[t.id] ? " 👻?!" : ""}` }); });
  if (S.finished) items.push({ src: await makeDiplom(), cap: "🏆 Strážci Noci duchů", contain: true });
  if (items.length < 2) { toast("Zatím tu skoro nic není. Nejdřív plňte úkoly! 📸"); return; }
  ambDuck(true);
  SH = { items, i: -1, layer: 0 }; $("#show").hidden = false;
  try { $("#show").requestFullscreen && $("#show").requestFullscreen().catch(() => {}); } catch (e) {}
  showMusic(true); showNext();
}
function showNext() {
  if (!SH) return; clearTimeout(SH.tm); SH.i++;
  if (SH.i >= SH.items.length) { $("#show-cap").textContent = "Konec 🎃 Šťastný Halloween!"; SH.tm = setTimeout(stopShow, 4000); return; }
  const it = SH.items[SH.i], imgs = document.querySelectorAll("#show img"), nx = imgs[SH.layer ^ 1], old = imgs[SH.layer];
  nx.className = (it.round ? "round " : "") + (it.contain ? "contain " : ""); nx.src = it.src;
  void nx.offsetWidth; nx.classList.add("on", "kb"); old.classList.remove("on");
  SH.layer ^= 1; $("#show-cap").textContent = it.cap; SH.tm = setTimeout(showNext, it.contain ? 7000 : 4200);
}
function stopShow() {
  if (!SH) return; clearTimeout(SH.tm); SH = null; showMusic(false); ambDuck(false); $("#show").hidden = true;
  document.querySelectorAll("#show img").forEach(i => { i.className = ""; i.removeAttribute("src"); });
  try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {}
}
$("#show").onclick = e => { if (e.target.id === "show-x") stopShow(); else showNext(); };
let musT = null, drone = null;
function showMusic(on) {
  const a = ac(); if (!a) return;
  if (!on) { clearInterval(musT); musT = null; if (drone) { try { drone.stop(); } catch (e) {} drone = null; } return; }
  drone = a.createOscillator(); const g = a.createGain(); drone.type = "sine"; drone.frequency.value = 55; g.gain.value = 0.06; drone.connect(g); g.connect(a.destination); drone.start();
  const mel = [220, 261.6, 329.6, 261.6, 207.7, 246.9, 329.6, 246.9, 196, 233.1, 293.7, 233.1, 207.7, 246.9, 311.1, 415.3]; let i = 0;
  musT = setInterval(() => { tone(mel[i % mel.length], 0, 0.45, "triangle", 0.07); if (i % 4 === 0) tone(mel[i % mel.length] / 2, 0, 1.1, "sine", 0.05); i++; }, 320);
}

// ---------- 4) LEKACKY ----------
const SCARE = { obcas: [4, 8], casto: [2, 4] }; // minuty mezi lekackami
let nextScare = 0;
function planScare() { const r = SCARE[S.scare]; nextScare = r ? Date.now() + rand(r[0], r[1]) * 60000 : 0; }
function scare() {
  const el = $("#scare"), c = $("#sc-c"), x = c.getContext("2d");
  x.clearRect(0, 0, 400, 400); x.filter = "blur(2px)"; drawGhost(x, Math.random() < 0.5 ? 0 : 1, 200, 210, 360, 0.95); x.filter = "none";
  el.hidden = false; el.classList.remove("go"); void el.offsetWidth; el.classList.add("go");
  sndScream(); vib([250, 60, 250]);
  setTimeout(() => { el.hidden = true; el.classList.remove("go"); }, 1100);
}
setInterval(() => {
  if (!S.scare || S.scare === "off" || S.finished || !S.done.probuzeni || document.hidden) return;
  if (!["main", "task", "map", "gallery"].includes(cur) || !$("#pin").hidden || !$("#award").hidden || !$("#pcheck").hidden || !$("#morph").hidden || SH || REC) return;
  if (!nextScare) { planScare(); return; }
  if (Date.now() >= nextScare) { scare(); planScare(); }
}, 15000);

// ---------- 5) CTENI NAHLAS ----------
let csVoice = null;
function pickVoice() { try { csVoice = speechSynthesis.getVoices().find(v => /^cs/i.test(v.lang)) || null; } catch (e) {} }
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, manual) {
  if (!("speechSynthesis" in window)) { if (manual) toast("Tenhle telefon neumí číst nahlas."); return; }
  pickVoice();
  if (!csVoice && manual) toast("Telefon nemá český hlas – zkus to, ale může číst divně.");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = "cs-CZ"; if (csVoice) u.voice = csVoice;
  u.pitch = 0.55; u.rate = 0.9; u.volume = 1;
  ambDuck(true); u.onend = u.onerror = () => ambDuck(false);
  speechSynthesis.speak(u);
}
// namluvene nahravky (voice/<id>.mp3) + strasidelne efekty pri prehrani; kdyz chybi, cte telefon
const VBUF = {}; let VS = null, vTok = 0, IR = null;
async function voiceBuf(id) {
  if (VBUF[id]) return VBUF[id];
  const r = await fetch(`voice/${id}.mp3`); if (!r.ok) throw new Error("bez nahravky");
  return VBUF[id] = await ac().decodeAudioData(await r.arrayBuffer());
}
// kdo cte: Vlasta = carodejnice (chvejivejsi, svetlejsi), ostatni Antonin = strazce noci
const WITCH = ["kopec", "truhla", "kotlik", "duch", "hroch", "pirat", "parkoviste"];
function spookyIR(a) { // dozvuk: dlouhy doznivajici sum
  IR = a.createBuffer(2, a.sampleRate * 2.8, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = IR.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3.2); }
}
function spookyPlay(buf, id) {
  const w = WITCH.includes(id), a = ac(), t = a.currentTime + 0.05, RATE = w ? 0.94 : 0.9;
  if (!IR) spookyIR(a);
  const s = a.createBufferSource(); s.buffer = buf; s.playbackRate.value = RATE;
  const lo = a.createBiquadFilter(); lo.type = "lowshelf"; lo.frequency.value = 220; lo.gain.value = w ? 2 : 5;
  const dry = a.createGain(); dry.gain.value = 0.85;
  const conv = a.createConvolver(); conv.buffer = IR; const wet = a.createGain(); wet.gain.value = 0.42;
  const dl = a.createDelay(1); dl.delayTime.value = 0.32; const fb = a.createGain(); fb.gain.value = 0.32;
  const dlf = a.createBiquadFilter(); dlf.type = "lowpass"; dlf.frequency.value = 1800; const ech = a.createGain(); ech.gain.value = 0.35;
  const s2 = a.createBufferSource(); s2.buffer = buf; s2.playbackRate.value = RATE; s2.detune.value = w ? 18 : -8; // chvejici se "duch" za hlasem
  const trem = a.createGain(); trem.gain.value = w ? 0.26 : 0.18; const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = w ? 7 : 5.5; lg.gain.value = w ? 0.22 : 0.12;
  const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 500;
  const master = a.createGain(); master.gain.value = 1.3;
  lfo.connect(lg); lg.connect(trem.gain);
  s.connect(lo); lo.connect(dry); dry.connect(master); lo.connect(conv); conv.connect(wet); wet.connect(master);
  lo.connect(dl); dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(ech); ech.connect(master);
  s2.connect(hp); hp.connect(trem); trem.connect(conv); trem.connect(master); master.connect(a.destination);
  s.start(t); s2.start(t + 0.045); lfo.start(t);
  VS = { nodes: [s, s2, lfo], master }; ambDuck(true);
  s.onended = () => { if (VS && VS.nodes[0] === s) setTimeout(() => { if (VS && VS.nodes[0] === s) stopSpeak(); }, 3000); };
}
function stopSpeak() {
  vTok++; try { speechSynthesis.cancel(); } catch (e) {}
  if (VS) { const v = VS; VS = null; try { v.master.gain.setTargetAtTime(0, ac().currentTime, 0.08); } catch (e) {} setTimeout(() => v.nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 400); }
  ambDuck(false);
}
function speakTask(t, manual) {
  if (!t || !t.story) return; stopSpeak(); const tok = vTok;
  voiceBuf(t.id).then(buf => { if (tok === vTok && (manual || cur === "task")) spookyPlay(buf, t.id); })
    .catch(() => { if (tok === vTok) speak(`${t.title}. ${t.story} ${S.done[t.id] ? "" : t.q || ""}`, manual); });
}

// ---------- 6) ZVUKY V POZADI ----------
let AMB = null;
function startAmb() {
  const a = ac(); if (!a || AMB) return;
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), out = a.createGain();
  s.buffer = noise(4); s.loop = true; fl.type = "bandpass"; fl.frequency.value = 500; fl.Q.value = 0.8; g.gain.value = 0.035; out.gain.value = 1;
  const l1 = a.createOscillator(), l1g = a.createGain(); l1.frequency.value = 0.07; l1g.gain.value = 300; l1.connect(l1g); l1g.connect(fl.frequency);
  const l2 = a.createOscillator(), l2g = a.createGain(); l2.frequency.value = 0.11; l2g.gain.value = 0.025; l2.connect(l2g); l2g.connect(g.gain);
  s.connect(fl); fl.connect(g); g.connect(out); out.connect(a.destination); s.start(); l1.start(); l2.start();
  const hoot = () => { if (!AMB) return; if (!AMB.duck) { tone(410, 0, 0.35, "sine", 0.05, 380); tone(400, 0.5, 0.7, "sine", 0.05, 320); } AMB.ht = setTimeout(hoot, rand(25, 50) * 1000); };
  AMB = { nodes: [s, l1, l2], out, duck: false }; AMB.ht = setTimeout(hoot, rand(8, 15) * 1000);
}
function stopAmb() { if (!AMB) return; clearTimeout(AMB.ht); AMB.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); AMB.out.disconnect(); AMB = null; }
function ambDuck(on) { if (!AMB) return; AMB.duck = on; try { AMB.out.gain.setTargetAtTime(on ? 0.15 : 1, ac().currentTime, 0.3); } catch (e) {} }
document.addEventListener("pointerdown", () => { if (S.amb && !AMB) startAmb(); }, true);
document.addEventListener("visibilitychange", () => { try { if (document.hidden) AC && AC.suspend(); else AC && AC.resume(); } catch (e) {} });

// ---------- NASTAVENI PRO DOSPELE ----------
function paintFxSet() {
  document.querySelectorAll("#p-scare button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.scare || "off")));
  document.querySelectorAll("#p-voice button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.voice ? "1" : "0")));
  document.querySelectorAll("#p-amb button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.amb ? "1" : "0")));
}
$("#p-scare").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.scare = b.dataset.v; save(); planScare(); paintFxSet(); };
$("#p-voice").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.voice = b.dataset.v === "1"; save(); paintFxSet(); };
$("#p-amb").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.amb = b.dataset.v === "1"; save(); S.amb ? startAmb() : stopAmb(); paintFxSet(); };
$("#p-scare-test").onclick = () => scare();
$("#p-voice-test").onclick = () => speakTask(TASKS[1], true);

// ---------- PRIHORIVA: hledani pokladu podle GPS (po odemceni) ----------
const HUNT_LV = [ // [do metru, text, barva]
  [10, "🔥🔥🔥 HOŘÍ! Posviťte baterkou kolem sebe!", "#ff2a00"], [20, "🔥 Přihořívá!", "#ff7a00"],
  [40, "🌤️ Vlažné…", "#d8a800"], [80, "❄️ Zima", "#3a8dde"], [1e9, "🧊 Samá voda!", "#1d3fa8"]];
let HU = null;
function geoDist(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function startHunt() {
  if (!navigator.geolocation) { toast("Tenhle telefon neumí zjistit polohu. Hledejte podle mapy!"); return; }
  stopHunt(); go("hunt"); ambDuck(true);
  HU = { d: null, hist: [], hot: false };
  $("#hu-txt").textContent = "Hledám signál… 🛰️"; $("#hu-trend").textContent = ""; $("#hu-acc").textContent = "";
  $("#hu-ball").style.background = "#333";
  HU.watch = navigator.geolocation.watchPosition(pos => {
    if (!HU) return;
    const me = { lat: pos.coords.latitude, lon: pos.coords.longitude }, tr = S.treasure || DEFAULT_TREASURE;
    const d = geoDist(me, tr), now = Date.now(); HU.d = d; HU.hist.push([now, d]); HU.hist = HU.hist.filter(h => now - h[0] < 12000);
    const lv = HUNT_LV.find(l => d <= l[0]);
    $("#hu-txt").textContent = lv[1]; $("#hu-ball").style.background = lv[2];
    $("#s-hunt").style.background = `radial-gradient(circle at 50% 40%, ${lv[2]}55, var(--bg) 70%)`;
    const old = HU.hist[0][1], diff = d - old; // trend za poslednich ~10 s
    $("#hu-trend").textContent = HU.hist.length < 2 || Math.abs(diff) < 3 ? "" : diff < 0 ? "⬆️ Jdete správně, blíž!" : "⬇️ Pozor, vzdalujete se!";
    $("#hu-acc").textContent = `GPS přesnost asi ±${Math.round(pos.coords.accuracy)} m`;
    if (d <= 10 && !HU.hot) { HU.hot = true; sndWin(); vib([200, 80, 200, 80, 400]); }
    if (d > 15) HU.hot = false;
  }, err => {
    if (!HU) return;
    $("#hu-txt").textContent = err.code === 1 ? "Povol appce polohu (zámek vedle adresy), jinak to nepůjde." : "Signál GPS se ztratil… zkuste vyjít víc na volno.";
  }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
  const beep = () => { if (!HU) return; const d = HU.d;
    if (d != null) { tone(d <= 10 ? 1046 : d <= 20 ? 880 : 660, 0, 0.08, "square", 0.12); if (d <= 20) vib(d <= 10 ? 90 : 40); }
    HU.bt = setTimeout(beep, d == null ? 1500 : Math.max(160, Math.min(2500, d * 30))); };
  beep();
}
function stopHunt() { if (!HU) return; try { navigator.geolocation.clearWatch(HU.watch); } catch (e) {} clearTimeout(HU.bt); HU = null; ambDuck(false); }
$("#hu-back").onclick = () => { stopHunt(); go("map"); };

// ---------- VLCI VYTI: nahraj 5 s a prehraj s ozvenou ve skalach ----------
let HOWL = null, REC = false;
function howlHtml() {
  return `<div class="howl"><h3>🎙️ Vlčí smečka</h3><p class="small">Nahrajte, jak všichni spolu vyjete. Pak si to pusťte s ozvěnou jako v horách!</p>
    <button class="btn" id="hw-rec">🎙️ Nahrát vytí (5 s)</button><button class="btn ghost" id="hw-play" ${HOWL ? "" : "hidden"}>▶️ Pustit vytí znovu</button></div>`;
}
function bindHowl() {
  const r = $("#hw-rec"); if (!r) return;
  r.onclick = async () => {
    if (REC) return; let st;
    try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } }); }
    catch (e) { toast("Povol appce mikrofon, jinak nahrávání nepůjde."); return; }
    stopSpeak(); ambDuck(true); REC = true; const chunks = [], mr = new MediaRecorder(st);
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    mr.onstop = async () => {
      st.getTracks().forEach(t => t.stop()); REC = false; r.disabled = false; r.textContent = "🎙️ Nahrát znovu";
      try { HOWL = await ac().decodeAudioData(await new Blob(chunks).arrayBuffer()); $("#hw-play").hidden = false; howlPlay(); }
      catch (e) { toast("Nahrávka se nepovedla, zkuste to znovu."); ambDuck(false); }
    };
    let n = 5; r.disabled = true; r.textContent = `🔴 Vyjte! ${n}`; mr.start(); vib(60);
    const tick = setInterval(() => { n--; if (n > 0) r.textContent = `🔴 Vyjte! ${n}`; else { clearInterval(tick); r.textContent = "⏳ Chvilku…"; mr.stop(); } }, 1000);
  };
  $("#hw-play").onclick = () => howlPlay();
}
function howlPlay() {
  if (!HOWL) return; const a = ac(), t = a.currentTime + 0.05;
  if (!IR) spookyIR(a);
  const s = a.createBufferSource(); s.buffer = HOWL; s.playbackRate.value = 0.88; // trochu hlubsi, vic vlci
  const pre = a.createGain(); pre.gain.value = 1.6; const out = a.createGain(); out.gain.value = 1;
  const conv = a.createConvolver(); conv.buffer = IR; const wet = a.createGain(); wet.gain.value = 0.6;
  s.connect(pre); pre.connect(out); pre.connect(conv); conv.connect(wet); wet.connect(out);
  [[0.45, 0.55], [0.9, 0.38], [1.4, 0.24], [2.0, 0.14]].forEach(([dt, g]) => { // ozvena odrazena od skal
    const dl = a.createDelay(3), gg = a.createGain(), lp = a.createBiquadFilter(); dl.delayTime.value = dt; gg.gain.value = g; lp.type = "lowpass"; lp.frequency.value = 2500 - dt * 700;
    pre.connect(dl); dl.connect(lp); lp.connect(gg); gg.connect(out); });
  out.connect(a.destination); s.start(t); ambDuck(true);
  s.onended = () => setTimeout(() => ambDuck(false), 2500);
}
