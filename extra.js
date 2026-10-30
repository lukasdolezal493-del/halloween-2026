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
// cas dalsi lekacky se uklada do telefonu – kdyz telefon appku pri zhasnuti uspi a znovu nacte, odpocet nezacina od nuly
function planScare() { const r = SCARE[S.scare]; S.nextScare = r ? Date.now() + rand(r[0], r[1]) * 60000 : 0; save(); }
// 4 druhy lekacek, stridaji se nahodne (nikdy dvakrat stejna po sobe)
// kreslena carodejnice: zelena tvar, spicaty klobouk, svitici oci, krivy usklebek
function drawWitch(x, cx, cy, H) {
  x.save(); x.translate(cx, cy);
  const W = H * 0.5, f = x.createRadialGradient(0, H * 0.08, W * 0.1, 0, H * 0.08, W * 0.75);
  f.addColorStop(0, "#9be05a"); f.addColorStop(0.7, "#4f8a2a"); f.addColorStop(1, "#1d3a0f");
  x.fillStyle = f; x.beginPath(); x.ellipse(0, H * 0.1, W / 2, H * 0.3, 0, 0, 7); x.fill();
  x.beginPath(); x.moveTo(-W * 0.06, H * 0.08); x.quadraticCurveTo(W * 0.02, H * 0.2, W * 0.16, H * 0.24); x.lineTo(W * 0.02, H * 0.2); x.fill(); // nos
  x.fillStyle = "#3d6b1f"; x.beginPath(); x.arc(W * 0.12, H * 0.2, W * 0.03, 0, 7); x.fill(); // bradavice
  x.fillStyle = "#111"; x.beginPath(); x.moveTo(-W * 0.85, -H * 0.12); x.lineTo(W * 0.85, -H * 0.12); x.lineTo(W * 0.6, -H * 0.2); x.lineTo(-W * 0.6, -H * 0.2); x.fill(); // krempa
  x.beginPath(); x.moveTo(-W * 0.38, -H * 0.18); x.lineTo(W * 0.38, -H * 0.18); x.lineTo(W * 0.25, -H * 0.42); x.lineTo(W * 0.45, -H * 0.55); x.lineTo(W * 0.05, -H * 0.45); x.closePath(); x.fill(); // spicka
  x.fillStyle = "#7b2cbf"; x.fillRect(-W * 0.37, -H * 0.22, W * 0.74, H * 0.04);
  x.shadowColor = "#ff2020"; x.shadowBlur = 25; x.fillStyle = "#ff3030";
  [-1, 1].forEach(sg => { x.beginPath(); x.ellipse(sg * W * 0.18, H * 0.0, W * 0.08, H * 0.03, sg * -0.35, 0, 7); x.fill(); });
  x.shadowBlur = 0; x.fillStyle = "#1a0505"; x.beginPath(); x.moveTo(-W * 0.22, H * 0.27); x.quadraticCurveTo(0, H * 0.36, W * 0.24, H * 0.25); x.quadraticCurveTo(0, H * 0.31, -W * 0.22, H * 0.27); x.fill(); // usklebek
  x.fillStyle = "#e8e0b0"; [-0.1, 0.08].forEach(z => { x.beginPath(); x.moveTo(W * z, H * 0.29); x.lineTo(W * (z + 0.05), H * 0.29); x.lineTo(W * (z + 0.025), H * 0.33); x.fill(); }); // zuby
  x.strokeStyle = "#555"; x.lineWidth = 3; for (let i = 0; i < 9; i++) { const sg = i % 2 ? 1 : -1, y0 = -H * 0.08 + i * 4; x.beginPath(); x.moveTo(sg * W * 0.45, y0); x.quadraticCurveTo(sg * W * 0.75, H * 0.2, sg * W * (0.55 + i * 0.03), H * 0.45); x.stroke(); } // vlasy
  x.restore();
}
// nahravka primo do usi (bez dozvuku); bez nahravky (iPhone neumi .ogg) nahradni zvuk
async function sfxNow(id, vol, rate) {
  const a = ac(); if (!a) return;
  try { const s = a.createBufferSource(), g = a.createGain(); s.buffer = await sfxBuf(a, id); if (rate) s.playbackRate.value = rate; g.gain.value = vol;
    const lim = a.createDynamicsCompressor(); lim.threshold.value = -8; lim.knee.value = 4; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.2; // pojistka proti chrceni
    s.connect(g); g.connect(lim); lim.connect(a.destination); s.start(); }
  catch (e) { sndScream(); }
}
const SCARES = ["krik", "carodejnice", "hrom", "strasidlo"];
let scareLast = "", scareTestI = 0;
function scare(kind) {
  if (!kind) { const k = SCARES.filter(v => v !== scareLast && (v !== "strasidlo" || S.kids.length)); kind = k[Math.floor(Math.random() * k.length)]; }
  scareLast = kind;
  const el = $("#scare"), c = $("#sc-c"), x = c.getContext("2d"), boo = el.querySelector(".boo");
  x.clearRect(0, 0, 400, 400); el.className = ""; let len = 1300;
  if (kind === "krik") { // duch + skutecny vykrik
    x.filter = "blur(2px)"; drawGhost(x, Math.random() < 0.5 ? 0 : 1, 200, 210, 360, 0.95); x.filter = "none";
    boo.textContent = "BÚÚÚ!"; sfxNow("krik1", 1.6); vib([250, 60, 250]);
  } else if (kind === "carodejnice") { // carodejnice + chechot
    drawWitch(x, 200, 215, 400); boo.textContent = "Chi chi chi!"; len = 2200;
    sfxNow(AMB_REC.chechot[Math.floor(Math.random() * 3)], 1.8, 0.9); vib([100, 50, 100, 50, 300]);
  } else if (kind === "hrom") { // zablesky, ve tme se mihne duch
    x.filter = "blur(3px)"; drawGhost(x, 1, 200, 200, 380, 0.9); x.filter = "none";
    boo.textContent = ""; el.classList.add("flash"); len = 2300;
    sfxNow(AMB_REC.hrom[Math.floor(Math.random() * 2)], 1.6); sndThunder(0.7); vib([60, 80, 60, 300, 600]);
  } else { // vlastni strasidlo z profilu vyskoci na celou obrazovku
    const k = S.kids[Math.floor(Math.random() * S.kids.length)], im = new Image();
    im.onload = () => { x.save(); x.beginPath(); x.arc(200, 200, 195, 0, 7); x.clip(); const r = Math.max(400 / im.width, 400 / im.height); x.drawImage(im, 200 - im.width * r / 2, 200 - im.height * r / 2, im.width * r, im.height * r);
      const v = x.createRadialGradient(200, 200, 120, 200, 200, 200); v.addColorStop(0, "rgba(120,0,0,0)"); v.addColorStop(1, "rgba(120,0,0,.75)"); x.fillStyle = v; x.fillRect(0, 0, 400, 400); x.restore(); };
    im.src = k.avatar; boo.textContent = `${k.name} si pro vás jde!`; el.classList.add("kid"); len = 2600;
    const a = ac(); if (a) AMBFX.psycho(a, a.destination, a.currentTime + 0.02); vib([150, 40, 150, 40, 400]);
  }
  el.hidden = false; void el.offsetWidth; el.classList.add("go");
  setTimeout(() => { el.hidden = true; el.className = ""; }, len);
}
setInterval(() => {
  if (!S.scare || S.scare === "off" || S.finished || !S.done.probuzeni || document.hidden) return;
  if (!["main", "task", "map", "gallery"].includes(cur) || !$("#pin").hidden || !$("#award").hidden || !$("#pcheck").hidden || !$("#morph").hidden || !$("#kidview").hidden || SH || REC) return;
  if (!S.nextScare) { planScare(); return; }
  if (Date.now() >= S.nextScare) { scare(); planScare(); }
}, 3000);

