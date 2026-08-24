/** Lote Matriz Moon Paracas — KMZ UTM 18S. 1 unit = 1.00 m */

export type Vec = { x: number; y: number };

export const LOTE_MATRIZ = {
  areaM2: 112391.8,
  areaHa: 11.23918,
  perimeterM: 1357.21,
  programAreaM2: 112554.3,
  vendibleM2: 61892.18,
  oasisM2: 20662.15,
  viasM2: 11964.41,
  retiroM2: 10035.56,
  reservaM2: 5684.83,
  utmZone: "18S",
  sides: { AB: 290.24, BC: 381.74, CD: 301.85, DA: 383.38 },
  parking: 192,
  lotsTarget: 384,
} as const;

export const UTM_ORIGIN = { east: 374770.351, north: 8460389.348 };

/** KMZ «11has paracas». B easting 374552 (el CAD 374652 da 8.6 ha). */
export const VERTICES = {
  A: { x: -6.921, y: -253.797, east: 374763.43, north: 8460135.551, label: "A", cardinal: "Sur" },
  B: { x: -218.318, y: -55.372, east: 374552.033, north: 8460333.976, label: "B", cardinal: "Oeste" },
  C: { x: 2.017, y: 257.617, east: 374772.368, north: 8460646.965, label: "C", cardinal: "Norte" },
  D: { x: 223.223, y: 51.552, east: 374993.574, north: 8460440.9, label: "D", cardinal: "Este" },
} as const;

export const RING: Vec[] = [VERTICES.A, VERTICES.B, VERTICES.C, VERTICES.D];

/** Elipse ≈ 20 662 m² (π · 90 · 73). */
export const OASIS = { x: 0, y: 0, rx: 90, ry: 73 };
export const PERIMETER_SETBACK = 10;
export const STREET = 6;
export const LOT_FRONT = 8;
export const LOT_DEPTH = 15;
export const LOT_GAP = 0.7;

export function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function centroid(pts: Vec[]): Vec {
  const n = pts.length || 1;
  return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n };
}
export function polygonArea(pts: Vec[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a) / 2;
}
export function pointInPolygon(p: Vec, poly: Vec[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y,
      xj = poly[j].x,
      yj = poly[j].y;
    const hit = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
function norm(v: Vec) {
  const L = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / L, y: v.y / L };
}
export function intersectSegments(p1: Vec, p2: Vec, p3: Vec, p4: Vec): Vec | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
}
export function insetPolygon(poly: Vec[], d: number): Vec[] {
  const n = poly.length;
  const shifted: { p: Vec; dir: Vec }[] = [];
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const e = norm({ x: b.x - a.x, y: b.y - a.y });
    const inward = { x: e.y, y: -e.x };
    shifted.push({ p: { x: a.x + inward.x * d, y: a.y + inward.y * d }, dir: e });
  }
  const out: Vec[] = [];
  for (let i = 0; i < n; i++) {
    const L1 = shifted[(i + n - 1) % n];
    const L2 = shifted[i];
    const p1 = L1.p;
    const p2 = { x: L1.p.x + L1.dir.x, y: L1.p.y + L1.dir.y };
    const p3 = L2.p;
    const p4 = { x: L2.p.x + L2.dir.x, y: L2.p.y + L2.dir.y };
    out.push(intersectSegments(p1, p2, p3, p4) ?? L2.p);
  }
  return out;
}
export const DIAGONAL_CROSS = intersectSegments(VERTICES.A, VERTICES.C, VERTICES.B, VERTICES.D) ?? { x: 0, y: 0 };
export const INSET_RING = insetPolygon(RING, PERIMETER_SETBACK);

const AC = norm({ x: VERTICES.C.x - VERTICES.A.x, y: VERTICES.C.y - VERTICES.A.y });
const AC_PERP = { x: -AC.y, y: AC.x };
/** Franja de acceso: 52 m desde A hacia C. */
export const SOUTH_GATE_S = 52;
export function fromA(s: number, t: number): Vec {
  return {
    x: VERTICES.A.x + AC.x * s + AC_PERP.x * t,
    y: VERTICES.A.y + AC.y * s + AC_PERP.y * t,
  };
}
export function southOfGate(p: Vec) {
  const s = (p.x - VERTICES.A.x) * AC.x + (p.y - VERTICES.A.y) * AC.y;
  return s < SOUTH_GATE_S;
}
export function inOasis(p: Vec, pad = 0) {
  const nx = (p.x - OASIS.x) / (OASIS.rx + pad);
  const ny = (p.y - OASIS.y) / (OASIS.ry + pad);
  return nx * nx + ny * ny <= 1;
}
export function oasisArea() {
  return Math.PI * OASIS.rx * OASIS.ry;
}
export function polyToSvg(pts: Vec[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`).join(" ") + " Z";
}
export const SVG_VIEW = { minX: -260, minY: -300, width: 540, height: 620 };
