"use client";

import { Upload } from "lucide-react";
import type { VehicleData } from "@/lib/types";

type Props = {
  vehicle: VehicleData;
  onChange: (next: VehicleData) => void;
  onFile: (file: File) => void;
  fileName: string | null;
};

const FIELDS: { key: keyof VehicleData; label: string }[] = [
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "version", label: "Versión / Subtítulo" },
  { key: "horsepower", label: "CV" },
  { key: "year", label: "Año" },
  { key: "mileage", label: "KM" },
  { key: "price", label: "Precio" },
  { key: "warranty", label: "Garantía" },
  { key: "status", label: "Estado" },
];

export default function CarForm({ vehicle, onChange, onFile, fileName }: Props) {
  return (
    <div className="space-y-5">
      {/* Subida de foto */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Foto del coche
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50">
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {fileName ?? "Seleccionar imagen…"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>
      </div>

      {/* Campos del vehículo */}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {label}
            </label>
            <input
              type="text"
              value={vehicle[key]}
              onChange={(e) => onChange({ ...vehicle, [key]: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
