#!/usr/bin/env python3
"""Fetch source data for improving the SF pixel map.

Run from the repository root with internet access:

  python sources/fetch_sources.py
  python generate_sf_pixel_map.py --out .

The generator now reads official DataSF shoreline, street-centerline, and park geometry
directly from the files downloaded here. It can also optionally append major OSM roads.
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "sources"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
DATASF_SHORELINE_GEOJSON = "https://data.sfgov.org/resource/txuc-3kzm.geojson"
DATASF_GEOJSON = "https://data.sfgov.org/resource/3psu-pn9h.geojson"
DATASF_PARKS_GEOJSON = "https://data.sfgov.org/resource/3nje-yn2u.geojson"


def download(url: str) -> str:
    with urlopen(url, timeout=120) as response:
        return response.read().decode("utf-8")


def post_form(url: str, form: dict[str, str]) -> str:
    payload = urlencode(form).encode("utf-8")
    request = Request(url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urlopen(request, timeout=120) as response:
        return response.read().decode("utf-8")


def fetch_overpass() -> None:
    query = (SRC / "overpass_sf_major_features.overpassql").read_text(encoding="utf-8")
    try:
        data = post_form(OVERPASS_URL, {"data": query})
        (SRC / "sf_osm_features.json").write_text(json.dumps(json.loads(data), indent=2), encoding="utf-8")
        print("wrote sources/sf_osm_features.json")
    except (HTTPError, URLError) as exc:
        print(f"warning: could not fetch optional Overpass data: {exc}")


def fetch_datasf_streets() -> None:
    url = DATASF_GEOJSON + "?" + urlencode({"$limit": 50000})
    (SRC / "datasf_streets.geojson").write_text(download(url), encoding="utf-8")
    print("wrote sources/datasf_streets.geojson")


def fetch_datasf_shoreline() -> None:
    url = DATASF_SHORELINE_GEOJSON + "?" + urlencode({"$limit": 50000})
    (SRC / "sf_shoreline.geojson").write_text(download(url), encoding="utf-8")
    print("wrote sources/sf_shoreline.geojson")


def fetch_datasf_parks() -> None:
    url = DATASF_PARKS_GEOJSON + "?" + urlencode({"$limit": 50000})
    (SRC / "datasf_parks.geojson").write_text(download(url), encoding="utf-8")
    print("wrote sources/datasf_parks.geojson")


if __name__ == "__main__":
    fetch_datasf_shoreline()
    fetch_datasf_streets()
    fetch_datasf_parks()
    fetch_overpass()
