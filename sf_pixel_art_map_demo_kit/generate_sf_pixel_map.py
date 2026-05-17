#!/usr/bin/env python3
"""Generate a stylized low-res pixel-art map of San Francisco.

This is designed for demos: deterministic, dependency-light, and easy to edit.
It uses curated simplified SF geometry by default, with an optional Overpass JSON
path for adding real OSM major-road geometries if you fetch data separately.

Outputs:
  - sf_pixel_map_320.png       native low-res pixel map
  - sf_pixel_map_1280.png      nearest-neighbor upscale
  - sf_pixel_map_manifest.json projection/bounds for overlaying app data
"""
from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw

# Palette: compact, readable, YC/demo-friendly.
PAL = {
    "water": (23, 46, 72),
    "water2": (29, 59, 89),
    "water3": (54, 91, 118),
    "land": (219, 196, 150),
    "land2": (229, 213, 171),
    "land_shadow": (93, 67, 79),
    "coast": (54, 42, 57),
    "park": (72, 139, 95),
    "park2": (96, 167, 109),
    "lake": (63, 126, 149),
    "road_dark": (60, 52, 63),
    "road": (235, 226, 185),
    "road_minor": (198, 183, 143),
    "road_highlight": (244, 199, 112),
    "bridge": (203, 79, 65),
    "bridge_dark": (80, 42, 52),
    "building": (99, 83, 91),
    "building_hi": (152, 128, 112),
    "building_dark": (55, 49, 62),
    "white": (246, 235, 205),
    "label": (255, 239, 194),
    "label_shadow": (42, 32, 48),
    "pin": (255, 111, 89),
    "pin2": (255, 209, 102),
    "fog": (168, 191, 195),
}

FONT_3X5 = {
    "A": ["111", "101", "111", "101", "101"],
    "B": ["110", "101", "110", "101", "110"],
    "C": ["111", "100", "100", "100", "111"],
    "D": ["110", "101", "101", "101", "110"],
    "E": ["111", "100", "110", "100", "111"],
    "F": ["111", "100", "110", "100", "100"],
    "G": ["111", "100", "101", "101", "111"],
    "H": ["101", "101", "111", "101", "101"],
    "I": ["111", "010", "010", "010", "111"],
    "J": ["001", "001", "001", "101", "111"],
    "K": ["101", "101", "110", "101", "101"],
    "L": ["100", "100", "100", "100", "111"],
    "M": ["101", "111", "111", "101", "101"],
    "N": ["101", "111", "111", "111", "101"],
    "O": ["111", "101", "101", "101", "111"],
    "P": ["111", "101", "111", "100", "100"],
    "Q": ["111", "101", "101", "111", "001"],
    "R": ["110", "101", "110", "101", "101"],
    "S": ["111", "100", "111", "001", "111"],
    "T": ["111", "010", "010", "010", "010"],
    "U": ["101", "101", "101", "101", "111"],
    "V": ["101", "101", "101", "101", "010"],
    "W": ["101", "101", "111", "111", "101"],
    "X": ["101", "101", "010", "101", "101"],
    "Y": ["101", "101", "010", "010", "010"],
    "Z": ["111", "001", "010", "100", "111"],
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    " ": ["000", "000", "000", "000", "000"],
    "-": ["000", "000", "111", "000", "000"],
    ".": ["000", "000", "000", "000", "010"],
    "/": ["001", "001", "010", "100", "100"],
}


def merc_y(lat: float) -> float:
    lat = max(min(lat, 89.9), -89.9)
    rad = math.radians(lat)
    return math.log(math.tan(math.pi / 4 + rad / 2))


class Projector:
    def __init__(self, bbox: dict[str, float], width: int, height: int) -> None:
        self.west = bbox["west"]
        self.east = bbox["east"]
        self.south = bbox["south"]
        self.north = bbox["north"]
        self.width = width
        self.height = height
        self.y_north = merc_y(self.north)
        self.y_south = merc_y(self.south)

    def xy(self, lon: float, lat: float) -> tuple[int, int]:
        x = (lon - self.west) / (self.east - self.west) * (self.width - 1)
        y = (self.y_north - merc_y(lat)) / (self.y_north - self.y_south) * (self.height - 1)
        return int(round(x)), int(round(y))

    def path(self, coords: Sequence[Sequence[float]]) -> list[tuple[int, int]]:
        return [self.xy(float(lon), float(lat)) for lon, lat in coords]


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def draw_polyline(draw: ImageDraw.ImageDraw, pts: Sequence[tuple[int, int]], fill: tuple[int, int, int], width: int = 1) -> None:
    if len(pts) < 2:
        return
    draw.line(list(pts), fill=fill, width=width, joint="curve")


