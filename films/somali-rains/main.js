// Labada Xilli-roobaad ee Soomaaliya — 3D map of the Horn of Africa (AWS Terrain Tiles + Sentinel-2 cloudless 2016, relief ×12),
// a glowing rain belt (ITCZ) that follows the sun, converging winds, a cut through the sea for upwelling.
// Fahaan theme on top: karaoke captions (Montserrat ExtraBold), the season calendar, the Fahaan end card. 1080×1920.
import * as THREE from 'three';
import { makePost } from './post.js';
import { clamp, lerp, seg, ss, eo, eio, back, hash, track, TAU } from '/core/lib.js';
import { SC, DUR } from './timeline.js';
import { drawIcon } from './icon.js';

const Wd = 1080, Ht = 1920, Q = new URLSearchParams(location.search), D2R = Math.PI / 180;
const J = u => fetch(u).then(r => r.json()), B = u => fetch(u).then(r => r.arrayBuffer());
const [meta, hraw, WORDS] = await Promise.all([J('assets/meta.json'), B('assets/height.bin'), J('voices/words.json')]);
const hbuf = new Float32Array(hraw), EX = meta.EX;
const { GW, GH, km_px, width_km: WK, height_km: HK } = meta, [MX0, MY0] = meta.merc, NZ = 2 ** meta.z * 256;
function merc(lon, lat) { return [(lon + 180) / 360 * NZ, (1 - Math.asinh(Math.tan(lat * D2R)) / Math.PI) / 2 * NZ]; }
function xz(lon, lat) { const [mx, my] = merc(lon, lat); return [(mx - MX0) * km_px - WK / 2, (my - MY0) * km_px - HK / 2]; }
function unz(z) { const my = MY0 + (z + HK / 2) / km_px; return Math.atan(Math.sinh(Math.PI * (1 - 2 * my / NZ))) / D2R; }
function bil(gx, gz) { const x0 = clamp(Math.floor(gx), 0, GW - 2), z0 = clamp(Math.floor(gz), 0, GH - 2), fx = clamp(gx - x0), fz = clamp(gz - z0); const a = hbuf[z0 * GW + x0], b = hbuf[z0 * GW + x0 + 1], c = hbuf[(z0 + 1) * GW + x0], d = hbuf[(z0 + 1) * GW + x0 + 1]; return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz; }
const hAt = (X, Z) => bil((X + WK / 2) / WK * (GW - 1), (Z + HK / 2) / HK * (GH - 1));
const yOf = h => Math.max(h, 0) / 1000 * EX;
const geo = (lon, lat, lift = 0) => { const [X, Z] = xz(lon, lat); return new THREE.Vector3(X, yOf(hAt(X, Z)) + lift, Z); };
const lift = (lon, lat, y) => { const [X, Z] = xz(lon, lat); return new THREE.Vector3(X, y, Z); };

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(Wd, Ht);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); const HAZE = new THREE.Color(0x8aa0b0); scene.fog = new THREE.Fog(HAZE, 3000, 9000);
scene.background = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g2 = c.getContext('2d'); const gr = g2.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#5f86a8'); gr.addColorStop(.45, '#a9bccb'); gr.addColorStop(.62, '#8aa0b0'); gr.addColorStop(.75, '#16293a'); gr.addColorStop(1, '#0b1825'); g2.fillStyle = gr; g2.fillRect(0, 0, 4, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
const tl = new THREE.TextureLoader(), load = u => new Promise((r, e) => tl.load(u, r, undefined, e));
const [albedo, waterTex, shadowTex] = await Promise.all(['assets/albedo.jpg', 'assets/water.png', 'assets/shadow.png'].map(load));
albedo.colorSpace = THREE.SRGBColorSpace; albedo.anisotropy = 16; shadowTex.anisotropy = 8;

