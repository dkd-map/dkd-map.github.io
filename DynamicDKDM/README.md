# DKD Atlas v3.0

Diabetic Kidney Disease — Parametric ODE Network Atlas

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

```
app/
  layout.js                   — root layout + CSS variables
  globals.css                 — design tokens (--bg, --blue-dark, --border, …)
  page.js                     — Atlas home: cell-type grid organised by category
  network/[celltype]/page.js  — Per-cell network viewer (ODE graph + sidebar)

components/
  NetworkGraph.js             — Cytoscape.js force-directed graph (SSR: false)

public/data/
  *.xml                       — SBML Level 3 models (25 files)
  reactions/
    *.csv                     — Reaction tables (25 files)
```

## Download Buttons

Each cell-type page header contains two download buttons:

| Button         | File served                          |
|----------------|--------------------------------------|
| ⬇ SBML Model  | `/data/<celltype>.xml`               |
| ⬇ Reactions CSV | `/data/reactions/<celltype>.csv`   |

Both buttons appear only after the model has loaded successfully.
