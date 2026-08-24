import {
  type Vec,
  VERTICES,
  centroid,
  dist,
  DIAGONAL_CROSS,
  inOasis,
  INSET_RING,
  OASIS,
  pointInPolygon,
  polygonArea,
  SOUTH_GATE_Y,
} from "./loteMatriz";

export type Aldea = 1 | 2 | 3 | 4;
export type Typology = "standard" | "premium-oasis" | "zen" | "ajuste";
export type LotStatus = "disponible" | "reservado" | "vendido" | "bloqueado";

export interface ResidentialLot {
  id: string;
  manzana: string;
  numero: number;
  aldea: Aldea;
  typology: Typology;
  status: LotStatus;
  areaM2: 120 | 240;
  widthM: number;
  depthM: number;
  compatibleDomes: (6 | 7 | 8)[];
  priceUSD: number;
  polygon: Vec[];
  centroid: Vec;
  nearOasis: boolean;
  nearEntrance: boolean;
}

export const ALDEA_META: Record<
  Aldea,
  { name: string; fill: string; fillPremium: string; stroke: string; cardinal: string }
> = {
  1: { name: "Aldea 1", cardinal: "Oeste", fill: "#5C7A54", fillPremium: "#3F5A3A", stroke: "#32462E" },
  2: { name: "Aldea 2", cardinal: "Norte", fill: "#D4B46A", fillPremium: "#C1963E", stroke: "#8E7030" },
  3: { name: "Aldea 3", cardinal: "Este", fill: "#C46A4A", fillPremium: "#A84F36", stroke: "#7C3A28" },
  4: { name: "Aldea 4", cardinal: "Sur", fill: "#CDB892", fillPremium: "#B89A6A", stroke: "#8A734C" },
};

const A = VERTICES.A;
const B = VERTICES.B;
const C = VERTICES.C;
const D = VERTICES.D;
const ORIGIN = { x: 0, y: 0 };

function side(p: Vec, a: Vec, b: Vec) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

/** Four quadrants split by diagonals AC (N–S) and BD (E–W). */
export function aldeaOfPoint(p: Vec): Aldea {
  const towardEast = side(p, A, C) < 0; // D is east of AC
  const towardNorth = side(p, B, D) > 0; // C is north of BD
  if (!towardEast && towardNorth) return 1;
  if (towardEast && towardNorth) return 2;
  if (towardEast && !towardNorth) return 3;
  return 4;
}

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

type Raw = { poly: Vec[]; c: Vec; aldea: Aldea; si: number; tj: number };

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}
function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}
function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

function distToSegment(p: Vec, a: Vec, b: Vec) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) / len;
}

function cellValid(poly: Vec[]) {
  const c = centroid(poly);
  if (!pointInPolygon(c, INSET_RING)) return false;
  if (poly.filter((p) => pointInPolygon(p, INSET_RING)).length < 3) return false;
  if (inOasis(c, 6)) return false;
  if (poly.some((p) => inOasis(p, 1))) return false;
  if (c.y < SOUTH_GATE_Y + 2) return false;
  if (distToSegment(c, A, C) < 5.2 && !inOasis(c, 18)) return false;
  if (distToSegment(c, B, D) < 5.2 && !inOasis(c, 18)) return false;
  const area = polygonArea(poly);
  if (area < 80 || area > 380) return false;
  return true;
}

function buildGrid(): Raw[] {
  const origin = DIAGONAL_CROSS;
  const uVec = sub(D, B);
  const vVec = sub(C, A);
  const uLen = Math.hypot(uVec.x, uVec.y);
  const vLen = Math.hypot(vVec.x, vVec.y);
  const uHat = scale(uVec, 1 / uLen);
  const vHat = scale(vVec, 1 / vLen);

  const LOT_U = 7.4;
  const LOT_V = 12.8;
  const GAP_U = 0.7;
  const GAP_V = 0.7;
  const STREET_U = 6.0;
  const STREET_V = 6.0;
  const BLOCK = 4;

  const raw: Raw[] = [];
  let uCursor = 4;
  let si = 0;
  while (uCursor + LOT_U < uLen - 4) {
    if (si > 0 && si % BLOCK === 0) uCursor += STREET_U;
    let vCursor = 4;
    let tj = 0;
    while (vCursor + LOT_V < vLen - 4) {
      if (tj > 0 && tj % BLOCK === 0) vCursor += STREET_V;

      const u0 = uCursor - uLen / 2;
      const v0 = vCursor - vLen / 2;
      const p00 = add(add(origin, scale(uHat, u0)), scale(vHat, v0));
      const p10 = add(p00, scale(uHat, LOT_U));
      const p01 = add(p00, scale(vHat, LOT_V));
      const p11 = add(p10, scale(vHat, LOT_V));
      const poly = [p00, p10, p11, p01];
      if (cellValid(poly)) {
        const c = centroid(poly);
        raw.push({ poly, c, aldea: aldeaOfPoint(c), si, tj });
      }
      vCursor += LOT_V + GAP_V;
      tj++;
    }
    uCursor += LOT_U + GAP_U;
    si++;
  }
  return raw;
}