// ---------- NEZHASINAT DISPLEJ ----------
// telefon pri chuzi zhasina -> utichne pozadi a lekacky cekaji; dokud se hraje, drzime displej rozsviceny
let WL = null;
async function wakeSync() {
  const want = S.wake && S.kids.length && !document.hidden && "wakeLock" in navigator;
  if (want && !WL) { try { WL = await navigator.wakeLock.request("screen"); WL.addEventListener("release", () => { WL = null; }); } catch (e) { WL = null; } }
  else if (!want && WL) { try { await WL.release(); } catch (e) {} WL = null; }
}
document.addEventListener("visibilitychange", wakeSync);
document.addEventListener("click", wakeSync); // prvni klepnuti po otevreni (nekdy telefon chce dotyk)
wakeSync();

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
  s.buffer = noise(4); s.loop = true; fl.type = "bandpass"; fl.frequency.value = 500; fl.Q.value = 0.8; g.gain.value = 0.06; out.gain.value = 1;
  const l1 = a.createOscillator(), l1g = a.createGain(); l1.frequency.value = 0.07; l1g.gain.value = 300; l1.connect(l1g); l1g.connect(fl.frequency);
  const l2 = a.createOscillator(), l2g = a.createGain(); l2.frequency.value = 0.11; l2g.gain.value = 0.04; l2.connect(l2g); l2g.connect(g.gain);
  s.connect(fl); fl.connect(g); g.connect(out); out.connect(ambBus(a)); s.start(); l1.start(); l2.start();
  AMB = { nodes: [s, l1, l2, ...ambDrone(a, out)], out, duck: false }; // vitr + stale temny podton
  sfxBuf(a, "vitr").then(b => { if (!AMB) return; const w = a.createBufferSource(), wg = a.createGain(); w.buffer = b; w.loop = true; wg.gain.value = 0.5; w.connect(wg); wg.connect(out); w.start(); AMB.nodes.push(w); }).catch(() => {}); // skutecne kvileni vetru
  const evt = () => { if (!AMB) return; if (!AMB.duck) ambRandom(); AMB.et = setTimeout(evt, rand(10, 25) * 1000); }; // hrom, dvere, vlk...
  AMB.et = setTimeout(evt, rand(6, 12) * 1000);
}
function stopAmb() { if (!AMB) return; clearTimeout(AMB.et); AMB.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); AMB.out.disconnect(); AMB = null; }
function ambDuck(on) { if (!AMB) return; AMB.duck = on; try { AMB.out.gain.setTargetAtTime(on ? 0.15 : 1, ac().currentTime, 0.3); } catch (e) {} }
document.addEventListener("pointerdown", () => { if (S.amb && !AMB) startAmb(); }, true);
document.addEventListener("visibilitychange", () => { try { if (document.hidden) AC && AC.suspend(); else AC && AC.resume(); } catch (e) {} });