def draw_pixel_text(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, color: tuple[int, int, int], scale: int = 1, shadow: bool = True) -> None:
    text = text.upper()
    if shadow:
        draw_pixel_text(draw, text, x + scale, y + scale, PAL["label_shadow"], scale=scale, shadow=False)
    cx = x
    for ch in text:
        glyph = FONT_3X5.get(ch, FONT_3X5[" "])
        for gy, row in enumerate(glyph):
            for gx, val in enumerate(row):
                if val == "1":
                    draw.rectangle(
                        [cx + gx * scale, y + gy * scale, cx + (gx + 1) * scale - 1, y + (gy + 1) * scale - 1],
                        fill=color,
                    )
        cx += 4 * scale


def text_width(text: str, scale: int = 1) -> int:
    return max(0, len(text) * 4 * scale - scale)


def fill_dither(draw: ImageDraw.ImageDraw, mask: Image.Image, color: tuple[int, int, int], step: int, rate: float, seed: int = 0) -> None:
    rng = random.Random(seed)
    w, h = mask.size
    m = mask.load()
    for y in range(0, h, step):
        for x in range(0, w, step):
            if m[x, y] and rng.random() < rate:
                draw.point((x, y), fill=color)
                if rng.random() < 0.35 and x + 1 < w:
                    draw.point((x + 1, y), fill=color)


def polygon_mask(size: tuple[int, int], polygons: Iterable[Sequence[tuple[int, int]]]) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    for pts in polygons:
        if len(pts) >= 3:
            d.polygon(pts, fill=255)
    return mask


def composite_layer(base: Image.Image, layer: Image.Image, mask: Image.Image | None = None) -> None:
    if mask is None:
        base.alpha_composite(layer)
    else:
        base.alpha_composite(Image.composite(layer, Image.new("RGBA", base.size, (0, 0, 0, 0)), mask))


def draw_water(img: Image.Image) -> None:
    draw = ImageDraw.Draw(img)
    w, h = img.size
    draw.rectangle([0, 0, w, h], fill=PAL["water"])
    rng = random.Random(42)
    # Layered, non-uniform wavelets. Looks like water after nearest-neighbor upscale.
    for _ in range(430):
        x = rng.randrange(0, w)
        y = rng.randrange(0, h)
        length = rng.choice([1, 2, 3, 4])
        col = PAL["water2"] if rng.random() < 0.72 else PAL["water3"]
        draw.line([(x, y), (min(w - 1, x + length), y)], fill=col)
    # Subtle fog bands in northwest / over the Golden Gate.
    for y in [18, 23, 31]:
        for x in range(5, 118, 14):
            draw.line([(x, y), (x + 7, y)], fill=PAL["fog"])


def draw_land_and_masks(img: Image.Image, features: dict, p: Projector) -> tuple[Image.Image, Image.Image]:
    draw = ImageDraw.Draw(img)
    land_polys = [p.path(features["land"]), p.path(features["marin_headlands"])]
    for island in features.get("islands", []):
        land_polys.append(p.path(island["polygon"]))

    # Shadow offset before land to provide chunky coastline depth.
    for pts in land_polys:
        shadow = [(x + 2, y + 3) for x, y in pts]
        draw.polygon(shadow, fill=PAL["land_shadow"])
    for pts in land_polys:
        draw.polygon(pts, fill=PAL["land"])
        draw.line(pts + [pts[0]], fill=PAL["coast"], width=2)

    land_mask = polygon_mask(img.size, land_polys)
    land_draw = ImageDraw.Draw(img)
    fill_dither(land_draw, land_mask, PAL["land2"], step=5, rate=0.25, seed=10)

    return land_mask, polygon_mask(img.size, [p.path(features["land"])])


