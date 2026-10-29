// Strasidelny make-up: efekty se kresli primo do fotky (prolinani s pleti), ne jako nalepky.
// Kazdy efekt kresli kolem bodu 0,0; L = velikost v px platna, rnd = opakovatelna nahoda (stejny seed = stejny tvar).
function fxRng(seed) { let s = (seed % 2147483646) + 1; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function fxLine(x, pts) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); }
function fxWobble(L, n, amp, rnd) { const p = []; for (let i = 0; i <= n; i++) p.push([-L / 2 + L * i / n, (rnd() - 0.5) * amp]); return p; }
function fxSoft(x, col, blur) { x.shadowColor = col; x.shadowBlur = blur; }
function fxNoShadow(x) { x.shadowColor = "transparent"; x.shadowBlur = 0; x.shadowOffsetY = 0; }

const FX = {
  jizva: { n: "Jizva", s: 0.4, y: 0.38, draw(x, L, rnd) {
    const p = fxWobble(L, 9, L * 0.05, rnd); x.lineCap = x.lineJoin = "round";
    x.globalCompositeOperation = "multiply";
    fxSoft(x, "rgba(170,30,50,.7)", L * 0.06); x.strokeStyle = "rgba(190,60,80,.55)"; x.lineWidth = L * 0.09; fxLine(x, p); x.stroke();
    fxNoShadow(x); x.strokeStyle = "rgba(95,5,20,.95)"; x.lineWidth = L * 0.032; fxLine(x, p); x.stroke();
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "rgba(255,225,225,.3)"; x.lineWidth = L * 0.012; fxLine(x, p.map(q => [q[0], q[1] - L * 0.03])); x.stroke();
    x.globalCompositeOperation = "multiply"; x.strokeStyle = "rgba(25,5,10,.95)"; x.lineWidth = L * 0.014;
    for (let i = 1; i < 9; i++) { const [sx, sy] = p[i], a = L * 0.075, b = (rnd() - 0.5) * L * 0.03;
      x.beginPath(); x.moveTo(sx - a * 0.5 + b, sy - a); x.lineTo(sx + a * 0.5 + b, sy + a); x.moveTo(sx + a * 0.5 - b, sy - a); x.lineTo(sx - a * 0.5 - b, sy + a); x.stroke(); }
  } },
  stehy: { n: "Frankenstein", s: 0.5, y: 0.25, draw(x, L, rnd) {
    const p = fxWobble(L, 6, L * 0.06, rnd); x.lineCap = x.lineJoin = "round";
    x.globalCompositeOperation = "multiply";
    fxSoft(x, "rgba(90,20,100,.8)", L * 0.08); x.strokeStyle = "rgba(110,50,120,.4)"; x.lineWidth = L * 0.13; fxLine(x, p); x.stroke();
    fxNoShadow(x); x.strokeStyle = "rgba(20,5,20,.95)"; x.lineWidth = L * 0.022; fxLine(x, p); x.stroke();
    for (let i = 0; i < 12; i++) { const t = (i + 0.5) / 12, sx = -L / 2 + L * t, k = Math.min(5, Math.floor(t * 6)),
        sy = p[k][1] + (p[k + 1][1] - p[k][1]) * (t * 6 - k), h = L * (0.08 + rnd() * 0.03);
      x.strokeStyle = "rgba(15,5,15,.95)"; x.lineWidth = L * 0.016; x.beginPath(); x.moveTo(sx, sy - h); x.lineTo(sx + L * 0.01, sy + h); x.stroke();
      x.fillStyle = "rgba(120,10,30,.8)"; [sy - h, sy + h].forEach(yy => { x.beginPath(); x.arc(sx, yy, L * 0.012, 0, 7); x.fill(); }); }
  } },
  zuby: { n: "Upíří zuby", s: 0.3, y: 0.7, draw(x, L, rnd) {
    x.globalCompositeOperation = "multiply"; x.strokeStyle = "rgba(60,0,20,.55)"; x.lineWidth = L * 0.035; x.lineCap = "round";
    x.beginPath(); x.moveTo(-L * 0.42, -L * 0.02); x.quadraticCurveTo(0, L * 0.06, L * 0.42, -L * 0.02); x.stroke();
    x.globalCompositeOperation = "source-over";
    [-1, 1].forEach((sd, j) => {
      const cx = sd * L * 0.2, w = L * 0.15, h = L * 0.38; x.save(); x.translate(cx, 0); x.scale(sd, 1);
      x.beginPath(); x.moveTo(-w / 2, 0); x.quadraticCurveTo(-w * 0.3, h * 0.55, w * 0.12, h); x.quadraticCurveTo(w * 0.22, h * 0.5, w / 2, 0); x.closePath();
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f4f8ef"); g.addColorStop(0.7, "#e2e9da"); g.addColorStop(1, "#b9c4ad");
      x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = L * 0.04; x.shadowOffsetY = L * 0.015; x.fillStyle = g; x.fill(); fxNoShadow(x);
      x.strokeStyle = "rgba(60,70,50,.5)"; x.lineWidth = L * 0.008; x.stroke();
      x.strokeStyle = "rgba(255,255,255,.8)"; x.lineWidth = L * 0.012; x.beginPath(); x.moveTo(-w * 0.2, h * 0.1); x.quadraticCurveTo(-w * 0.12, h * 0.5, w * 0.05, h * 0.8); x.stroke();
      if (j === 1) { // kapka krve na spicce
        const ty = h * 0.98, dx = w * 0.12; x.fillStyle = "#8a0010"; x.beginPath(); x.moveTo(dx - L * 0.02, ty); x.quadraticCurveTo(dx, ty - L * 0.04, dx + L * 0.02, ty);
        x.lineTo(dx + L * 0.012, ty + L * 0.1); x.arc(dx, ty + L * 0.11, L * 0.024, 0, Math.PI); x.closePath(); x.fill();
        x.fillStyle = "rgba(255,255,255,.55)"; x.beginPath(); x.arc(dx - L * 0.008, ty + L * 0.105, L * 0.007, 0, 7); x.fill(); }
      x.restore(); });
  } },
  sroub: { n: "Šroub", s: 0.2, x: 0.22, y: 0.78, draw(x, L, rnd) {
    x.globalCompositeOperation = "multiply"; fxSoft(x, "rgba(0,0,0,.9)", L * 0.12);
    x.fillStyle = "rgba(40,30,40,.6)"; x.beginPath(); x.ellipse(L * 0.15, 0, L * 0.1, L * 0.2, 0, 0, 7); x.fill(); fxNoShadow(x);
    x.globalCompositeOperation = "source-over";
    const metal = (y0, y1) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#2b302b"); g.addColorStop(0.35, "#c3ccbe"); g.addColorStop(0.55, "#7c857a"); g.addColorStop(1, "#1e221e"); return g; };
    x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = L * 0.06; x.shadowOffsetY = L * 0.03;
    x.fillStyle = metal(-L * 0.1, L * 0.1); x.fillRect(-L * 0.25, -L * 0.1, L * 0.42, L * 0.2);
    x.fillStyle = metal(-L * 0.2, L * 0.2); x.fillRect(-L * 0.44, -L * 0.2, L * 0.2, L * 0.4); fxNoShadow(x);
    x.strokeStyle = "rgba(0,0,0,.5)"; x.lineWidth = L * 0.012; for (let i = 1; i < 5; i++) { const sx = -L * 0.25 + i * L * 0.08; x.beginPath(); x.moveTo(sx, -L * 0.1); x.lineTo(sx + L * 0.03, L * 0.1); x.stroke(); }
    x.globalCompositeOperation = "multiply"; x.fillStyle = "rgba(160,80,30,.5)";
    for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(-L * 0.44 + rnd() * L * 0.6, (rnd() - 0.5) * L * 0.35, L * (0.01 + rnd() * 0.025), 0, 7); x.fill(); }
  } },
  kruhy: { n: "Propadlé oči", s: 0.42, y: 0.42, draw(x, L, rnd) {
    x.globalCompositeOperation = "multiply";
    [-1, 1].forEach(sd => { const cx = sd * L * 0.3;
      let g = x.createRadialGradient(cx, 0, 0, cx, 0, L * 0.24); g.addColorStop(0, "rgba(70,10,70,.75)"); g.addColorStop(0.6, "rgba(80,20,80,.45)"); g.addColorStop(1, "rgba(80,20,80,0)");
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, 0, L * 0.24, L * 0.17, 0, 0, 7); x.fill();
      g = x.createRadialGradient(cx, L * 0.08, 0, cx, L * 0.08, L * 0.16); g.addColorStop(0, "rgba(40,0,40,.6)"); g.addColorStop(1, "rgba(40,0,40,0)");
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, L * 0.09, L * 0.17, L * 0.07, 0, 0, 7); x.fill(); });
  } },
  oci: { n: "Svítící oči", s: 0.42, y: 0.42, draw(x, L, rnd) {
    x.globalCompositeOperation = "screen";
    [-1, 1].forEach(sd => { const cx = sd * L * 0.3;
      let g = x.createRadialGradient(cx, 0, 0, cx, 0, L * 0.17); g.addColorStop(0, "rgba(255,60,30,1)"); g.addColorStop(0.25, "rgba(255,20,10,.8)"); g.addColorStop(1, "rgba(255,0,0,0)");
      x.fillStyle = g; x.beginPath(); x.arc(cx, 0, L * 0.17, 0, 7); x.fill();
      x.fillStyle = "rgba(255,240,200,.95)"; x.beginPath(); x.arc(cx, 0, L * 0.022, 0, 7); x.fill(); });
  } },
  krev: { n: "Krev", s: 0.32, y: 0.74, draw(x, L, rnd) {
    const n = 5, drops = [];
    for (let i = 0; i < n; i++) drops.push([-L * 0.4 + L * 0.8 * (i + 0.15 + rnd() * 0.7) / n, L * 0.025 + rnd() * L * 0.025, L * (0.1 + rnd() * rnd() * 0.6)]);
    const g = x.createLinearGradient(0, 0, 0, L * 0.7); g.addColorStop(0, "#a00014"); g.addColorStop(1, "#600008");
    const blob = () => { x.beginPath(); // rozmazana skvrna nahore, nepravidelny okraj
      for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2, r = 1 + (rnd() - 0.5) * 0.35; x.lineTo(Math.cos(a) * L * 0.42 * r, Math.sin(a) * L * 0.07 * r); }
      x.closePath(); x.fill();
      drops.forEach(([cx, w, len]) => { x.beginPath(); x.moveTo(cx - w, 0); x.quadraticCurveTo(cx - w * 0.6, len * 0.6, cx - w * 0.75, len);
        x.arc(cx, len, w * 0.95, Math.PI, 0, true); x.quadraticCurveTo(cx + w * 0.6, len * 0.6, cx + w, 0); x.closePath(); x.fill(); }); };
    // nejdriv prosakne do pokozky (multiply), pak leskla krev navrch
    x.globalCompositeOperation = "multiply"; x.fillStyle = "rgba(150,0,20,.5)"; fxSoft(x, "rgba(150,0,20,.6)", L * 0.06);
    let st = rnd; const seed = Math.floor(rnd() * 1e6); rnd = fxRng(seed); blob(); fxNoShadow(x);
    x.globalCompositeOperation = "source-over"; x.fillStyle = g; x.shadowColor = "rgba(0,0,0,.4)"; x.shadowBlur = L * 0.02; x.shadowOffsetY = L * 0.008;
    x.save(); x.scale(0.88, 0.9); rnd = fxRng(seed); blob(); x.restore(); fxNoShadow(x); rnd = st;
    x.fillStyle = "rgba(255,255,255,.45)"; drops.forEach(([cx, w, len]) => { x.beginPath(); x.arc((cx - w * 0.3) * 0.88, (len - w * 0.2) * 0.9, w * 0.28, 0, 7); x.fill(); });
  } },
  praskliny: { n: "Praskliny", s: 0.38, y: 0.3, draw(x, L, rnd) {
    x.lineCap = "butt"; x.lineJoin = "miter";
    const branch = (px, py, ang, len, w, d) => { const pts = [[px, py]]; let cx = px, cy = py;
      for (let i = 0; i < 5; i++) { ang += (rnd() - 0.5) * 1.1; cx += Math.cos(ang) * len / 5; cy += Math.sin(ang) * len / 5; pts.push([cx, cy]); }
      x.globalCompositeOperation = "multiply"; fxSoft(x, "rgba(60,20,40,.6)", w * 2); x.strokeStyle = "rgba(20,8,15,.92)"; x.lineWidth = w; fxLine(x, pts); x.stroke(); fxNoShadow(x);
      x.globalCompositeOperation = "source-over"; x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = w * 0.5; fxLine(x, pts.map(q => [q[0] + w * 0.7, q[1] + w * 0.7])); x.stroke();
      if (d < 2) { const j = 2 + Math.floor(rnd() * 3); branch(pts[j][0], pts[j][1], ang + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.6), len * 0.45, w * 0.55, d + 1); } };
    const n = 4 + Math.floor(rnd() * 2); for (let i = 0; i < n; i++) branch(0, 0, i / n * Math.PI * 2 + rnd() * 0.8, L * (0.3 + rnd() * 0.25), L * 0.016, 0);
    x.globalCompositeOperation = "multiply"; x.fillStyle = "rgba(20,8,15,.9)"; x.beginPath(); x.arc(0, 0, L * 0.025, 0, 7); x.fill();
  } },
  hniloba: { n: "Hniloba", s: 0.3, x: 0.68, y: 0.55, draw(x, L, rnd) {
    const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = L * (0.28 + rnd() * 0.16); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    x.globalCompositeOperation = "multiply"; // zanicena cervenofialova obruba
    fxSoft(x, "rgba(140,20,60,.9)", L * 0.12); x.fillStyle = "rgba(150,40,80,.55)"; fxLine(x, pts); x.closePath(); x.fill(); fxNoShadow(x);
    x.save(); x.scale(0.78, 0.78); // vnitrek: hnije, ale kuze prosvita (multiply)
    const g = x.createRadialGradient(0, 0, 0, 0, 0, L * 0.42); g.addColorStop(0, "rgba(120,140,20,.95)"); g.addColorStop(0.6, "rgba(160,170,50,.85)"); g.addColorStop(1, "rgba(120,90,50,.6)");
    x.fillStyle = g; fxLine(x, pts); x.closePath(); x.fill(); x.restore();
    for (let i = 0; i < 12; i++) { const a = rnd() * 7, r = rnd() * L * 0.27, rr = L * (0.015 + rnd() * 0.04);
      x.fillStyle = `rgba(${30 + rnd() * 30},${20 + rnd() * 25},5,.85)`; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, rr, 0, 7); x.fill(); }
    for (let i = 0; i < 8; i++) { const a = rnd() * 7, r = rnd() * L * 0.25, rr = L * (0.012 + rnd() * 0.022);
      x.globalCompositeOperation = "source-over"; x.fillStyle = "rgba(215,225,110,.7)"; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, rr, 0, 7); x.fill();
      x.fillStyle = "rgba(255,255,255,.7)"; x.beginPath(); x.arc(Math.cos(a) * r - rr * 0.3, Math.sin(a) * r - rr * 0.3, rr * 0.3, 0, 7); x.fill(); }
  } },
  pavucina: { n: "Pavučina", s: 0.4, x: 0.7, y: 0.42, draw(x, L, rnd) {
    x.globalCompositeOperation = "multiply"; x.strokeStyle = "rgba(10,5,15,.9)"; x.lineWidth = L * 0.01; x.lineCap = "round";
    const sp = 9, R = L * 0.5, ang = []; for (let i = 0; i < sp; i++) ang.push(i / sp * Math.PI * 2 + (rnd() - 0.5) * 0.25);
    ang.forEach(a => { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); x.stroke(); });
    for (let r = 1; r <= 4; r++) { const rr = R * r / 4.3; x.beginPath();
      for (let i = 0; i <= sp; i++) { const a = ang[i % sp], b = ang[(i + 1) % sp] + (i + 1 >= sp ? Math.PI * 2 : 0), m = (a + b) / 2;
        if (i === 0) x.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); if (i < sp) x.quadraticCurveTo(Math.cos(m) * rr * 0.8, Math.sin(m) * rr * 0.8, Math.cos(b) * rr, Math.sin(b) * rr); }
      x.stroke(); }
  } },
  lebka: { n: "Kostlivec", s: 0.4, y: 0.72, draw(x, L, rnd) {
    x.globalCompositeOperation = "multiply"; x.strokeStyle = "rgba(10,5,10,.92)"; x.lineCap = "round"; x.lineWidth = L * 0.022;
    const cy = t => L * 0.06 * (1 - (2 * t - 1) ** 2);
    x.beginPath(); for (let i = 0; i <= 20; i++) { const t = i / 20; x.lineTo(-L / 2 + L * t, cy(t)); } x.stroke();
    x.lineWidth = L * 0.016;
    for (let i = 1; i < 10; i++) { const t = i / 10, px = -L / 2 + L * t, h = L * 0.13 * (1 - Math.abs(2 * t - 1) * 0.5);
      x.beginPath(); x.moveTo(px, cy(t) - h); x.lineTo(px, cy(t) + h); x.stroke(); }
    x.fillStyle = "rgba(10,5,10,.9)"; [-1, 1].forEach(sd => { x.beginPath(); x.arc(sd * L * 0.52, 0, L * 0.035, 0, 7); x.fill(); });
  } }
};

// nakresli jednu polozku (efekt i emoji) do platna velikosti W
function drawItem(x, it, W) {
  x.save(); x.translate(it.x * W, it.y * W); x.rotate(it.r || 0); if (it.m) x.scale(-1, 1);
  if (it.f) FX[it.f].draw(x, it.s * W, fxRng(it.seed || 1));
  else { x.textAlign = "center"; x.textBaseline = "middle"; x.font = `${it.s * W}px "Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.fillText(it.e, 0, 0); }
  x.restore();
}
