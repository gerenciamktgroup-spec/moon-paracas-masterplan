import type { Vec } from "./loteMatriz";
import { VERTICES } from "./loteMatriz";

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
    anchor: ring(248, 58),
    blurb: "Piscina climatizada con deck de teca sobre el borde sur de la laguna.",
    details: ["Deck solárium", "Agua climatizada", "Servicio de toallas"],
  },
  {
    id: "bar-lounge",
    name: "Bar & Lounge",
    shortLabel: "Bar & Lounge",
    category: "gastronomia",
    categoryLabel: "Gastronomía",
    anchor: ring(55, 60),
    blurb: "Coctelería de autor y cocina marina con terraza al oasis.",
    details: ["Terraza elevada", "Cocina Paracas", "Atardeceres"],
  },
  {
    id: "yoga-deck",
    name: "Yoga Deck",
    shortLabel: "Yoga Deck",
    category: "wellness",
    categoryLabel: "Wellness",
    anchor: ring(175, 60),
    blurb: "Plataforma de madera para práctica al amanecer, al oeste de la laguna.",
    details: ["Madera natural", "Clases al alba", "Meditación"],
  },
  {
    id: "zona-chill",
    name: "Zona Chill & Hamacas",
    shortLabel: "Chill",
    category: "wellness",
    categoryLabel: "Wellness",
    anchor: ring(130, 62),
    blurb: "Hamacas bajo palmeras datileras, fuera del espejo de agua.",
    details: ["Hamacas de algodón", "Sombra de palmeras"],
  },
  {
    id: "fogatas",
    name: "Fogatas Sociales",
    shortLabel: "Fogatas",
    category: "recreacion",
    categoryLabel: "Noche",
    anchor: ring(15, 60),
    blurb: "Firepits de caliche para astroturismo al este del oasis.",
    details: ["3 firepits de piedra", "Cielo de Paracas"],
  },
  {
    id: "juegos",
    name: "Juegos Infantiles",
    shortLabel: "Juegos",
    category: "recreacion",
    categoryLabel: "Familia",
    anchor: ring(300, 60),
    blurb: "Juegos de madera y cuerda sobre arena tamizada.",
    details: ["Madera certificada", "Sombra continua"],
  },
  {
    id: "portico",
    name: "Pórtico de Ingreso 24/7",
    shortLabel: "Pórtico",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: { x: VERTICES.A.x, y: VERTICES.A.y + 22 },
    blurb: "Control de acceso monumental sobre el vértice sur.",
    details: ["Doble carril", "Seguridad 24/7"],
  },
  {
    id: "welcome",
    name: "Welcome Center",
    shortLabel: "Welcome",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: { x: VERTICES.A.x - 36, y: VERTICES.A.y + 28 },
    blurb: "Recepción y concierge para propietarios e invitados.",
    details: ["Concierge", "Carritos eléctricos"],
  },
  {
    id: "lobby",
    name: "Lobby Vistas",
    shortLabel: "Lobby",
    category: "acceso",
    categoryLabel: "Acceso",
    anchor: { x: VERTICES.A.x + 36, y: VERTICES.A.y + 28 },
    blurb: "Showroom de tipologías de domo y terraza de bienvenida.",
    details: ["Showroom", "Atención comercial"],
  },
  {
    id: "cocheras",
    name: "Cochera Plus · 192 plazas",
    shortLabel: "Cocheras Plus",
    category: "estacionamiento",
    categoryLabel: "Servicios",
    anchor: { x: VERTICES.A.x + 2, y: VERTICES.A.y + 42 },
    blurb: "Bahías techadas a ambos lados del pórtico de llegada.",
    details: ["192 plazas", "Carga eléctrica"],
  },
];

export function organicLagoonPath(rx = 46, ry = 40, waves = 7) {
  const pts: Vec[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const k = 1 + 0.08 * Math.sin(t * waves) + 0.04 * Math.cos(t * 3);
    pts.push({ x: q(Math.cos(t) * rx * k), y: q(Math.sin(t) * ry * k) });
  }
  return pts;
}

export function palmPositions(): Vec[] {
  const palms: Vec[] = [];
  for (let i = 0; i < 22; i++) {
    const t = (i / 22) * Math.PI * 2 + 0.2;
    const k = 1 + (i % 3) * 0.03;
    palms.push({ x: q(Math.cos(t) * 50 * k), y: q(Math.sin(t) * 44 * k) });
  }
  return palms;
}
