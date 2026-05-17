import manifest from './sf-map-manifest.json';

export type SfMapManifest = typeof manifest;

export const SF_MAP_MANIFEST: SfMapManifest = manifest;

function mercY(lat: number) {
  const clamped = Math.max(Math.min(lat, 89.9), -89.9);
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

export function projectLonLat(lon: number, lat: number) {
  const { bbox, width, height } = SF_MAP_MANIFEST;
  const x = ((lon - bbox.west) / (bbox.east - bbox.west)) * width;
  const yNorth = mercY(bbox.north);
  const ySouth = mercY(bbox.south);
  const y = ((yNorth - mercY(lat)) / (yNorth - ySouth)) * height;
  return { x, y };
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function fitCamera(viewportWidth: number, viewportHeight: number, padding = 36) {
  const { width, height } = SF_MAP_MANIFEST;
  const innerWidth = Math.max(1, viewportWidth - padding * 2);
  const innerHeight = Math.max(1, viewportHeight - padding * 2);
  const scale = Math.min(innerWidth / width, innerHeight / height);
  const tx = (viewportWidth - width * scale) / 2;
  const ty = (viewportHeight - height * scale) / 2;
  return { scale, tx, ty };
}

export function clampCamera(
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
  tx: number,
  ty: number,
  overscroll = 80,
) {
  const { width, height } = SF_MAP_MANIFEST;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  const minTx = Math.min(overscroll, viewportWidth - scaledWidth - overscroll);
  const maxTx = Math.max(viewportWidth - scaledWidth - overscroll, overscroll);
  const minTy = Math.min(overscroll, viewportHeight - scaledHeight - overscroll);
  const maxTy = Math.max(viewportHeight - scaledHeight - overscroll, overscroll);

  return {
    tx: clamp(tx, minTx, maxTx),
    ty: clamp(ty, minTy, maxTy),
  };
}
