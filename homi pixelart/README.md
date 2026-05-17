# Homi — Property Ops Center (V1)

A pixelart property management operating center. Click a building on the SF map to see its floors, tap an issue cloud to dispatch a "homie" (AI agent), and watch homies negotiate with vendors via live browser previews and call transcripts in the office view.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

No build step — uses React 18 + Babel standalone in-browser.

## Three views

- **SF Map** — stylized pixelart map with Golden Gate Bridge, Bay Bridge, Transamerica Pyramid, Coit Tower, Painted Ladies, Ferry Building. Properties dot the city; vendor trucks animate to issues; quote bubbles pop up with prices.
- **Building Dollhouse** — side-view cutaway of all floors; click a floor → top-down floor plan with rooms A–D. Issues appear as bobbing clouds with pixel glyphs (water drop, lightning bolt, thermometer, bug, lock, broom, speech, wrench). **Tap a cloud** to dispatch a homie.
- **Homie Office** — top-down pixel office with homies at desks (some on phones, some on laptops). Click any homie to open a side panel with their live activity: streaming phone transcript or a fake browser preview.

## File map

```
index.html        — shell + script loaders
styles.css        — pixelart UI styles (panels, buttons, console, animations)
pixel.jsx         — <Pixel> SVG sprite renderer + shared palette
sprites.jsx       — all sprite definitions (buildings, landmarks, characters, vehicles, glyphs)
data.jsx          — properties, vendors, issues, homies, pre-baked transcripts
mapview.jsx       — SF map with animated trucks + vendor popups
buildingview.jsx  — dollhouse cutaway + floor plan + issue clouds
officeview.jsx    — top-down office with desks
agentpanel.jsx    — slide-in panel: phone transcript or browser preview, streamed
app.jsx           — top-level state, tabs, dispatch flow, tweaks wiring
tweaks-panel.jsx  — in-design tweak panel (zoom, spawn/reset)
```

## Tweaks

Toggle the Tweaks panel from the toolbar:

- **Map scale (zoom)** — slider, auto-fitted to viewport.
- **Office scale** — slider.
- **SPAWN ISSUE** — drops a random new issue on a random property.
- **RESET** — clears dispatches, restores initial state.

## Tech

- React 18 + Babel standalone (inline JSX, no build).
- All pixel art is SVG `<rect>` grids rendered via a shared `<Pixel sprite={[...]} />` component.
- `image-rendering: pixelated` + `shape-rendering: crispEdges` keep edges sharp at any scale.
- Fonts: Press Start 2P (headers) + VT323 (body/transcripts), both Google Fonts.

## Status

V1. Designed as a prototype to show the loop: see properties → drill into a building → tap an issue → watch agents work it. Resolution timer is fixed (~18s after dispatch).
