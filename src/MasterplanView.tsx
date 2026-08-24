import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Grid3x3, Info, RotateCcw, X } from "lucide-react";
import { AMENITIES, organicLagoonPath, palmPositions, type MasterplanAmenity } from "./amenities";
import {
  ALDEA_META,
  inventoryCounts,
  RESIDENTIAL_LOTS,
  type Aldea,
  type ResidentialLot,
} from "./generateLots";
import {
  LOTE_MATRIZ,
  OASIS,
  RING,
  SVG_VIEW,
  VERTICES,
  INSET_RING,
  fromA,
  oasisArea,
  polyToSvg,
} from "./loteMatriz";
import { cn } from "./cn";

const STATUS_LABEL: Record<ResidentialLot["status"], string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
  bloqueado: "Bloqueado",
};

function sy(y: number) {
  return -y;
}

function bay(s: number, t0: number, t1: number) {
  const p = [fromA(s, t0), fromA(s + 16, t0), fromA(s + 16, t1), fromA(s, t1)];
  return polyToSvg(p);
}

export function MasterplanView() {
  const [aldeaFilter, setAldeaFilter] = useState<Aldea | 0>(0);
  const [lot, setLot] = useState<ResidentialLot | null>(null);
  const [amenity, setAmenity] = useState<MasterplanAmenity | null>(null);
  const [hud, setHud] = useState(true);
  const [grid, setGrid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const counts = useMemo(() => inventoryCounts(), []);
  const lagoon = useMemo(() => organicLagoonPath(), []);
  const palms = useMemo(() => palmPositions(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lots = !mounted
    ? []
    : aldeaFilter === 0
      ? RESIDENTIAL_LOTS
      : RESIDENTIAL_LOTS.filter((l) => l.aldea === aldeaFilter);

  const sides = [
    { from: VERTICES.A, to: VERTICES.B, label: `${LOTE_MATRIZ.sides.AB.toFixed(2)} m` },
    { from: VERTICES.B, to: VERTICES.C, label: `${LOTE_MATRIZ.sides.BC.toFixed(2)} m` },
    { from: VERTICES.C, to: VERTICES.D, label: `${LOTE_MATRIZ.sides.CD.toFixed(2)} m` },
    { from: VERTICES.D, to: VERTICES.A, label: `${LOTE_MATRIZ.sides.DA.toFixed(2)} m` },
  ];

  const welcome = fromA(22, -28);
  const portico = fromA(16, 0);
  const lobby = fromA(22, 28);
  const dropL = fromA(10, -12);
  const dropR = fromA(10, 12);

  return (
    <div className="relative h-dvh overflow-hidden bg-sand text-ink">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-sm backdrop-blur">
          <p className="font-display text-xl font-semibold leading-none tracking-tight sm:text-2xl">Moon Paracas</p>
          <p className="mt-1 text-xs text-muted">Masterplan director · UTM 18S · 4 aldeas · oasis 20.662 m²</p>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-[11px] font-medium">
            <Compass className="h-3.5 w-3.5 text-clay" />
            Norte UTM · C
          </span>
          <button
            type="button"
            onClick={() => setGrid((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-medium",
              grid ? "border-ink bg-ink text-sand" : "border-line bg-paper",
            )}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Grilla 50 m
          </button>
          <button
            type="button"
            onClick={() => setHud((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-2 text-[11px] font-medium"
          >
            <Info className="h-3.5 w-3.5" />
            HUD
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute left-3 top-24 z-20 sm:left-4">
        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-2xl border border-line bg-paper/95 p-1.5 shadow-sm">
          <FilterChip active={aldeaFilter === 0} onClick={() => setAldeaFilter(0)} label={`Todas (${counts.total})`} />
          {([1, 2, 3, 4] as Aldea[]).map((id) => (
            <FilterChip
              key={id}
              active={aldeaFilter === id}
              onClick={() => setAldeaFilter(id)}
              label={`Aldea ${id} (${counts.byAldea[id]})`}
              dot={ALDEA_META[id].fill}
            />
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`${SVG_VIEW.minX} ${SVG_VIEW.minY} ${SVG_VIEW.width} ${SVG_VIEW.height}`}
        className="h-full w-full touch-none"
        role="img"
        aria-label="Masterplan Moon Paracas"
      >
        <defs>
          <linearGradient id="lagoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8c3" />
            <stop offset="55%" stopColor="#3d8b84" />
            <stop offset="100%" stopColor="#2b6d68" />
          </linearGradient>
          <filter id="soft">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodColor="#161310" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x={SVG_VIEW.minX} y={SVG_VIEW.minY} width={SVG_VIEW.width} height={SVG_VIEW.height} fill="#efe6d6" />

        {grid
          ? Array.from({ length: 26 }, (_, i) => {
              const y = -300 + i * 50;
              const x = -260 + i * 50;
              return (
                <g key={i} stroke="#d7cbb8" strokeWidth="0.4">
                  <line x1={-260} y1={sy(y)} x2={280} y2={sy(y)} />
                  <line x1={x} y1={sy(-300)} x2={x} y2={sy(320)} />
                </g>
              );
            })
          : null}

        <path d={polyToSvg(RING)} fill="#e6d9c4" stroke="#a84f36" strokeWidth="2.4" />
        <path d={polyToSvg(INSET_RING)} fill="#efe4d1" stroke="#c5a059" strokeWidth="1.1" fillOpacity="0.45" />

        {lots.map((l) => {
          const meta = ALDEA_META[l.aldea];
          const selected = lot?.id === l.id;
          const fill =
            l.status === "bloqueado"
              ? "#9a938a"
              : l.status === "vendido"
                ? "#6d645a"
                : l.typology === "premium-oasis"
                  ? meta.fillPremium
                  : meta.fill;
          return (
            <g key={l.id}>
              <path
                d={polyToSvg(l.polygon)}
                fill={fill}
                fillOpacity={l.status === "reservado" ? 0.72 : selected ? 1 : 0.92}
                stroke={selected ? "#161310" : meta.stroke}
                strokeWidth={selected ? 1.1 : 0.28}
                className="cursor-pointer"
                onClick={() => {
                  setLot(l);
                  setAmenity(null);
                }}
              />
              <ellipse
                cx={l.centroid.x}
                cy={sy(l.centroid.y)}
                rx={l.areaM2 === 240 ? 1.55 : 1.15}
                ry={l.areaM2 === 240 ? 1.35 : 1.05}
                fill="#f7f1e8"
                opacity="0.9"
                className="pointer-events-none"
              />
            </g>
          );
        })}

        <ellipse cx={OASIS.x} cy={sy(OASIS.y)} rx={OASIS.rx} ry={OASIS.ry} fill="#cbb892" opacity="0.92" />
        <path d={polyToSvg(lagoon)} fill="url(#lagoon)" stroke="#9ee0db" strokeWidth="1.2" filter="url(#soft)" />
        <ellipse cx="8" cy={sy(10)} rx="16" ry="8" fill="#ffffff" opacity="0.16" />

        {palms.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${sy(p.y)})`}>
            <circle r="1.05" fill="#3a5a34" />
            <circle r="0.4" cy="-1.3" fill="#5c7a54" />
          </g>
        ))}

        {AMENITIES.filter((a) => a.category !== "acceso" && a.category !== "estacionamiento").map((a) => (
          <g
            key={a.id}
            transform={`translate(${a.anchor.x} ${sy(a.anchor.y)})`}
            className="cursor-pointer"
            onClick={() => {
              setAmenity(a);
              setLot(null);
            }}
          >
            <rect x="-20" y="-6" width="40" height="12" rx="6" fill="#161310" />
            <text textAnchor="middle" y="2.8" fill="#f4eee4" fontSize="4.2" fontFamily="Outfit, sans-serif" fontWeight="600">
              {a.shortLabel}
            </text>
          </g>
        ))}

        <g>
          <path d={bay(28, -58, -32)} fill="#d9c9a8" stroke="#8a734c" strokeWidth="0.6" />
          <path d={bay(28, -30, -8)} fill="#d9c9a8" stroke="#8a734c" strokeWidth="0.6" />
          <path d={bay(28, 8, 30)} fill="#d9c9a8" stroke="#8a734c" strokeWidth="0.6" />
          <path d={bay(28, 32, 58)} fill="#d9c9a8" stroke="#8a734c" strokeWidth="0.6" />
          <rect x={welcome.x - 10} y={sy(welcome.y) - 6} width="20" height="12" rx="1.4" fill="#c5a059" stroke="#8d7030" />
          <rect x={portico.x - 11} y={sy(portico.y) - 8} width="22" height="16" rx="1.6" fill="#161310" stroke="#c5a059" strokeWidth="1" />
          <rect x={lobby.x - 10} y={sy(lobby.y) - 6} width="20" height="12" rx="1.4" fill="#c5a059" stroke="#8d7030" />
          <circle cx={dropL.x} cy={sy(dropL.y)} r="6" fill="none" stroke="#4e6646" strokeWidth="0.7" />
          <circle cx={dropR.x} cy={sy(dropR.y)} r="6" fill="none" stroke="#4e6646" strokeWidth="0.7" />
          {AMENITIES.filter((a) => a.category === "acceso" || a.category === "estacionamiento").map((a) => (
            <g
              key={a.id}
              transform={`translate(${a.anchor.x} ${sy(a.anchor.y)})`}
              className="cursor-pointer"
              onClick={() => {
                setAmenity(a);
                setLot(null);
              }}
            >
              <text textAnchor="middle" y="0" fill="#161310" fontSize="4.1" fontFamily="Outfit, sans-serif" fontWeight="700">
                {a.shortLabel}
              </text>
            </g>
          ))}
        </g>

        {sides.map((s) => {
          const mx = (s.from.x + s.to.x) / 2;
          const my = (s.from.y + s.to.y) / 2;
          return (
            <g key={s.label} transform={`translate(${mx} ${sy(my)})`}>
              <rect x="-22" y="-6" width="44" height="12" rx="6" fill="#161310" />
              <text textAnchor="middle" y="3" fill="#f4eee4" fontSize="4.8" fontFamily="Outfit, sans-serif">
                {s.label}
              </text>
            </g>
          );
        })}

        {Object.values(VERTICES).map((v) => (
          <g key={v.label} transform={`translate(${v.x} ${sy(v.y)})`}>
            <circle r="6.5" fill="#161310" stroke="#c5a059" strokeWidth="1.1" />
            <text textAnchor="middle" y="3.2" fill="#f4eee4" fontSize="7" fontFamily="Cormorant Garamond, serif" fontWeight="700">
              {v.label}
            </text>
          </g>
        ))}
      </svg>

      {hud ? (
        <aside className="absolute bottom-3 left-3 z-20 w-[min(100%-1.5rem,380px)] rounded-2xl border border-line bg-paper/95 p-4 shadow-lg backdrop-blur sm:bottom-4 sm:left-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Inventario · programa 3D</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat k="Lotes" v={`${counts.total}/384`} />
            <Stat k="Oasis" v={`${Math.round(oasisArea()).toLocaleString("es-PE")} m²`} />
            <Stat k="Cocheras" v="192" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[10px]">
            {([1, 2, 3, 4] as Aldea[]).map((id) => (
              <div key={id} className="rounded-xl bg-sand-2 px-1 py-2">
                <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full" style={{ background: ALDEA_META[id].fill }} />
                <div className="font-semibold">{counts.byAldea[id]}</div>
                <div className="text-muted">A{id}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Premium {counts.byType["premium-oasis"]} · Zen {counts.byType.zen} · Ajuste {counts.byType.ajuste} · Std{" "}
            {counts.byType.standard} · {counts.n120}×120 · {counts.n240}×240
          </p>
          <p className="mt-1 text-[10px] text-olive">
            8×15 m · vías 6 m · pirca 10 m · ×8 solo en 240 · predio {LOTE_MATRIZ.areaM2.toLocaleString("es-PE")} m²
          </p>
        </aside>
      ) : null}

      {(lot || amenity) && (
        <aside className="absolute bottom-3 right-3 z-30 w-[min(100%-1.5rem,320px)] rounded-2xl border border-line bg-paper p-4 shadow-xl sm:bottom-4 sm:right-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              {lot ? (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {ALDEA_META[lot.aldea].name} · {lot.manzana}
                  </p>
                  <h2 className="font-display text-2xl font-semibold">{lot.id}</h2>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{amenity?.categoryLabel}</p>
                  <h2 className="font-display text-2xl font-semibold">{amenity?.name}</h2>
                </>
              )}
            </div>
            <button
              type="button"
              className="rounded-full border border-line p-1.5"
              onClick={() => {
                setLot(null);
                setAmenity(null);
              }}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {lot ? (
            <div className="mt-3 space-y-1.5 text-sm">
              <Row k="Estado" v={STATUS_LABEL[lot.status]} />
              <Row k="Tipología" v={lot.typology} />
              <Row k="Área" v={`${lot.areaM2} m²`} />
              <Row k="Frente / fondo" v={`${lot.widthM} × ${lot.depthM} m`} />
              <Row k="Domos" v={lot.compatibleDomes.map((d) => `Ø${d}`).join(" · ")} />
              <Row k="Precio" v={`US$ ${lot.priceUSD.toLocaleString("en-US")}`} />
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-muted">
              <p>{amenity?.blurb}</p>
              <ul className="list-disc pl-4">
                {amenity?.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}

      <button
        type="button"
        className="absolute bottom-3 right-3 z-10 rounded-full border border-line bg-paper p-2 shadow-sm sm:hidden"
        onClick={() => {
          setLot(null);
          setAmenity(null);
        }}
        aria-label="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium",
        active ? "bg-ink text-sand" : "text-ink hover:bg-sand",
      )}
    >
      {dot ? <span className="h-2 w-2 rounded-full" style={{ background: dot }} /> : null}
      {label}
    </button>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-sand-2 px-2 py-2">
      <div className="font-display text-lg font-semibold leading-none">{v}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">{k}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/80 py-1.5 last:border-0">
      <span className="text-muted">{k}</span>
      <span className="font-medium capitalize">{v}</span>
    </div>
  );
}
