import { NextRequest, NextResponse } from "next/server";

/**
 * Llamada a Photoroom desde el SERVIDOR (la API key nunca llega al frontend).
 *
 * Endpoint: Image Editing API v2
 *   POST https://image-api.photoroom.com/v2/edit
 *   Auth: header  x-api-key: <PHOTOROOM_API_KEY>
 *   Body: multipart/form-data con el campo "imageFile"
 *
 * NOTA: Photoroom ajusta de vez en cuando los nombres de los parámetros.
 * Por eso TODOS los parámetros configurables están agrupados aquí abajo,
 * para que puedas editarlos con facilidad sin tocar el resto del código.
 * Si algún parámetro diera error, coméntalo y vuelve a probar.
 */

const PHOTOROOM_ENDPOINT = "https://image-api.photoroom.com/v2/edit";

// 🔧 Parámetros SIEMPRE activos (no dependen de los botones) -------------
// Para fondo transparente NO se envía "background.color".
const BASE_PARAMS: Record<string, string> = {
  removeBackground: "true",
  padding: "0.08",
  "export.format": "png",
  // Recorta a las dimensiones exactas del coche: queda más grande y nítido
  // sobre la plantilla, sin espacio transparente desperdiciado.
  outputSize: "croppedSubject",
};
// Sombras y luz se eligen desde la app (ver más abajo). -----------------

export async function POST(req: NextRequest) {
  const apiKey = process.env.PHOTOROOM_API_KEY;

  if (!apiKey || apiKey === "mi_api_key") {
    return NextResponse.json(
      { error: "Falta la clave de la API en la configuración (.env.local)." },
      { status: 401 }
    );
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Petición inválida: no se recibió la imagen." },
      { status: 400 }
    );
  }

  const file = incoming.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se ha recibido ninguna imagen." },
      { status: 400 }
    );
  }

  // Opciones elegidas en la app (con valores por defecto seguros)
  const shadow = (incoming.get("shadow") as string) || "ai.soft";
  const relight = (incoming.get("relight") as string) === "true";
  const hd = (incoming.get("hd") as string) === "true";
  const beautify = (incoming.get("beautify") as string) === "true";
  const textRemoval = (incoming.get("textRemoval") as string) === "true";

  // Construimos los parámetros finales
  const params: Record<string, string> = { ...BASE_PARAMS };
  if (shadow && shadow !== "none") {
    params["shadow.mode"] = shadow; // "ai.soft" | "ai.hard" | "ai.auto"
  }
  if (relight) {
    params["lighting.mode"] = "ai.auto";
  }
  if (beautify) {
    params["beautify.mode"] = "ai.car"; // específico para coches: quita reflejos
  }
  if (textRemoval) {
    params["textRemoval.mode"] = "ai.all"; // borra textos/marcas de agua
  }

  // Cabeceras (HD background removal va como cabecera, no como campo)
  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    Accept: "image/png, application/json",
  };
  if (hd) {
    headers["pr-hd-background-removal"] = "auto";
  }

  // Montamos el body para Photoroom
  const body = new FormData();
  body.append("imageFile", file, file.name || "car.png");
  for (const [key, value] of Object.entries(params)) {
    body.append(key, value);
  }

  try {
    const photoroomRes = await fetch(PHOTOROOM_ENDPOINT, {
      method: "POST",
      headers,
      body,
    });

    if (!photoroomRes.ok) {
      // Intentamos extraer el mensaje de error de Photoroom
      let detail = `El servicio de imagen respondió ${photoroomRes.status}.`;
      try {
        const errJson = await photoroomRes.json();
        const raw = errJson?.detail ?? errJson?.error ?? errJson;
        detail = typeof raw === "string" ? raw : JSON.stringify(raw);
      } catch {
        /* respuesta no-JSON */
      }
      return NextResponse.json(
        { error: `No se ha podido procesar la imagen. ${detail}` },
        { status: photoroomRes.status }
      );
    }

    // Devolvemos la imagen procesada tal cual (binario) al frontend
    const arrayBuffer = await photoroomRes.arrayBuffer();
    const contentType =
      photoroomRes.headers.get("content-type") ?? "image/png";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Error de red al procesar la imagen. Revisa tu conexión y la clave de la API.",
      },
      { status: 502 }
    );
  }
}
