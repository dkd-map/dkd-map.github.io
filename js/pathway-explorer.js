/* =====================================================================
   DKDM — Pathway Explorer page logic
   Two modes:
     1. Browse by Cell Type — select a cell, see enriched pathways sorted by FDR
     2. Search by Pathway Name — type a pathway, see which cell types have it
   Loads pathway-index.json.
   ===================================================================== */
(function () {
  let PATHWAY_INDEX = null;
  let mode = 'cell';        // 'cell' | 'pathway'
  let selectedCell = '';
  let pathwayQuery = '';
  let selectedPathway = '';

  // ── Load the pathway index ──────────────────────────────────────
  async function loadIndex() {
    try {
      const res = await fetch('assets/data/pathway-index.json');
      PATHWAY_INDEX = await res.json();
      populateCellSelect();
      checkUrlParam();
    } catch (e) {
      document.getElementById('pePlaceholder').innerHTML =
        '<p class="muted" style="text-align:center;padding:40px 0;color:var(--crimson)">Could not load pathway index. Please try again later.</p>';
    }
  }

  // ── Populate the cell-type dropdown ─────────────────────────────
  function populateCellSelect() {
    const cells = new Set();
    for (const pw in PATHWAY_INDEX) {
      for (const c in PATHWAY_INDEX[pw]) cells.add(c);
    }
    const select = document.getElementById('cellSelect');
    const sorted = Array.from(cells).sort();
    sorted.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      select.appendChild(opt);
    });
  }

  // ── Check URL for ?q= parameter (from gene-search pathway tags) ─
  function checkUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setMode('pathway');
      document.getElementById('pathwayInput').value = q;
      pathwayQuery = q;
      selectedPathway = q;
      render();
    }
  }

  // ── Mode switching ──────────────────────────────────────────────
  function setMode(m) {
    mode = m;
    document.getElementById('modeByCell').classList.toggle('active', m === 'cell');
    document.getElementById('modeByPathway').classList.toggle('active', m === 'pathway');
    document.getElementById('cellSelectGroup').style.display = m === 'cell' ? '' : 'none';
    document.getElementById('pathwaySearchGroup').style.display = m === 'pathway' ? '' : 'none';
    document.getElementById('pathwayAutocomplete').innerHTML = '';
    document.getElementById('pathwayAutocomplete').style.display = 'none';
    if (m === 'cell') {
      pathwayQuery = ''; selectedPathway = '';
      document.getElementById('pathwayInput').value = '';
    } else {
      selectedCell = '';
      document.getElementById('cellSelect').value = '';
    }
    render();
  }

  // ── Cell selection handler ──────────────────────────────────────
  function onCellChange() {
    selectedCell = document.getElementById('cellSelect').value;
    render();
  }

  // ── Pathway search autocomplete ─────────────────────────────────
  function onPathwaySearch(query) {
    pathwayQuery = query;
    selectedPathway = '';
    const ac = document.getElementById('pathwayAutocomplete');
    if (!query || query.length < 2) {
      ac.innerHTML = ''; ac.style.display = 'none';
      render();
      return;
    }
    const allPathways = Object.keys(PATHWAY_INDEX);
    const matches = allPathways
      .filter(pw => pw.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 15);
    if (!matches.length) {
      ac.innerHTML = ''; ac.style.display = 'none';
      render();
      return;
    }
    ac.innerHTML = matches.map(pw =>
      '<div class="ac-item" data-pathway="' + pw.replace(/"/g, '&quot;') + '">' + pw + '</div>'
    ).join('');
    ac.style.display = 'block';
    ac.querySelectorAll('.ac-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById('pathwayInput').value = item.dataset.pathway;
        ac.innerHTML = ''; ac.style.display = 'none';
        selectedPathway = item.dataset.pathway;
        render();
      });
    });
    // Also render partial results (pathways matching the typed text)
    render();
  }

  // ── Get FDR threshold from dropdown ─────────────────────────────
  function getFdrThreshold() {
    return parseFloat(document.getElementById('fdrFilter').value) || 1.0;
  }

  // ── Format p-value / FDR for display ────────────────────────────
  function fmtP(val) {
    if (val === null || val === undefined) return '—';
    if (val < 0.0001) return val.toExponential(2);
    if (val < 0.01) return val.toFixed(4);
    return val.toFixed(3);
  }

  // ── Render pathway link ─────────────────────────────────────────
  function pathwayLink(name, data) {
    if (data.link) {
      return '<a href="' + data.link + '" target="_blank" rel="noopener" class="pe-pathway-link">' + name + ' ↗</a>';
    }
    // Build KEGG link if geneSet starts with hsa
    if (data.geneSet && data.geneSet.startsWith('hsa')) {
      return '<a href="https://www.genome.jp/kegg-bin/show_pathway?' + data.geneSet + '" target="_blank" rel="noopener" class="pe-pathway-link">' + name + ' ↗</a>';
    }
    return name;
  }

  // ── Render gene tags ────────────────────────────────────────────
  function geneTags(genes) {
    if (!genes || genes.length === 0) return '<span class="muted" style="font-size:.85rem">Gene list not available for this entry</span>';
    return genes.map(g =>
      '<a href="gene-search.html?gene=' + encodeURIComponent(g) + '" class="gene-pathway-tag">' + g + '</a>'
    ).join('');
  }

  // ── Main render function ────────────────────────────────────────
  function render() {
    const results = document.getElementById('peResults');
    const placeholder = document.getElementById('pePlaceholder');
    const fdrThreshold = getFdrThreshold();

    if (!PATHWAY_INDEX) return;

    if (mode === 'cell') {
      renderByCell(results, placeholder, fdrThreshold);
    } else {
      renderByPathway(results, placeholder, fdrThreshold);
    }
  }

  // ── Mode 1: Browse by cell type ─────────────────────────────────
  function renderByCell(results, placeholder, fdrThreshold) {
    if (!selectedCell) {
      results.innerHTML = '';
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">Select a cell type above to see its enriched pathways.</p>';
      return;
    }

    // Collect all pathways for this cell
    const entries = [];
    for (const pw in PATHWAY_INDEX) {
      if (PATHWAY_INDEX[pw][selectedCell]) {
        const d = PATHWAY_INDEX[pw][selectedCell];
        if (d.fdr <= fdrThreshold) {
          entries.push({ name: pw, data: d });
        }
      }
    }
    // Sort by FDR ascending
    entries.sort((a, b) => a.data.fdr - b.data.fdr);

    if (entries.length === 0) {
      results.innerHTML = '';
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">No pathways meet the current FDR threshold for <strong>' + selectedCell + '</strong>. Try relaxing the filter.</p>';
      return;
    }

    placeholder.style.display = 'none';
    results.innerHTML =
      '<div class="pe-result-header">' +
        '<h2>' + selectedCell + '</h2>' +
        '<span class="gene-result-meta">' + entries.length + ' enriched pathways (FDR &le; ' + fdrThreshold + ')</span>' +
      '</div>' +
      '<div class="table-wrap"><table class="dk"><thead><tr>' +
        '<th>Pathway</th><th>p-value</th><th>FDR</th><th>Gene Set</th><th>Genes</th>' +
      '</tr></thead><tbody>' +
        entries.map(e => {
          const geneCount = e.data.genes ? e.data.genes.length : 0;
          return '<tr>' +
            '<td class="pe-pw-name">' + pathwayLink(e.name, e.data) + '</td>' +
            '<td class="pe-num">' + fmtP(e.data.pvalue) + '</td>' +
            '<td class="pe-num">' + fmtP(e.data.fdr) + '</td>' +
            '<td class="pe-geneset">' + (e.data.geneSet || '—') + '</td>' +
            '<td class="pe-genes-cell">' +
              (geneCount > 0
                ? '<span class="pe-gene-count">' + geneCount + ' genes</span> <button class="pe-expand-btn" onclick="DKDMPathway.toggleGenes(this)">Show</button><div class="pe-gene-list" style="display:none">' + geneTags(e.data.genes) + '</div>'
                : '<span class="muted" style="font-size:.85rem">—</span>') +
            '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table></div>';
  }

  // ── Mode 2: Search by pathway name ──────────────────────────────
  function renderByPathway(results, placeholder, fdrThreshold) {
    if (!pathwayQuery || pathwayQuery.length < 2) {
      results.innerHTML = '';
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">Type at least 2 characters to search pathway names, or pick a suggestion from the dropdown.</p>';
      return;
    }

    // If a specific pathway is selected from autocomplete, show only that
    // Otherwise, show all pathways matching the query text
    let matchingPathways;
    if (selectedPathway) {
      matchingPathways = [selectedPathway];
    } else {
      matchingPathways = Object.keys(PATHWAY_INDEX)
        .filter(pw => pw.toLowerCase().includes(pathwayQuery.toLowerCase()));
    }

    if (matchingPathways.length === 0) {
      results.innerHTML = '';
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">No pathways match <strong>' + pathwayQuery + '</strong>. Try another term.</p>';
      return;
    }

    placeholder.style.display = 'none';

    // Build cards for each matching pathway
    const cards = matchingPathways.map(pw => {
      const cells = PATHWAY_INDEX[pw];
      const cellEntries = [];
      for (const c in cells) {
        if (cells[c].fdr <= fdrThreshold) {
          cellEntries.push({ cell: c, data: cells[c] });
        }
      }
      cellEntries.sort((a, b) => a.data.fdr - b.data.fdr);

      if (cellEntries.length === 0) return ''; // skip if no cells pass filter

      return '<div class="gene-result-card">' +
        '<div class="gene-result-header">' +
          '<h2>' + pw + '</h2>' +
          '<span class="gene-result-meta">' + cellEntries.length + ' cell types (FDR &le; ' + fdrThreshold + ')</span>' +
        '</div>' +
        (cellEntries[0].data.link || cellEntries[0].data.geneSet ?
          '<div class="gene-ext-links"><span class="gene-ext-label">Pathway database:</span>' +
          '<a href="' + (cellEntries[0].data.link || 'https://www.genome.jp/kegg-bin/show_pathway?' + cellEntries[0].data.geneSet) + '" target="_blank" rel="noopener" class="gene-ext-link">' +
          (cellEntries[0].data.geneSet || 'View') + ' ↗</a></div>' : '') +
        '<div class="table-wrap"><table class="dk"><thead><tr>' +
          '<th>Cell Type</th><th>p-value</th><th>FDR</th><th>Genes</th>' +
        '</tr></thead><tbody>' +
          cellEntries.map(e => {
            const geneCount = e.data.genes ? e.data.genes.length : 0;
            return '<tr>' +
              '<td>' + e.cell + '</td>' +
              '<td class="pe-num">' + fmtP(e.data.pvalue) + '</td>' +
              '<td class="pe-num">' + fmtP(e.data.fdr) + '</td>' +
              '<td class="pe-genes-cell">' +
                (geneCount > 0
                  ? '<span class="pe-gene-count">' + geneCount + ' genes</span> <button class="pe-expand-btn" onclick="DKDMPathway.toggleGenes(this)">Show</button><div class="pe-gene-list" style="display:none">' + geneTags(e.data.genes) + '</div>'
                  : '<span class="muted" style="font-size:.85rem">—</span>') +
              '</td>' +
            '</tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</div>';
    }).filter(Boolean).join('');

    if (!cards) {
      results.innerHTML = '';
      placeholder.style.display = 'block';
      placeholder.innerHTML = '<p class="muted" style="text-align:center;padding:40px 0">No pathways matching <strong>' + pathwayQuery + '</strong> meet the current FDR threshold. Try relaxing the filter.</p>';
      return;
    }

    results.innerHTML = cards;
  }

  // ── Toggle gene list visibility in table rows ───────────────────
  function toggleGenes(btn) {
    const list = btn.nextElementSibling;
    if (list.style.display === 'none') {
      list.style.display = 'flex';
      btn.textContent = 'Hide';
    } else {
      list.style.display = 'none';
      btn.textContent = 'Show';
    }
  }

  // ── Init ────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadIndex();
  });

  // ── Public API ──────────────────────────────────────────────────
  window.DKDMPathway = {
    setMode,
    onCellChange,
    onPathwaySearch,
    render,
    toggleGenes
  };
})();