// ---------- NASTAVENI PRO DOSPELE ----------
function paintFxSet() {
  document.querySelectorAll("#p-scare button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.scare || "off")));
  document.querySelectorAll("#p-voice button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.voice ? "1" : "0")));
  document.querySelectorAll("#p-amb button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.amb ? "1" : "0")));
  document.querySelectorAll("#p-wake button").forEach(b => b.classList.toggle("on", b.dataset.v === (S.wake ? "1" : "0")));
}
$("#p-scare").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.scare = b.dataset.v; save(); planScare(); paintFxSet(); };
$("#p-voice").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.voice = b.dataset.v === "1"; save(); paintFxSet(); };
$("#p-amb").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.amb = b.dataset.v === "1"; save(); S.amb ? startAmb() : stopAmb(); paintFxSet(); };
$("#p-wake").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.wake = b.dataset.v === "1"; save(); wakeSync(); paintFxSet(); };
$("#p-scare-test").onclick = () => { const k = SCARES[scareTestI++ % SCARES.length]; scare(k === "strasidlo" && !S.kids.length ? "krik" : k); }; // postupne vsechny 4
$("#p-voice-test").onclick = () => speakTask(TASKS[1], true);
$("#p-amb-test").onclick = () => { const a = ac(), bus = ambBus(a); let d = 0; Object.keys(AMB_W).forEach(k => { setTimeout(() => { toast(AMB_NAMES[k]); ambEvent(a, bus, a.currentTime + 0.05, k).catch(() => {}); }, d * 1000); d += k === "hororovka" ? 30 : k === "scena" ? 18 : k === "broukani" ? 14 : 8; }); };

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

