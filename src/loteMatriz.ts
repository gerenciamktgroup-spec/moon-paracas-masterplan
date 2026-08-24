/** Masterplan comercial Moon Paracas — cuadrado de programa (no el rombo UTM). */

export type Vec = { x: number; y: number };

export const LOTE_MATRIZ = {
  areaM2: 112554.3,
  areaHa: 11.25543,
  perimeterM: 1342.99,
  oasisM2: 20662.15,
  viasM2: 11964.41,
  parking: 192,
  lotsTarget: 384,
  streetM: 6,
} as const;

/** Lado del cuadrado: √112554.30 ≈ 335.49 m */
export const SIDE = Math.sqrt(LOTE_MATRIZ.areaM2);
export const HALF = SIDE / 2;

export const RING: Vec[] = [
  { x: -HALF, y: -HALF },
  { x: -HALF, y: HALF },
  { x: HALF, y: HALF },
  { x: HALF, y: -HALF },
];

export const VERTICES = {
  SW: { x: -HALF, y: -HALF, label: "SW", cardinal: "Suroeste" },
  NW: { x: -HALF, y: HALF, label: "NW", cardinal: "Noroeste" },
  NE: { x: HALF, y: HALF, label: "NE", cardinal: "Noreste" },
  SE: { x: HALF, y: -HALF, label: "SE", cardinal: "Sureste" },
} as const;

export const PERIMETER_SETBACK = 10;
export const STREET = 6;
export const LOT_FRONT = 8;
export const LOT_DEPTH = 15;
export const LOT_GAP = 0.7;
export const SERVICE_DEPTH = 42;
export const FRONT_Y = -HALF;
export const SERVICE_Y = FRONT_Y + SERVICE_DEPTH;
export const GATE: Vec = { x: 0, y: FRONT_Y };

export const OASIS = { x: 0, y: 12, rx: 81, ry: 66 };

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
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi) inside = !inside;
  }
  return inside;
}
function norm(v: Vec) {
  const L = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / L, y: v.y / L };
}
export function insetPolygon(poly: Vec[], d: number): Vec[] {
  return poly.map((p, i) => {
    const a = poly[(i + poly.length - 1) % poly.length];
    const b = poly[i];
    const c = poly[(i + 1) % poly.length];
    const e1 = norm({ x: b.x - a.x, y: b.y - a.y });
    const e2 = norm({ x: c.x - b.x, y: c.y - b.y });
    const n1 = { x: e1.y, y: -e1.x };
    const n2 = { x: e2.y, y: -e2.x };
    const n = norm({ x: n1.x + n2.x, y: n1.y + n2.y });
    return { x: b.x + n.x * d, y: b.y + n.y * d };
  });
}
export const INSET_RING = insetPolygon(RING, PERIMETER_SETBACK);

export function oasisOctagon(): Vec[] {
  const { x, y, rx, ry } = OASIS;
  const cx = rx * 0.38;
  const cy = ry * 0.38;
  return [
    { x: x - rx + cx, y: y + ry },
    { x: x + rx - cx, y: y + ry },
    { x: x + rx, y: y + ry - cy },
    { x: x + rx, y: y - ry + cy },
    { x: x + rx - cx, y: y - ry },
    { x: x - rx + cx, y: y - ry },
    { x: x - rx, y: y - ry + cy },
    { x: x - rx, y: y + ry - cy },
  ];
}
export function inOasis(p: Vec, pad = 0) {
  const nx = (p.x - OASIS.x) / (OASIS.rx + pad);
  const ny = (p.y - OASIS.y) / (OASIS.ry + pad);
  return nx * nx + ny * ny <= 1;
}
export function oasisArea() {
  return polygonArea(oasisOctagon());
}
export function southOfGate(p: Vec) {
  return p.y < SERVICE_Y;
}
export function fromFront(north: number, east: number): Vec {
  return { x: GATE.x + east, y: FRONT_Y + north };
}
/** Distancia a las diagonales del cuadrado (avenidas en X). */
export function distToSquareDiagonal(p: Vec) {
  const d1 = Math.abs(p.y - p.x) / Math.SQRT2;
  const d2 = Math.abs(p.y + p.x) / Math.SQRT2;
  return Math.min(d1, d2);
}
export function polyToSvg(pts: Vec[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`).join(" ") + " Z";
}
export const SVG_VIEW = { minX: -HALF - 28, minY: -HALF - 36, width: SIDE + 56, height: SIDE + 72 };
