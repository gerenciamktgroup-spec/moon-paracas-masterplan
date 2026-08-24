import {
  type Vec,
  GATE,
  HALF,
  INSET_RING,
  LOT_DEPTH,
  LOT_FRONT,
  LOT_GAP,
  PERIMETER_SETBACK,
  SERVICE_Y,
  STREET,
  centroid,
  distToSquareDiagonal,
  inOasis,
  pointInPolygon,
  polygonArea,
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
  properties: {
    id: string;
    aldea: string;
    sector_color: string;
    tipo: "Lote Regular" | "Lote Premium (Oasis)" | "Lote Zen" | "Lote Ajuste";
    area_m2: number;
    precio_usd: number;
    status: LotStatus;
    cocheras_asignadas: number;
  };
}

export const ALDEA_META: Record<
  Aldea,
  { name: string; fill: string; fillPremium: string; stroke: string; cardinal: string }
> = {
  1: { name: "Aldea 1", cardinal: "Oeste", fill: "#4E7D5B", fillPremium: "#3A5E44", stroke: "#2F4C35" },
  2: { name: "Aldea 2", cardinal: "Norte", fill: "#C89D34", fillPremium: "#A67E20", stroke: "#7A5C16" },
  3: { name: "Aldea 3", cardinal: "Este", fill: "#D35400", fillPremium: "#A84300", stroke: "#7A3000" },
  4: { name: "Aldea 4", cardinal: "Sur", fill: "#8D7B68", fillPremium: "#6E5F50", stroke: "#52463C" },
};

const TIPO: Record<Typology, ResidentialLot["properties"]["tipo"]> = {
  standard: "Lote Regular",
  "premium-oasis": "Lote Premium (Oasis)",
  zen: "Lote Zen",
  ajuste: "Lote Ajuste",
};

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
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

function valid(poly: Vec[]) {
  const c = centroid(poly);
  if (!pointInPolygon(c, INSET_RING)) return false;
  if (poly.some((p) => !pointInPolygon(p, INSET_RING))) return false;
  if (inOasis(c, 3) || poly.some((p) => inOasis(p, 1))) return false;
  if (c.y < SERVICE_Y + 1) return false;
  if (distToSquareDiagonal(c) < 3.2) return false;
  const area = polygonArea(poly);
  return area >= 114 && area <= 252;
}

type Raw = { poly: Vec[]; c: Vec; aldea: Aldea; areaM2: 120 | 240 };

function rect(x0: number, y0: number, dx: number, dy: number): Vec[] {
  return [
    { x: x0, y: y0 },
    { x: x0 + dx, y: y0 },
    { x: x0 + dx, y: y0 + dy },
    { x: x0, y: y0 + dy },
  ];
}

/** Aldea 1 Oeste y 3 Este: franjas verticales (fondo en X, frente 8 m en Y). */
function verticalAldea(aldea: 1 | 3): Raw[] {
  const inward = aldea === 1 ? 1 : -1;
  const startX = aldea === 1 ? -HALF + PERIMETER_SETBACK : HALF - PERIMETER_SETBACK;
  const out: Raw[] = [];
  let col = 0;
  let xCursor = startX;
  while (col < 12) {
    const x0 = inward > 0 ? xCursor : xCursor - LOT_DEPTH;
    let row = 0;
    let y = SERVICE_Y + STREET;
    while (y + LOT_FRONT < HALF - PERIMETER_SETBACK) {
      if (row > 0 && row % 4 === 0) y += STREET;
      const poly = rect(x0, y, LOT_DEPTH, LOT_FRONT);
      if (valid(poly)) out.push({ poly, c: centroid(poly), aldea, areaM2: 120 });
      y += LOT_FRONT + LOT_GAP;
      row++;
    }
    xCursor += inward * (LOT_DEPTH + (col % 2 === 1 ? STREET : LOT_GAP));
    col++;
  }
  return out;
}

/** Aldea 2 Norte y 4 Sur: franjas horizontales (fondo en Y, frente 8 m en X). */
function horizontalAldea(aldea: 2 | 4): Raw[] {
  const inward = aldea === 4 ? 1 : -1;
  const startY = aldea === 4 ? SERVICE_Y + STREET : HALF - PERIMETER_SETBACK;
  const out: Raw[] = [];
  let band = 0;
  let yCursor = startY;
  while (band < 12) {
    const y0 = inward > 0 ? yCursor : yCursor - LOT_DEPTH;
    let col = 0;
    let x = -HALF + PERIMETER_SETBACK + STREET;
    while (x + LOT_FRONT < HALF - PERIMETER_SETBACK) {
      if (col > 0 && col % 4 === 0) x += STREET;
      const poly = rect(x, y0, LOT_FRONT, LOT_DEPTH);
      if (valid(poly)) out.push({ poly, c: centroid(poly), aldea, areaM2: 120 });
      x += LOT_FRONT + LOT_GAP;
      col++;
    }
    yCursor += inward * (LOT_DEPTH + (band % 2 === 1 ? STREET : LOT_GAP));
    band++;
  }
  return out;
}

