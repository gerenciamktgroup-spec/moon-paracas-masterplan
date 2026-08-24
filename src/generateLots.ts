import {
  type Vec,
  VERTICES,
  GATE,
  centroid,
  dist,
  inOasis,
  INSET_RING,
  LOT_DEPTH,
  LOT_FRONT,
  LOT_GAP,
  STREET,
  pointInPolygon,
  polygonArea,
  southOfGate,
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
const ORIGIN: Vec = { x: GATE.x, y: 0 };

function side(p: Vec, a: Vec, b: Vec) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}
export function aldeaOfPoint(p: Vec): Aldea {
  const towardEast = side(p, A, C) < 0;
  const towardNorth = side(p, B, D) > 0;
  if (!towardEast && towardNorth) return 1;
  if (towardEast && towardNorth) return 2;
  if (towardEast && !towardNorth) return 3;
  return 4;
}
function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

type Raw = {
  poly: Vec[];
  c: Vec;
  aldea: Aldea;
  si: number;
  tj: number;
  u0: number;
  v0: number;
  front: number;
  depth: number;
  areaM2: 120 | 240;
};

function at(u: number, v: number): Vec {
  return { x: ORIGIN.x + u, y: v };
}

function cellValid(poly: Vec[]) {
  const c = centroid(poly);
  if (!pointInPolygon(c, INSET_RING)) return false;
  if (poly.filter((p) => pointInPolygon(p, INSET_RING)).length < 4) return false;
  if (inOasis(c, 4)) return false;
  if (poly.some((p) => inOasis(p, 1))) return false;
  if (southOfGate(c)) return false;
  const area = polygonArea(poly);
  if (area < 114 || area > 132) return false;
  return true;
}

function buildGrid(): Raw[] {
  const FRONT = LOT_FRONT;
  const DEPTH = LOT_DEPTH;
  const GAP = LOT_GAP;
  const uMax = 210;
  const vMax = 250;
  const raw: Raw[] = [];
  const quads: { uDir: 1 | -1; vDir: 1 | -1 }[] = [
    { uDir: -1, vDir: 1 },
    { uDir: 1, vDir: 1 },
    { uDir: 1, vDir: -1 },
    { uDir: -1, vDir: -1 },
  ];
  for (const q of quads) {
    let uOff = STREET / 2 + 0.4;
    let si = 0;
    while (uOff + FRONT < uMax) {
      let vOff = STREET / 2 + 0.4;
      let tj = 0;
      while (vOff + DEPTH < vMax) {
        const u0 = q.uDir > 0 ? uOff : -(uOff + FRONT);
        const v0 = q.vDir > 0 ? vOff : -(vOff + DEPTH);
        const poly = [at(u0, v0), at(u0 + FRONT, v0), at(u0 + FRONT, v0 + DEPTH), at(u0, v0 + DEPTH)];
        if (cellValid(poly)) {
          const c = centroid(poly);
          raw.push({
            poly,
            c,
            aldea: aldeaOfPoint(c),
            si,
            tj,
            u0,
            v0,
            front: FRONT,
            depth: DEPTH,
            areaM2: 120,
          });
        }
        vOff += DEPTH;
        tj++;
        vOff += tj % 2 === 0 ? STREET : GAP;
      }
      uOff += FRONT;
      si++;
      uOff += si % 4 === 0 ? STREET : GAP;
    }
  }
  return raw;
}

function pairPremium(cells: Raw[]): Raw[] {
  const used = new Set<Raw>();
  const out: Raw[] = [];
  for (const aldea of [1, 2, 3, 4] as Aldea[]) {
    const group = cells.filter((c) => c.aldea === aldea).sort((a, b) => dist(a.c, ORIGIN) - dist(b.c, ORIGIN));
    let made = 0;
    for (const a of group) {
      if (used.has(a) || made >= 12) continue;
      if (dist(a.c, ORIGIN) > 160) continue;
      const buddy = group.find(
        (b) => !used.has(b) && b !== a && b.tj === a.tj && Math.abs(b.u0 - a.u0) < a.front + LOT_GAP + 0.4,
      );
      if (!buddy) continue;
      const u0 = Math.min(a.u0, buddy.u0);
      const poly = [at(u0, a.v0), at(u0 + 16, a.v0), at(u0 + 16, a.v0 + a.depth), at(u0, a.v0 + a.depth)];
      if (poly.some((p) => inOasis(p, 0)) || southOfGate(centroid(poly))) continue;
      used.add(a);
      used.add(buddy);
      out.push({
        poly,
        c: centroid(poly),
        aldea,
        si: Math.min(a.si, buddy.si),
        tj: a.tj,
        u0,
        v0: a.v0,
        front: 16,
        depth: a.depth,
        areaM2: 240,
      });
      made++;
    }
  }
  for (const c of cells) if (!used.has(c)) out.push(c);
  return out;
}

