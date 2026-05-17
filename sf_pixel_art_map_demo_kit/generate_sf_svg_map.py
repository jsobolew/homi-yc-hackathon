#!/usr/bin/env python3
"""Generate a zoom-friendly SVG map of San Francisco from real GIS geometry.

Outputs:
  - sf_map_vector.svg
  - sf_map_vector_manifest.json
"""
from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path
from typing import Any, Iterable, Sequence
from xml.sax.saxutils import escape


PAL = {
    "water": "#17304a",
    "water2": "#1d3b59",
    "water3": "#365b76",
    "land": "#dbc496",
    "land2": "#e5d5ab",
    "land_shadow": "#5d434f",
    "coast": "#362a39",
    "park": "#488b5f",
    "park2": "#60a76d",
    "lake": "#3f7e95",
    "road_dark": "#3c343f",
    "road": "#ebe2b9",
    "road_minor": "#c6b78f",
    "road_highlight": "#f4c770",
    "bridge": "#cb4f41",
    "bridge_dark": "#502a34",
    "building": "#63535b",
    "building_hi": "#988070",
    "building_dark": "#37313e",
    "white": "#f6ebcd",
    "label": "#ffefc2",
    "label_shadow": "#2a2030",
    "pin": "#ff6f59",
    "pin2": "#ffd166",
    "fog": "#a8bfc3",
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

    def xy(self, lon: float, lat: float) -> tuple[float, float]:
        x = (lon - self.west) / (self.east - self.west) * self.width
        y = (self.y_north - merc_y(lat)) / (self.y_north - self.y_south) * self.height
        return x, y

    def path(self, coords: Sequence[Sequence[float]]) -> list[tuple[float, float]]:
        return [self.xy(float(lon), float(lat)) for lon, lat in coords]


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def polygon_area(pts: Sequence[tuple[float, float]]) -> float:
    if len(pts) < 3:
        return 0.0
    area = 0.0
    closed = list(pts) + [pts[0]]
    for (x1, y1), (x2, y2) in zip(closed, closed[1:]):
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0


def bounds_intersect(pts: Sequence[tuple[float, float]], width: int, height: int) -> bool:
    xs = [x for x, _ in pts]
    ys = [y for _, y in pts]
    return max(xs) >= 0 and min(xs) <= width and max(ys) >= 0 and min(ys) <= height


def geojson_outer_rings(geometry: dict[str, Any] | None) -> list[list[list[float]]]:
    if not geometry:
        return []
    gtype = geometry.get("type")
    coords = geometry.get("coordinates", [])
    if gtype == "Polygon":
        return [coords[0]] if coords else []
    if gtype == "MultiPolygon":
        return [poly[0] for poly in coords if poly]
    return []


def load_geojson_polygons(
    geojson_path: Path,
    projector: Projector,
    min_area_px: float,
) -> list[list[tuple[float, float]]]:
    data = load_json(geojson_path)
    polygons: list[list[tuple[float, float]]] = []
    for feature in data.get("features", []):
        for ring in geojson_outer_rings(feature.get("geometry")):
            pts = projector.path(ring)
            if len(pts) < 3:
                continue
            if not bounds_intersect(pts, projector.width, projector.height):
                continue
            if polygon_area(pts) < min_area_px:
                continue
            polygons.append(pts)
    return polygons


def iter_geojson_lines(geojson_path: Path) -> Iterable[tuple[dict[str, Any], list[list[list[float]]]]]:
    data = load_json(geojson_path)
    for feature in data.get("features", []):
        geometry = feature.get("geometry")
        if not geometry:
            continue
        gtype = geometry.get("type")
        coords = geometry.get("coordinates", [])
        if gtype == "LineString":
            yield feature.get("properties", {}), [coords]
        elif gtype == "MultiLineString":
            yield feature.get("properties", {}), list(coords)


def path_d(points: Sequence[tuple[float, float]], close: bool = False) -> str:
    if not points:
        return ""
    segs = [f"M{points[0][0]:.2f},{points[0][1]:.2f}"]
    segs.extend(f"L{x:.2f},{y:.2f}" for x, y in points[1:])
    if close:
        segs.append("Z")
    return " ".join(segs)


def svg_polygon(points: Sequence[tuple[float, float]], class_name: str) -> str:
    return f'<path class="{class_name}" d="{path_d(points, close=True)}" />'


def svg_polyline(points: Sequence[tuple[float, float]], class_name: str) -> str:
    return f'<path class="{class_name}" d="{path_d(points, close=False)}" />'


def svg_text(x: float, y: float, text: str, class_name: str, size: float, anchor: str = "middle") -> str:
    return (
        f'<text class="{class_name}" x="{x:.2f}" y="{y:.2f}" '
        f'font-size="{size:.2f}" text-anchor="{anchor}">{escape(text)}</text>'
    )


def extend_polyline(points: Sequence[tuple[float, float]], start_amount: float = 0.0, end_amount: float = 0.0) -> list[tuple[float, float]]:
    pts = list(points)
    if len(pts) < 2:
        return pts
    if start_amount:
        x0, y0 = pts[0]
        x1, y1 = pts[1]
        dx, dy = x0 - x1, y0 - y1
        length = math.hypot(dx, dy) or 1.0
        pts[0] = (x0 + dx / length * start_amount, y0 + dy / length * start_amount)
    if end_amount:
        x0, y0 = pts[-2]
        x1, y1 = pts[-1]
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy) or 1.0
        pts[-1] = (x1 + dx / length * end_amount, y1 + dy / length * end_amount)
    return pts


