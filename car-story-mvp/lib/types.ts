// Tipos compartidos de la app

export type VehicleData = {
  brand: string;
  model: string;
  version: string;
  horsepower: string;
  year: string;
  mileage: string;
  price: string;
  warranty: string;
  status: string;
};

export type ImageAdjustments = {
  scale: number;       // multiplicador de tamaño (1 = original)
  x: number;           // desplazamiento horizontal en px (coordenadas del canvas 1080x1920)
  y: number;           // desplazamiento vertical en px
  brightness: number;  // 0-200 (100 = normal)
  contrast: number;    // 0-200 (100 = normal)
  saturation: number;  // 0-200 (100 = normal)
};

export const DEFAULT_VEHICLE: VehicleData = {
  brand: "BMW",
  model: "M4 COMPETITION",
  version: "COMPETITION",
  horsepower: "453",
  year: "2018",
  mileage: "97.845",
  price: "67.990€",
  warranty: "12 MESOS",
  status: "EN STOCK",
};

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  scale: 1,
  x: 0,
  y: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};
