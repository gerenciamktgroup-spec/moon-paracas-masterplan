import type { Vec } from "./loteMatriz";
import { fromFront } from "./loteMatriz";

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
  y: q(8 + Math.sin(deg(angle)) * r),
});

export const AMENITIES: MasterplanAmenity[] = [
  {
    id: "piscina-oasis",
    name: "Piscina Oasis",
    shortLabel: "Piscina",
    category: "oasis",
    categoryLabel: "Agua",
    anchor: ring(248, 42),
    blurb: "Piscina al sur de la laguna, dentro del oasis.",
    details: ["Deck solárium", "Agua climatizada"],
  },
  {
    id: "bar-lounge",
    name: "Bar & Lounge",
    shortLabel: "Bar & Lounge",
    category: "gastronomia",
    categoryLabel: "Gastronomía",
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
    blurb: "Hamacas bajo palmeras.",
    details: ["Hamacas", "Sombra"],
  },
  {
    id: "fogatas",
    name: "Fogatas Sociales",
    shortLabel: "Fogatas",
    category: "recreacion",
    categoryLabel: "Noche",
    anchor: ring(20, 42),
    blurb: "Firepits al este del lago.",
    details: ["3 firepits", "Cielo de Paracas"],
  },
  {
    id: "juegos",
    name: "Juegos Infantiles",
    shortLabel: "Juegos",
    category: "recreacion",
    categoryLabel: "Familia",
    anchor: ring(310, 42),
    blurb: "Juegos de madera sobre arena.",
    details: ["Madera", "Sombra continua"],
  },
  {
    id: "portico",
    name: "Pórtico de Ingreso 24/7",
    shortLabel: "Pórtico",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromFront(8, 0),
    blurb: "Puerta al centro del frontis Sur, no en el pico A.",
    details: ["Eje del corte horizontal", "Doble carril", "Seguridad 24/7"],
  },
  {
    id: "welcome",
    name: "Welcome Center",
    shortLabel: "Welcome",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromFront(12, -28),
    blurb: "Recepción a la izquierda del pórtico.",
    details: ["Concierge", "Carritos"],
  },
  {
    id: "lobby",
    name: "Lobby Vistas",
    shortLabel: "Lobby",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: fromFront(12, 28),
    blurb: "Showroom a la derecha del pórtico.",
    details: ["Showroom", "Atención comercial"],
  },
  {
    id: "cocheras",
    name: "Cochera Plus · 192 plazas",
    shortLabel: "Cochera Plus",
    category: "estacionamiento",
    categoryLabel: "Servicios",
    anchor: fromFront(28, 0),
    blurb: "Cuatro bahías sobre el frontis, simétricas al pórtico.",
    details: ["192 plazas", "4 bahías"],
  },
];

export function organicLagoonPath(rx = 38, ry = 28, waves = 6) {
  const pts: Vec[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(t * waves) + 0.04 * Math.cos(t * 3);
    pts.push({ x: q(Math.cos(t) * rx * k), y: q(8 + Math.sin(t) * ry * k) });
  }
  return pts;
}

export function palmPositions(): Vec[] {
  const palms: Vec[] = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2 + 0.15;
    const k = 1 + (i % 3) * 0.04;
    palms.push({ x: q(Math.cos(t) * 62 * k), y: q(8 + Math.sin(t) * 50 * k) });
  }
  return palms;
}