def draw_parks_lakes(img: Image.Image, features: dict, p: Projector, sf_land_mask: Image.Image) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for park in features.get("parks", []):
        pts = p.path(park["polygon"])
        draw.polygon(pts, fill=PAL["park"])
        draw.line(pts + [pts[0]], fill=(48, 84, 68), width=1)
        # Small tree pixels / grass variation
        for i, (x, y) in enumerate(pts[:1]):
            pass
    for lake in features.get("lakes", []):
        pts = p.path(lake["polygon"])
        draw.polygon(pts, fill=PAL["lake"])
        draw.line(pts + [pts[0]], fill=PAL["coast"], width=1)
    composite_layer(img, layer, sf_land_mask)

    # Park texture after masking
    tex = Image.new("RGBA", img.size, (0, 0, 0, 0))
    texd = ImageDraw.Draw(tex)
    park_mask = polygon_mask(img.size, [p.path(x["polygon"]) for x in features.get("parks", [])])
    fill_dither(texd, park_mask, PAL["park2"], step=4, rate=0.35, seed=11)
    composite_layer(img, tex, sf_land_mask)


def append_osm_roads(roads: list[dict], osm_path: Path | None) -> None:
    """Optionally append major roads from an Overpass 'out geom' JSON export.

    The demo artifact does not require this. It is here so the same generator can
    be upgraded to use real OSM geometries by placing sf_osm_features.json in
    sources/ and running with --osm-json sources/sf_osm_features.json.
    """
    if not osm_path or not osm_path.exists():
        return
    data = load_json(osm_path)
    highway_rank = {
        "motorway": "highway",
        "trunk": "highway",
        "primary": "major",
        "secondary": "major",
        "tertiary": "minor",
    }
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        kind = highway_rank.get(tags.get("highway"))
        geom = el.get("geometry")
        if not kind or not geom or len(geom) < 2:
            continue
        roads.append({
            "name": tags.get("name", "OSM ROAD"),
            "kind": kind,
            "path": [[pt["lon"], pt["lat"]] for pt in geom],
        })


def draw_roads(img: Image.Image, features: dict, p: Projector, sf_land_mask: Image.Image, osm_json: Path | None) -> None:
    roads = list(features.get("roads", []))
    append_osm_roads(roads, osm_json)

    # Grid roads: generated stylized neighborhoods, clipped to SF land.
    grid_roads: list[dict] = []
    # West-side Sunset/Richmond grid.
    for lon in [-122.505, -122.497, -122.489, -122.481, -122.469, -122.461, -122.453, -122.445]:
        grid_roads.append({"name":"GRID", "kind":"grid", "path":[[lon,37.715],[lon,37.792]]})
    for lat in [37.720,37.728,37.736,37.744,37.752,37.760,37.768,37.776,37.784,37.792]:
        grid_roads.append({"name":"GRID", "kind":"grid", "path":[[-122.512,lat],[-122.437,lat]]})
    # Downtown / SOMA blocks.
    for lon in [-122.421, -122.416, -122.411, -122.406, -122.401, -122.396, -122.391]:
        grid_roads.append({"name":"DT GRID", "kind":"grid", "path":[[lon,37.764],[lon,37.806]]})
    for lat in [37.768,37.773,37.778,37.783,37.788,37.793,37.798,37.803]:
        grid_roads.append({"name":"DT GRID", "kind":"grid", "path":[[-122.430,lat],[-122.386,lat]]})
    roads = grid_roads + roads

    road_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(road_layer)
    kind_style = {
        "grid": (PAL["road_minor"], 1, 0),
        "minor": (PAL["road_minor"], 1, 1),
        "major": (PAL["road"], 2, 1),
        "highway": (PAL["road_highlight"], 3, 2),
        "highlight": (PAL["road_highlight"], 2, 1),
    }
    # Dark under-strokes first.
    for road in roads:
        color, width, outline = kind_style.get(road.get("kind", "minor"), kind_style["minor"])
        pts = p.path(road["path"])
        if outline:
            draw_polyline(draw, pts, PAL["road_dark"], width + outline * 2)
    # Main strokes.
    for road in roads:
        color, width, _ = kind_style.get(road.get("kind", "minor"), kind_style["minor"])
        pts = p.path(road["path"])
        draw_polyline(draw, pts, color, width)
    composite_layer(img, road_layer, sf_land_mask)