// ---------- STRASIDELNE ZVUKY V POZADI ----------
// Skutecne nahravky (sfx/*.ogg, Wikimedia Commons, autori v menu Pro dospele) + zvuky vyrabene primo v appce.
// Kazdy vyrabeny zvuk: (a = AudioContext, out = kam hrat, t = kdy zacit). Funguje i v OfflineAudioContext (ukazky).
function nBuf(a, sec) { const b = a.createBuffer(1, Math.floor(a.sampleRate * sec), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function env(g, t, att, len, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + len); }
function thump(a, out, t, f, len, v) { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + len); env(g, t, 0.008, len, v); o.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05); }
function burst(a, out, t, len, type, f, q, v) { const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = nBuf(a, len); fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, t, 0.004, len, v); s.connect(fl); fl.connect(g); g.connect(out); s.start(t); }
// ukolebavky v moll (bez autorskych prav): [nota v pultonech od C5, delka v dobach]
const LULL = {
  kubo: [[0, 1], [2, 1], [3, 1], [0, 1], [0, 1], [2, 1], [3, 1], [0, 1], [3, 1], [5, 1], [7, 2], [3, 1], [5, 1], [7, 2],
         [7, .5], [8, .5], [7, .5], [5, .5], [3, 1], [0, 1], [7, .5], [8, .5], [7, .5], [5, .5], [3, 1], [0, 1], [0, 1], [-5, 1], [0, 2]], // Bratre Kubo
  hvezdicka: [[0, 1], [0, 1], [7, 1], [7, 1], [8, 1], [8, 1], [7, 2], [5, 1], [5, 1], [3, 1], [3, 1], [2, 1], [2, 1], [0, 2]], // Twinkle twinkle
  brahms: [[3, .5], [3, .5], [7, 2], [3, .5], [3, .5], [7, 2], [3, .5], [7, .5], [12, 1], [10, 1.5], [8, .5], [8, 1], [7, 1],
           [2, .5], [3, .5], [5, 1], [2, 1], [2, .5], [3, .5], [5, 2]] // Brahmsova ukolebavka
};
function lullNotes(a, t, beat) { // vybere ukolebavku, zpomaluje se a rozlaďuje jako stary strojek
  const k = Object.keys(LULL), mel = LULL[k[Math.floor(Math.random() * k.length)]], out = []; let tt = t;
  mel.forEach(([n, d], i) => { const slow = 1 + (i / mel.length) * 0.6; out.push([tt, 523.25 * Math.pow(2, n / 12) * Math.pow(2, rand(-18, 18) / 1200), d * beat * slow]); tt += d * beat * slow + rand(0, 0.04); });
  return out;
}
const AMBFX = {
  broukani(a, out, t) { // detske broukani „uuu“ ukolebavky (samohlaska z formantu)
    const notes = lullNotes(a, t, rand(0.55, 0.7)).slice(0, 8), end = notes[notes.length - 1][0] + notes[notes.length - 1][2];
    const o = a.createOscillator(), v = a.createOscillator(), vg = a.createGain(), g = a.createGain(), mix = a.createGain(); o.type = "sawtooth";
    notes.forEach(([t0, f], i) => i ? o.frequency.setTargetAtTime(f, t0, 0.05) : o.frequency.setValueAtTime(f, t0));
    v.frequency.value = 5.5; vg.gain.value = 6; v.connect(vg); vg.connect(o.frequency);
    [[320, 6, 1], [800, 8, 0.35], [2700, 12, 0.08]].forEach(([f, q, gv]) => { const bp = a.createBiquadFilter(), gg = a.createGain(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q; gg.gain.value = gv * 3; o.connect(bp); bp.connect(gg); gg.connect(mix); });
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.6); g.gain.setValueAtTime(0.5, end - 0.5); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.4);
    mix.connect(g); g.connect(out); o.start(t); v.start(t); o.stop(end + 0.5); v.stop(end + 0.5);
  },
  psycho(a, out, t) { // ostre housle jako ve filmu Psycho: tri bodnuti
    for (let i = 0; i < 4; i++) { const t0 = t + i * 0.32;
      [1, 1.06, 1.5].forEach(m => { const o = a.createOscillator(), g = a.createGain(), hp = a.createBiquadFilter(); o.type = "sawtooth";
        o.frequency.setValueAtTime(1500 * m, t0); o.frequency.linearRampToValueAtTime(1750 * m, t0 + 0.22); hp.type = "highpass"; hp.frequency.value = 900;
        env(g, t0, 0.01, 0.26, 0.15); o.connect(hp); hp.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.3); }); }
  },
  bum(a, out, t) { // temne BWAAM: hluboky uder s dlouhym dozvukem
    thump(a, out, t, 55, 3.2, 1); thump(a, out, t, 82, 2.5, 0.5);
    [[0, "sawtooth", 110], [0, "sawtooth", 116.5], [0, "sawtooth", 155.6]].forEach(([d, ty, f]) => { const o = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(); o.type = ty; o.frequency.value = f;
      lp.type = "lowpass"; lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(200, t + 2.5); env(g, t, 0.02, 3, 0.2); o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + 3.1); });
    burst(a, out, t, 1.5, "lowpass", 300, 0.7, 0.6);
  },
  napeti(a, out, t) { // stoupajici napeti a nahle ticho
    const len = 3.2;
    [0, 1, 6, 7].forEach(n => { const o = a.createOscillator(), g = a.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110 * Math.pow(2, n / 12), t); o.frequency.exponentialRampToValueAtTime(660 * Math.pow(2, n / 12), t + len);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + len); g.gain.setValueAtTime(0.0001, t + len + 0.01); const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2500;
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05); });
    const s = a.createBufferSource(), g = a.createGain(), bp = a.createBiquadFilter(); s.buffer = nBuf(a, len); bp.type = "bandpass"; bp.Q.value = 2; bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(4000, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + len); g.gain.setValueAtTime(0.0001, t + len + 0.01); s.connect(bp); bp.connect(g); g.connect(out); s.start(t);
    thump(a, out, t + len, 60, 0.8, 1);
  },
  retezy(a, out, t) { // rinceni retezu
    for (let i = 0; i < 14; i++) { const t0 = t + Math.random() * 1.4;
      [2100, 3370, 5150].forEach((f, k) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f * (0.95 + Math.random() * 0.1);
        env(g, t0, 0.003, 0.09 + k * 0.03, 0.08 / (k + 1)); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.2); });
      burst(a, out, t0, 0.05, "highpass", 4000, 0.7, 0.12); }
  },
  duch(a, out, t) { // duchovske „uuuu“
    const len = 3.5, s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), o = a.createOscillator(), v = a.createOscillator(), vg = a.createGain(), og = a.createGain();
    s.buffer = nBuf(a, len); bp.type = "bandpass"; bp.Q.value = 9;
    bp.frequency.setValueAtTime(350, t); bp.frequency.linearRampToValueAtTime(850, t + 1.4); bp.frequency.linearRampToValueAtTime(300, t + len);
    s.connect(bp); bp.connect(g);
    o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(330, t + 1.4); o.frequency.linearRampToValueAtTime(210, t + len);
    v.frequency.value = 4; vg.gain.value = 12; v.connect(vg); vg.connect(o.frequency); og.gain.value = 0.25; o.connect(og); og.connect(g);
    env(g, t, 0.8, len, 0.6); g.connect(out); s.start(t); o.start(t); v.start(t); o.stop(t + len); v.stop(t + len);
  },
  klepani(a, out, t) { [0, 0.32, 0.64, 1.6, 1.85].forEach(d => { thump(a, out, t + d, 170, 0.12, 0.7); burst(a, out, t + d, 0.05, "bandpass", 420, 2.5, 0.8); }); },
  kroky(a, out, t) { for (let i = 0; i < 7; i++) { const t0 = t + i * 0.55 + Math.random() * 0.04, v = 0.3 + i * 0.1; burst(a, out, t0, 0.09, "lowpass", 450, 0.7, v); burst(a, out, t0 + 0.01, 0.12, "bandpass", 2600, 1.2, v * 0.35); } },
  zvon(a, out, t) { for (let i = 0; i < 3; i++) { const t0 = t + i * 2.1;
    [[0.5, 4.5, 0.25], [1, 3.8, 0.35], [1.19, 2.8, 0.2], [1.56, 2.2, 0.15], [2, 2, 0.12], [2.51, 1.5, 0.08], [3.01, 1.2, 0.06]].forEach(([m, len, v]) => {
      const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 196 * m; env(g, t0, 0.005, len, v); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + len + 0.05); }); } }
};
const AMB_REC = { dvere: ["dvere1", "dvere2", "dvere4", "dvere5"], hrom: ["hrom1", "hrom2"], vlk: ["vlk1"], sova: ["sova1", "sova2"], chechot: ["chechot1", "chechot2", "chechot3"], krik: ["krik1"],
  havran: ["havran1", "havran2", "vrana1"], srdce: ["srdce1"], scena: ["scena1"] };
