/* =====================================================================
   DKDM — Page logic: homepage boxes, cell-type grid, resource panel.
   ===================================================================== */
(function () {
  const D = window.DKDM;
  const ICON = f => "assets/icons/" + f;

  /* ---- File definitions for per-cell downloads ---- */
  const CELL_FILES = [
    { suffix: "_BiologicalProcessResults.xlsx",    label: "Biological Process Results"      },
    { suffix: "_NetworkCentralityMeasurements.csv", label: "Network Centrality Measurements" },
    { suffix: "_PathwayEnrichmentResults.xlsx",     label: "Pathway Enrichment Results"       },
    { suffix: "_PPInetwork.xlsx",                   label: "PPI Network"                      }
  ];

  const cellFileUrl = (name, suffix) => "assets/data/" + name + suffix;

  /* Per-cell resource links. */
  function res(cell) {
    return {
      minerva:    cell.minerva,
      ode:        cell.ode        || D.dynamicDkdmUrl,
      fairdomhub: cell.fairdomhub || D.links.fairdomhub,
      analysis:   cell.analysis   || cell.fairdomhub || D.links.fairdomhub,
      go:         cell.go         || cell.fairdomhub || D.links.fairdomhub,
      pathway:    cell.pathway    || cell.fairdomhub || D.links.fairdomhub
    };
  }

  /* ---------- HOMEPAGE: 6 interactive boxes ---------- */
  function renderBoxes(node) {
    const boxes = [
      { accent:"var(--indigo)", icon:"Cell.png", title:"Gene Search", count:"713 GENES ACROSS 24 CELLS",
        text:D.boxes.geneSearch, href:"gene-search.html",
        features:["Autocomplete search","External DB links","Centrality & miRNA & pathways"] },
      { accent:"var(--teal)", icon:"CCI.png", title:"Pathway Explorer", count:"110 ENRICHED PATHWAYS",
        text:D.boxes.pathwayExplorer, href:"pathway-explorer.html",
        features:["Browse by cell type","Search by pathway name","FDR filtering"] },
      { accent:"var(--violet)", icon:"Cell.png", title:"Cell Types", count:"24 KIDNEY CELL TYPES",
        text:D.boxes.cellTypes, href:"cell-types.html",
        features:["Per-cell MINERVA map","ODE model","FAIRDOMHub resources"] },
      { accent:"var(--crimson)", icon:"CCI.png", title:"Cell\u2013Cell Interaction Map", count:"498 INTERACTIONS",
        text:D.boxes.cci, href:D.cciMapUrl, external:true,
        features:["Interaction Network Visualization","Downloadable CSV Data"] },
      { accent:"var(--gold)", icon:"miR_Target.png", title:"miRNA\u2013Target Interaction Map", count:"128 miRNAs",
        text:D.boxes.mirna, href:D.mirnaMapUrl, external:true,
        features:["Regulatory Interaction Network","Downloadable CSV Data"] },
      { accent:"var(--green)", icon:"Dynamic_DKDM.png", title:"Dynamic DKDM", count:"PARAMETRIC ODE MODELS",
        text:D.boxes.dynamic, href:D.dynamicDkdmUrl, external:true,
        features:["Simulate perturbations","Download SBML"] }
    ];
    node.innerHTML = boxes.map(b => `
      <article class="navbox" style="--accent:${b.accent}">
        <div class="navbox-head">
          <span class="navbox-icon"><img src="${ICON(b.icon)}" alt=""></span>
          <div><h3>${b.title}</h3><span class="count">${b.count}</span></div>
        </div>
        <p>${b.text}</p>
        <div class="navbox-foot">
          ${b.features.map(f=>`<span class="feature-pill">${f}</span>`).join("")}
        </div>
        <a class="btn btn-primary btn-sm" style="margin-top:14px;align-self:flex-start"
           href="${b.href}" ${b.external?'target="_blank" rel="noopener"':''}>
           ${b.external?"Open ↗":"Explore →"}</a>
      </article>`).join("");

    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold:.15 });
    node.querySelectorAll(".navbox").forEach((c,i)=>{ c.style.transitionDelay=(i*70)+"ms"; io.observe(c); });
  }

  /* ---------- CELL-TYPES PAGE: grid ---------- */
  function renderCellGrid(node) {
    node.innerHTML = D.cells.map((c,i) => `
      <button class="cell-card" data-i="${i}">
        <span class="thumb"><img src="${ICON(c.icon)}" alt="${c.name}"></span>
        <span class="name">${c.name}</span>
        ${c.iconPlaceholder ? '<span class="ph">placeholder icon</span>' : ''}
      </button>`).join("");
    node.querySelectorAll(".cell-card").forEach(btn =>
      btn.addEventListener("click", () => openCellModal(D.cells[+btn.dataset.i])));
  }

  /* ---------- CELL RESOURCE MODAL ---------- */
  function openCellModal(cell) {
    const r = res(cell);
    const link = (url, label) => `<a class="btn btn-ghost btn-sm" href="${url}" target="_blank" rel="noopener">${label}</a>`;
    const panel = [
      ["Dynamic simulation model",    link(r.ode,        "Open in Dynamic DKDM ↗")],
      ["Annotated signalling map",    link(r.minerva,    "Open MINERVA")],
      ["Network centrality analysis", link(r.analysis,   "Open Analysis")],
      ["GO enrichment results",       link(r.go,         "Open Results")],
      ["Pathway enrichment results",  link(r.pathway,    "Open Results")],
      ["Download all resources",      link(r.fairdomhub, "Open FAIRDOMHub")]
    ].map(([w,a]) => `<tr><td class="want">${w}</td><td class="act">${a}</td></tr>`).join("");

    const dlButtons = CELL_FILES.map(f =>
      `<a class="btn btn-ghost btn-sm" href="${cellFileUrl(cell.name, f.suffix)}" download>⬇ ${f.label}</a>`
    ).join("");

    DKDMLayout.openModal(`
      <div class="modal-head">
        <span class="thumb"><img src="${ICON(cell.icon)}" alt=""></span>
        <h3>${cell.name}</h3>
        <button class="x" onclick="DKDMLayout.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <p class="eyebrow">What do you want to see?</p>
        <table class="resource-table">${panel}</table>
        <p class="eyebrow" style="margin-top:20px">Direct downloads</p>
        <div class="downloads">${dlButtons}</div>
        ${cell.iconPlaceholder ? '<p class="muted" style="font-size:.8rem;margin-top:16px">Note: this cell type is currently shown with a placeholder icon.</p>' : ''}
      </div>`);
  }

  /* ---------- BULK DOWNLOAD MODAL (called from header dropdown) ---------- */
  function openBulkModal(suffix, label) {
    const dw = document.getElementById("dlWrapper");
    if (dw) dw.classList.remove("open");

    const links = D.cells.map(c =>
      `<a class="btn btn-ghost btn-sm" href="${cellFileUrl(c.name, suffix)}" download>⬇ ${c.name}</a>`
    ).join("");

    DKDMLayout.openModal(`
      <div class="modal-head">
        <h3>${label}</h3>
        <button class="x" onclick="DKDMLayout.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <p class="muted mt-0">Download <strong>${label}</strong> for each of the 24 renal cell types.</p>
        <div class="downloads">${links}</div>
      </div>`);
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const boxes = document.getElementById("navBoxes");
    if (boxes) renderBoxes(boxes);
    const grid = document.getElementById("cellGrid");
    if (grid) renderCellGrid(grid);
  });

  window.DKDMMain = { openCellModal, openBulkModal };
})();