def draw_buildings(img: Image.Image, p: Projector, sf_land_mask: Image.Image) -> None:
    b = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(b)
    rng = random.Random(99)
    mask = sf_land_mask.load()

    # Dense downtown/SOMA pixels.
    x0, y0 = p.xy(-122.424, 37.806)
    x1, y1 = p.xy(-122.386, 37.765)
    xmin, xmax = sorted([x0, x1])
    ymin, ymax = sorted([y0, y1])
    for y in range(ymin, ymax, 5):
        for x in range(xmin, xmax, 5):
            if mask[x, y] and rng.random() < 0.68:
                ww = rng.choice([2, 3, 4])
                hh = rng.choice([2, 3, 4, 5])
                col = PAL["building"] if rng.random() < 0.75 else PAL["building_dark"]
                d.rectangle([x, y, x + ww, y + hh], fill=col)
                if rng.random() < 0.35:
                    d.point((x + 1, y + 1), fill=PAL["building_hi"])

    # Lighter residential dots elsewhere.
    for _ in range(430):
        lon = rng.uniform(-122.505, -122.405)
        lat = rng.uniform(37.716, 37.795)
        x, y = p.xy(lon, lat)
        if 0 <= x < img.width and 0 <= y < img.height and mask[x, y] and rng.random() < 0.55:
            d.rectangle([x, y, x + 1, y + 1], fill=(151, 128, 105, 180))
    composite_layer(img, b, sf_land_mask)


def draw_bridges(img: Image.Image, features: dict, p: Projector) -> None:
    d = ImageDraw.Draw(img)
    for bridge in features.get("bridges", []):
        pts = p.path(bridge["path"])
        draw_polyline(d, pts, PAL["bridge_dark"], 5)
        draw_polyline(d, pts, PAL["bridge"], 3)
        # bridge deck highlights and towers
        for i, (x, y) in enumerate(pts):
            d.rectangle([x - 2, y - 3, x + 2, y + 3], fill=PAL["bridge_dark"])
            d.rectangle([x - 1, y - 4, x + 1, y + 2], fill=PAL["bridge"])
        # pixel cable suggestion
        if len(pts) >= 2:
            for a, c in zip(pts[:-1], pts[1:]):
                ax, ay = a
                cx, cy = c
                mx, my = (ax + cx) // 2, min(ay, cy) - 5
                d.line([a, (mx, my), c], fill=(222, 116, 86), width=1)


def draw_landmarks(img: Image.Image, features: dict, p: Projector) -> None:
    d = ImageDraw.Draw(img)
    for lm in features.get("landmarks", []):
        x, y = p.xy(lm["lon"], lm["lat"])
        sprite = lm.get("sprite")
        if sprite == "tower":
            d.rectangle([x - 2, y - 13, x + 3, y + 3], fill=PAL["building_dark"])
            d.rectangle([x - 1, y - 12, x + 2, y + 2], fill=(91, 126, 145))
            d.point((x + 1, y - 9), fill=PAL["white"])
            d.point((x + 1, y - 5), fill=PAL["white"])
        elif sprite == "coit":
            d.rectangle([x - 2, y - 9, x + 2, y + 2], fill=PAL["building_dark"])
            d.rectangle([x - 1, y - 8, x + 1, y + 1], fill=PAL["white"])
            d.rectangle([x - 3, y + 1, x + 3, y + 3], fill=PAL["building_dark"])
        elif sprite == "sutro":
            d.line([(x, y - 15), (x - 5, y + 4)], fill=PAL["building_dark"], width=1)
            d.line([(x, y - 15), (x + 5, y + 4)], fill=PAL["building_dark"], width=1)
            d.line([(x - 3, y - 5), (x + 3, y - 5)], fill=PAL["bridge"], width=1)
            d.line([(x - 4, y), (x + 4, y)], fill=PAL["bridge"], width=1)
        elif sprite == "ferry":
            d.rectangle([x - 4, y - 5, x + 4, y + 3], fill=PAL["building_dark"])
            d.rectangle([x - 2, y - 11, x + 2, y - 5], fill=PAL["building_dark"])
            d.point((x, y - 9), fill=PAL["pin2"])
            d.rectangle([x - 3, y - 4, x + 3, y + 2], fill=PAL["white"])
        elif sprite == "parkdot":
            d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=PAL["park2"], outline=PAL["label_shadow"])
        else:  # pin / default
            d.ellipse([x - 4, y - 8, x + 4, y], fill=PAL["pin"], outline=PAL["label_shadow"])
            d.polygon([(x, y + 6), (x - 3, y), (x + 3, y)], fill=PAL["pin"])
            d.point((x, y - 4), fill=PAL["pin2"])