// jak casto (vaha) a jak nahlas (srovnano merenim)
const AMB_W = { hororovka: 4, dvere: 4, chechot: 3, hrom: 2, vlk: 1.5, sova: 1.5, havran: 1.5, srdce: 1, scena: 1, krik: 0.5, broukani: 1, psycho: 1, bum: 1, napeti: 1, retezy: 0.7, duch: 0.7, klepani: 0.8, kroky: 0.5, zvon: 0.5 };
const AMB_LVL = { hororovka: 0.85, dvere: 1, chechot: 1, hrom: 1, vlk: 1, sova: 1, havran: 1, srdce: 1, scena: 1, krik: 1, broukani: 1, psycho: 1, bum: 1, napeti: 1, retezy: 2.6, duch: 0.95, klepani: 1.1, kroky: 3.5, zvon: 0.25 };
const AMB_NAMES = { hororovka: "🎠 dětská hororovka (hrací strojek)", dvere: "🚪 skřípání dveří", chechot: "🧙 chechot ježibaby", hrom: "⛈️ hrom", vlk: "🐺 vlk", sova: "🦉 sova", havran: "🐦‍⬛ havran", srdce: "💓 srdce", scena: "👣 kroky, výkřik a vrčení",
  krik: "😱 výkřik", broukani: "👧 broukání ukolébavky", psycho: "🎻 lekačka – housle", bum: "💥 lekačka – BUM", napeti: "📈 lekačka – napětí", retezy: "⛓️ řetězy", duch: "👻 duch", klepani: "✊ klepání", kroky: "👣 kroky", zvon: "🔔 zvon" };
