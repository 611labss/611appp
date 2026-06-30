"use client";

import { useState } from "react";

export type Background = { id: string; label: string; src: string };

// 🔧 Añade aquí los fondos que tengas en /public.
// Para usar un fondo nuevo: copia el PNG a la carpeta public/ y añade una línea.
export const BACKGROUNDS: Background[] = [
  { id: "fondo", label: "Fondo 1", src: "/fondo.png" },
  { id: "fondo2", label: "Fondo 2", src: "/fondo2.png" },
  { id: "fondo3", label: "Fondo 3", src: "/fondo3.png" },
];

type Props = {
  value: string; // src del fondo seleccionado
  onChange: (src: string) => void;
};

export default function BackgroundPicker({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Fondo
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {BACKGROUNDS.map((bg) => (
          <Thumb
            key={bg.id}
            bg={bg}
            active={value === bg.src}
            onClick={() => onChange(bg.src)}
          />
        ))}
      </div>
    </div>
  );
}

function Thumb({
  bg,
  active,
  onClick,
}: {
  bg: Background;
  active: boolean;
  onClick: () => void;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`overflow-hidden rounded-xl border-2 text-left transition ${
        active
          ? "border-ink ring-2 ring-ink/20"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <div className="relative aspect-[9/16] bg-sand">
        {missing ? (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-neutral-500">
            Añade {bg.src.replace("/", "")} a /public
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg.src}
            alt={bg.label}
            className="h-full w-full object-cover"
            onError={() => setMissing(true)}
          />
        )}
        {active && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
            En uso
          </span>
        )}
      </div>
      <span className="block px-2 py-1.5 text-xs font-medium text-neutral-700">
        {bg.label}
      </span>
    </button>
  );
}
