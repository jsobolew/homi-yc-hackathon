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
  { id: 'p3', name: '402 Hayes', lon: -122.4255, lat: 37.7764, x: 44, y: 36, variant: 1, floors: 3, units: 6, neighborhood: 'Hayes Valley' },
  { id: 'p8', name: '714 Mission', lon: -122.4193, lat: 37.7599, x: 36, y: 50, variant: 3, floors: 3, units: 9, neighborhood: 'Mission' },
];

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}