const SFX = {};
async function sfxBuf(a, id) { if (SFX[id]) return SFX[id]; const r = await fetch(`sfx/${id}.ogg`); if (!r.ok) throw new Error("bez zvuku"); return SFX[id] = await a.decodeAudioData(await r.arrayBuffer()); }
// zahraj jeden zvuk z dalky: nahodne zleva/zprava, s dozvukem
async function ambEvent(a, dest, t, name, vol, pick) {
  if (!IR) spookyIR(a);
  const pan = a.createStereoPanner ? a.createStereoPanner() : a.createGain(); if (pan.pan) pan.pan.value = rand(-0.8, 0.8);
  const dry = a.createGain(), conv = a.createConvolver(), wet = a.createGain(), out = a.createGain();
  dry.gain.value = 0.75; conv.buffer = IR; wet.gain.value = ["hororovka", "broukani"].includes(name) ? 0.7 : 0.45; out.gain.value = (vol == null ? 1.25 : vol) * AMB_LVL[name];
  dry.connect(out); conv.connect(wet); wet.connect(out); out.connect(pan); pan.connect(dest);
  const tap = a.createGain(); tap.connect(dry); tap.connect(conv);
  if (name === "hororovka") { await hororovka(a, tap, t, pick); return; }
  if (AMBFX[name]) { AMBFX[name](a, tap, t); return; }
  const list = AMB_REC[name], id = pick || list[Math.floor(Math.random() * list.length)], buf = await sfxBuf(a, id);
  const s = a.createBufferSource(); s.buffer = buf; if (name === "chechot") s.playbackRate.value = rand(0.82, 0.95); // hlubsi, zlovestnejsi
  s.connect(tap); s.start(Math.max(t, a.currentTime));
}
let ambLast = "";
function ambPick() { // nahodny vyber podle vah, nikdy dvakrat po sobe
  const keys = Object.keys(AMB_W).filter(k => k !== ambLast), sum = keys.reduce((s, k) => s + AMB_W[k], 0); let r = Math.random() * sum;
  for (const k of keys) { r -= AMB_W[k]; if (r <= 0) return k; } return keys[0];
}
function ambRandom() { const k = ambPick(); ambLast = k; const a = ac(); ambEvent(a, AMB.out, a.currentTime + 0.05, k).catch(() => {}); }
// stale temny podton: rozladene hluboke tony + jemne kvileni nahore
function ambDrone(a, out) {
  const nodes = [], lp = a.createBiquadFilter(), g = a.createGain(); lp.type = "lowpass"; lp.frequency.value = 600; lp.Q.value = 4; g.gain.value = 0.009; // telefon hluboke basy nezahraje -> o oktavu vys
  const lf = a.createOscillator(), lfg = a.createGain(); lf.frequency.value = 0.045; lfg.gain.value = 350; lf.connect(lfg); lfg.connect(lp.frequency); nodes.push(lf);
  [[110, "sine", 1], [116.5, "sine", 0.8], [155.6, "triangle", 0.6], [220.8, "sawtooth", 0.15]].forEach(([f, ty, v]) => { const o = a.createOscillator(), og = a.createGain(); o.type = ty; o.frequency.value = f; og.gain.value = v; o.connect(og); og.connect(lp); nodes.push(o); });
  const hi = a.createOscillator(), hg = a.createGain(), tr = a.createOscillator(), tg = a.createGain(); hi.frequency.value = 1661; hg.gain.value = 0.004; tr.frequency.value = 0.3; tg.gain.value = 0.004;
  tr.connect(tg); tg.connect(hg.gain); hi.connect(hg); hg.connect(out); nodes.push(hi, tr);
  lp.connect(g); g.connect(out); nodes.forEach(n => n.start()); return nodes;
}
// spolecny vystup pozadi: hlasitejsi, ale s pojistkou proti prebuzeni reproduktoru
function ambBus(a) {
  const comp = a.createDynamicsCompressor(), mk = a.createGain();
  comp.threshold.value = -18; comp.knee.value = 8; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.25; mk.gain.value = 1.6;
  const lim = a.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.1; // strop: nikdy neprebudi
  comp.connect(mk); mk.connect(lim); lim.connect(a.destination); return comp;
}

