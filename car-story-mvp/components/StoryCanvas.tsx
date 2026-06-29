"use client";

import { useEffect, useRef, useState } from "react";
import type { VehicleData, ImageAdjustments } from "@/lib/types";

export type LayoutOffsets = Record<string, { x: number; y: number }>;

export const DEFAULT_LAYOUT: LayoutOffsets = {
  car: { x: 0, y: 0 },
  title: { x: 0, y: 0 },
  specs: { x: 0, y: 0 },
  price: { x: 0, y: 0 },
  status: { x: 0, y: 0 },
  footer: { x: 0, y: 0 },
};

// Ancho de referencia del diseño. Todo el diseño (textos, coche) se piensa
// sobre 1080 px de ancho y luego se escala al ancho real del fondo.
const DESIGN_W = 1080;

// Zona donde se encaja el coche recortado (en unidades de diseño).
const STAGE_W = 900;
const STAGE_H = 620;

type Props = {
  vehicle: VehicleData;
  adjustments: ImageAdjustments;
  carImage: string | null;
  layout: LayoutOffsets;
  onDrag: (id: string, x: number, y: number) => void;
  scale: number; // escala de la vista previa
  background: string; // ruta del fondo
  canvasW: number; // ancho real del canvas (= ancho del fondo)
  canvasH: number; // alto real del canvas (= alto del fondo)
  showInfo: boolean; // mostrar u ocultar la plantilla de información
};

