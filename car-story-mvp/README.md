# Car Story MVP

App local para generar historias de Instagram (1080×1920) de coches para concesionario.
Sin login, sin base de datos, sin servicios externos de despliegue. Solo `npm run dev`.

---

## 1. Crear el proyecto desde cero (opcional)

Si partes de cero en lugar de usar esta carpeta, este es el comando base:

```bash
npx create-next-app@latest car-story-mvp --typescript --tailwind --eslint --app
cd car-story-mvp
npm install html-to-image lucide-react
```

Luego copia/sustituye los archivos de este proyecto.

## 2. Si usas esta carpeta directamente

```bash
cd car-story-mvp
npm install
```

Esto instala Next, React, Tailwind, `html-to-image` y `lucide-react`.

## 3. API key de Photoroom

1. Copia `.env.local.example` a `.env.local`.
2. Pon tu clave real:

```
PHOTOROOM_API_KEY=tu_clave_real_de_photoroom
```

La clave se usa SOLO en el servidor (`app/api/photoroom/route.ts`). Nunca llega al navegador.

## 4. Fondo de la historia

- Coloca tu fondo en `public/fondo.png` (idealmente vertical, alta resolución).
- Si **no** existe `fondo.png`, la app usa automáticamente un fondo CSS de respaldo
  (beige cálido tipo hormigón minimalista). No tienes que hacer nada.

## 5. Ejecutar en local

```bash
npm run dev
```

Abre: http://localhost:3000

## 6. Probar con una foto

1. Pulsa **Foto del coche** y selecciona una imagen.
2. La imagen aparece en la plantilla (parte central).
3. Ajusta los datos del vehículo en el formulario.
4. (Opcional) Pulsa **Generar con Photoroom** para quitar el fondo, añadir sombra y
   armonizar la luz. Si Photoroom falla, la app sigue funcionando con la imagen original.
5. Usa los sliders (escala, posición, brillo, contraste, saturación) para encajar el coche.

## 7. Descargar el PNG

Pulsa **Descargar historia**. Se exporta solo el lienzo, a **1080×1920 px**, como
`historia-marca-modelo.png`.

---

## Estructura

```
car-story-mvp/
├─ app/
│  ├─ layout.tsx          # fuentes (Playfair + Inter) y layout raíz
│  ├─ page.tsx            # estado principal, preview y exportación PNG
│  ├─ globals.css         # Tailwind + fondo CSS de respaldo
│  └─ api/photoroom/
│     └─ route.ts         # llamada a Photoroom (solo servidor)
├─ components/
│  ├─ CarForm.tsx         # formulario + subida de foto
│  ├─ StoryCanvas.tsx     # plantilla fija 1080×1920
│  └─ ImageControls.tsx   # sliders de ajuste
├─ lib/
│  └─ types.ts            # VehicleData, ImageAdjustments y valores por defecto
└─ public/
   └─ fondo.png           # (opcional) fondo base
```

## Ajustar Photoroom

Todos los parámetros configurables están agrupados al principio de
`app/api/photoroom/route.ts` (objeto `PHOTOROOM_PARAMS`): eliminación de fondo,
modo de sombra, relighting, formato y tamaño de salida. Si Photoroom cambia algún
nombre de parámetro y da error, edítalos ahí sin tocar el resto del código.

## Notas

- La plantilla es **fija y determinista**: solo cambian el coche y los datos.
- Photoroom **solo** procesa la imagen del coche; el diseño lo monta la app.
- Ningún texto se genera con IA.
