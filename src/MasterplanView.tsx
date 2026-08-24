import { useEffect, useMemo, useState } from "react";
import { AMENITIES, organicLagoonPath, type MasterplanAmenity } from "./amenities";
import { ALDEA_META, inventoryCounts, RESIDENTIAL_LOTS, type Aldea, type ResidentialLot } from "./generateLots";
import {
  FRONT_Y,
  GATE,
  HALF,
  INSET_RING,
  LOTE_MATRIZ,
  RING,
  SERVICE_Y,
  SVG_VIEW,
  VERTICES,
  fromFront,
  oasisArea,
  oasisOctagon,
  polyToSvg,
} from "./loteMatriz";
import { cn } from "./cn";

const STATUS: Record<ResidentialLot["status"], string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  bloqueado: "Bloqueado",
};
const sy = (y: number) => -y;

export function MasterplanView() {
  const [aldeaFilter, setAldeaFilter] = useState<Aldea | 0>(0);
  const [lot, setLot] = useState<ResidentialLot | null>(null);
  const [amenity, setAmenity] = useState<MasterplanAmenity | null>(null);
  const [mounted, setMounted] = useState(false);
  const counts = useMemo(() => inventoryCounts(), []);
  const lagoon = useMemo(() => organicLagoonPath(), []);
  const oasis = useMemo(() => oasisOctagon(), []);
  useEffect(() => setMounted(true), []);
  const lots = !mounted ? [] : aldeaFilter === 0 ? RESIDENTIAL_LOTS : RESIDENTIAL_LOTS.filter((l) => l.aldea === aldeaFilter);

  return (
    <div className="relative h-dvh overflow-hidden bg-sand text-ink">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between p-3">
        <div className="pointer-events-auto rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-sm">
          <p className="font-display text-2xl font-semibold">Moon Paracas</p>
          <p className="text-xs text-muted">Cuadrado 335,5 m · frontis plano · 4 aldeas × 96</p>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-2xl border border-line bg-paper/95 p-1.5">
          <Chip active={aldeaFilter === 0} onClick={() => setAldeaFilter(0)} label={`Todas (${counts.total})`} />
          {([1, 2, 3, 4] as Aldea[]).map((id) => (
            <Chip key={id} active={aldeaFilter === id} onClick={() => setAldeaFilter(id)} label={`${ALDEA_META[id].name} (${counts.byAldea[id]})`} dot={ALDEA_META[id].fill} />
          ))}
        </div>
      </header>

      <svg viewBox={`${SVG_VIEW.minX} ${SVG_VIEW.minY} ${SVG_VIEW.width} ${SVG_VIEW.height}`} className="h-full w-full">
        <defs>
          <linearGradient id="lagoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8c3" />
            <stop offset="100%" stopColor="#2b6d68" />
          </linearGradient>
        </defs>
        <rect x={SVG_VIEW.minX} y={SVG_VIEW.minY} width={SVG_VIEW.width} height={SVG_VIEW.height} fill="#efe6d6" />
        <path d={polyToSvg(RING)} fill="#e8dcc8" stroke="#a84f36" strokeWidth="2.2" />
        <path d={polyToSvg(INSET_RING)} fill="#f3ead9" stroke="#c5a059" strokeWidth="0.9" fillOpacity="0.5" />

        <line x1={-HALF} y1={sy(HALF)} x2={HALF} y2={sy(-HALF)} stroke="#c5a059" strokeWidth="6" opacity="0.35" />
        <line x1={-HALF} y1={sy(-HALF)} x2={HALF} y2={sy(HALF)} stroke="#c5a059" strokeWidth="6" opacity="0.35" />
        <rect x={-HALF + 10} y={sy(HALF - 10)} width={2 * HALF - 20} height={2 * HALF - 20} fill="none" stroke="#8a734c" strokeWidth="6" opacity="0.25" />

        {lots.map((l) => {
          const meta = ALDEA_META[l.aldea];
          const selected = lot?.id === l.id;
          const fill = l.status === "vendido" ? "#6d645a" : l.status === "bloqueado" ? "#9a938a" : l.typology === "premium-oasis" ? meta.fillPremium : meta.fill;
          return (
            <path
              key={l.id}
              d={polyToSvg(l.polygon)}
              fill={fill}
              fillOpacity={l.status === "reservado" ? 0.7 : 0.94}
              stroke={selected ? "#161310" : meta.stroke}
              strokeWidth={selected ? 1.2 : 0.25}
              className="cursor-pointer"
              onClick={() => {
                setLot(l);
                setAmenity(null);
              }}
            />
          );
        })}

        <path d={polyToSvg(oasis)} fill="#cbb892" />
        <path d={polyToSvg(lagoon)} fill="url(#lagoon)" stroke="#9ee0db" strokeWidth="1.1" />

        {AMENITIES.filter((a) => a.category !== "acceso" && a.category !== "estacionamiento").map((a) => (
          <g key={a.id} transform={`translate(${a.anchor.x} ${sy(a.anchor.y)})`} className="cursor-pointer" onClick={() => { setAmenity(a); setLot(null); }}>
            <rect x="-22" y="-6" width="44" height="12" rx="6" fill="#161310" />
            <text textAnchor="middle" y="2.8" fill="#f4eee4" fontSize="4" fontFamily="Outfit, sans-serif" fontWeight="600">{a.shortLabel}</text>
          </g>
        ))}

        <rect x={-HALF} y={sy(SERVICE_Y)} width={2 * HALF} height={SERVICE_Y - FRONT_Y} fill="#ddd2bf" />
        <rect x={fromFront(22, -92).x} y={sy(fromFront(22, 0).y + 8)} width="184" height="16" fill="#d9c9a8" stroke="#8a734c" strokeWidth="0.5" />
        <rect x={fromFront(16, -48).x} y={sy(fromFront(16, 0).y + 6)} width="24" height="12" fill="#c5a059" />
        <rect x={fromFront(14, -11).x} y={sy(fromFront(14, 0).y + 8)} width="22" height="16" fill="#161310" stroke="#c5a059" />
        <rect x={fromFront(16, 24).x} y={sy(fromFront(16, 0).y + 6)} width="24" height="12" fill="#c5a059" />
        <circle cx={GATE.x} cy={sy(FRONT_Y - 8)} r="10" fill="none" stroke="#4e6646" strokeWidth="1.1" />
        {AMENITIES.filter((a) => a.category === "acceso" || a.category === "estacionamiento").map((a) => (
          <text key={a.id} x={a.anchor.x} y={sy(a.anchor.y)} textAnchor="middle" fill="#161310" fontSize="4.2" fontFamily="Outfit, sans-serif" fontWeight="700" className="cursor-pointer" onClick={() => { setAmenity(a); setLot(null); }}>{a.shortLabel}</text>
        ))}

        {Object.values(VERTICES).map((v) => (
          <g key={v.label} transform={`translate(${v.x} ${sy(v.y)})`}>
            <circle r="5" fill="#161310" stroke="#c5a059" />
            <text textAnchor="middle" y="3" fill="#f4eee4" fontSize="5" fontFamily="Outfit, sans-serif">{v.label}</text>
          </g>
        ))}
      </svg>

      <aside className="absolute bottom-3 left-3 z-20 w-[min(100%-1.5rem,360px)] rounded-2xl border border-line bg-paper/95 p-4 shadow-lg">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Programa oficial</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat k="Lotes" v={`${counts.total}/384`} />
          <Stat k="Oasis" v={`${Math.round(oasisArea()).toLocaleString("es-PE")} m²`} />
          <Stat k="Cocheras" v="192" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[10px]">
          {([1, 2, 3, 4] as Aldea[]).map((id) => (
            <div key={id} className="rounded-xl bg-sand-2 py-2">
              <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full" style={{ background: ALDEA_META[id].fill }} />
              <div className="font-semibold">{counts.byAldea[id]}</div>
              <div className="text-muted">A{id}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-olive">O/E franjas verticales · N/S horizontales · predio {LOTE_MATRIZ.areaM2.toLocaleString("es-PE")} m²</p>
      </aside>

      {(lot || amenity) && (
        <aside className="absolute bottom-3 right-3 z-30 w-[min(100%-1.5rem,300px)] rounded-2xl border border-line bg-paper p-4 shadow-xl">
          {lot ? (
            <>
              <p className="text-[10px] uppercase tracking-widest text-muted">{lot.properties.aldea}</p>
              <h2 className="font-display text-2xl font-semibold">{lot.id}</h2>
              <Row k="Tipo" v={lot.properties.tipo} />
              <Row k="Área" v={`${lot.properties.area_m2} m²`} />
              <Row k="Estado" v={STATUS[lot.status]} />
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-widest text-muted">{amenity?.categoryLabel}</p>
              <h2 className="font-display text-2xl font-semibold">{amenity?.name}</h2>
              <p className="mt-2 text-sm text-muted">{amenity?.blurb}</p>
            </>
          )}
          <button className="mt-3 text-xs underline" onClick={() => { setLot(null); setAmenity(null); }}>Cerrar</button>
        </aside>
      )}
    </div>
  );
}

function Chip({ active, onClick, label, dot }: { active: boolean; onClick: () => void; label: string; dot?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium", active ? "bg-ink text-sand" : "text-ink")}>
      {dot ? <span className="h-2 w-2 rounded-full" style={{ background: dot }} /> : null}
      {label}
    </button>
  );
}
function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-sand-2 px-2 py-2">
      <div className="font-display text-lg font-semibold">{v}</div>
      <div className="text-[10px] uppercase text-muted">{k}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mt-1 flex justify-between border-b border-line py-1 text-sm">
      <span className="text-muted">{k}</span>
      <span>{v}</span>
    </div>
  );
}
