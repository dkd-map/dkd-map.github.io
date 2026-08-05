/* =====================================================================
   DKDM — Gene Search page logic
   Loads gene-index.json, provides autocomplete + detailed gene results.
   ===================================================================== */
(function () {
  let GENE_INDEX = null;
  let allSymbols = [];

  // ── External database link builder ──────────────────────────────
  function extLinks(symbol, gene) {
    const s = encodeURIComponent(symbol);
    // KEGG GENES entries are keyed by NCBI Gene ID (hsa:<entrezId>), not by symbol.
    // KEGG dropped gene-symbol aliases, so we only emit a KEGG link when we have the ID.
    const eid = gene && gene.entrezId;

    const links = [
      { label: 'NCBI Gene',    url: eid ? 'https://www.ncbi.nlm.nih.gov/gene/' + eid
                                        : 'https://www.ncbi.nlm.nih.gov/gene/?term=' + s },
      { label: 'UniProt',      url: 'https://www.uniprot.org/uniprotkb?query=' + s },
      { label: 'HGNC',         url: 'https://www.genenames.org/tools/search/#!/all?query=' + s },
      { label: 'Open Targets', url: 'https://platform.opentargets.org/search?q=' + s },
    ];
    if (eid) links.push({ label: 'KEGG', url: 'https://www.kegg.jp/entry/hsa:' + eid });
    return links;
  }

  // ── Load the gene index ─────────────────────────────────────────
  async function loadIndex() {
    try {
      const res = await fetch('assets/data/gene-index.json');
      GENE_INDEX = await res.json();
      allSymbols = Object.keys(GENE_INDEX).sort();
    } catch (e) {
      document.getElementById('genePlaceholder').innerHTML =
        '<p class="muted" style="text-align:center;padding:40px 0;color:var(--crimson)">Could not load gene index. Please try again later.</p>';
    }
  }

  // ── Autocomplete ────────────────────────────────────────────────
  function showAutocomplete(query) {
    const container = document.getElementById('geneAutocomplete');
    if (!query || query.length < 1) { container.innerHTML = ''; container.style.display = 'none'; return; }
    const matches = allSymbols.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
    if (!matches.length) { container.innerHTML = ''; container.style.display = 'none'; return; }
    container.innerHTML = matches.map(s =>
      '<div class="ac-item" data-symbol="' + s + '">' + s + '</div>'
    ).join('');
    container.style.display = 'block';
    container.querySelectorAll('.ac-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('geneInput').value = item.dataset.symbol;
        container.innerHTML = ''; container.style.display = 'none';
        searchGene(item.dataset.symbol);
      });
    });
  }

  // ── Render gene result ──────────────────────────────────────────
  function searchGene(symbol) {
    const sym = symbol.toUpperCase().trim();
    const results = document.getElementById('geneResults');
    const placeholder = document.getElementById('genePlaceholder');

    if (!GENE_INDEX) return;
    if (!GENE_INDEX[sym]) {
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">No results for <strong>' + sym + '</strong>. Try another gene symbol.</p>';
      results.innerHTML = '';
      return;
    }

    placeholder.style.display = 'none';
    const g = GENE_INDEX[sym];

    // External links
    const links = extLinks(sym, g);
    const linksHtml = '<div class="gene-ext-links">' +
      '<span class="gene-ext-label">Learn more:</span>' +
      links.map(l => '<a href="' + l.url + '" target="_blank" rel="noopener" class="gene-ext-link">' + l.label + ' ↗</a>').join('') +
      '</div>';

    // Cell types
    const cellTypesHtml = g.cellTypes.length > 0 ?
      '<div class="gene-section"><h4>Present in ' + g.cellTypes.length + ' cell types</h4>' +
      '<div class="gene-cell-grid">' + g.cellTypes.map(c => {
        const slug = g.cellSlugs && g.cellSlugs[c] ? g.cellSlugs[c] : null;
        const link = slug ? 'https://dkd-map.github.io/DynamicDKDM/network/' + slug + '/' : null;
        const types = g.speciesTypes[c] || [];
        return '<div class="gene-cell-card">' +
          (link ? '<a href="' + link + '" target="_blank" rel="noopener" class="gene-cell-name">' + c + ' →</a>' : '<span class="gene-cell-name">' + c + '</span>') +
          '<span class="gene-cell-types">' + types.join(', ') + '</span>' +
          '</div>';
      }).join('') + '</div></div>' : '';

    // Centrality
    let centralityHtml = '';
    if (Object.keys(g.centrality).length > 0) {
      const cells = Object.keys(g.centrality).sort((a, b) =>
        (g.centrality[a].rank || 999) - (g.centrality[b].rank || 999)
      );
      centralityHtml = '<div class="gene-section"><h4>Network centrality</h4>' +
        '<div class="table-wrap"><table class="dk"><thead><tr>' +
        '<th>Cell Type</th><th>Rank</th><th>Degree</th><th>Betweenness</th><th>PageRank</th>' +
        '</tr></thead><tbody>' +
        cells.map(c => {
          const cr = g.centrality[c];
          return '<tr><td>' + c + '</td><td>' + (cr.rank ? '#' + Math.round(cr.rank) : '—') + '</td>' +
            '<td>' + cr.degree.toFixed(3) + '</td>' +
            '<td>' + cr.betweenness.toFixed(4) + '</td>' +
            '<td>' + cr.pagerank.toFixed(5) + '</td></tr>';
        }).join('') +
        '</tbody></table></div></div>';
    }

    // CCI role
    let cciHtml = '';
    var ligandIn = (g.cciRole && g.cciRole.ligandIn) ? g.cciRole.ligandIn : [];
    var receptorIn = (g.cciRole && g.cciRole.receptorIn) ? g.cciRole.receptorIn : [];
    if (ligandIn.length > 0 || receptorIn.length > 0) {
      cciHtml = '<div class="gene-section"><h4>Cell&ndash;cell communication role</h4>';
      if (ligandIn.length > 0) {
        cciHtml += '<p><strong>Acts as ligand in:</strong> ' + ligandIn.join(', ') + '</p>';
      }
      if (receptorIn.length > 0) {
        cciHtml += '<p><strong>Acts as receptor in:</strong> ' + receptorIn.join(', ') + '</p>';
      }
      if (g.uniprotId) {
        cciHtml += '<p><strong>UniProt ID:</strong> <a href="https://www.uniprot.org/uniprotkb?query=' + g.uniprotId + '" target="_blank" rel="noopener">' + g.uniprotId + ' ↗</a></p>';
      }
      cciHtml += '</div>';
    }

    // miRNA regulation
    let mirnaHtml = '';
    if (g.mirnaRegulation && g.mirnaRegulation.length > 0) {
      const validated = g.mirnaRegulation.filter(m => m.type !== 'Predicted only');
      const predicted = g.mirnaRegulation.filter(m => m.type === 'Predicted only');
      mirnaHtml = '<div class="gene-section"><h4>miRNA regulation (' + g.mirnaRegulation.length + ' interactions)</h4>';
      if (validated.length > 0) {
        mirnaHtml += '<div class="table-wrap"><table class="dk"><thead><tr><th>miRNA</th><th>Type</th><th>Experiment</th><th>PMID</th></tr></thead><tbody>' +
          validated.map(m => '<tr><td>' + m.miRNA + '</td><td>' + m.type + '</td><td>' + m.experiment + '</td>' +
            '<td>' + (m.pmid ? '<a href="https://pubmed.ncbi.nlm.nih.gov/' + m.pmid + '/" target="_blank" rel="noopener">' + m.pmid + ' ↗</a>' : '—') + '</td></tr>').join('') +
          '</tbody></table></div>';
      }
      if (predicted.length > 0) {
        mirnaHtml += '<p class="muted" style="font-size:.85rem;margin-top:8px">Also predicted to be regulated by ' + predicted.length + ' miRNAs (computational predictions only).</p>';
      }
      mirnaHtml += '</div>';
    }

    // Pathways
    let pathwayHtml = '';
    if (g.pathways && Object.keys(g.pathways).length > 0) {
      const cells = Object.keys(g.pathways);
      pathwayHtml = '<div class="gene-section"><h4>Associated pathways</h4>' +
        cells.map(c => {
          const pws = g.pathways[c];
          return '<div class="gene-pathway-cell"><span class="gene-pathway-cell-name">' + c + '</span>' +
            '<div class="gene-pathway-list">' + pws.map(pw =>
              '<a href="pathway-explorer.html?q=' + encodeURIComponent(pw) + '" class="gene-pathway-tag">' + pw + '</a>'
            ).join('') + '</div></div>';
        }).join('') + '</div>';
    }

    // Assemble
    results.innerHTML =
      '<div class="gene-result-card">' +
        '<div class="gene-result-header">' +
          '<h2>' + sym + '</h2>' +
          '<span class="gene-result-meta">' + g.cellTypes.length + ' cell types' +
          (g.uniprotId ? ' · ' + g.uniprotId : '') + '</span>' +
        '</div>' +
        linksHtml +
        cellTypesHtml +
        centralityHtml +
        cciHtml +
        mirnaHtml +
        pathwayHtml +
      '</div>';
  }

  // ── Event handlers ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadIndex();

    const input = document.getElementById('geneInput');
    const btn = document.getElementById('geneSearchBtn');
    const ac = document.getElementById('geneAutocomplete');

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => showAutocomplete(input.value), 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        ac.innerHTML = ''; ac.style.display = 'none';
        searchGene(input.value);
      }
    });

    btn.addEventListener('click', () => {
      ac.innerHTML = ''; ac.style.display = 'none';
      searchGene(input.value);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.gene-search-wrap')) {
        ac.innerHTML = ''; ac.style.display = 'none';
      }
    });

    // Check URL for ?gene= parameter
    const params = new URLSearchParams(window.location.search);
    const geneParam = params.get('gene');
    if (geneParam) {
      input.value = geneParam;
      // Wait for index to load
      const checkLoaded = setInterval(() => {
        if (GENE_INDEX) { clearInterval(checkLoaded); searchGene(geneParam); }
      }, 100);
    }
  });
})();