def load_datasf_streets(streets_geojson: Path, projector: Projector) -> dict[str, list[list[tuple[float, float]]]]:
    skip_layers = {
        "PAPER",
        "PAPER_FWYS",
        "PAPER_WATER",
        "PRIVATE",
        "PRIVATE_PARKING",
        "PSEUDO",
        "STREETS_PEDESTRI",
        "UPROW",
    }
    grouped: dict[str, list[list[tuple[float, float]]]] = {"minor": [], "major": [], "highway": []}
    for props, paths in iter_geojson_lines(streets_geojson):
        layer = props.get("layer")
        classcode = props.get("classcode")
        if layer in skip_layers or not classcode:
            continue
        if layer == "FREEWAYS" or classcode in {"0", "1", "2"}:
            kind = "highway"
        elif classcode == "3":
            kind = "major"
        elif classcode == "4":
            kind = "minor"
        else:
            continue
        for path in paths:
            pts = projector.path(path)
            if len(pts) >= 2 and bounds_intersect(pts, projector.width, projector.height):
                grouped[kind].append(pts)
    return grouped


def add_random_segments(width: int, height: int) -> list[str]:
    rng = random.Random(42)
    lines: list[str] = []
    for _ in range(180):
        x = rng.uniform(0, width)
        y = rng.uniform(0, height)
        length = rng.choice([3, 4, 5, 6, 8, 10])
        cls = "wave-1" if rng.random() < 0.72 else "wave-2"
        lines.append(
            f'<line class="{cls}" x1="{x:.2f}" y1="{y:.2f}" x2="{min(width, x + length):.2f}" y2="{y:.2f}" />'
        )
    return lines


def add_dots(polygons: Sequence[Sequence[tuple[float, float]]], width: int, height: int, count: int, seed: int, class_name: str) -> list[str]:
    if not polygons:
        return []
    xs = [x for poly in polygons for x, _ in poly]
    ys = [y for poly in polygons for _, y in poly]
    xmin, xmax = max(0.0, min(xs)), min(float(width), max(xs))
    ymin, ymax = max(0.0, min(ys)), min(float(height), max(ys))
    rng = random.Random(seed)
    dots: list[str] = []
    for _ in range(count):
        x = rng.uniform(xmin, xmax)
        y = rng.uniform(ymin, ymax)
        dots.append(f'<circle class="{class_name}" cx="{x:.2f}" cy="{y:.2f}" r="{rng.choice([0.35, 0.45, 0.55]):.2f}" />')
    return dots


def circle_icon(x: float, y: float, r: float, class_name: str) -> str:
    return f'<circle class="{class_name}" cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" />'