// cross-section cut (upwelling): terrain between the section line and the camera is swept away
const CUT = { p: new THREE.Vector4(), d: { value: 0 } }, cutU = { cutP: { value: CUT.p }, cutD: CUT.d };
const CUT_GLSL = `uniform vec4 cutP; uniform float cutD; bool cutAway(vec3 w){ if (cutD <= 0.) return false; float s = dot(w.xz - cutP.xy, cutP.zw); return s > 0. && s < cutD; }\n`;
// rain greening: latitudes the belt has swept (Gu'), plus two storm spots in the opening
const WET = { band: new THREE.Vector4(-90, -90, 0, 0), s1: new THREE.Vector4(0, 0, 1, 0), s2: new THREE.Vector4(0, 0, 1, 0), dry: { value: 0 } };
const wetU = { wetBand: { value: WET.band }, wetS1: { value: WET.s1 }, wetS2: { value: WET.s2 }, dryAmt: WET.dry, tWater: { value: waterTex }, MY0: { value: MY0 }, HK: { value: HK }, kmpx: { value: km_px }, NZ: { value: NZ } };
const LIGHT_CHUNK = THREE.ShaderChunk.lights_fragment_begin.replaceAll('RE_Direct( directLight,', 'directLight.color *= mix( 1.0, texture2D( tShadow, vMapUv ).r, 0.85 );\n\t\tRE_Direct( directLight,');
function terrainMat() {
  const rough = (() => { const c = document.createElement('canvas'); c.width = waterTex.image.width; c.height = waterTex.image.height; const g = c.getContext('2d'); g.drawImage(waterTex.image, 0, 0); const id = g.getImageData(0, 0, c.width, c.height); for (let i = 0; i < id.data.length; i += 4) { const w = id.data[i] / 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = 245 * (1 - w) + 190 * w; } g.putImageData(id, 0, 0); return new THREE.CanvasTexture(c); })();
  const m = new THREE.MeshStandardMaterial({ map: albedo, roughnessMap: rough, roughness: 1, metalness: 0 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, cutU, wetU, { tShadow: { value: shadowTex } });
    sh.vertexShader = 'varying vec3 vWp;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = `uniform sampler2D tShadow, tWater; uniform vec4 wetBand, wetS1, wetS2; uniform float dryAmt, MY0, HK, kmpx, NZ; varying vec3 vWp;\n` + CUT_GLSL + sh.fragmentShader
      .replace('void main() {', 'void main() {\n if (cutAway(vWp)) discard;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float my = MY0 + (vWp.z + HK * .5) / kmpx; float lat = degrees(atan(sinh(3.14159265 * (1. - 2. * my / NZ))));
        float land = 1. - texture2D(tWater, vMapUv).r;
        float w = wetBand.w * smoothstep(wetBand.x - 1.2, wetBand.x + .4, lat) * (1. - smoothstep(wetBand.y - .4, wetBand.y + 1.2, lat));
        w = max(w, wetS1.w * (1. - smoothstep(wetS1.z * .5, wetS1.z, distance(vWp.xz, wetS1.xy))));
        w = max(w, wetS2.w * (1. - smoothstep(wetS2.z * .5, wetS2.z, distance(vWp.xz, wetS2.xy))));
        vec3 green = vec3(.10, .26, .07);
        diffuseColor.rgb = mix(diffuseColor.rgb, green * (.8 + 1.4 * dot(diffuseColor.rgb, vec3(.33))), clamp(w, 0., 1.) * land * .72);
        float l = dot(diffuseColor.rgb, vec3(.3, .59, .11)); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(l) * vec3(1.12, 1.0, .82), dryAmt * land * .35);`)
      .replace('#include <lights_fragment_begin>', LIGHT_CHUNK);
  };
  return m;
}
{ // terrain at half the height-grid resolution
  const sx = 2, gw = Math.floor((GW - 1) / sx) + 1, gh = Math.floor((GH - 1) / sx) + 1;
  const g = new THREE.PlaneGeometry(WK, HK, gw - 1, gh - 1); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) p.setY(j * gw + i, yOf(hbuf[Math.min(GH - 1, j * sx) * GW + Math.min(GW - 1, i * sx)]));
  g.computeVertexNormals(); scene.add(new THREE.Mesh(g, terrainMat()));
}
const sun = new THREE.DirectionalLight(0xffe2b8, 3.0); sun.position.set(-150, 67, -60); scene.add(sun, sun.target, new THREE.HemisphereLight(0xa9c2d6, 0x4a3420, .65));

// ---------- glowing ribbons (the style's ribbon shader) ----------
const camera = new THREE.PerspectiveCamera(32, Wd / Ht, 2, 30000);
const PIXK = 2 * Math.tan(16 * D2R) / Ht;
const RIB_V = `attribute float aSide; attribute vec3 aNorm; attribute float aAlong; uniform float wW, pxW, pixK; varying float vSide, vAlong; varying vec3 vW;
  void main(){ vec4 wp = modelMatrix * vec4(position, 1.); float pw = length(cameraPosition - wp.xyz) * pixK; float hw = max(wW * .5, pxW * .5 * pw); wp.xyz += mat3(modelMatrix) * aNorm * aSide * hw; vSide = aSide; vAlong = aAlong; vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const RIB_F = `varying float vSide, vAlong; varying vec3 vW; uniform vec3 col, col2; uniform float k, inten, revA, revB, soft, dash, duty, flowSp, flowLen, flowAmt, flowPh, base, L, endFade, grad;
  ${CUT_GLSL}
  void main(){ if (cutAway(vW) && grad > -.5) discard;
    float g = exp(-vSide * vSide * k); float vis = smoothstep(revA - soft, revA, vAlong) * (1. - smoothstep(revB, revB + soft, vAlong)); if (vis <= 0.) discard;
    float e = smoothstep(0., endFade, vAlong) * smoothstep(L, L - endFade, vAlong); float a = base;
    if (dash > 0.) a *= step(fract(vAlong / dash), duty);
    if (flowAmt > 0.) { float f = fract((vAlong - flowPh) / flowSp); a += flowAmt * smoothstep(1. - flowLen / flowSp, 1., f) * smoothstep(1., .985, f); }
    vec3 c = mix(col, col2, clamp(grad > 0. ? vAlong / L : 0., 0., 1.));
    gl_FragColor = vec4(c * g * a * inten * vis * e, 1.); }`;
function ribbon(pts, o) {
  const pos = [], side = [], nrm = [], al = [], idx = []; let L = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], t = new THREE.Vector3().subVectors(b, a);
    const n = o.side ? o.side.clone() : new THREE.Vector3().crossVectors(t, new THREE.Vector3(0, 1, 0)).normalize();
    if (i) L += pts[i].distanceTo(pts[i - 1]);
    for (const s of [1, -1]) { pos.push(pts[i].x, pts[i].y, pts[i].z); side.push(s); nrm.push(n.x, n.y, n.z); al.push(L); }
    if (i) { const q = 2 * i; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
  g.setAttribute('aNorm', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('aAlong', new THREE.Float32BufferAttribute(al, 1)); g.setIndex(idx);
  const U = { col: new THREE.Color(o.col ?? 0xffa63d), col2: new THREE.Color(o.col2 ?? o.col ?? 0xffa63d), k: o.k ?? 3, inten: 0, wW: o.wW ?? 0, pxW: o.pxW ?? 2, pixK: PIXK, revA: 0, revB: 1e9, soft: o.soft ?? 20,
    dash: o.dash ?? 0, duty: o.duty ?? .55, flowSp: o.flowSp ?? 300, flowLen: o.flowLen ?? 60, flowAmt: o.flowAmt ?? 0, flowPh: 0, base: o.base ?? 1, L, endFade: o.endFade ?? 1, grad: o.grad ?? 0 };
  const uniforms = { ...cutU }; for (const k in U) uniforms[k] = { value: U[k] };
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms, vertexShader: RIB_V, fragmentShader: RIB_F, side: THREE.DoubleSide, transparent: true, depthWrite: false, depthTest: o.depthTest ?? true, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.renderOrder = o.order ?? 2; m.frustumCulled = false; scene.add(m); m.L = L; m.u = uniforms; return m;
}
const smooth = (pts, n) => new THREE.CatmullRomCurve3(pts, false, 'centripetal').getSpacedPoints(n);
const rv = (r, a) => { for (const k in a) r.u[k].value = a[k]; };
const AMB = 0xffa63d, AMB2 = 0xffc36b, ICE = 0xbfe3ff, MONS = 0xff8a4c, DRY = 0xffd45c, WARM = 0xff9a5a;

// ---------- the rain belt (ITCZ): a band along a parallel, moved by its z ----------
const BELT_LON = [31, 63];
const beltPts = smooth([...Array(17)].map((_, i) => lift(lerp(BELT_LON[0], BELT_LON[1], i / 16), 0, 40)), 300);
const z0 = xz(46, 0)[1];
const belt = { glow: ribbon(beltPts, { wW: 640, k: 5.5, base: .26, col: AMB, endFade: 300 }), core: ribbon(beltPts, { wW: 60, pxW: 3, k: 1.6, base: .9, col: AMB2, flowAmt: 1.6, flowSp: 420, flowLen: 120, endFade: 300 }) };
// clouds: soft sprites along the belt; rain streaks under them
const cloudTex = [0, 1, 2, 3].map(v => { const c = document.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d');
  for (let k = 0; k < 9; k++) { const x = 50 + hash(v * 31 + k) * 156, y = 70 + (hash(v * 17 + k) - .5) * 40, r = 26 + hash(v * 7 + k) * 30;
    const gr = g.createRadialGradient(x - r * .2, y - r * .3, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.6, 'rgba(240,244,248,.8)'); gr.addColorStop(1, 'rgba(225,232,240,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  const sh = g.createLinearGradient(0, 60, 0, 130); sh.addColorStop(0, 'rgba(120,135,155,0)'); sh.addColorStop(1, 'rgba(120,135,155,.45)'); g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(0, 0, 256, 160);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; });
const NCL = 46, clouds = [...Array(NCL)].map((_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex[i % 4], color: 0xffffff, transparent: true, depthWrite: false, fog: false })); s.renderOrder = 6; scene.add(s); return s; });
const NRN = 900, rainG = new THREE.BufferGeometry(), rainPos = new Float32Array(NRN * 6); rainG.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rain = new THREE.LineSegments(rainG, new THREE.LineBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: .75, depthWrite: false, fog: false })); rain.frustumCulled = false; rain.renderOrder = 5; scene.add(rain);

// ---------- winds ----------
const curve = (ll, y = 30, n = 120) => smooth(ll.map(([lo, la]) => lift(lo, la, y)), n);
const tradeN = [[[54, 17], [50, 10], [47, 4]], [[48, 18], [44.5, 11], [42, 4.5]], [[60, 13], [55.5, 7], [52, 3.5]], [[42, 16.5], [39.5, 10], [37.5, 4.5]]].map(l => ribbon(curve(l), { pxW: 13, k: 2.4, base: .5, col: ICE, flowAmt: 2.2, flowSp: 260, flowLen: 80 }));
const tradeS = [[[54, -9], [50, -5], [47, -2.5]], [[47.5, -10], [44.5, -6], [42.5, -2.5]], [[60, -8], [55.5, -4.5], [52, -2]], [[41, -10], [39.5, -6], [38.5, -2.5]]].map(l => ribbon(curve(l), { pxW: 13, k: 2.4, base: .5, col: ICE, flowAmt: 2.2, flowSp: 260, flowLen: 80 }));
const monsoon = [[[40.5, -5], [44, 0], [48.5, 5.5], [52.5, 11.5]], [[43.5, -7.5], [47, -2.5], [51, 3], [55, 9.5]], [[46.5, -10], [50, -5], [54, .5], [57.5, 7]]].map(l => ribbon(curve(l, 25, 160), { pxW: 14, k: 2.4, base: .55, col: MONS, flowAmt: 2.6, flowSp: 300, flowLen: 90 }));
const dryW = [[[60, 18], [54, 11], [48.5, 5]], [[55, 20], [49.5, 13], [44.5, 7]], [[62, 12], [57, 6.5], [52, 1.5]]].map(l => ribbon(curve(l, 28, 140), { pxW: 13, k: 2.4, base: .55, col: DRY, flowAmt: 2.4, flowSp: 280, flowLen: 80 }));
const equator = ribbon(smooth([...Array(9)].map((_, i) => lift(lerp(30, 64, i / 8), 0, 6)), 200), { pxW: 2.2, k: 1, base: .9, dash: 60, duty: .5, col: 0xe8f2f8, order: 3 });
// convection: warm air rising under the belt (slanted a little toward the camera so it faces the low shot)
const CONV_LON = [43.7, 44.2, 44.7, 45.2, 45.7];
const conv = CONV_LON.map((lo, i) => { const [X, Z] = xz(lo, 0); const pts = smooth([new THREE.Vector3(X, 3, Z), new THREE.Vector3(X + 6, 18, Z + 3), new THREE.Vector3(X - 3, 34, Z + 5)], 60); return ribbon(pts, { side: new THREE.Vector3(1, 0, 0), wW: 9, pxW: 10, k: 1.8, base: .5, col: WARM, col2: 0xffffff, grad: 1, flowAmt: 3, flowSp: 22, flowLen: 7, endFade: 2 }); });
// subsolar point: where the sun is overhead
const sunDot = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true }));
sunDot.renderOrder = 7; scene.add(sunDot);
const sunRing = ribbon([...Array(73)].map((_, i) => new THREE.Vector3(Math.cos(i / 72 * TAU), 0, Math.sin(i / 72 * TAU))), { pxW: 3, k: 1.4, base: 1, col: 0xffd45c, endFade: .01, order: 7 });