function pairNearOasis(list: Raw[], aldea: Aldea): Raw[] {
  const group = list.filter((r) => r.aldea === aldea);
  const used = new Set<Raw>();
  const out: Raw[] = [];
  const ranked = [...group].sort((a, b) => Math.hypot(a.c.x, a.c.y - 12) - Math.hypot(b.c.x, b.c.y - 12));
  let made = 0;
  for (const a of ranked) {
    if (used.has(a) || made >= 12) continue;
    const buddy = group.find((b) => {
      if (used.has(b) || b === a) return false;
      const dx = Math.abs(a.c.x - b.c.x);
      const dy = Math.abs(a.c.y - b.c.y);
      if (aldea === 1 || aldea === 3) return dy < 9 && dx < 4;
      return dx < 9 && dy < 4;
    });
    if (!buddy) continue;
    const xs = [...a.poly, ...buddy.poly].map((p) => p.x);
    const ys = [...a.poly, ...buddy.poly].map((p) => p.y);
    const poly = rect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    if (!valid(poly) && polygonArea(poly) < 220) continue;
    used.add(a);
    used.add(buddy);
    out.push({ poly, c: centroid(poly), aldea, areaM2: 240 });
    made++;
  }
  for (const r of group) if (!used.has(r)) out.push(r);
  return out;
}

function cap(list: Raw[], n = 96) {
  return [...list]
    .sort((a, b) => (a.areaM2 === 240 ? -1 : 1) || Math.hypot(a.c.x, a.c.y) - Math.hypot(b.c.x, b.c.y))
    .slice(0, n);
}

function typologyOf(raw: Raw, index: number, total: number): Typology {
  if (raw.areaM2 === 240) return "premium-oasis";
  if (index >= total - 6) return "ajuste";
  if (index < 6) return "zen";
  return "standard";
}

export function generateResidentialLots(): ResidentialLot[] {
  const pools: Raw[][] = [
    cap(pairNearOasis(verticalAldea(1), 1)),
    cap(pairNearOasis(horizontalAldea(2), 2)),
    cap(pairNearOasis(verticalAldea(3), 3)),
    cap(pairNearOasis(horizontalAldea(4), 4)),
  ];
  const lots: ResidentialLot[] = [];
  pools.forEach((group, gi) => {
    const aldea = (gi + 1) as Aldea;
    group.forEach((raw, i) => {
      const typology = typologyOf(raw, i, group.length);
      const areaM2 = raw.areaM2;
      const id = `A${aldea}-${String(i + 1).padStart(2, "0")}`;
      const price = priceUSD(areaM2, typology);
      const status = statusFor(aldea * 1000 + i);
      lots.push({
        id,
        manzana: `A${aldea}-M${Math.floor(i / 8) + 1}`,
        numero: i + 1,
        aldea,
        typology,
        status,
        areaM2,
        widthM: areaM2 === 240 ? 16 : 8,
        depthM: 15,
        compatibleDomes: areaM2 === 240 ? [6, 7, 8] : [6, 7],
        priceUSD: price,
        polygon: raw.poly,
        centroid: raw.c,
        nearOasis: Math.hypot(raw.c.x, raw.c.y - 12) < 110,
        nearEntrance: raw.c.y < SERVICE_Y + 40,
        properties: {
          id,
          aldea: ALDEA_META[aldea].name,
          sector_color: ALDEA_META[aldea].fill,
          tipo: TIPO[typology],
          area_m2: areaM2,
          precio_usd: price,
          status,
          cocheras_asignadas: 0,
        },
      });
    });
  });
  return lots;
}

export const RESIDENTIAL_LOTS = generateResidentialLots();

export function toGeoJSON(lots = RESIDENTIAL_LOTS) {
  return {
    type: "FeatureCollection" as const,
    features: lots.map((lot) => ({
      type: "Feature" as const,
      properties: lot.properties,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[...lot.polygon.map((p) => [p.x, p.y]), [lot.polygon[0].x, lot.polygon[0].y]]],
      },
    })),
  };
}

export function inventoryCounts(lots = RESIDENTIAL_LOTS) {
  const byAldea = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Aldea, number>;
  const byType = { standard: 0, "premium-oasis": 0, zen: 0, ajuste: 0 } as Record<Typology, number>;
  let n120 = 0;
  let n240 = 0;
  for (const l of lots) {
    byAldea[l.aldea]++;
    byType[l.typology]++;
    if (l.areaM2 === 120) n120++;
    else n240++;
  }
  return { total: lots.length, byAldea, byType, n120, n240, parking: 192, gate: GATE };
}