def bridge_group(name: str, points: Sequence[tuple[float, float]]) -> list[str]:
    if name != "GOLDEN GATE":
        lines = [svg_polyline(points, "bridge-outline"), svg_polyline(points, "bridge")]
        if len(points) >= 2:
            for a, b in zip(points[:-1], points[1:]):
                mx = (a[0] + b[0]) / 2
                my = min(a[1], b[1]) - 6
                lines.append(
                    f'<path class="bridge-cable" d="M{a[0]:.2f},{a[1]:.2f} Q{mx:.2f},{my:.2f} {b[0]:.2f},{b[1]:.2f}" />'
                )
        return lines

    south = points[0]
    north = points[-1]
    deck = [south, *points[1:-1], north]
    tower1 = (77.0, 69.0)
    tower2 = (72.0, 39.0)
    south_anchor = (80.2, 83.0)
    north_anchor = (68.0, 18.0)
    return [
        svg_polyline(deck, "bridge-outline"),
        svg_polyline(deck, "bridge"),
        f'<line class="gg-tower-outline" x1="{tower1[0]:.2f}" y1="{tower1[1]-12:.2f}" x2="{tower1[0]:.2f}" y2="{tower1[1]+10:.2f}" />',
        f'<line class="gg-tower-outline" x1="{tower2[0]:.2f}" y1="{tower2[1]-11:.2f}" x2="{tower2[0]:.2f}" y2="{tower2[1]+9:.2f}" />',
        f'<line class="gg-tower" x1="{tower1[0]:.2f}" y1="{tower1[1]-12:.2f}" x2="{tower1[0]:.2f}" y2="{tower1[1]+10:.2f}" />',
        f'<line class="gg-tower" x1="{tower2[0]:.2f}" y1="{tower2[1]-11:.2f}" x2="{tower2[0]:.2f}" y2="{tower2[1]+9:.2f}" />',
        f'<path class="gg-cable" d="M{south_anchor[0]:.2f},{south_anchor[1]:.2f} Q{tower1[0]-1:.2f},{tower1[1]-17:.2f} {tower1[0]:.2f},{tower1[1]-12:.2f}" />',
        f'<path class="gg-cable" d="M{tower1[0]:.2f},{tower1[1]-12:.2f} Q{tower2[0]+1:.2f},{tower2[1]-18:.2f} {tower2[0]:.2f},{tower2[1]-11:.2f}" />',
        f'<path class="gg-cable" d="M{tower2[0]:.2f},{tower2[1]-11:.2f} Q{north_anchor[0]-1:.2f},{north_anchor[1]-6:.2f} {north_anchor[0]:.2f},{north_anchor[1]:.2f}" />',
        f'<line class="gg-hanger" x1="78.5" y1="75.5" x2="78.5" y2="82.5" />',
        f'<line class="gg-hanger" x1="76.0" y1="58.5" x2="76.0" y2="66.5" />',
        f'<line class="gg-hanger" x1="73.8" y1="46.5" x2="73.8" y2="54.0" />',
        f'<line class="gg-hanger" x1="71.2" y1="31.5" x2="71.2" y2="38.5" />',
    ]


def draw_landmarks(features: dict[str, Any], projector: Projector) -> list[str]:
    marks: list[str] = []
    for lm in features.get("landmarks", []):
        x, y = projector.xy(lm["lon"], lm["lat"])
        sprite = lm.get("sprite")
        if sprite == "tower":
            marks.append(f'<g class="landmark"><rect class="tower-body" x="{x - 3:.2f}" y="{y - 19:.2f}" width="6" height="19" rx="1.2" />')
            marks.append(f'<rect class="tower-glow" x="{x - 1.6:.2f}" y="{y - 15:.2f}" width="3.2" height="12" rx="0.9" /></g>')
        elif sprite == "coit":
            marks.append(f'<g class="landmark"><rect class="monument" x="{x - 2.2:.2f}" y="{y - 12:.2f}" width="4.4" height="12" rx="1.2" />')
            marks.append(f'<rect class="monument-base" x="{x - 4.2:.2f}" y="{y - 1.5:.2f}" width="8.4" height="2.8" rx="0.7" /></g>')
        elif sprite == "sutro":
            marks.append(
                f'<g class="landmark">'
                f'<line class="sutro" x1="{x:.2f}" y1="{y - 16:.2f}" x2="{x - 5.5:.2f}" y2="{y + 3:.2f}" />'
                f'<line class="sutro" x1="{x:.2f}" y1="{y - 16:.2f}" x2="{x + 5.5:.2f}" y2="{y + 3:.2f}" />'
                f'<line class="sutro-cross" x1="{x - 4:.2f}" y1="{y - 6:.2f}" x2="{x + 4:.2f}" y2="{y - 6:.2f}" />'
                f'<line class="sutro-cross" x1="{x - 4.8:.2f}" y1="{y:.2f}" x2="{x + 4.8:.2f}" y2="{y:.2f}" /></g>'
            )
        elif sprite == "ferry":
            marks.append(
                f'<g class="landmark"><rect class="ferry-body" x="{x - 4.5:.2f}" y="{y - 7:.2f}" width="9" height="7" rx="0.9" />'
                f'<rect class="ferry-tower" x="{x - 1.9:.2f}" y="{y - 14:.2f}" width="3.8" height="7.2" rx="0.7" />'
                f'<circle class="ferry-light" cx="{x:.2f}" cy="{y - 11:.2f}" r="0.85" /></g>'
            )
        elif sprite == "parkdot":
            marks.append(circle_icon(x, y, 2.2, "park-dot"))
        else:
            marks.append(
                f'<g class="landmark"><path class="pin" d="M{x:.2f},{y + 7:.2f} '
                f'C{x - 6:.2f},{y - 2:.2f} {x - 5:.2f},{y - 10:.2f} {x:.2f},{y - 10:.2f} '
                f'C{x + 5:.2f},{y - 10:.2f} {x + 6:.2f},{y - 2:.2f} {x:.2f},{y + 7:.2f} Z" />'
                f'<circle class="pin-core" cx="{x:.2f}" cy="{y - 4:.2f}" r="2.2" /></g>'
            )
    return marks


