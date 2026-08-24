import type { Vec } from "./loteMatriz";
import { OASIS, fromFront } from "./loteMatriz";

export type AmenityCategory =
  | "oasis"
  | "wellness"
  | "gastronomia"
  | "acceso"
  | "recreacion"
  | "estacionamiento";

export interface MasterplanAmenity {
  id: string;
  name: string;
  shortLabel: string;
  category: AmenityCategory;
  categoryLabel: string;
  anchor: Vec;
  blurb: string;
  details: string[];
}

const o = (dx: number, dy: number): Vec => ({ x: OASIS.x + dx, y: OASIS.y + dy });

export const AMENITIES: MasterplanAmenity[] = [
  { id: "bar-lounge", name: "Bar & Lounge", shortLabel: "Bar & Lounge", category: "gastronomia", categoryLabel: "Gastronomía", anchor: o(0, 48), blurb: "Terraza norte del oasis.", details: ["Terraza"] },
  { id: "fogatas", name: "Fogatas Sociales", shortLabel: "Fogatas", category: "recreacion", categoryLabel: "Noche", anchor: o(48, 28), blurb: "Firepits noreste.", details: ["Astroturismo"] },
  { id: "juegos", name: "Juegos Infantiles", shortLabel: "Juegos", category: "recreacion", categoryLabel: "Familia", anchor: o(48, -28), blurb: "Juegos sureste.", details: ["Madera"] },
  { id: "hamacas", name: "Zona Chill / Hamacas", shortLabel: "Hamacas", category: "wellness", categoryLabel: "Wellness", anchor: o(-48, 28), blurb: "Hamacas noroeste.", details: ["Sombra"] },
  { id: "yoga", name: "Yoga Deck", shortLabel: "Yoga Deck", category: "wellness", categoryLabel: "Wellness", anchor: o(-48, -28), blurb: "Deck suroeste.", details: ["Alba"] },
  { id: "piscina", name: "Piscina Oasis", shortLabel: "Piscina Oasis", category: "oasis", categoryLabel: "Agua", anchor: o(0, -8), blurb: "Cuerpo de agua central.", details: ["20.662 m² de núcleo"] },
  { id: "portico", name: "Pórtico de Ingreso", shortLabel: "Pórtico", category: "acceso", categoryLabel: "Acceso", anchor: fromFront(14, 0), blurb: "Centro del frontis horizontal.", details: ["Rotonda", "24/7"] },
  { id: "welcome", name: "Welcome Center", shortLabel: "Welcome", category: "acceso", categoryLabel: "Acceso", anchor: fromFront(16, -36), blurb: "Izquierda del pórtico.", details: ["Concierge"] },
  { id: "lobby", name: "Lobby Vistas", shortLabel: "Lobby", category: "acceso", categoryLabel: "Acceso", anchor: fromFront(16, 36), blurb: "Derecha del pórtico.", details: ["Showroom"] },
  { id: "cocheras", name: "Cochera Plus", shortLabel: "192 Cocheras Plus", category: "estacionamiento", categoryLabel: "Servicios", anchor: fromFront(28, 0), blurb: "192 plazas lineales en el frontis Sur.", details: ["192", "Franja horizontal"] },
];

export function organicLagoonPath() {
  const pts: Vec[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const k = 1 + 0.06 * Math.sin(t * 5);
    pts.push({ x: OASIS.x + Math.cos(t) * 36 * k, y: OASIS.y + Math.sin(t) * 22 * k });
  }
  return pts;
}
export function palmPositions(): Vec[] {
  return [];
}