/* Envoltorio arrastrable (translate visual + arrastre con ratón/dedo). */
function Draggable({
  id,
  offset,
  dragScale,
  onDrag,
  extraTransform = "",
  className = "",
  style = {},
  children,
}: {
  id: string;
  offset: { x: number; y: number };
  dragScale: number;
  onDrag: (id: string, x: number, y: number) => void;
  extraTransform?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const start = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(
    null
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!start.current) return;
      const dx = (e.clientX - start.current.mx) / dragScale;
      const dy = (e.clientY - start.current.my) / dragScale;
      onDrag(
        id,
        Math.round(start.current.ox + dx),
        Math.round(start.current.oy + dy)
      );
    }
    function up() {
      if (start.current) {
        start.current = null;
        setDragging(false);
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [id, dragScale, onDrag]);

  return (
    <div
      className={`select-none ${className}`}
      style={{
        ...style,
        transform: `translate(${offset.x}px, ${offset.y}px) ${extraTransform}`,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        start.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
        setDragging(true);
      }}
    >
      {children}
    </div>
  );
}

export default function StoryCanvas({
  vehicle,
  adjustments,
  carImage,
  layout,
  onDrag,
  scale,
  background,
  canvasW,
  canvasH,
  showInfo,
}: Props) {
  const [hasBgImage, setHasBgImage] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasBgImage(true);
    img.onerror = () => setHasBgImage(false);
    img.src = background;
  }, [background]);

  const l = (id: string) => layout[id] ?? { x: 0, y: 0 };

  // El diseño (1080 de ancho) se escala al ancho real del fondo.
  const designScale = canvasW / DESIGN_W;
  const layerH = canvasH / designScale; // alto del diseño en sus propias unidades
  // Para arrastrar: combina escala de preview y escala del diseño.
  const dragScale = scale * designScale;

  return (
    <div
      id="story-canvas"
      className="relative overflow-hidden text-ink"
      style={{ width: canvasW, height: canvasH }}
    >
      {/* ---------- FONDO ---------- */}
      <div className="absolute inset-0 story-bg-fallback" />
      {hasBgImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      )}

      {/* ---------- CAPA DE DISEÑO (escalada al ancho del fondo) ---------- */}
      <div
        className="absolute left-0 top-0"
        style={{
          width: DESIGN_W,
          height: layerH,
          transform: `scale(${designScale})`,
          transformOrigin: "top left",
        }}
      >
        {/* COCHE (centrado, arrastrable) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {carImage ? (
            <Draggable
              id="car"
              offset={{ x: adjustments.x, y: adjustments.y }}
              dragScale={dragScale}
              onDrag={onDrag}
              extraTransform={`scale(${adjustments.scale})`}
              className="relative flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={carImage}
                alt="Coche"
                crossOrigin="anonymous"
                className="relative object-contain"
                style={{
                  width: STAGE_W,
                  height: STAGE_H,
                  filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`,
                }}
                draggable={false}
              />
            </Draggable>
          ) : (
            <div className="relative flex h-[360px] w-[760px] items-center justify-center rounded-2xl border border-dashed border-ink/25 text-[28px] text-graphite">
              Sube una foto del coche
            </div>
          )}
        </div>

        {/* INFORMACIÓN (se muestra/oculta con el botón) */}
        {showInfo && (
          <>
            {/* CABECERA */}
            <div className="absolute left-0 right-0 top-[120px] flex flex-col items-center px-[90px]">
              <Draggable
                id="title"
                offset={l("title")}
                dragScale={dragScale}
                onDrag={onDrag}
                className="flex flex-col items-center text-center"
              >
                <div className="h-px w-[120px] bg-ink/40" />
                <h1 className="mt-[44px] font-display text-[96px] leading-[1.02] tracking-tight">
                  {vehicle.brand}
                  <br />
                  <span className="font-medium">{vehicle.model}</span>
                </h1>
                <div className="mt-[36px] flex items-baseline gap-[10px] font-sans">
                  <span className="text-[64px] font-light tracking-tight">
                    {vehicle.horsepower}
                  </span>
                  <span className="text-[26px] font-medium tracking-[0.3em] text-graphite">
                    CV
                  </span>
                </div>
                {vehicle.version && (
                  <p className="mt-[14px] text-[24px] font-medium uppercase tracking-[0.42em] text-graphite">
                    {vehicle.version}
                  </p>
                )}
              </Draggable>
            </div>

            {/* BLOQUE INFERIOR */}
            <div className="absolute bottom-[120px] left-0 right-0 px-[90px]">
              <Draggable
                id="specs"
                offset={l("specs")}
                dragScale={dragScale}
                onDrag={onDrag}
              >
                <div className="grid grid-cols-3 overflow-hidden rounded-[18px] border border-ink/10 bg-bone/70 backdrop-blur-sm">
                  <Spec label="AÑO" value={vehicle.year} />
                  <Spec label="KM" value={vehicle.mileage} divider />
                  <Spec label="GARANTÍA" value={vehicle.warranty} divider />
                </div>
              </Draggable>

              <Draggable
                id="price"
                offset={l("price")}
                dragScale={dragScale}
                onDrag={onDrag}
              >
                <p className="mt-[56px] text-center font-display text-[110px] leading-none tracking-tight">
                  {vehicle.price}
                </p>
              </Draggable>

              <Draggable
                id="status"
                offset={l("status")}
                dragScale={dragScale}
                onDrag={onDrag}
              >
                <div className="mt-[44px] flex justify-center">
                  <span className="rounded-full bg-ink px-[64px] py-[26px] text-[28px] font-semibold uppercase tracking-[0.32em] text-bone">
                    {vehicle.status}
                  </span>
                </div>
              </Draggable>

              <Draggable
                id="footer"
                offset={l("footer")}
                dragScale={dragScale}
                onDrag={onDrag}
              >
                <p className="mt-[44px] text-center text-[20px] font-medium uppercase tracking-[0.3em] text-graphite">
                  Compromiso&nbsp;&nbsp;|&nbsp;&nbsp;Transparencia&nbsp;&nbsp;|&nbsp;&nbsp;Confianza
                </p>
              </Draggable>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Spec({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-[40px] ${
        divider ? "border-l border-ink/10" : ""
      }`}
    >
      <span className="text-[22px] font-semibold uppercase tracking-[0.3em] text-graphite">
        {label}
      </span>
      <span className="mt-[10px] text-[40px] font-medium tracking-tight">
        {value}
      </span>
    </div>
  );
}