// ---------- DETSKE HOROROVKY: skutecny hraci strojek + desivy podkres ----------
// Stare detske rikanky (volne dilo), prevedene do moll. [pulton od C5, delka v dobach]
const RIK = {
  mary: [[4, 1], [2, 1], [0, 1], [2, 1], [4, 1], [4, 1], [4, 2], [2, 1], [2, 1], [2, 2], [4, 1], [7, 1], [7, 2], [4, 1], [2, 1], [0, 1], [2, 1], [4, 1], [4, 1], [4, 1], [4, 1], [2, 1], [2, 1], [4, 1], [2, 1], [0, 3]],
  london: [[7, 1.5], [9, .5], [7, 1], [5, 1], [4, 1], [5, 1], [7, 2], [2, 1], [4, 1], [5, 2], [4, 1], [5, 1], [7, 2], [7, 1.5], [9, .5], [7, 1], [5, 1], [4, 1], [5, 1], [7, 2], [2, 2], [7, 2], [4, 1], [0, 3]],
  rosie: [[7, 1], [7, .5], [4, 1], [9, .5], [7, 1], [4, 1], [5, 1], [7, .5], [7, 1], [4, .5], [9, 1], [7, 1], [4, 1], [7, 1], [7, 1], [4, 2], [7, 1], [7, 1], [4, 2], [7, 1], [7, 1], [0, 3]],
  rockabye: [[4, 1.5], [7, .5], [4, 1], [2, 1], [0, 1], [4, 1], [7, 2], [12, 1.5], [11, .5], [9, 1], [7, 3], [7, 1.5], [9, .5], [7, 1], [5, 1], [4, 1], [5, 1], [7, 3], [2, 1.5], [4, .5], [5, 1], [4, 1], [2, 1], [0, 3]],
  weasel: [[0, 1], [0, .5], [2, 1], [2, .5], [4, .5], [7, .5], [4, .5], [0, 1], [0, .5], [2, 1], [2, .5], [4, 1.5], [0, 1], [-5, .5], [0, 1], [0, .5], [2, 1], [2, .5], [4, .5], [7, .5], [4, .5], [0, 1.5], [9, 1.5], [2, 1], [5, .5], [4, 1.5], [0, 2]],
  kubo: [[0, 1], [2, 1], [4, 1], [0, 1], [0, 1], [2, 1], [4, 1], [0, 1], [4, 1], [5, 1], [7, 2], [4, 1], [5, 1], [7, 2], [7, .5], [9, .5], [7, .5], [5, .5], [4, 1], [0, 1], [7, .5], [9, .5], [7, .5], [5, .5], [4, 1], [0, 1], [0, 1], [-5, 1], [0, 2]]
};
const minor = n => [4, 9, 11].includes(((n % 12) + 12) % 12) ? n - 1 : n; // E->Eb, A->Ab, H->B: z durove rikanky je moll
async function hororovka(a, out, t, pick) {
  const box = await sfxBuf(a, "strojek1"), BASE = 993; // nahrany ton hraciho strojku (993 Hz)
  const stings = ["dvere", "chechot", "bum", "psycho"], sting = stings[Math.floor(Math.random() * stings.length)];
  t = Math.max(t, a.currentTime + 0.05); // po nacteni zvuku uz mohl cas utect
  const key = pick || Object.keys(RIK)[Math.floor(Math.random() * Object.keys(RIK).length)], mel = RIK[key], beat = rand(0.42, 0.52), root = 523.25 * Math.pow(2, rand(-3, 1) / 12);
  const t0 = t + 2.5; let tt = t0; const N = mel.length;
  mel.forEach(([n, d], i) => { // strojek se ke konci dotaci: zpomaluje, rozlaďuje a klesa
    const wind = Math.max(0, (i - (N - 6)) / 6), f = root * Math.pow(2, minor(n) / 12) * Math.pow(2, (rand(-12, 12) - wind * 90) / 1200);
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = box; s.playbackRate.value = f / BASE; g.gain.value = 0.9;
    s.connect(g); g.connect(out); s.start(tt); tt += d * beat * (1 + wind * 0.9) + rand(0, 0.03);
  });
  const end = tt + 0.8;
  // podkres: chvejici se rozladene smycce (pultonovy "cluster"), pomalu nabiha
  const str = a.createGain(), lp = a.createBiquadFilter(), trem = a.createOscillator(), tg = a.createGain();
  lp.type = "lowpass"; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1600, end);
  trem.frequency.value = 7; tg.gain.value = 0.35; trem.connect(tg); tg.connect(str.gain);
  str.gain.setValueAtTime(0.0001, t); str.gain.exponentialRampToValueAtTime(0.45, t + 6); str.gain.setValueAtTime(0.45, end - 0.3); str.gain.exponentialRampToValueAtTime(0.0001, end + 0.2);
  [233.1, 246.9, 349.2, 370].forEach(f => { const o = a.createOscillator(), og = a.createGain(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = rand(-10, 10); og.gain.value = 0.05; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.3); });
  lp.connect(str); str.connect(out); trem.start(t); trem.stop(end + 0.3);
  // tichy tep pod tim
  for (let p = t + 3; p < end - 0.5; p += 1.25) { thump(a, out, p, 58, 0.18, 0.5); thump(a, out, p + 0.24, 50, 0.2, 0.32); }
  // a na konci lekacka
  const se = end + 0.15;
  if (AMBFX[sting]) AMBFX[sting](a, out, se);
  else { const b = await sfxBuf(a, AMB_REC[sting][Math.floor(Math.random() * AMB_REC[sting].length)]), s = a.createBufferSource(), g = a.createGain(); s.buffer = b; g.gain.value = 1.1; s.connect(g); g.connect(out); s.start(se); }
  return end + 3 - t; // delka v sekundach
}
