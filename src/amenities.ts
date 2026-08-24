import type { Vec } from "./loteMatriz";
import { fromA } from "./loteMatriz";

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

const q = (n: number) => Math.round(n * 1000) / 1000;
const deg = (d: number) => (d * Math.PI) / 180;
const ring = (angle: number, r: number): Vec => ({
  x: q(Math.cos(deg(angle)) * r),
  y: q(Math.sin(deg(angle)) * r),
});

export const AMENITIES: MasterplanAmenity[] = [
  {
    id: "piscina-oasis",
    name: "Piscina Oasis",
    shortLabel: "Piscina",
    category: "oasis",
    categoryLabel: "Agua",
    anchor: ring(248, 42),
    blurb: "Piscina en el borde sur de la laguna, dentro del oasis de 20.662 m\u00b2.",
    details: ["Deck sol\u00e1rium", "Agua climatizada"],
  },
  {
    id: "bar-lounge",
    name: "Bar & Lounge",
    shortLabel: "Bar & Lounge",
    category: "gastronomia",
    categoryLabel: "Gastronom\u00eda",
    anchor: ring(90, 38),
    blurb: "Terraza al norte de la laguna.",
    details: ["Terraza elevada", "Cocina Paracas"],
  },
  {
    id: "yoga-deck",
    name: "Yoga Deck",
    shortLabel: "Yoga",
    category: "wellness",
    categoryLabel: "Wellness",
    anchor: ring(180, 40),
    blurb: "Plataforma al oeste de la laguna.",
    details: ["Madera natural", "Clases al alba"],
  },
  {
    id: "zona-chill",
    name: "Zona Chill & Hamacas",
    shortLabel: "Hamacas",
    category: "wellness",
    categoryLabel: "Wellness",
    anchor: ring(140, 44),
    blurb: "Hamacas bajo palmeras, dentro del anillo del oasis.",
    details: ["Hamacas", "Sombra"],
  },
  {
    id: "fogatas",
    name: "Fogatas Sociales",
    shortLabel: "Fogatas",
    category: "recreacion",
    categoryLabel: "Noche",
    anchor: ring(20, 42),
    blurb: "Firepits para astroturismo al este del lago.",
    details: ["3 firepits", "Cielo de Paracas"],
  },
  {
    id: "juegos",
    name: "Juegos Infantiles",
    shortLabel: "Juegos",
    category: "recreacion",
    categoryLabel: "Familia",
    anchor: ring(310, 42),
    blurb: "Juegos de madera sobre arena, dentro del oasis.",
    details: ["Madera", "Sombra continua"],
  },
  {
    id: "portico",
    name: "P\u00f3rtico de Ingreso 24/7",
    shortLabel: "P\u00f3rtico",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromA(18, 0),
    blurb: "Control monumental en el eje AC. No ocupa lotes.",
    details: ["Doble carril", "Seguridad 24/7"],
  },
  {
    id: "welcome",
    name: "Welcome Center",
    shortLabel: "Welcome",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromA(22, -28),
    blurb: "Recepci\u00f3n a la izquierda del p\u00f3rtico.",
    details: ["Concierge", "Carritos"],
  },
  {
    id: "lobby",
    name: "Lobby Vistas",
    shortLabel: "Lobby",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromA(22, 28),
    blurb: "Showroom a la derecha del p\u00f3rtico.",
    details: ["Showroom", "Atenci\u00f3n comercial"],
  },
  {
    id: "cocheras",
    name: "Cochera Plus \u00b7 192 plazas",
    shortLabel: "Cochera Plus",
    category: "estacionamiento",
    categoryLabel: "Servicios",
    anchor: fromA(36, 0),
    blurb: "Cuatro bah\u00edas a lo largo de la franja Sur, no en el pico del diamante.",
    details: ["192 plazas", "4 bah\u00edas", "Carga el\u00e9ctrica"],
  },
];

export function organicLagoonPath(rx = 38, ry = 28, waves = 6) {
  const pts: Vec[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(t * waves) + 0.04 * Math.cos(t * 3);
    pts.push({ x: q(Math.cos(t) * rx * k), y: q(Math.sin(t) * ry * k) });
  }
  return pts;
}

export function palmPositions(): Vec[] {
  const palms: Vec[] = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2 + 0.15;
    const k = 1 + (i % 3) * 0.04;
    palms.push({ x: q(Math.cos(t) * 62 * k), y: q(Math.sin(t) * 50 * k) });
  }
  return palms;
}
