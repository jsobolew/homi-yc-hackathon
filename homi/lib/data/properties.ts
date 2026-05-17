export interface Property {
  id: string;
  name: string;
  lon: number;
  lat: number;
  x: number;
  y: number;
  variant: number;
  floors: number;
  units: number;
  neighborhood: string;
}

export const PROPERTIES: Property[] = [
  { id: 'p1', name: '1247 Castro St', lon: -122.4354, lat: 37.7607, x: 28, y: 44, variant: 0, floors: 4, units: 12, neighborhood: 'Castro' },
  { id: 'p2', name: '88 Mission Bay', lon: -122.3891, lat: 37.7705, x: 70, y: 40, variant: 2, floors: 6, units: 36, neighborhood: 'Mission Bay' },
  { id: 'p3', name: '402 Hayes', lon: -122.4255, lat: 37.7764, x: 44, y: 36, variant: 1, floors: 3, units: 6, neighborhood: 'Hayes Valley' },
  { id: 'p4', name: '17 Nob Hill', lon: -122.4149, lat: 37.7931, x: 52, y: 24, variant: 3, floors: 5, units: 18, neighborhood: 'Nob Hill' },
  { id: 'p5', name: '901 Sunset', lon: -122.4941, lat: 37.7536, x: 14, y: 36, variant: 0, floors: 3, units: 8, neighborhood: 'Sunset' },
  { id: 'p6', name: '230 Marina', lon: -122.4407, lat: 37.8034, x: 38, y: 14, variant: 1, floors: 4, units: 14, neighborhood: 'Marina' },
  { id: 'p7', name: '55 SoMa Lofts', lon: -122.4037, lat: 37.7806, x: 60, y: 32, variant: 2, floors: 5, units: 22, neighborhood: 'SoMa' },
  { id: 'p8', name: '714 Mission', lon: -122.4193, lat: 37.7599, x: 36, y: 50, variant: 3, floors: 3, units: 9, neighborhood: 'Mission' },
];

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}