def draw_labels(img: Image.Image, p: Projector) -> None:
    d = ImageDraw.Draw(img)
    # Main city mark: low on the map to avoid covering the active demo area.
    x, y = p.xy(-122.460, 37.716)
    draw_pixel_text(d, "SAN FRANCISCO", x - text_width("SAN FRANCISCO", 2) // 2, y - 6, PAL["label"], scale=2)

    # Functional small labels. Kept sparse so it doesn't look like GIS noise.
    labels = [
        ("GGP", -122.484, 37.768, 1),
        ("PRESIDIO", -122.489, 37.798, 1),
        ("DOWNTOWN", -122.408, 37.798, 1),
        ("SOMA", -122.407, 37.779, 1),
        ("MISSION", -122.424, 37.750, 1),
        ("TWIN PEAKS", -122.468, 37.752, 1),
        ("BAY BRIDGE", -122.356, 37.824, 1),
        ("GOLDEN GATE", -122.517, 37.825, 1),
        ("OCEAN", -122.528, 37.750, 1),
        ("BAY", -122.338, 37.770, 1),
    ]
    for text, lon, lat, sc in labels:
        xx, yy = p.xy(lon, lat)
        draw_pixel_text(d, text, xx, yy, PAL["label"], scale=sc)


def write_manifest(out_dir: Path, features: dict, width: int, height: int) -> None:
    manifest = {
        "name": "sf_pixel_map",
        "width": width,
        "height": height,
        "projection": "web_mercator",
        "bbox": features["bbox"],
        "coordinateTransform": {
            "description": "x=(lon-west)/(east-west)*(width-1); y=(merc(north)-merc(lat))/(merc(north)-merc(south))*(height-1)",
            "mercY": "log(tan(pi/4 + radians(lat)/2))"
        },
        "recommendedCss": {
            "imageRendering": "pixelated",
            "nativeResolution": f"{width}x{height}",
            "displayResolution": "960px to 1280px wide"
        },
        "attributionNote": "Curated stylized geometry. If regenerated with OSM/Overpass data, display: © OpenStreetMap contributors. DataSF street source is PDDL 1.0."
    }
    (out_dir / "sf_pixel_map_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def generate(out_dir: Path, features_path: Path, size: int = 320, scale: int = 4, osm_json: Path | None = None) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    features = load_json(features_path)
    img = Image.new("RGBA", (size, size), PAL["water"] + (255,))
    p = Projector(features["bbox"], size, size)

    draw_water(img)
    _, sf_land_mask = draw_land_and_masks(img, features, p)
    draw_parks_lakes(img, features, p, sf_land_mask)
    draw_roads(img, features, p, sf_land_mask, osm_json)
    draw_buildings(img, p, sf_land_mask)
    draw_bridges(img, features, p)
    draw_landmarks(img, features, p)
    draw_labels(img, p)

    native_path = out_dir / "sf_pixel_map_320.png"
    upscaled_path = out_dir / "sf_pixel_map_1280.png"
    img.convert("RGB").save(native_path)
    img.resize((size * scale, size * scale), Image.Resampling.NEAREST).convert("RGB").save(upscaled_path)
    write_manifest(out_dir, features, size, size)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=Path("."), help="Output directory")
    ap.add_argument("--features", type=Path, default=Path("curated_sf_features.json"), help="Curated features JSON")
    ap.add_argument("--size", type=int, default=320, help="Native pixel resolution")
    ap.add_argument("--scale", type=int, default=4, help="Nearest-neighbor upscale factor")
    ap.add_argument("--osm-json", type=Path, default=None, help="Optional Overpass JSON export using out geom")
    args = ap.parse_args()
    generate(args.out, args.features, args.size, args.scale, args.osm_json)


if __name__ == "__main__":
    main()
