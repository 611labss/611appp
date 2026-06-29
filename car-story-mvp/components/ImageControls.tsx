"use client";

import { RotateCcw } from "lucide-react";
import type { ImageAdjustments } from "@/lib/types";

type Props = {
  adjustments: ImageAdjustments;
  onChange: (next: ImageAdjustments) => void;
  onReset: () => void;
  disabled?: boolean;
};

const CONTROLS: {
  key: keyof ImageAdjustments;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "scale", label: "Escala", min: 0.3, max: 2.5, step: 0.01 },
  { key: "x", label: "Posición X", min: -500, max: 500, step: 1 },
  { key: "y", label: "Posición Y", min: -500, max: 500, step: 1 },
  { key: "brightness", label: "Brillo", min: 0, max: 200, step: 1 },
  { key: "contrast", label: "Contraste", min: 0, max: 200, step: 1 },
  { key: "saturation", label: "Saturación", min: 0, max: 200, step: 1 },
];

export default function ImageControls({
  adjustments,
  onChange,
  onReset,
  disabled,
}: Props) {
  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Ajustes de imagen
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {CONTROLS.map(({ key, label, min, max, step }) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-700">{label}</span>
              <span className="tabular-nums text-neutral-400">
                {adjustments[key]}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={adjustments[key]}
              onChange={(e) =>
                onChange({ ...adjustments, [key]: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