def write_manifest(out_dir: Path, features: dict[str, Any], width: int, height: float) -> None:
    landmarks = []
    for lm in features.get("landmarks", []):
        landmarks.append(
            {
                "name": lm["name"],
                "lon": lm["lon"],
                "lat": lm["lat"],
                "sprite": lm["sprite"],
            }
        )
    manifest = {
        "name": "sf_map_vector",
        "width": width,
        "height": height,
        "viewBox": [0, 0, width, height],
        "projection": "web_mercator",
        "bbox": features["bbox"],
        "layers": ["water", "land", "parks", "roads", "bridges", "landmarks", "labels"],
        "landmarks": landmarks,
        "coordinateTransform": {
            "description": "x=(lon-west)/(east-west)*width; y=(merc(north)-merc(lat))/(merc(north)-merc(south))*height",
            "mercY": "log(tan(pi/4 + radians(lat)/2))",
        },
        "recommendations": {
            "embedAs": "inline_svg_or_img",
            "zoom": "vector-friendly; suitable for pan/zoom camera transforms",
            "overlayStrategy": "project lon/lat into the same viewBox before placing properties, vendors, and vehicles",
        },
        "attributionNote": "Base geometry comes from official DataSF shoreline, parks, and streets datasets. If OSM overlays are added later, also display: © OpenStreetMap contributors.",
    }
    (out_dir / "sf_map_vector_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def generate_svg(
    out_dir: Path,
    features_path: Path,
    shoreline_geojson: Path,
    streets_geojson: Path,
    parks_geojson: Path,
    width: int = 320,
    height: int = 320,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    features = load_json(features_path)
    projector = Projector(features["bbox"], width, height)

    shoreline_polys = load_geojson_polygons(shoreline_geojson, projector, min_area_px=10.0)
    context_polys = [[
        (0.0, 0.0),
        (73.0, 0.0),
        (67.0, 14.0),
        (60.0, 25.0),
        (46.0, 34.0),
        (24.0, 38.0),
        (0.0, 35.0),
    ]]
    park_polys = load_geojson_polygons(parks_geojson, projector, min_area_px=3.0)
    lake_polys = [projector.path(lake["polygon"]) for lake in features.get("lakes", [])]
    roads = load_datasf_streets(streets_geojson, projector)
    bridges = []
    for bridge in features.get("bridges", []):
        if bridge["name"] == "GOLDEN GATE":
            pts = [
                (80.2, 83.0),
                (77.8, 66.0),
                (74.8, 49.0),
                (71.6, 33.0),
                (68.0, 18.0),
            ]
        elif bridge["name"] == "BAY BRIDGE":
            pts = projector.path(bridge["path"])
            pts = extend_polyline(pts, start_amount=5)
        else:
            pts = projector.path(bridge["path"])
        bridges.append(pts)

    waves = add_random_segments(width, height)
    land_dots = add_dots(shoreline_polys, width, height, 420, 10, "land-dot")
    park_dots = add_dots(park_polys, width, height, 180, 11, "park-dot-small")
    downtown_dots = add_dots([[projector.xy(-122.424, 37.806), projector.xy(-122.386, 37.806), projector.xy(-122.386, 37.765), projector.xy(-122.424, 37.765)]], width, height, 200, 99, "building-dot")
    crop_bottom = min(height, max(y for poly in shoreline_polys for _, y in poly) + 4)

    label_specs = [
        ("SAN FRANCISCO", -122.460, 37.716, 14, "middle"),
        ("PRESIDIO", -122.489, 37.798, 7, "middle"),
        ("GGP", -122.484, 37.768, 7, "middle"),
        ("DOWNTOWN", -122.408, 37.798, 7, "middle"),
        ("SOMA", -122.407, 37.779, 7, "middle"),
        ("MISSION", -122.424, 37.750, 7, "middle"),
        ("TWIN PEAKS", -122.468, 37.752, 6, "middle"),
        ("BAY BRIDGE", -122.356, 37.824, 7, "middle"),
        ("GOLDEN GATE", -122.522, 37.827, 7, "start"),
        ("OCEAN", -122.528, 37.750, 7, "middle"),
        ("BAY", -122.338, 37.770, 8, "middle"),
    ]

    svg_parts: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {crop_bottom:.2f}" role="img" aria-labelledby="title desc">',
        "<title id=\"title\">San Francisco vector demo map</title>",
        "<desc id=\"desc\">Stylized San Francisco map generated from official shoreline, parks, and street geometry.</desc>",
        "<defs>",
        "<linearGradient id=\"bg-grad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">"
        f'<stop offset="0%" stop-color="{PAL["water"]}" />'
        f'<stop offset="100%" stop-color="#10243b" />'
        "</linearGradient>",
        "<linearGradient id=\"bay-glow\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
        f'<stop offset="0%" stop-color="{PAL["water2"]}" stop-opacity="0.0" />'
        f'<stop offset="100%" stop-color="{PAL["water3"]}" stop-opacity="0.65" />'
        "</linearGradient>",
        "<filter id=\"soft-shadow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">"
        '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0d1422" flood-opacity="0.35" />'
        "</filter>",
        "<filter id=\"road-glow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">"
        '<feDropShadow dx="0" dy="0" stdDeviation="1.4" flood-color="#1a1326" flood-opacity="0.26" />'
        "</filter>",
        "<clipPath id=\"land-clip\">",
        *[svg_polygon(poly, "clip-shape") for poly in shoreline_polys],
        "</clipPath>",
        "<clipPath id=\"park-clip\">",
        *[svg_polygon(poly, "clip-shape") for poly in park_polys],
        "</clipPath>",
        "<style><![CDATA[",
        "text{font-family:'Press Start 2P','VT323',monospace;letter-spacing:0.04em}",
        ".water{fill:url(#bg-grad)}",
        ".bay-sheen{fill:url(#bay-glow)}",
        f'.land-shadow{{fill:{PAL["land_shadow"]};opacity:.75}}',
        f'.land{{fill:{PAL["land"]};stroke:{PAL["coast"]};stroke-width:2.6;stroke-linejoin:round}}',
        f'.park{{fill:{PAL["park"]};stroke:#305744;stroke-width:1.2;stroke-linejoin:round}}',
        f'.lake{{fill:{PAL["lake"]};stroke:{PAL["coast"]};stroke-width:1.1}}',
        f'.minor-road-outline{{fill:none;stroke:{PAL["road_dark"]};stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;opacity:.84}}',
        f'.minor-road{{fill:none;stroke:{PAL["road_minor"]};stroke-width:0.9;stroke-linecap:round;stroke-linejoin:round}}',
        f'.major-road-outline{{fill:none;stroke:{PAL["road_dark"]};stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round;opacity:.9}}',
        f'.major-road{{fill:none;stroke:{PAL["road"]};stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}}',
        f'.highway-outline{{fill:none;stroke:{PAL["bridge_dark"]};stroke-width:5.4;stroke-linecap:round;stroke-linejoin:round;opacity:.92}}',
        f'.highway{{fill:none;stroke:{PAL["road_highlight"]};stroke-width:2.7;stroke-linecap:round;stroke-linejoin:round}}',
        f'.bridge-outline{{fill:none;stroke:{PAL["bridge_dark"]};stroke-width:8;stroke-linecap:round;stroke-linejoin:round}}',
        f'.bridge{{fill:none;stroke:{PAL["bridge"]};stroke-width:4.6;stroke-linecap:round;stroke-linejoin:round}}',
        f'.bridge-cable{{fill:none;stroke:#de7457;stroke-width:1.2;stroke-linecap:round;opacity:.9}}',
        f'.gg-tower-outline{{stroke:{PAL["bridge_dark"]};stroke-width:4.2;stroke-linecap:round}}',
        f'.gg-tower{{stroke:{PAL["bridge"]};stroke-width:2.4;stroke-linecap:round}}',
        f'.gg-cable{{fill:none;stroke:#f08a6b;stroke-width:1.5;stroke-linecap:round;opacity:.95}}',
        f'.gg-hanger{{stroke:#f2b39a;stroke-width:1.0;stroke-linecap:round;opacity:.9}}',
        f'.wave-1{{stroke:{PAL["water2"]};stroke-width:1.2;stroke-linecap:round;opacity:.7}}',
        f'.wave-2{{stroke:{PAL["water3"]};stroke-width:1.2;stroke-linecap:round;opacity:.45}}',
        f'.fog{{stroke:{PAL["fog"]};stroke-width:2.2;stroke-linecap:round;opacity:.7}}',
        f'.land-dot{{fill:{PAL["land2"]};opacity:.58}}',
        f'.park-dot-small{{fill:{PAL["park2"]};opacity:.55}}',
        f'.building-dot{{fill:{PAL["building"]};opacity:.42}}',
        f'.district-haze{{fill:{PAL["building_dark"]};opacity:.22}}',
        f'.shore-accent{{stroke:{PAL["white"]};stroke-width:1.2;opacity:.25;fill:none}}',
        f'.label-shadow{{fill:{PAL["label_shadow"]};paint-order:stroke;stroke:{PAL["label_shadow"]};stroke-width:2.2}}',
        f'.label{{fill:{PAL["label"]};paint-order:stroke;stroke:{PAL["label_shadow"]};stroke-width:1.6}}',
        f'.tower-body{{fill:{PAL["building_dark"]}}}',
        f'.tower-glow{{fill:#6e93a8}}',
        f'.monument{{fill:{PAL["white"]};stroke:{PAL["building_dark"]};stroke-width:1}}',
        f'.monument-base{{fill:{PAL["building_dark"]}}}',
        f'.sutro{{stroke:{PAL["building_dark"]};stroke-width:1.2;stroke-linecap:round}}',
        f'.sutro-cross{{stroke:{PAL["bridge"]};stroke-width:1.2;stroke-linecap:round}}',
        f'.ferry-body{{fill:{PAL["white"]};stroke:{PAL["building_dark"]};stroke-width:1.1}}',
        f'.ferry-tower{{fill:{PAL["building_dark"]}}}',
        f'.ferry-light{{fill:{PAL["pin2"]}}}',
        f'.park-dot{{fill:{PAL["park2"]};stroke:{PAL["label_shadow"]};stroke-width:.8}}',
        f'.pin{{fill:{PAL["pin"]};stroke:{PAL["label_shadow"]};stroke-width:1}}',
        f'.pin-core{{fill:{PAL["pin2"]}}}',
        "]]></style>",
        "</defs>",
        '<rect class="water" width="100%" height="100%" />',
        f'<rect class="bay-sheen" x="{width * 0.58:.2f}" y="0" width="{width * 0.42:.2f}" height="{height:.2f}" />',
        '<g id="water-texture">',
        *waves,
        '</g>',
        '<g id="fog-bands">',
        '<line class="fog" x1="6" y1="18" x2="118" y2="18" />',
        '<line class="fog" x1="12" y1="23" x2="130" y2="23" />',
        '<line class="fog" x1="4" y1="31" x2="108" y2="31" />',
        '</g>',
        '<g id="land" filter="url(#soft-shadow)">',
    ]

    for poly in shoreline_polys:
        shadow = [(x + 2.5, y + 3.5) for x, y in poly]
        svg_parts.append(svg_polygon(shadow, "land-shadow"))
    for poly in context_polys:
        shadow = [(x + 2.5, y + 3.5) for x, y in poly]
        svg_parts.append(svg_polygon(shadow, "land-shadow"))
    for poly in shoreline_polys:
        svg_parts.append(svg_polygon(poly, "land"))
    for poly in context_polys:
        svg_parts.append(svg_polygon(poly, "land"))
    svg_parts.append("</g>")

    svg_parts.append('<g id="shoreline-accents">')
    for poly in shoreline_polys[:6]:
        accent = poly[:: max(1, len(poly) // 90)]
        if len(accent) >= 2:
            svg_parts.append(svg_polyline(accent, "shore-accent"))
    svg_parts.append("</g>")

    svg_parts.append('<g id="land-texture" clip-path="url(#land-clip)">')
    svg_parts.extend(land_dots)
    svg_parts.append("</g>")

    svg_parts.append('<g id="parks">')
    for poly in park_polys:
        svg_parts.append(svg_polygon(poly, "park"))
    svg_parts.append("</g>")

    svg_parts.append('<g id="park-texture" clip-path="url(#park-clip)">')
    svg_parts.extend(park_dots)
    svg_parts.append("</g>")

    svg_parts.append('<g id="lakes">')
    for poly in lake_polys:
        svg_parts.append(svg_polygon(poly, "lake"))
    svg_parts.append("</g>")

    x0, y0 = projector.xy(-122.424, 37.806)
    x1, y1 = projector.xy(-122.386, 37.765)
    xmin, xmax = sorted([x0, x1])
    ymin, ymax = sorted([y0, y1])
    svg_parts.append(
        f'<rect class="district-haze" x="{xmin:.2f}" y="{ymin:.2f}" width="{xmax - xmin:.2f}" height="{ymax - ymin:.2f}" rx="8" />'
    )
    svg_parts.extend(downtown_dots)

    svg_parts.append('<g id="roads" filter="url(#road-glow)">')
    for pts in roads["minor"]:
        svg_parts.append(svg_polyline(pts, "minor-road-outline"))
    for pts in roads["minor"]:
        svg_parts.append(svg_polyline(pts, "minor-road"))
    for pts in roads["major"]:
        svg_parts.append(svg_polyline(pts, "major-road-outline"))
    for pts in roads["major"]:
        svg_parts.append(svg_polyline(pts, "major-road"))
    for pts in roads["highway"]:
        svg_parts.append(svg_polyline(pts, "highway-outline"))
    for pts in roads["highway"]:
        svg_parts.append(svg_polyline(pts, "highway"))
    svg_parts.append("</g>")

    svg_parts.append('<g id="bridges">')
    for bridge, pts in zip(features.get("bridges", []), bridges):
        svg_parts.extend(bridge_group(bridge["name"], pts))
    svg_parts.append("</g>")

    svg_parts.append('<g id="landmarks">')
    svg_parts.extend(draw_landmarks(features, projector))
    svg_parts.append("</g>")

    svg_parts.append('<g id="labels">')
    for text, lon, lat, size, anchor in label_specs:
        x, y = projector.xy(lon, lat)
        svg_parts.append(svg_text(x + 1.6, y + 1.6, text, "label-shadow", size, anchor))
        svg_parts.append(svg_text(x, y, text, "label", size, anchor))
    svg_parts.append("</g>")
    svg_parts.append("</svg>")

    (out_dir / "sf_map_vector.svg").write_text("\n".join(svg_parts), encoding="utf-8")
    write_manifest(out_dir, features, width, crop_bottom)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=Path("."), help="Output directory")
    ap.add_argument("--features", type=Path, default=Path("curated_sf_features.json"))
    ap.add_argument("--shoreline-geojson", type=Path, default=Path("sources/sf_shoreline.geojson"))
    ap.add_argument("--streets-geojson", type=Path, default=Path("sources/datasf_streets.geojson"))
    ap.add_argument("--parks-geojson", type=Path, default=Path("sources/datasf_parks.geojson"))
    ap.add_argument("--width", type=int, default=320)
    ap.add_argument("--height", type=int, default=320)
    args = ap.parse_args()
    generate_svg(
        out_dir=args.out,
        features_path=args.features,
        shoreline_geojson=args.shoreline_geojson,
        streets_geojson=args.streets_geojson,
        parks_geojson=args.parks_geojson,
        width=args.width,
        height=args.height,
    )


if __name__ == "__main__":
    main()
