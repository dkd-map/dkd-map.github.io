/* =====================================================================
   DKDM — Shared layout (header, footer, help button, modal)
   Reads everything from data.js (the DKDM object).
   Each page sets  window.PAGE = "about" | "team" | "tools" | "home" | ...
   then calls DKDMLayout.mount().
   ===================================================================== */
(function () {
  const D = window.DKDM;

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ---------- HEADER ---------- */
function header(active) {
  const logos = D.logos.map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener" title="${l.name}">
       <img src="${l.file}" alt="${l.name} logo"></a>`).join("");

  const dlItems = D.downloads.map(d => {
    if (d.download) {
      return `<a href="${d.url}" download class="dl-item">${d.label}</a>`;
    }
    return `<a href="${d.url}" target="_blank" rel="noopener" class="dl-item">${d.label} ↗</a>`;
  }).join("");

  const bulkItems = D.bulkDownloads ? `
    <div class="dl-divider"></div>
    <span class="dl-group-label">By Data Type — All 24 Cells</span>
    ${D.bulkDownloads.map(b =>
      `<a href="${b.zip}" download class="dl-item">⬇ ${b.label}</a>`
    ).join("")}` : "";

  return `
  <header class="site-header">
    <div class="header-inner">
      <div class="header-top">
        <a class="brand" href="index.html">
          <img src="assets/DKDM_Logo.png" alt="DKDM Logo" class="brand-logo">
          <span class="brand-text">
            <span class="brand-title">Diabetic Kidney Disease Map</span>
            <span class="brand-sub">${D.subtitle}</span>
          </span>
        </a>
        <div class="header-right">
          <div class="header-logos">${logos}</div>
          <div class="dl-wrapper" id="dlWrapper">
            <button class="btn btn-primary btn-sm dl-trigger" onclick="DKDMLayout.toggleDl(event)">
              ⬇ Download Data
            </button>
            <div class="dl-dropdown" id="dlDropdown">
              ${dlItems}${bulkItems}
            </div>
          </div>
        </div>
      </div>
      <div class="header-bottom">
        <button class="nav-toggle" aria-label="Menu" onclick="DKDMLayout.toggleNav()">Menu ▾</button>
        <ul class="main-nav" id="mainNav">
          <li class="has-dropdown" id="aboutDD">
            <button class="navbtn ${active==='about'?'active':''}" onclick="DKDMLayout.toggleDD(event)">
              About <span class="caret">▼</span>
            </button>
            <div class="dropdown">
              <a href="about-overview.html">Project Overview<small>What DKDM is and why it exists</small></a>
              <a href="${D.cciMapUrl}">Cell–Cell Interaction Map<small>Tissue-level signalling network</small></a>
              <a href="${D.mirnaMapUrl}">miRNA–Target Regulatory Network<small>Post-transcriptional regulation</small></a>
              <a href="about-dynamic.html">Dynamic DKDM Framework<small>Parametric ODE models</small></a>
              <a href="data-resources.html">Data &amp; Resources<small>Where to find every resource</small></a>
            </div>
          </li>
          <li class="has-dropdown" id="exploreDD">
            <button class="navbtn ${active==='explore'?'active':''}" onclick="DKDMLayout.toggleExploreDD(event)">
              Explore <span class="caret">▼</span>
            </button>
            <div class="dropdown">
              <a href="gene-search.html">Gene Search<small>Find any gene across 24 cell types</small></a>
              <a href="pathway-explorer.html">Pathway Explorer<small>Browse enrichment results</small></a>
              <a href="cell-types.html">Cell Types<small>24 kidney cell types</small></a>
              <a href="use-cases.html">Use Cases<small>Step-by-step examples</small></a>
            </div>
          </li>
          <li><a href="documentation.html" class="${active==='documentation'?'active':''}">Documentation</a></li>
          <li><a href="team.html" class="${active==='team'?'active':''}">Team</a></li>
          <li><a href="${D.dynamicDkdmUrl}" target="_blank" rel="noopener">Dynamic DKDM ↗</a></li>
          <li><a href="tools.html" class="${active==='tools'?'active':''}">Tools</a></li>
        </ul>
      </div>
    </div>
  </header>`;
}

  /* ---------- FOOTER ---------- */
  function footer() {
    const L = D.links;
    return `
    <footer class="site-footer">
      <div class="footer-inner">
        <p class="footer-cite" title="${D.citation.replace(/"/g,'&quot;')}">${D.citation}</p>
        <nav class="footer-links">
          <a href="${L.github}" target="_blank" rel="noopener"><span class="dot"></span>GitHub</a>
          <a href="${L.fairdomhub}" target="_blank" rel="noopener"><span class="dot"></span>FAIRDOMHub</a>
          <a href="${L.diseaseMaps}" target="_blank" rel="noopener"><span class="dot"></span>Disease Maps</a>
        </nav>
      </div>
    </footer>`;
  }

  /* ---------- FLOATING HELP BUTTON ---------- */
  const HELP_ROWS = [
    ["References &amp; Evidence", "MINERVA", null, "Open the cell-type MINERVA map and click any gene or interaction."],
    ["ODE Models", "Dynamic DKDM", D.dynamicDkdmUrl, "Open the live Dynamic DKDM atlas."],
    ["Network Analysis", "FAIRDOMHub", D.links.fairdomhub, "Download the centrality CSV from the cell-type resources."],
    ["GO Enrichment", "FAIRDOMHub", D.links.fairdomhub, "Download the GO enrichment CSV."],
    ["Pathway Enrichment", "FAIRDOMHub", D.links.fairdomhub, "Download the pathway enrichment CSV."],
    ["Cell–Cell Communication", "Cell–Cell Interaction Map", D.cciMapUrl, "Open the interaction map."],
    ["miRNA Regulation", "miRNA–Target Interaction Map", D.mirnaMapUrl, "Open the regulatory map."]
  ];
  function helpFab() {
    return `<button class="help-fab" onclick="DKDMLayout.openHelp()">
      <span class="q">?</span> Where can I find…?</button>`;
  }
  function openHelp() {
    const rows = HELP_ROWS.map(([what, where, url, how]) => `
      <tr>
        <td class="want">${what}</td>
        <td class="act">${url ? `<a class="btn btn-ghost btn-sm" href="${url}" ${url.startsWith('http')?'target="_blank" rel="noopener"':''}>${where} →</a>` : `<span class="loc-tag">${where}</span>`}</td>
      </tr>
      <tr><td colspan="2" class="muted" style="padding-top:0;font-size:.85rem;border-bottom:1px solid var(--line)">${how}</td></tr>`
    ).join("");
    openModal(`
      <div class="modal-head">
        <h3>Where can I find…?</h3>
        <button class="x" onclick="DKDMLayout.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <p class="muted mt-0">DKDM information is distributed across a few connected systems. Here is what lives where, for every cell type:</p>
        <table class="resource-table">${rows}</table>
      </div>`);
  }

  /* ---------- MODAL ---------- */
  function ensureBackdrop() {
    let b = document.getElementById("dkdmModal");
    if (!b) {
      b = el(`<div class="modal-backdrop" id="dkdmModal"></div>`);
      b.addEventListener("click", e => { if (e.target === b) closeModal(); });
      document.body.appendChild(b);
    }
    return b;
  }
  function openModal(inner) {
    const b = ensureBackdrop();
    b.innerHTML = `<div class="modal">${inner}</div>`;
    b.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    const b = document.getElementById("dkdmModal");
    if (b) { b.classList.remove("open"); document.body.style.overflow = ""; }
  }

  /* ---------- behaviour ---------- */
  function toggleDD(e) { e.stopPropagation(); document.getElementById("aboutDD").classList.toggle("open"); }
  function toggleExploreDD(e) { e.stopPropagation(); document.getElementById("exploreDD").classList.toggle("open"); }
  function toggleNav() { document.getElementById("mainNav").classList.toggle("open"); }
  function toggleDl(e) {
    e.stopPropagation();
    document.getElementById("dlWrapper").classList.toggle("open");
  }
  document.addEventListener("click", () => {
    const dd = document.getElementById("aboutDD");
    if (dd) dd.classList.remove("open");
    const edd = document.getElementById("exploreDD");
    if (edd) edd.classList.remove("open");
    const dw = document.getElementById("dlWrapper");
    if (dw) dw.classList.remove("open");
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  /* ---------- mount ---------- */
  function mount() {
    const active = window.PAGE || "";
    document.body.insertAdjacentHTML("afterbegin", header(active));
    document.body.insertAdjacentHTML("beforeend", footer());
    document.body.insertAdjacentHTML("beforeend", helpFab());
  }

  window.DKDMLayout = { mount, openModal, closeModal, openHelp, toggleDD, toggleExploreDD, toggleNav, toggleDl };
})();
