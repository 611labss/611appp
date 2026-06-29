"use client";

export type PhotoroomSettings = {
  shadow: "none" | "ai.soft" | "ai.hard";
  relight: boolean;
  hd: boolean;
  beautify: boolean;
  textRemoval: boolean;
};

export const DEFAULT_PHOTOROOM: PhotoroomSettings = {
  shadow: "ai.soft",
  relight: false,
  hd: true,
  beautify: false,
  textRemoval: false,
};

const SHADOWS: { value: PhotoroomSettings["shadow"]; label: string }[] = [
  { value: "none", label: "Sin sombra" },
  { value: "ai.soft", label: "Suave" },
  { value: "ai.hard", label: "Marcada" },
];

const LIGHTING: { value: boolean; label: string }[] = [
  { value: false, label: "Original" },
  { value: true, label: "Reequilibrar luz" },
];

type Props = {
  settings: PhotoroomSettings;
  onChange: (next: PhotoroomSettings) => void;
  disabled?: boolean;
};

export default function PhotoroomOptions({
  settings,
  onChange,
  disabled,
}: Props) {
  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Acabado de la foto
      </h3>

      {/* Sombra */}
      <div className="mb-4">
        <span className="mb-2 block text-xs font-medium text-neutral-700">
          Sombra
        </span>
        <div className="grid grid-cols-3 gap-2">
          {SHADOWS.map((s) => {
            const active = settings.shadow === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onChange({ ...settings, shadow: s.value })}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Iluminación (relight) */}
      <div className="mb-4">
        <span className="mb-2 block text-xs font-medium text-neutral-700">
          Iluminación
        </span>
        <div className="grid grid-cols-2 gap-2">
          {LIGHTING.map((opt) => {
            const active = settings.relight === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => onChange({ ...settings, relight: opt.value })}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-neutral-400">
          &laquo;Reequilibrar luz&raquo; corrige la iluminación del coche cuando le
          da la luz desde un ángulo que no encaja con el fondo.
        </p>
      </div>

      {/* Mejoras extra (toggles) */}
      <div className="space-y-2 border-t border-neutral-100 pt-4">
        <Toggle
          label="Recorte HD"
          hint="Bordes más limpios en llantas, retrovisores y antenas."
          value={settings.hd}
          onClick={() => onChange({ ...settings, hd: !settings.hd })}
        />
        <Toggle
          label="Mejorar calidad (IA)"
          hint="Optimizada para coches: quita reflejos y mejora detalle. Puede retocar la imagen."
          value={settings.beautify}
          onClick={() => onChange({ ...settings, beautify: !settings.beautify })}
        />
        <Toggle
          label="Quitar textos / marcas de agua"
          hint="Borra textos o watermarks sobre el coche."
          value={settings.textRemoval}
          onClick={() =>
            onChange({ ...settings, textRemoval: !settings.textRemoval })
          }
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onClick,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
        value
          ? "border-ink bg-ink/5"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <span>
        <span className="block text-xs font-medium text-neutral-800">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug text-neutral-400">
            {hint}
          </span>
        )}
      </span>
      {/* Interruptor visual */}
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
          value ? "bg-ink" : "bg-neutral-300"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
