# SF Pixel-Art Map Demo Kit

This kit gives you a ready-to-use, stylized pixel-art San Francisco map for a hackathon demo.
The current generator keeps the original visual style, but builds the coastline, parks,
and street network from real GIS geometry instead of hand-drawn city shapes.

## Files

- `sf_pixel_map_320.png` — native 320×320 pixel-art map. Use this in the app.
- `sf_pixel_map_1280.png` — nearest-neighbor 4× upscale preview/export.
- `sf_pixel_map_manifest.json` — projection bounds for converting lat/lon to pixels.
- `sf_map_vector.svg` — zoom-friendly SVG map built from the same real GIS sources.
- `sf_map_vector_manifest.json` — vector-map viewBox/projection metadata for future overlays.
- `index.html` — standalone demo with animated route and pins.
- `preview_vector.html` — lightweight browser preview for the SVG asset.
- `sf_map_component.tsx` — React/Next-style component skeleton.
- `generate_sf_pixel_map.py` — deterministic generator.
- `generate_sf_svg_map.py` — deterministic SVG generator for the higher-fidelity map.
- `curated_sf_features.json` — styling metadata, labels, bridges, lakes, and landmarks.
- `sources/` — downloaded official DataSF geometry plus optional Overpass query/source notes.

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
/Users/jakubsobolewski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 sources/fetch_sources.py
/Users/jakubsobolewski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 generate_sf_pixel_map.py --out .
/Users/jakubsobolewski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 generate_sf_svg_map.py --out .
```

Optional, if you want to append OSM major-road geometry as an extra source:

```bash
/Users/jakubsobolewski/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 generate_sf_pixel_map.py --out . --osm-json sources/sf_osm_features.json
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

For a YC demo, the best polish pass is still manual:

1. Regenerate the base PNG.
2. Open `sf_pixel_map_320.png` in Aseprite, Photoshop, Figma, or any pixel editor.
3. Clean up 3–5 priority spots: Golden Gate Bridge, Bay Bridge, downtown, your product’s main pin, and any labels.
4. Keep the same 320×320 canvas and same manifest bounds.
5. Overlay all product state in the frontend rather than baking it into the map.

## Source strategy

This generated artifact is original stylized pixel art rendered from GIS geometry.
It does not embed a third-party poster, tile image, or commercial artwork.

Useful data sources included for future upgrades:

- DataSF `SF Shoreline and Islands`: official SF mainland shoreline and islands. The public map page is `rgcx-5tix`; the backing geometry layer used by the generator is `txuc-3kzm`.
- DataSF `RPD Parks`: official San Francisco Recreation and Parks polygons.
- DataSF `Streets - Active and Retired`: official SF street-centerline dataset. The Data.gov catalog lists it as public access and PDDL 1.0. See `sources/datasf_streets_source.txt`.
- OpenStreetMap / Overpass API: use `sources/overpass_sf_major_features.overpassql` to fetch major roads, parks, and water features. If you use OSM data publicly, display attribution: `© OpenStreetMap contributors`.

The included HTML has a small attribution note. Keep or improve it if you regenerate from OSM or DataSF.
