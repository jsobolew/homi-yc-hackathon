import React, { useMemo } from "react";

type Point = { label: string; lon: number; lat: number; hot?: boolean };

const manifest = {
  width: 320,
  height: 320,
  bbox: { west: -122.535, south: 37.695, east: -122.300, north: 37.842 },
};

function mercY(lat: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function project(lon: number, lat: number) {
  const { bbox: b, width, height } = manifest;
  const x = ((lon - b.west) / (b.east - b.west)) * (width - 1);
  const yNorth = mercY(b.north);
  const ySouth = mercY(b.south);
  const y = ((yNorth - mercY(lat)) / (yNorth - ySouth)) * (height - 1);
  return { x, y };
}

export function SfPixelMap({ points }: { points: Point[] }) {
  const route = useMemo(() => {
    return points
      .map((p, i) => {
        const xy = project(p.lon, p.lat);
        return `${i === 0 ? "M" : "L"}${xy.x.toFixed(1)},${xy.y.toFixed(1)}`;
      })
      .join(" ");
  }, [points]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", imageRendering: "pixelated" }}>
      <img
        src="/sf_pixel_map_320.png"
        alt="San Francisco pixel map"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", imageRendering: "pixelated" }}
      />
      <svg viewBox="0 0 320 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d={route} fill="none" stroke="rgba(42,32,48,.95)" strokeWidth="2.2" />
        <path d={route} fill="none" stroke="#ffd166" strokeWidth="1.1" strokeDasharray="6 5" />
      </svg>
      {points.map((point) => {
        const xy = project(point.lon, point.lat);
        return (
          <div
            key={point.label}
            title={point.label}
            style={{
              position: "absolute",
              left: `${(xy.x / manifest.width) * 100}%`,
              top: `${(xy.y / manifest.height) * 100}%`,
              width: 14,
              height: 14,
              marginLeft: -7,
              marginTop: -14,
              background: point.hot ? "#ffd166" : "#ff6f59",
              border: "2px solid #2a2030",
              borderRadius: "50%",
              boxShadow: "2px 2px 0 #2a2030",
            }}
          />
        );
      })}
    </div>
  );
}
