#!/usr/bin/env python3
"""Fetch optional source data for improving the SF pixel map.

Run from the repository root with internet access:

  python sources/fetch_sources.py
  python generate_sf_pixel_map.py --out . --features curated_sf_features.json --osm-json sources/sf_osm_features.json

The generator can read the Overpass JSON export and append real major-road geometries.
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlencode

import requests

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "sources"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
DATASF_GEOJSON = "https://data.sfgov.org/resource/3psu-pn9h.geojson"


def fetch_overpass() -> None:
    query = (SRC / "overpass_sf_major_features.overpassql").read_text(encoding="utf-8")
    r = requests.post(OVERPASS_URL, data={"data": query}, timeout=90)
    r.raise_for_status()
    (SRC / "sf_osm_features.json").write_text(json.dumps(r.json(), indent=2), encoding="utf-8")
    print("wrote sources/sf_osm_features.json")


def fetch_datasf_streets() -> None:
    url = DATASF_GEOJSON + "?" + urlencode({"$limit": 50000})
    r = requests.get(url, timeout=90)
    r.raise_for_status()
    (SRC / "datasf_streets.geojson").write_text(json.dumps(r.json(), indent=2), encoding="utf-8")
    print("wrote sources/datasf_streets.geojson")


if __name__ == "__main__":
    fetch_overpass()
    fetch_datasf_streets()
