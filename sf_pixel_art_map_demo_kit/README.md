# SF Pixel-Art Map Demo Kit

This kit gives you a ready-to-use, stylized pixel-art San Francisco map for a hackathon demo.

## Files

- `sf_pixel_map_320.png` — native 320×320 pixel-art map. Use this in the app.
- `sf_pixel_map_1280.png` — nearest-neighbor 4× upscale preview/export.
- `sf_pixel_map_manifest.json` — projection bounds for converting lat/lon to pixels.
- `index.html` — standalone demo with animated route and pins.
- `sf_map_component.tsx` — React/Next-style component skeleton.
- `generate_sf_pixel_map.py` — deterministic generator.
- `curated_sf_features.json` — editable geometry for land, parks, roads, bridges, landmarks.
- `sources/` — optional Overpass/DataSF fetch query and source notes.

## Best demo usage

Use the 320px map as the app background and scale it with CSS:

```css
.sf-map {
  image-rendering: pixelated;
  width: 960px;
  height: 960px;
  background-image: url('/sf_pixel_map_320.png');
  background-size: cover;
}
```

Do not use the 1280px image unless you need a static export. The 320px source looks cleaner when scaled by the browser with `image-rendering: pixelated`.

## Run the standalone demo

From this folder:

```bash
python3 -m http.server 8000
```

Then open:

```txt
http://localhost:8000/index.html
```

## Regenerate the map

```bash
python generate_sf_pixel_map.py --out . --features curated_sf_features.json
```

Optional, if you fetch OSM data first:

```bash
python sources/fetch_sources.py
python generate_sf_pixel_map.py --out . --features curated_sf_features.json --osm-json sources/sf_osm_features.json
```

## Coordinate transform

The manifest uses Web Mercator bounds:

```json
{
  "width": 320,
  "height": 320,
  "projection": "web_mercator",
  "bbox": {
    "west": -122.535,
    "south": 37.695,
    "east": -122.300,
    "north": 37.842
  }
}
```

JS projection:

```js
function mercY(lat) {
  const rad = lat * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function project(lon, lat, manifest) {
  const b = manifest.bbox;
  const x = ((lon - b.west) / (b.east - b.west)) * (manifest.width - 1);
  const yNorth = mercY(b.north);
  const ySouth = mercY(b.south);
  const y = ((yNorth - mercY(lat)) / (yNorth - ySouth)) * (manifest.height - 1);
  return { x, y };
}
```

## Editing the art quickly

For a YC demo, the best polish pass is manual:

1. Regenerate the base PNG.
2. Open `sf_pixel_map_320.png` in Aseprite, Photoshop, Figma, or any pixel editor.
3. Clean up 3–5 priority spots: Golden Gate Bridge, Bay Bridge, downtown, your product’s main pin, and any labels.
4. Keep the same 320×320 canvas and same manifest bounds.
5. Overlay all product state in the frontend rather than baking it into the map.

## Source strategy

This generated artifact is original stylized, code-drawn geometry. It does not embed a third-party poster, tile image, or commercial artwork.

Useful data sources included for future upgrades:

- DataSF `Streets - Active and Retired`: official SF street-centerline dataset. The Data.gov catalog lists it as public access and PDDL 1.0. See `sources/datasf_streets_source.txt`.
- OpenStreetMap / Overpass API: use `sources/overpass_sf_major_features.overpassql` to fetch major roads, parks, and water features. If you use OSM data publicly, display attribution: `© OpenStreetMap contributors`.

The included HTML has a small attribution note. Keep or improve it if you regenerate from OSM or DataSF.