// ---------- upwelling: a section across the Somali coast, offshore of Hobyo/Eyl ----------
const SA = [47.2, 9.4], SB = [53.2, 5.2];   // inland → offshore
const SEC = (() => {
  const N = 420, pts = []; for (let i = 0; i < N; i++) { const k = i / (N - 1), lo = lerp(SA[0], SB[0], k), la = lerp(SA[1], SB[1], k), [X, Z] = xz(lo, la); pts.push({ k, X, Z, h: hAt(X, Z) }); }
  const P0 = pts[0], P1 = pts[N - 1], tx = P1.X - P0.X, tz = P1.Z - P0.Z, tln = Math.hypot(tx, tz); let nx = -tz / tln, nz = tx / tln; if (nz < 0) { nx = -nx; nz = -nz; }   // toward the south: the camera side
  const coast = pts.find(p => p.h <= 0);
  return { pts, P0, P1, nx, nz, len: tln, coastK: coast ? coast.k : .4 };
})();
const DEX = 12, BASE = -75;
const wall = (() => {
  const pos = [], bed = [], kk = [], idx = [];
  SEC.pts.forEach((p, i) => { const top = p.h > 0 ? yOf(p.h) : 0, bd = p.h > 0 ? top : p.h / 1000 * DEX; pos.push(p.X, top, p.Z, p.X, BASE, p.Z); bed.push(bd, bd); kk.push(p.k, p.k); if (i) { const q = 2 * i; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aBed', new THREE.Float32BufferAttribute(bed, 1)); g.setAttribute('aK', new THREE.Float32BufferAttribute(kk, 1)); g.setIndex(idx);
  const m = new THREE.ShaderMaterial({ side: THREE.DoubleSide, transparent: true, toneMapped: false, uniforms: { op: { value: 0 }, up: { value: 0 }, coastK: { value: SEC.coastK } },
    vertexShader: `attribute float aBed, aK; varying float vY, vBed, vK; void main(){ vY = position.y; vBed = aBed; vK = aK; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying float vY, vBed, vK; uniform float op, up, coastK;
      void main(){ vec3 c;
        if (vY > .01) c = mix(vec3(.36, .27, .18), vec3(.66, .52, .35), clamp(vY / 20., 0., 1.));
        else if (vY > vBed) {
          float d = vK - coastK;                                   // distance offshore along the section (0 at the coast)
          float warmDepth = -6. - 10. * smoothstep(.0, .5, d);      // the warm surface layer (schematic thickness)
          float rise = up * (1. - smoothstep(0., .35, d));          // near the coast the cold water climbs to the surface
          float top = mix(warmDepth, 1., rise);
          vec3 warm = vec3(.10, .45, .62), cold = vec3(.02, .30, .30), deep = vec3(.01, .06, .12);
          c = vY > top ? warm : mix(cold, deep, clamp(-vY / 70., 0., 1.));
          if (abs(vY - top) < .6) c += vec3(.25, .4, .4) * up;
        } else { float s = fract(vY * .12); c = mix(vec3(.33, .25, .17), vec3(.37, .28, .19), step(.5, s)); }
        if (abs(vY) < .35 && vY < .0) c = vec3(.75, .9, 1.);
        gl_FragColor = vec4(c, op); }` });
  const w = new THREE.Mesh(g, m); w.renderOrder = 4; w.frustumCulled = false; w.visible = false; scene.add(w); return w;
})();
const secLine = (k0, k1, y0, y1, n = 40) => { const A = SEC.pts[Math.round(k0 * (SEC.pts.length - 1))], Bp = SEC.pts[Math.round(k1 * (SEC.pts.length - 1))]; return [...Array(n)].map((_, i) => { const u = i / (n - 1); return new THREE.Vector3(lerp(A.X, Bp.X, u) + SEC.nx * 1.5, lerp(y0, y1, u), lerp(A.Z, Bp.Z, u) + SEC.nz * 1.5); }); };
const secSide = new THREE.Vector3(0, 1, 0);
const upOut = ribbon(secLine(SEC.coastK + .02, SEC.coastK + .42, -2.5, -2.5), { side: secSide, wW: 2.4, pxW: 5, k: 1.6, base: .5, col: 0x9fe3ff, flowAmt: 3, flowSp: 40, flowLen: 12, order: 6, grad: -1, depthTest: false });
const upRise = ribbon(secLine(SEC.coastK + .3, SEC.coastK + .04, -55, -4), { side: new THREE.Vector3(SEC.nz, 0, -SEC.nx).normalize(), wW: 3, pxW: 6, k: 1.6, base: .5, col: 0x2fd0c0, flowAmt: 3, flowSp: 30, flowLen: 9, order: 6, grad: -1, depthTest: false });

// ---------- clock ----------
const sc = id => SC.find(s => s.id === id), at = (id, dt = 0) => sc(id).t + dt, vEnd = id => { const s = sc(id); return s.v + s.vd; };
const ITLAT = [-12, -13, -8, 0, 6, 12, 15, 15, 10, 4, -3, -9];
const itczLat = phi => { const m = ((phi - .5) % 12 + 12) % 12, i = Math.floor(m), f = m - i; return lerp(ITLAT[i], ITLAT[(i + 1) % 12], ss(f)); };
const PH = [[at('s03'), 3.5], [at('s06', .3), 3.5], [at('s06', 5.3), 15.5], [at('s07', .2), 14.6], [at('s07', 3.3), 18.4], [at('s08', .05), 21], [at('s08', 3.2), 23.8], [at('s09', .2), 24], [at('s09', 2.6), 31.3], [at('s11', .1), 31.3], [at('s11', 3.0), 37.4]];
function phase(t) { if (t <= PH[0][0]) return PH[0][1]; for (let i = 1; i < PH.length; i++) if (t <= PH[i][0]) return lerp(PH[i - 1][1], PH[i][1], eio(seg(t, PH[i - 1][0], PH[i][0]))); return PH[PH.length - 1][1]; }
const beltLat = t => itczLat(phase(t)), sunLat = t => 23.4 * Math.sin((phase(t) - 2.7) / 12 * TAU);
const STORM = [[44.2, 3.4, 1.3], [48.6, 8.6, 1.9]];

// ---------- camera: [t, log distance km, pitch°, yaw°, lon, lat, target height km, target's height on screen (0 top..1)] ----------
const SECMID = [lerp(SA[0], SB[0], SEC.coastK + .16), lerp(SA[1], SB[1], SEC.coastK + .16)];
const YAWS = Math.atan2(SEC.nx, SEC.nz) / D2R;
const CAM = track([
  [0, [Math.log(520), 26, -22, 47.4, 5.6, 0, .42]], [at('s01', 3.8), [Math.log(2600), 58, -10, 46.5, 6, 0, .4]],
  [at('s02', .4), [Math.log(3200), 66, -6, 46, 6, 0, .38]], [at('s02', 3.0), [Math.log(6200), 89, 0, 45.5, 4.5, 0, .36]],
  [at('s04', 3.8), [Math.log(6400), 89, 0, 45.5, 4, 0, .36]],
  [at('s05', .3), [Math.log(3600), 72, -4, 45, 2, 0, .4]], [at('s05', 4.2), [Math.log(3300), 70, -8, 45, 2, 0, .4]],
  [at('s06', .5), [Math.log(5600), 62, -12, 46, 3, 0, .4]], [at('s06', 5.4), [Math.log(5700), 64, -8, 46, 3, 0, .4]],
  [at('s07', .5), [Math.log(5000), 89, 0, 46, 5, 0, .36]], [at('s08', 3.4), [Math.log(4900), 89, 0, 46, 5, 0, .36]],
  [at('s09', .6), [Math.log(3600), 58, -24, 49, 3.5, 0, .38]], [at('s09', 4.8), [Math.log(3300), 54, -18, 49.5, 4, 0, .38]],
  [at('s10', .3), [Math.log(900), 22, YAWS - 6, ...SECMID, -20, .45]], [at('s10', 1.6), [Math.log(640), 7, YAWS + 2, ...SECMID, -24, .46]], [at('s10', 4.6), [Math.log(620), 6, YAWS + 6, ...SECMID, -24, .46]],
  [at('s11', .5), [Math.log(6200), 89, 0, 45.5, 5, 0, .36]], [at('s11', 3.2), [Math.log(6300), 89, 0, 45.5, 5, 0, .36]],
  [at('s12', .2), [Math.log(6300), 89, 0, 45.5, 5, 0, .36]], [at('s12', 1.6), [Math.log(8600), 89, 0, 45.5, 6, 0, .24]], [DUR + 1, [Math.log(8900), 89, 0, 45.5, 6, 0, .24]],
]);
let CAMS = {};
function setCamera(t) {
  const [ld, pd, yd, lo, la, ty, fy] = CAM(t), d = Math.exp(ld), p = pd * D2R, y = yd * D2R, [X, Z] = xz(lo, la);
  const tgt = new THREE.Vector3(X, ty, Z);
  camera.position.set(X + Math.sin(y) * Math.cos(p) * d, ty + Math.sin(p) * d, Z + Math.cos(y) * Math.cos(p) * d);
  camera.up.set(-Math.sin(y), 0, -Math.cos(y)).normalize().add(new THREE.Vector3(0, .02, 0));
  camera.near = Math.max(2, d * .05); camera.far = d * 8 + 2000; camera.lookAt(tgt);
  camera.setViewOffset(Wd, Ht, 0, (.5 - fy) * Ht, Wd, Ht); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  scene.fog.near = d * 1.1; scene.fog.far = d * 3.6 + 200;
  CAMS = { d, tgt, pitch: pd };
}

// ---------- post ----------
const post = makePost(renderer, scene, camera, Wd, Ht, { ssaa: +(Q.get('ssaa') ?? 1), ao: false });
post.dof.maxCoc = 6; post.bloom.strength = .6; post.bloom.radius = .55; post.bloom.threshold = .95;
const VU = post.vig.uniforms; VU.amt.value = .38; VU.warm.value = .2; VU.sat.value = .98; VU.contrast.value = .1;

// ---------- 2D overlay (Fahaan theme) ----------
const ov = document.createElement('canvas'); ov.width = Wd; ov.height = Ht; document.body.appendChild(ov); const g = ov.getContext('2d');
const FONT = 'Montserrat';
const scr = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * Wd, (1 - p.y) / 2 * Ht, p.z]; };
function label(text, x, y, o = {}) {
  if ((o.a ?? 1) <= 0) return; g.save(); g.globalAlpha = o.a ?? 1; g.font = `${o.w || 700} ${o.size || 30}px ${FONT}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.track) g.letterSpacing = o.track + 'px'; g.shadowColor = 'rgba(5,15,30,.65)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.fillStyle = o.color || '#ffffff'; g.fillText(text, x, y); g.restore();
}
function pinAt(text, v, a, o = {}) {
  if (a <= 0) return; const [sx, sy] = scr(v), up = (o.up ?? 130) * eo(seg(a, 0, .5)), dx = o.dx ?? 0;
  g.save(); g.globalAlpha = Math.min(1, a * 2); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.shadowColor = 'rgba(5,15,30,.5)'; g.shadowBlur = 8;
  g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + dx * eo(seg(a, .2, .6)), sy - up); g.stroke();
  g.beginPath(); g.arc(sx, sy, 8 * back(seg(a, 0, .3), 2), 0, TAU); g.fillStyle = '#ffffff'; g.fill(); g.beginPath(); g.arc(sx, sy, 3.5, 0, TAU); g.fillStyle = o.dot || '#4189DD'; g.fill(); g.restore();
  label(text, sx + dx, sy - up - 28, { a: seg(a, .45, 1), size: o.size || 36, w: 800, track: 3, color: o.color });
}
function hexChip(x, y, s, top, side, dark) {
  const pts = [0, 1, 2, 3, 4, 5].map(i => [x + Math.cos(i * Math.PI / 3) * s, y + Math.sin(i * Math.PI / 3) * s * .58]), d = s * .5;
  g.fillStyle = side; g.beginPath(); g.moveTo(...pts[0]); [0, 1, 2, 3].forEach(i => g.lineTo(pts[i][0], pts[i][1] + d)); g.lineTo(...pts[3]); g.lineTo(...pts[2]); g.lineTo(...pts[1]); g.closePath(); g.fill();
  g.fillStyle = dark; g.beginPath(); g.moveTo(...pts[0]); g.lineTo(pts[0][0], pts[0][1] + d); g.lineTo(pts[1][0], pts[1][1] + d); g.lineTo(...pts[1]); g.closePath(); g.fill();
  g.fillStyle = top; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.moveTo(x, y); g.lineTo(...pts[3]); g.lineTo(...pts[4]); g.lineTo(...pts[5]); g.closePath(); g.fill();
}
const MONTH = ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'], SEASON = [{ n: 'JILAAL', wet: 0 }, { n: "GU'", wet: 1 }, { n: 'XAGAA', wet: 0 }, { n: 'DEYR', wet: 1 }];
function calendar(t) {
  const a = seg(t, at('s02', .3), at('s02', 1.6)) * (1 - seg(t, at('s12', .2), at('s12', .9))); if (a <= 0) return;
  const y0 = 1190, gap = 74, x0 = Wd / 2 - gap * 5.5, grow = eo(seg(t, at('s02', 1.6), at('s02', 2.8))), phi = phase(t), cur = Math.floor(((phi % 12) + 12) % 12);
  g.save(); g.globalAlpha = Math.min(1, a * 1.5);
  const bg = g.createLinearGradient(0, y0 - 130, 0, y0 + 90); bg.addColorStop(0, 'rgba(5,15,30,0)'); bg.addColorStop(.5, 'rgba(5,15,30,.28)'); bg.addColorStop(1, 'rgba(5,15,30,0)'); g.fillStyle = bg; g.fillRect(0, y0 - 130, Wd, 220);
  for (let i = 0; i < 12; i++) {
    const s = SEASON[Math.floor(i / 3)], p = back(seg(a, .1 + i * .04, .4 + i * .04), 2); if (p <= 0) continue;
    const x = x0 + i * gap, stack = s.wet ? 1 + Math.round(2 * grow) : 1;
    for (let k = 0; k < stack; k++) hexChip(x, y0 - k * 17 * p, 30 * p, s.wet ? '#6fb8ef' : '#f3dfab', s.wet ? '#3f86c4' : '#d9b27c', s.wet ? '#2f6ea8' : '#b88a5e');
    label(MONTH[i], x, y0 + 46, { size: 24, w: 700, a: p });
  }
  for (let q = 0; q < 4; q++) { const s = SEASON[q], x = x0 + (q * 3 + 1) * gap; label(s.n, x, y0 - (s.wet ? 92 : 52), { size: s.wet ? 32 : 26, w: 800, track: 2, a: seg(a, .5 + q * .08, .8 + q * .08), color: s.wet ? '#ffffff' : '#fff3dc' }); }
  const ma = seg(t, at('s06', .2), at('s06', .8)) * (1 - seg(t, at('s12', .1), at('s12', .5)));
  if (ma > 0) { const x = x0 + cur * gap; g.globalAlpha = ma; g.strokeStyle = '#ffd45c'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y0 + 4, 40, 28, 0, 0, TAU); g.stroke(); g.fillStyle = '#ffd45c'; g.beginPath(); g.moveTo(x - 10, y0 + 70); g.lineTo(x + 10, y0 + 70); g.lineTo(x, y0 + 58); g.closePath(); g.fill(); }
  g.restore();
}
function captions(t, s, o = {}) {
  const words = WORDS[s.id], a = ss(seg(t, s.t, s.t + .25)) * (s.id === 's12' ? 1 : 1 - ss(seg(t, s.end - .2, s.end))); if (a <= 0) return [];
  const fs = o.size || 62, lh = fs * 1.22, maxW = 940, tv = t - s.v;
  g.save(); g.font = `800 ${fs}px ${FONT}`; g.textBaseline = 'alphabetic';
  const sp = g.measureText(' ').width, lines = [[]]; let lw = 0;
  for (const w of words) { const ww = g.measureText(w.w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp; }
  const cy = o.cy || 1440, top = cy - (lines.length * lh) / 2 + fs * .8, boxes = [];
  const fl = g.createLinearGradient(0, cy - 200, 0, cy + 200); fl.addColorStop(0, 'rgba(5,15,30,0)'); fl.addColorStop(.5, `rgba(5,15,30,${.32 * a})`); fl.addColorStop(1, 'rgba(5,15,30,0)'); g.fillStyle = fl; g.fillRect(0, cy - 200, Wd, 400);
  lines.forEach((L, li) => {
    const tot = L.reduce((s2, w) => s2 + w.ww, 0) + sp * (L.length - 1); let x = Wd / 2 - tot / 2; const y = top + li * lh;
    for (const w of L) {
      const on = tv >= w.t0 && tv < w.t1 + .04, done = tv >= w.t1, pop = on ? 1 + .07 * Math.sin(Math.PI * clamp((tv - w.t0) / Math.max(.12, w.t1 - w.t0))) : 1;
      g.save(); g.globalAlpha = a; g.translate(x + w.ww / 2, y - fs * .35); g.scale(pop, pop);
      g.shadowColor = 'rgba(5,15,30,.6)'; g.shadowBlur = 16; g.shadowOffsetY = 3; g.lineJoin = 'round'; g.strokeStyle = 'rgba(8,24,45,.6)'; g.lineWidth = 7; g.strokeText(w.w, -w.ww / 2, fs * .35);
      g.shadowColor = 'transparent'; g.fillStyle = on ? '#ffd45c' : done ? '#ffffff' : 'rgba(255,255,255,.82)'; g.fillText(w.w, -w.ww / 2, fs * .35); g.restore(); x += w.ww + sp;
    }
    boxes.push({ id: s.id + '_' + li, text: L.map(w => w.w).join(' '), x0: Wd / 2 - tot / 2, y0: y - fs, x1: Wd / 2 + tot / 2, y1: y + fs * .3 });
  });
  g.restore(); return boxes;
}
function cloudIcon(x, y, s, strike) {
  g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = 'rgba(5,15,30,.5)'; g.shadowBlur = 12; g.fillStyle = '#ffffff';
  for (const [cx, cy, r] of [[-26, 6, 22], [0, -8, 30], [28, 6, 22]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); } g.fillRect(-48, 6, 96, 22);
  if (strike > 0) { g.shadowColor = 'transparent'; g.strokeStyle = '#ff5a4a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-58, 44); g.lineTo(-58 + 116 * strike, 44 - 92 * strike); g.stroke(); }
  g.restore();
}
function convectionCard(t) {
  const a = seg(t, at('s05', .5), at('s05', 1.1)) * (1 - seg(t, at('s05', 4.1), at('s06', .3))); if (a <= 0) return;
  const u = seg(t, at('s05', 1.0), vEnd('s05')), cx = Wd / 2, cy = 640, w = 860, h = 720, x0 = cx - w / 2, y0 = cy - h / 2, sc_ = .9 + .1 * back(a, 2);
  g.save(); g.globalAlpha = a; g.translate(cx, cy); g.scale(sc_, sc_); g.translate(-cx, -cy);
  // card: sky gradient, ground strip, rounded, thin white rim
  const rr = () => { g.beginPath(); g.roundRect(x0, y0, w, h, 36); };
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; rr(); const sky = g.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, '#4f7fa8'); sky.addColorStop(1, '#bcd6e6'); g.fillStyle = sky; g.fill(); g.shadowColor = 'transparent';
  g.save(); rr(); g.clip();
  const gy = y0 + h - 120; g.fillStyle = '#b9824f'; g.fillRect(x0, gy, w, 120); g.fillStyle = '#d7a46b'; g.fillRect(x0, gy, w, 16);
  // sun-warmed ground glow
  const hg = g.createRadialGradient(cx, gy, 0, cx, gy, 340); hg.addColorStop(0, `rgba(255,140,70,${.45 * seg(u, 0, .2)})`); hg.addColorStop(1, 'rgba(255,140,70,0)'); g.fillStyle = hg; g.fillRect(x0, y0, w, h);
  // rising air: arrows climbing from the ground, warm orange → cool white
  for (let i = 0; i < 5; i++) {
    const x = x0 + 150 + i * 140, ph = (t * .55 + i * .23) % 1, rise = seg(u, .05 + i * .03, .55);
    for (let k = 0; k < 3; k++) { const p = (ph + k / 3) % 1, y = lerp(gy - 20, y0 + 250, p * rise), col = `rgb(${Math.round(lerp(255, 245, p))},${Math.round(lerp(140, 248, p))},${Math.round(lerp(80, 255, p))})`;
      if (rise <= 0) continue; g.globalAlpha = a * Math.sin(Math.PI * p); g.fillStyle = col; g.beginPath(); g.moveTo(x, y - 26); g.lineTo(x + 20, y + 6); g.lineTo(x + 7, y + 6); g.lineTo(x + 7, y + 30); g.lineTo(x - 7, y + 30); g.lineTo(x - 7, y + 6); g.lineTo(x - 20, y + 6); g.closePath(); g.fill(); }
  }
  g.globalAlpha = a;
  // the cloud forms, then rains
  const cl = back(seg(u, .5, .68), 2); if (cl > 0) { g.save(); g.translate(cx, y0 + 180); g.scale(cl * 2.4, cl * 2.4); g.fillStyle = '#ffffff'; for (const [x, y, r] of [[-40, 8, 26], [-12, -10, 34], [22, -4, 30], [48, 10, 22]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } g.fillRect(-66, 8, 136, 26); g.fillStyle = 'rgba(120,140,165,.5)'; g.fillRect(-66, 26, 136, 8); g.restore(); }
  const rn = seg(u, .7, .8); if (rn > 0) { g.strokeStyle = '#8fd0ff'; g.lineWidth = 6; g.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = cx - 150 + i * 23, p = (t * 1.6 + hash(i)) % 1, y = lerp(y0 + 270, gy - 10, p); g.globalAlpha = a * rn; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 34); g.stroke(); } g.globalAlpha = a; }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4; rr(); g.stroke();
  label('HAWO KULUL', x0 + 40, gy - 40, { size: 34, w: 800, track: 2, align: 'left', color: '#ffd2b0', a: seg(u, .08, .2) });
  label('QABOW', x0 + w - 40, y0 + 300, { size: 34, w: 800, track: 2, align: 'right', color: '#ffffff', a: seg(u, .4, .52) });
  label('DARUUR', x0 + w - 40, y0 + 110, { size: 30, w: 800, track: 2, align: 'right', color: '#ffffff', a: seg(u, .6, .72) });
  label('ROOB', x0 + 40, y0 + 430, { size: 30, w: 800, track: 2, align: 'left', color: '#bfe6ff', a: seg(u, .74, .84) });
  g.restore();
}
let TEXTS = [];
function hud(t) {
  g.clearRect(0, 0, Wd, Ht); TEXTS = [];
  const L = beltLat(t);
  pinAt('SOOMAALIYA', geo(46.6, 6.2, 1), seg(t, .9, 1.7) * (1 - seg(t, at('s02', 2), at('s02', 2.6))) + seg(t, at('s07', .6), at('s07', 1.3)) * (1 - seg(t, at('s09'), at('s09', .4))), { up: 150, dx: -40 });
  const itA = seg(t, at('s03', 1.6), at('s03', 2.6)) * (1 - seg(t, at('s04', 3.4), at('s04', 4)));
  if (itA > 0) { const [x, y] = scr(lift(56.5, L, 40)); label('ITCZ', x, y - 80, { size: 56, w: 800, track: 4, a: itA, color: '#ffd45c' }); label('suunka roobka', x, y - 32, { size: 28, w: 700, a: itA }); }
  const eqA = seg(t, at('s04', .8), at('s04', 1.6)) * (1 - seg(t, at('s05'), at('s05', .4)));
  if (eqA > 0) { const [x, y] = scr(lift(33, 0, 6)); label('DHULBARAHA', Math.max(20, x), y - 28, { size: 26, w: 800, track: 3, a: eqA, align: 'left' }); }
  const kA = 0;
  if (kA > 0) { const [x1, y1] = scr(lift(44.0, L - .15, 6)); label('HAWO KULUL', x1, y1, { size: 32, w: 800, track: 2, a: kA, color: '#ffc29a' }); const [x2, y2] = scr(lift(44.0, L + .1, 30)); label('QABOW', x2, y2, { size: 32, w: 800, track: 2, a: kA * seg(t, at('s05', 2.4), at('s05', 3.0)), color: '#e8f4ff' }); }
  const sunA = sunVis(t); if (sunA > 0) { const [x, y] = scr(lift(57, sunLat(t), 2)); label('QORRAXDA', x + 34, y, { size: 28, w: 800, track: 2, a: sunA, align: 'left', color: '#ffd45c' }); }
  const ioA = seg(t, at('s09', 1.8), at('s09', 2.8)) * (1 - seg(t, at('s10'), at('s10', .2)));
  if (ioA > 0) { const [x, y] = scr(lift(56, 2, 0)); label('BADWEYNTA HINDIYA', x, y, { size: 26, w: 700, track: 3, a: ioA, color: '#cfe9f5' }); }
  const mA = seg(t, at('s09', 2.4), at('s09', 3.2)) * (1 - seg(t, at('s10'), at('s10', .3)));
  if (mA > 0) { const [x, y] = scr(lift(53.5, 7, 25)); label('MONSOON', clamp(x + 20, 40, 760), y - 20, { size: 34, w: 800, track: 3, a: mA, color: '#ffb48a', align: 'left' }); }
  const u = secU(t);
  if (u > 0) {
    const P = k => { const p = SEC.pts[Math.round(clamp(k) * (SEC.pts.length - 1))]; return new THREE.Vector3(p.X, 0, p.Z); };
    const [xc, yc] = scr(P(SEC.coastK - .06).setY(6)); label('XEEBTA', clamp(xc, 120, 960), yc - 40, { size: 28, w: 800, track: 3, a: seg(u, .05, .2) });
    const [xw, yw] = scr(P(SEC.coastK + .32).setY(-4)); label('BIYO KULUL', xw, yw - 22, { size: 26, w: 800, track: 2, a: seg(u, .1, .25) * (1 - seg(u, .55, .7)), color: '#cfeeff' });
    const [xq, yq] = scr(P(SEC.coastK + .18).setY(-40));  label('BIYO QABOW', xq, yq, { size: 32, w: 800, track: 2, a: seg(u, .35, .5), color: '#7ff0e0' });
    const [xx, yx] = scr(P(SEC.coastK).setY(0)); const ca = back(seg(u, .62, .75), 2); if (ca > 0) cloudIcon(clamp(xx, 140, 940), clamp(yx - 230, 380, 900), 1.1 * ca, eo(seg(u, .75, .88)));
    label('×12', 70, 330, { size: 24, w: 700, a: seg(u, .1, .3), align: 'left', color: '#cfe9f5' });
  }
  { const es = sc('s12'); if (t > es.t + .6) { g.save(); g.globalAlpha = ss(seg(t, es.t + .6, es.t + 1.4)); const eg = g.createLinearGradient(0, 760, 0, 1700); eg.addColorStop(0, 'rgba(6,16,28,0)'); eg.addColorStop(.25, 'rgba(6,16,28,.72)'); eg.addColorStop(1, 'rgba(6,16,28,.85)'); g.fillStyle = eg; g.fillRect(0, 760, Wd, 1160); g.restore(); } }
  if (t > at('s05') && t < at('s06', .4)) convectionCard(t);
  calendar(t);
  const s = SC.find(x => t >= x.t && t < x.end) || SC[SC.length - 1];
  TEXTS.push(...captions(t, s, s.id === 's12' ? { size: 66, cy: 1450 } : {}));
  // end card: the Fahaan icon and name
  const es = sc('s12'), ea = seg(t, es.t + .9, es.t + 1.5); if (ea > 0) { drawIcon(g, Wd / 2, 1010, 250 * Math.max(.01, back(ea, 1.8))); label('FAHAAN', Wd / 2, 1200, { size: 56, w: 800, track: 10, a: seg(t, es.t + 1.3, es.t + 1.8) }); }
  // sources (one small line for the whole film)
  label('Sawir: Sentinel-2 cloudless 2016 © EOX (CC BY 4.0) · Dhul: AWS Terrain Tiles · Joogga ×12 · Jaantus fudud', Wd / 2, 1660, { size: 15, w: 500, a: .7, color: '#dfe9ef' });
}
const sunVis = t => seg(t, at('s06', .3), at('s06', .9)) * (1 - seg(t, at('s06', 5.2), at('s07', .3))) + (t > at('s09') && t < at('s11', .6) ? seg(t, at('s09', .3), at('s09', .9)) * (1 - seg(t, at('s10'), at('s10', .2))) : 0);
const secU = t => t > at('s10') && t < at('s11') ? seg(t, at('s10', .6), vEnd('s10')) : 0;

// ---------- frame ----------
function render(t) {
  setCamera(t);
  const L = beltLat(t), d = CAMS.d;
  // belt
  const bA = seg(t, at('s03', .2), at('s03', 1.8)) * (1 - seg(t, at('s12', .1), at('s12', .8))) * seg(L, -6, -3.5);
  const bz = xz(46, L)[1] - z0;
  for (const r of [belt.glow, belt.core]) { r.position.z = bz; }
  rv(belt.glow, { inten: bA * .9, revA: lerp(BELT_LON[0] * 0, 0, 1) }); rv(belt.core, { inten: bA, flowPh: t * 160 });
  const bRev = eo(seg(t, at('s03', .2), at('s03', 1.8))) * belt.core.L; rv(belt.glow, { revB: bRev }); rv(belt.core, { revB: bRev });
  // clouds and rain (opening storms + belt)
  const C = [];
  STORM.forEach(([lo, la, t0], i) => { const a = back(seg(t, t0, t0 + .5), 2) * (1 - eo(seg(t, at('s02', .2), at('s02', 1)))); if (a > .01) for (let k = 0; k < 4; k++) C.push({ p: lift(lo + (hash(i * 9 + k) - .5) * 1.6, la + (hash(i * 7 + k) - .5) * 1.2, 34 + k * 3), s: 170 * a * (.7 + .5 * hash(k + i)), a: Math.min(1, a), rain: seg(t, t0 + .3, t0 + .6) }); });
  if (bA > 0) for (let k = 0; k < 30; k++) { const lo = lerp(32, 62, k / 29) + (hash(k) - .5) * .8, la = L + (hash(k * 3) - .5) * 2.4, dd = Math.abs(k / 29 - .45) * 1.6; const a = back(seg(seg(t, at('s03', .2), at('s03', 2)), dd * .5, dd * .5 + .5), 2) * bA; if (a > .01) C.push({ p: lift(lo, la, 36 + hash(k * 5) * 10), s: (190 + 120 * hash(k * 7)) * a, a: Math.min(1, a) * .9, rain: t > at('s05', 3.4) && t < at('s12') ? 1 : 0 }); }
  const camNear = d < 1000;
  clouds.forEach((s, i) => { const c = C[i]; s.visible = !!c; if (!c) return; s.position.copy(c.p); s.scale.set(c.s * (camNear ? .32 : 1), c.s * (camNear ? .2 : .62), 1); s.material.opacity = c.a * .95; });
  let ri = 0; const fall = t * 1.4;
  for (const c of C) { if (c.rain <= 0) continue; for (let k = 0; k < 18 && ri < NRN; k++, ri++) { const ph = (fall + hash(ri * 1.3)) % 1, x = c.p.x + (hash(ri) - .5) * c.s * .7, z = c.p.z + (hash(ri * 7) - .5) * c.s * .35, y = lerp(c.p.y - 4, 2, ph); rainPos.set([x, y, z, x, y - (camNear ? 2.5 : 7), z], ri * 6); } }
  for (; ri < NRN; ri++) rainPos.fill(0, ri * 6, ri * 6 + 6); rainG.attributes.position.needsUpdate = true; rain.visible = C.some(c => c.rain > 0);
  // wetness on the ground
  const sp = (k) => { const [lo, la, t0] = STORM[k], [X, Z] = xz(lo, la); return [X, Z, 320, seg(t, t0 + .5, t0 + 1.6) * (1 - seg(t, at('s02', .4), at('s02', 1.6)))]; };
  WET.s1.set(...sp(0)); WET.s2.set(...sp(1));
  const gu = t > at('s07') ? seg(t, at('s07'), at('s07', .5)) : 0, Lgu = beltLat(Math.min(Math.max(t, at('s07')), at('s07', 3.3)));
  WET.band.set(-4, Lgu, 0, gu * (1 - .7 * ss(seg(t, at('s09', .6), at('s09', 3.2)))) * (1 - ss(seg(t, at('s11', .3), at('s11', 2.6)))));
  WET.dry.value = ss(seg(t, at('s11', .4), at('s11', 2.4))) * (1 - seg(t, at('s12', .2), at('s12', 1)));
  // winds
  tradeN.concat(tradeS).forEach((r, i) => { const a = seg(t, at('s04', .3 + (i % 4) * .2), at('s04', 1.3 + (i % 4) * .2)) * (1 - seg(t, at('s05', .2), at('s05', 1))); rv(r, { inten: a, revB: eo(a) * r.L, flowPh: t * 240 }); });
  monsoon.forEach((r, i) => { const a = seg(t, at('s09', 1.2 + i * .25), at('s09', 2.3 + i * .25)) * (1 - seg(t, at('s10', 4.4), at('s11', .4))); rv(r, { inten: a, revB: eo(a) * r.L, flowPh: t * 260 }); });
  dryW.forEach((r, i) => { const a = seg(t, at('s11', .3 + i * .25), at('s11', 1.3 + i * .25)) * (1 - seg(t, at('s12', .2), at('s12', .8))); rv(r, { inten: a, revB: eo(a) * r.L, flowPh: t * 240 }); });
  const eqA = seg(t, at('s04', .2), at('s04', 1.4)) * (1 - seg(t, at('s06', 5.2), at('s07'))); rv(equator, { inten: eqA * .8, revB: eo(eqA) * equator.L });
  // convection
  const cA = 0 * seg(t, at('s05', 1.4), at('s05', 2.0)) * (1 - seg(t, at('s05', 4.0), at('s06', .3)));
  conv.forEach((r, i) => { r.position.z = bz; rv(r, { inten: cA * .75, revB: eo(seg(t, at('s05', 1.4 + i * .1), at('s05', 2.6 + i * .1))) * r.L, flowPh: t * 14 }); });
  // the sun overhead
  const sA = sunVis(t), [sx, sz] = xz(52, sunLat(t)); sunDot.visible = sA > .01; sunDot.position.set(sx, 4, sz); sunDot.scale.setScalar(Math.max(1, d * .0035) * back(sA, 2));
  sunRing.position.set(sx, 4, sz); sunRing.scale.setScalar(d * (.009 + .002 * Math.sin(t * 3))); rv(sunRing, { inten: sA * .5 });
  // the section (upwelling)
  const u = secU(t);
  if (u > 0) { CUT.p.set(SEC.P0.X, SEC.P0.Z, SEC.nx, SEC.nz); CUT.d.value = 600 * eo(seg(u, 0, .12)); } else CUT.d.value = 0;
  wall.visible = u > 0; wall.material.uniforms.op.value = eo(seg(u, .02, .14)); wall.material.uniforms.up.value = eo(seg(u, .3, .62));
  rv(upOut, { inten: seg(u, .12, .3) * (1 - seg(u, .92, 1)), revB: eo(seg(u, .12, .4)) * upOut.L, flowPh: t * 30 });
  rv(upRise, { inten: seg(u, .3, .45), revB: eo(seg(u, .3, .62)) * upRise.L, flowPh: t * 26 });
  // post: focus on the target, aperture deepening as the camera climbs
  post.dof.focus = d; post.dof.aper = d * (d < 1000 ? 4 : 1.5);
  post.composer.render();
  hud(t);
}

// ---------- sound events (non-musical only) ----------
function events() {
  const E = [], e = (t, type, gain = 1, o = {}) => E.push({ t: +t.toFixed(3), type, gain, ...o });
  e(.05, 'air', .4, { dur: 4.4 }); e(1.3, 'pop', .6); e(1.9, 'pop', .6); e(1.7, 'rain', .45, { dur: 2.6 });
  e(at('s02', .3), 'paper', .6); e(at('s02', .5), 'whoosh', .55, { dur: 2.2 }); for (let i = 0; i < 4; i++) e(at('s02', .6 + i * .16), 'click', .4);
  e(at('s03', .2), 'shimmer', .5, { dur: 1.6 }); e(at('s03', 1.6), 'click', .5);
  for (let i = 0; i < 4; i++) e(at('s04', .3 + i * .2), 'swipe', .4); e(at('s04'), 'wind', .3, { dur: 9 });
  e(at('s05', .2), 'whoosh', .65, { dur: 1.4 }); e(at('s05', 1.5), 'air', .35, { dur: 3 }); e(at('s05', 3.4), 'rain', .4, { dur: 2.2 });
  e(at('s06', .3), 'whoosh', .55, { dur: 1.8 }); e(at('s06', .6), 'pop', .5);
  e(at('s07', .3), 'whoosh', .5, { dur: 1.4 }); e(at('s07', .4), 'rain', .5, { dur: 3.1 });
  e(at('s08', .05), 'whoosh', .5, { dur: 1.2 }); e(at('s08', .3), 'rain', .5, { dur: 2.8 });
  e(at('s09', .4), 'whoosh', .55, { dur: 1.6 }); for (let i = 0; i < 3; i++) e(at('s09', 1.2 + i * .25), 'swipe', .45); e(at('s09', 1.2), 'sea', .3, { dur: 7 });
  e(at('s10', .3), 'whoosh', .5, { dur: 1.2 }); e(at('s10', .6), 'tear', .6, { dur: .9 }); e(at('s10', 1.2), 'hush', .35, { dur: 3.4 }); e(at('s10', 3.6), 'pop', .5); e(at('s10', 4.1), 'click', .6);
  e(at('s11', .3), 'whoosh', .5, { dur: 1.2 }); e(at('s11', .4), 'drywind', .3, { dur: 3.2 });
  e(at('s12', .2), 'whoosh', .65, { dur: 1.6 }); e(at('s12', .9), 'pop', .8); e(at('s12', 1.3), 'click', .5);
  for (const x of SC) E.push({ t: x.v, type: 'voice', id: x.id });
  return E.sort((a, b) => a.t - b.t);
}

window.render = t => render(t); window.DUR = DUR; window.EV = events();
window.TEXTS = t => { render(t); return TEXTS; };
await document.fonts.load(`800 62px ${FONT}`); await document.fonts.load(`700 30px ${FONT}`); await document.fonts.load(`500 15px ${FONT}`);
render(+(Q.get('t') ?? 2));
window.READY = true;