function pickN(list: Raw[], n: number): Raw[] {
  if (list.length <= n) return list;
  const ranked = [...list].sort((a, b) => {
    const da = Math.hypot(a.c.x / OASIS.rx, a.c.y / OASIS.ry);
    const db = Math.hypot(b.c.x / OASIS.rx, b.c.y / OASIS.ry);
    return da - db;
  });
  // even spatial coverage along the grid
  const byGrid = [...list].sort((a, b) => a.tj - b.tj || a.si - b.si);
  const step = byGrid.length / n;
  const picked: Raw[] = [];
  const used = new Set<string>();
  for (let i = 0; i < n; i++) {
    const idx = Math.min(byGrid.length - 1, Math.floor(i * step));
    const key = `${byGrid[idx].si}:${byGrid[idx].tj}`;
    if (!used.has(key)) {
      used.add(key);
      picked.push(byGrid[idx]);
    }
  }
  for (const item of ranked) {
    if (picked.length >= n) break;
    const key = `${item.si}:${item.tj}`;
    if (!used.has(key)) {
      used.add(key);
      picked.push(item);
    }
  }
  return picked.slice(0, n);
}

function assignTypology(list: Raw[]): Map<Raw, Typology> {
  const map = new Map<Raw, Typology>();
  const byOasis = [...list].sort((a, b) => dist(a.c, ORIGIN) - dist(b.c, ORIGIN));
  const byEdge = [...list].sort((a, b) => dist(b.c, ORIGIN) - dist(a.c, ORIGIN));
  const taken = new Set<Raw>();
  for (const item of byOasis.slice(0, 12)) {
    map.set(item, "premium-oasis");
    taken.add(item);
  }
  let zen = 0;
  for (const item of byOasis.slice(12)) {
    if (taken.has(item)) continue;
    map.set(item, "zen");
    taken.add(item);
    zen++;
    if (zen >= 6) break;
  }
  let adj = 0;
  for (const item of byEdge) {
    if (taken.has(item)) continue;
    map.set(item, "ajuste");
    taken.add(item);
    adj++;
    if (adj >= 6) break;
  }
  for (const item of list) if (!map.has(item)) map.set(item, "standard");
  return map;
}

function statusFor(seed: number): LotStatus {
  const r = hash(seed + 9);
  if (r < 0.08) return "vendido";
  if (r < 0.2) return "reservado";
  if (r < 0.23) return "bloqueado";
  return "disponible";
}

function priceUSD(area: 120 | 240, typology: Typology) {
  const base = area === 240 ? 31800 : 16800;
  const m = typology === "premium-oasis" ? 1.18 : typology === "zen" ? 1.08 : typology === "ajuste" ? 0.94 : 1;
  return Math.round(base * m);
}

export function generateResidentialLots(): ResidentialLot[] {
  const grid = buildGrid();
  const lots: ResidentialLot[] = [];
  for (const aldea of [1, 2, 3, 4] as Aldea[]) {
    const group = grid.filter((g) => g.aldea === aldea);
    const types = assignTypology(group);
    [...group]
      .sort((a, b) => a.tj - b.tj || a.si - b.si)
      .forEach((raw, i) => {
        const typology = types.get(raw) ?? "standard";
        const areaM2: 120 | 240 = typology === "premium-oasis" ? 240 : 120;
        const area = polygonArea(raw.poly);
        const widthM = Math.round(Math.sqrt(area) * 10) / 10;
        lots.push({
          id: `A${aldea}-${String(i + 1).padStart(2, "0")}`,
          manzana: `A${aldea}-M${Math.floor(i / 8) + 1}`,
          numero: i + 1,
          aldea,
          typology,
          status: statusFor(aldea * 1000 + i),
          areaM2,
          widthM,
          depthM: Math.round((area / Math.max(widthM, 1)) * 10) / 10,
          compatibleDomes: areaM2 === 240 ? [6, 7, 8] : [6, 7],
          priceUSD: priceUSD(areaM2, typology),
          polygon: raw.poly,
          centroid: raw.c,
          nearOasis: dist(raw.c, ORIGIN) < 82,
          nearEntrance: raw.c.y < -145,
        });
      });
  }
  return lots;
}

export const RESIDENTIAL_LOTS = generateResidentialLots();

export function inventoryCounts(lots = RESIDENTIAL_LOTS) {
  const byAldea = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Aldea, number>;
  const byType = { standard: 0, "premium-oasis": 0, zen: 0, ajuste: 0 } as Record<Typology, number>;
  let illegalDome = 0;
  for (const l of lots) {
    byAldea[l.aldea]++;
    byType[l.typology]++;
    if (l.areaM2 === 120 && l.compatibleDomes.includes(8)) illegalDome++;
  }
  return {
    total: lots.length,
    byAldea,
    byType,
    illegalDome,
    pool: 0,
  };
}