function capPerAldea(cells: Raw[], cap = 96): Raw[] {
  const out: Raw[] = [];
  for (const aldea of [1, 2, 3, 4] as Aldea[]) {
    const g = cells
      .filter((c) => c.aldea === aldea)
      .sort((a, b) => {
        const score = (r: Raw) => (r.areaM2 === 240 ? 5 : 0) - dist(r.c, ORIGIN) / 400;
        return score(b) - score(a);
      });
    out.push(...g.slice(0, cap));
  }
  return out;
}

function assignTypology(list: Raw[]): Map<Raw, Typology> {
  const map = new Map<Raw, Typology>();
  for (const item of list) {
    if (item.areaM2 === 240) map.set(item, "premium-oasis");
  }
  const rest = list.filter((i) => !map.has(i)).sort((a, b) => dist(a.c, ORIGIN) - dist(b.c, ORIGIN));
  let zen = 0;
  let adj = 0;
  const edge = [...rest].sort((a, b) => dist(b.c, ORIGIN) - dist(a.c, ORIGIN));
  for (const item of rest) {
    if (zen < 6 && dist(item.c, ORIGIN) < 160) {
      map.set(item, "zen");
      zen++;
    }
  }
  for (const item of edge) {
    if (map.has(item)) continue;
    if (adj >= 6) break;
    map.set(item, "ajuste");
    adj++;
  }
  for (const item of list) if (!map.has(item)) map.set(item, "standard");
  return map;
}

function statusFor(seed: number): LotStatus {
  const r = hash(seed + 9);
  if (r < 0.08) return "vendido";
  if (r < 0.16) return "reservado";
  if (r < 0.2) return "bloqueado";
  return "disponible";
}
function priceUSD(area: 120 | 240, typology: Typology) {
  const base = area === 240 ? 31800 : 16800;
  const m = typology === "premium-oasis" ? 1.18 : typology === "zen" ? 1.08 : typology === "ajuste" ? 0.94 : 1;
  return Math.round(base * m);
}

export function generateResidentialLots(): ResidentialLot[] {
  const grid = capPerAldea(pairPremium(buildGrid()), 96);
  const lots: ResidentialLot[] = [];
  for (const aldea of [1, 2, 3, 4] as Aldea[]) {
    const group = grid.filter((g) => g.aldea === aldea);
    const types = assignTypology(group);
    [...group]
      .sort((a, b) => a.tj - b.tj || a.si - b.si)
      .forEach((raw, i) => {
        const typology = types.get(raw) ?? "standard";
        const areaM2 = raw.areaM2;
        lots.push({
          id: `A${aldea}-${String(i + 1).padStart(2, "0")}`,
          manzana: `A${aldea}-M${Math.floor(i / 8) + 1}`,
          numero: i + 1,
          aldea,
          typology,
          status: statusFor(aldea * 1000 + i),
          areaM2,
          widthM: areaM2 === 240 ? 16 : 8,
          depthM: 15,
          compatibleDomes: areaM2 === 240 ? [6, 7, 8] : [6, 7],
          priceUSD: priceUSD(areaM2, typology),
          polygon: raw.poly,
          centroid: raw.c,
          nearOasis: dist(raw.c, ORIGIN) < 130,
          nearEntrance: raw.c.y < SOUTH_NEAR,
        });
      });
  }
  return lots;
}

const SOUTH_NEAR = -140;

export const RESIDENTIAL_LOTS = generateResidentialLots();

export function inventoryCounts(lots = RESIDENTIAL_LOTS) {
  const byAldea = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Aldea, number>;
  const byType = { standard: 0, "premium-oasis": 0, zen: 0, ajuste: 0 } as Record<Typology, number>;
  let soldM2 = 0;
  let n120 = 0;
  let n240 = 0;
  for (const l of lots) {
    byAldea[l.aldea]++;
    byType[l.typology]++;
    soldM2 += l.areaM2;
    if (l.areaM2 === 120) n120++;
    else n240++;
  }
  return { total: lots.length, byAldea, byType, soldM2, n120, n240, parking: 192 };
}
