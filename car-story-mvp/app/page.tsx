"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Sparkles, Download, ImageOff, Loader2 } from "lucide-react";
import CarForm from "@/components/CarForm";
import StoryCanvas, {
  DEFAULT_LAYOUT,
  type LayoutOffsets,
} from "@/components/StoryCanvas";
import ImageControls from "@/components/ImageControls";
import BackgroundPicker, {
  BACKGROUNDS,
} from "@/components/BackgroundPicker";
import PhotoroomOptions, {
  DEFAULT_PHOTOROOM,
  type PhotoroomSettings,
} from "@/components/PhotoroomOptions";
import {
  DEFAULT_VEHICLE,
  DEFAULT_ADJUSTMENTS,
  type VehicleData,
  type ImageAdjustments,
} from "@/lib/types";

// Tamaño por defecto si no se puede leer el fondo (formato historia IG)
const DEFAULT_CANVAS = { w: 1080, h: 1920 };

type Status =
  | "idle"
  | "uploading"
  | "processing"
  | "rendering"
  | "downloading";

export default function Page() {
  const [vehicle, setVehicle] = useState<VehicleData>(DEFAULT_VEHICLE);
  const [adjustments, setAdjustments] =
    useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [layout, setLayout] = useState<LayoutOffsets>(DEFAULT_LAYOUT);
  const [background, setBackground] = useState<string>(BACKGROUNDS[0].src);
  const [showInfo, setShowInfo] = useState(true);
  const [canvas, setCanvas] = useState(DEFAULT_CANVAS);
  const [photoroom, setPhotoroom] =
    useState<PhotoroomSettings>(DEFAULT_PHOTOROOM);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Imagen mostrada: la procesada por Photoroom si existe, si no la original.
  const carImage = processedImage ?? originalImage;

  // ---------- Tamaño del canvas según el fondo elegido ----------
  // Se lee el tamaño real del PNG del fondo y el canvas se adapta a él.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setCanvas({ w: img.naturalWidth, h: img.naturalHeight });
      } else {
        setCanvas(DEFAULT_CANVAS);
      }
    };
    img.onerror = () => setCanvas(DEFAULT_CANVAS);
    img.src = background;
  }, [background]);

  // ---------- Vista previa escalada ----------
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / canvas.w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvas.w]);

  // ---------- Subida de foto ----------
  const handleFile = useCallback((file: File) => {
    setOriginalFile(file);
    setProcessedImage(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setOriginalImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ---------- Arrastrar bloques en la vista previa ----------
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const handleDrag = useCallback((id: string, x: number, y: number) => {
    if (id === "car") {
      // El coche comparte posición con los sliders X/Y
      setAdjustments((prev) => ({
        ...prev,
        x: clamp(x, -500, 500),
        y: clamp(y, -500, 500),
      }));
    } else {
      setLayout((prev) => ({
        ...prev,
        [id]: { x: clamp(x, -900, 900), y: clamp(y, -900, 900) },
      }));
    }
  }, []);

  const resetLayout = useCallback(() => setLayout(DEFAULT_LAYOUT), []);

  // ---------- Generar con Photoroom ----------
  const generateWithPhotoroom = useCallback(async () => {
    if (!originalFile) {
      setError("Primero sube una foto del coche.");
      return;
    }
    setError(null);
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("image", originalFile);
      formData.append("shadow", photoroom.shadow);
      formData.append("relight", String(photoroom.relight));
      formData.append("hd", String(photoroom.hd));
      formData.append("beautify", String(photoroom.beautify));
      formData.append("textRemoval", String(photoroom.textRemoval));

      setStatus("processing");
      const res = await fetch("/api/photoroom", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let msg = "No se ha podido procesar la imagen.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          /* respuesta no-JSON */
        }
        if (res.status === 401 || res.status === 403) {
          msg = "Falta la clave de la API en la configuración (.env.local) o no es válida.";
        }
        throw new Error(msg);
      }

      setStatus("rendering");
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      setProcessedImage(dataUrl);
    } catch (e) {
      // Fallback: la app sigue funcionando con la imagen original.
      const msg =
        e instanceof Error
          ? e.message
          : "No se ha podido procesar la imagen.";
      setError(
        `${msg} Prueba con otra foto donde el coche se vea completo y con buena luz. Mientras tanto seguimos usando tu imagen original.`
      );
    } finally {
      setStatus("idle");
    }
  }, [originalFile, photoroom]);

  // ---------- Descargar PNG ----------
  const download = useCallback(async () => {
    const node = document.getElementById("story-canvas");
    if (!node) return;
    setStatus("downloading");
    setError(null);
    try {
      const dataUrl = await toPng(node, {
        width: canvas.w,
        height: canvas.h,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      const slug = `${vehicle.brand}-${vehicle.model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      link.download = `${slug || "coche"}-${canvas.w}x${canvas.h}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("No se ha podido generar el PNG. Inténtalo de nuevo.");
    } finally {
      setStatus("idle");
    }
  }, [vehicle.brand, vehicle.model, canvas.w, canvas.h]);

  const busy = status !== "idle";
  const statusLabel: Record<Status, string> = {
    idle: "",
    uploading: "Subiendo imagen…",
    processing: "Procesando imagen…",
    rendering: "Generando preview…",
    downloading: "Descargando historia…",
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight">
          611 <span className="text-neutral-400">Photoroom</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Genera fotos de tu negocio es SEGUNDOS
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ---------- COLUMNA IZQUIERDA ---------- */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <CarForm
              vehicle={vehicle}
              onChange={setVehicle}
              onFile={handleFile}
              fileName={originalFile?.name ?? null}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <BackgroundPicker value={background} onChange={setBackground} />

            <button
              onClick={() => setShowInfo((v) => !v)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                showInfo
                  ? "border-ink bg-ink text-white"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              <span>Añadir información</span>
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {showInfo ? "Activado" : "Desactivado"}
              </span>
            </button>
          </section>

          <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <PhotoroomOptions
              settings={photoroom}
              onChange={setPhotoroom}
              disabled={!originalImage}
            />

            <button
              onClick={generateWithPhotoroom}
              disabled={busy || !originalImage}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "processing" || status === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generar foto de estudio
            </button>

            {processedImage && (
              <button
                onClick={() => setProcessedImage(null)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
              >
                <ImageOff className="h-3.5 w-3.5" />
                Volver a la imagen original
              </button>
            )}

            {busy && statusLabel[status] && (
              <p className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {statusLabel[status]}
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                {error}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <ImageControls
              adjustments={adjustments}
              onChange={setAdjustments}
              onReset={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
              disabled={!carImage}
            />
          </section>

          <button
            onClick={download}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Descargar historia
          </button>
        </div>

        {/* ---------- COLUMNA DERECHA: PREVIEW ---------- */}
        <div>
          <div className="sticky top-8">
            {/* Contenedor que reserva el alto escalado */}
            <div
              ref={previewRef}
              className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
              style={{ height: canvas.h * scale }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  width: canvas.w,
                  height: canvas.h,
                }}
              >
                <StoryCanvas
                  vehicle={vehicle}
                  adjustments={adjustments}
                  carImage={carImage}
                  layout={layout}
                  onDrag={handleDrag}
                  scale={scale}
                  background={background}
                  canvasW={canvas.w}
                  canvasH={canvas.h}
                  showInfo={showInfo}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-neutral-400">
              Arrastra el coche y los textos para recolocarlos · exporta a{" "}
              {canvas.w}×{canvas.h} px
            </p>
            <div className="mt-2 text-center">
              <button
                onClick={resetLayout}
                className="text-xs font-medium text-neutral-500 underline-offset-2 transition hover:text-ink hover:underline"
              >
                Restablecer posición de los textos
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
