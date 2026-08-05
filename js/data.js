/* =====================================================================
   DKDM — CENTRAL SITE DATA
   ---------------------------------------------------------------------
   THIS IS THE ONE FILE NON-DEVELOPERS SHOULD EDIT.
   Everything below controls text, links, logos and the cell-type list.
   After editing, just save and re-publish. Do not change variable names.
   ===================================================================== */

const DKDM = {

  /* ---- Site-wide identity --------------------------------------- */
  siteUrl: "https://DKD-map.github.io/",
  title: "DKDM",
  subtitle: "A Multi-Scale Digital Map of Diabetic Kidney Disease, from Macro Anatomy to Molecular Interactions",

  /* ---- The Dynamic DKDM platform (the parametric ODE Network Atlas) ---- */
  dynamicDkdmUrl: "https://dkd-map.github.io/DynamicDKDM/",

  /* The MINERVA annotated disease map (the static cell maps link here). */
  minervaMapUrl: "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03",

  /* ---- Cell-Cell & miRNA interactive maps (Google Sites) -------- */
  cciMapUrl: "https://sites.google.com/view/dkdm-cci/home",
  mirnaMapUrl: "https://sites.google.com/view/dkdm-mirna-target/home",

  /* Direct CSV downloads for the two networks (see assets/data/) */
  cciCsv:   "assets/data/cell-cell-interactions.csv",
  mirnaCsv: "assets/data/mirna-target-interactions.csv",

  /* ---- Footer: citation + external links ------------------------ */
  citation: "If you use DKDM in your research, please cite: Kiyanpour F, et al. DKDM: A Multi-Scale Digital Resource for Diabetic Kidney Disease., https://DKD-map.github.io (The publication will be announced here!)",
  links: {
    github:      "https://github.com/dkd-map/dkd-map.github.io",
    fairdomhub:  "https://fairdomhub.org/projects/505",
    diseaseMaps: "https://disease-maps.io/diabetickidneydisease"
  },

  /* ---- Partner logos (files in assets/logos/) ------------------- */
  logos: [
    { name: "RMRC", file: "assets/logos/rmrc.png", url: "https://rmrc.mui.ac.ir/" },
    { name: "University of Luxembourg", file: "assets/logos/luxembourg.png", url: "https://www.uni.lu/lcsb-en/" }
  ],

  /* ---- Download packages for the global Download button --------- */
  downloads: [
    { label: "Dynamic DKDM — All SBML Models (ZIP)", url: "assets/data/dynamic-dkdm-models.zip", download: true },
    { label: "Cell–Cell Interaction Network (CSV)",  url: "assets/data/cell-cell-interactions.csv", download: true },
    { label: "miRNA–Target Network (CSV)",           url: "assets/data/mirna-target-interactions.csv", download: true },
    { label: "MINERVA Disease Map",                  url: "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03", external: true }
  ],

  /* ---- Bulk download type definitions (powers the header dropdown) ---- */
  bulkDownloads: [
    { label: "Biological Process Results",       zip: "assets/data/AllCells_BiologicalProcessResults.zip"      },
    { label: "Network Centrality Measurements",  zip: "assets/data/AllCells_NetworkCentralityMeasurements.zip" },
    { label: "Pathway Enrichment Results",       zip: "assets/data/AllCells_PathwayEnrichmentResults.zip"      },
    { label: "PPI Networks",                     zip: "assets/data/AllCells_PPInetwork.zip"                    }
  ],

  /* ---- Homepage box texts --------------------------------------- */
  boxes: {
    geneSearch: "Look up any gene to see which kidney cell types contain it, its network centrality rank, cell\u2013cell communication role, miRNA regulators, and associated pathways. Every gene links to NCBI, UniProt, HGNC, and Open Targets.",
    pathwayExplorer: "Browse pathway enrichment results by cell type, or search a pathway name to see which cell types share it. Filter by significance and explore the genes driving each enrichment.",
    cellTypes: "Explore 24 DKD-relevant kidney cell types. Each cell type provides access to its ODE model, MINERVA cell-type map with traceable annotations, and associated FAIRDOMHub resources, including network centrality analyses, pathway enrichment results, and GO enrichment analyses.",
    cci:   "Explore and download communication between kidney cell types. Visualize and investigate the cell\u2013cell interaction network underlying diabetic kidney disease.",
    mirna: "Discover miRNA\u2013target gene interactions. Explore regulatory relationships and visualize the miRNA\u2013gene interaction network.",
    dynamic: "Run, simulate and download parametric ODE models for every kidney cell type. Open the live Dynamic DKDM atlas to inspect equations and parameters interactively."
  },

  /* ---- The 24 cell types ---------------------------------------- */
  cells: [
  {
    "name": "B cell",
    "slug": "b-cell",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Bcell/",
    "icon": "Bcell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1614.572815404765&y=1691.142440052015&modelId=579&backgroundId=2&searchValue=element:69865",
    "iconPlaceholder": false
  },
  {
    "name": "Connecting Tubule Cells",
    "slug": "connecting-tubule-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/ConnectingTubule/",
    "icon": "ColectingDuct.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1847.01141962054&y=1997.152239256655&modelId=590&backgroundId=2&searchValue=element:69865",
    "iconPlaceholder": false
  },
  {
    "name": "Distal Convoluted Tubule Cells",
    "slug": "distal-convoluted-tubule-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/DCT/",
    "icon": "DistalConvolutedTubule.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1736.52282684301&y=1710.74044848599&modelId=581&backgroundId=2&searchValue=element:70931",
    "iconPlaceholder": false
  },
  {
    "name": "Endothelial Cell",
    "slug": "endothelial-cell",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Endothelial/",
    "icon": "EndothelialCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2453.941475984095&y=2516.812216190885&modelId=580&backgroundId=2&searchValue=element:69140",
    "iconPlaceholder": false
  },
  {
    "name": "Fibroblast Cell",
    "slug": "fibroblast-cell",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Fibroblast/",
    "icon": "FibroblastCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2015.27881160386&y=2008.047371636215&modelId=573&backgroundId=2&searchValue=element:69034",
    "iconPlaceholder": false
  },
  {
    "name": "Glomerular Capillary Cells",
    "slug": "glomerular-capillary-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/GlomerularCapillary/",
    "icon": "GlomerularCapillaryCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=3113.169074755565&y=3163.85498590878&modelId=592&backgroundId=2&searchValue=element:69233",
    "iconPlaceholder": false
  },
  {
    "name": "Intercalated Cell A",
    "slug": "intercalated-cell-a",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/InterCellA/",
    "icon": "IntercalatedCellA.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2505.57482961876&y=2576.89702637318&modelId=591&backgroundId=2&searchValue=element:70004",
    "iconPlaceholder": false
  },
  {
    "name": "Intercalated Cell B",
    "slug": "intercalated-cell-b",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/InterCellB/",
    "icon": "IntercalatedCellB.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=3330.757300536675&y=3077.96805936105&modelId=589&backgroundId=2&searchValue=element:69534",
    "iconPlaceholder": false
  },
  {
    "name": "M2 Macrophage Cells",
    "slug": "m2-machrophage-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/M2machrophage/",
    "icon": "M2macrophage.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2839.475578203945&y=3113.967413092445&modelId=584&backgroundId=2&searchValue=element:69424",
    "iconPlaceholder": false
  },
  {
    "name": "Macula Densa Cells",
    "slug": "macula-densa-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/MaculaDensa/",
    "icon": "MaculaDensa.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1918.44371466247&y=1905.83924675889&modelId=586&backgroundId=2&searchValue=element:70477",
    "iconPlaceholder": false
  },
  {
    "name": "Mesangial Cells",
    "slug": "mesangial-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Mesengial/",
    "icon": "MesangialCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1896.65226222502&y=1947.01200792682&modelId=577&backgroundId=2&searchValue=element:69638",
    "iconPlaceholder": false
  },
  {
    "name": "Monocyte Derived Cells",
    "slug": "monocyte-derived-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/MonocyteDerivedCell/",
    "icon": "MonocyteCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2401.813545659745&y=2479.55807930354&modelId=593&backgroundId=2&searchValue=element:70584",
    "iconPlaceholder": false
  },
  {
    "name": "Natural Killer T Cell",
    "slug": "natural-killer-t-cell",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/NKT/",
    "icon": "NaturalKillerTcell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1984.63218806418&y=2237.21584633602&modelId=587&backgroundId=2&searchValue=element:70376",
    "iconPlaceholder": false
  },
  {
    "name": "Non-Classical Monocyte",
    "slug": "non-classical-monocyte",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/NonClassicalMonocyte/",
    "icon": "NonClassicalMonocyte.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2864.65479785193&y=2813.47627273916&modelId=582&backgroundId=2&searchValue=element:71037",
    "iconPlaceholder": false
  },
  {
    "name": "Parietal Cells",
    "slug": "parietal-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/ParietalCell/",
    "icon": "ParietalCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2319.19660982724&y=2365.59483144859&modelId=574&backgroundId=2&searchValue=element:70176",
    "iconPlaceholder": false
  },
  {
    "name": "Pericyte Cells",
    "slug": "pericyte-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Pericyte/",
    "icon": "PericyteCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1896.65226222502&y=1947.01200792682&modelId=578&backgroundId=2&searchValue=element:70694",
    "iconPlaceholder": false
  },
  {
    "name": "Plasma Cells",
    "slug": "plasma-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/PlasmaCell/",
    "icon": "PlasmaCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1357.869606527265&y=1294.892599046705&modelId=585&backgroundId=2&searchValue=element:70802",
    "iconPlaceholder": false
  },
  {
    "name": "Podocyte Cells",
    "slug": "podocyte-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Podocyte/",
    "icon": "PodocyteCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1564.27327872607&y=1593.5134367907&modelId=594&backgroundId=2&searchValue=element:68810",
    "iconPlaceholder": false
  },
  {
    "name": "Principal Cells",
    "slug": "principal-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/PrincipalCell/",
    "icon": "PrincipalCell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2721.539349013245&y=2630.521493437145&modelId=575&backgroundId=2&searchValue=element:71137",
    "iconPlaceholder": false
  },
  {
    "name": "Proximal Tubule Cells",
    "slug": "proximal-tubule-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/PT/",
    "icon": "ProximalConvolutedTubule.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1651.490838538325&y=1582.83289045388&modelId=583&backgroundId=2&searchValue=element:70068",
    "iconPlaceholder": false
  },
  {
    "name": "T Cells",
    "slug": "t-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/Tcell/",
    "icon": "Tcell.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2252.610740299345&y=2513.45715202745&modelId=588&backgroundId=2&searchValue=element:68930",
    "iconPlaceholder": false
  },
  {
    "name": "Thick Ascending Limb Cells",
    "slug": "thick-ascending-limb-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/TAL/",
    "icon": "ThickAscendingLimb.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1824.41278583692&y=1715.12709359171&modelId=595&backgroundId=2&searchValue=element:69326",
    "iconPlaceholder": false
  },
  {
    "name": "Vasa Recta Cells",
    "slug": "vasa-recta-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/VasaRecta/",
    "icon": "VasaRecta.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=2797.602375796365&y=2753.072166669085&modelId=576&backgroundId=2&searchValue=element:69764",
    "iconPlaceholder": false
  },
  {
    "name": "Vascular Smooth Muscle Cells",
    "slug": "vascular-smooth-muscle-cells",
    "ode": "https://dkd-map.github.io/DynamicDKDM/network/VSM/",
    "icon": "VascularSmoothMuscle.png",
    "minerva": "https://dkdm.elixir-luxembourg.org/minerva/index.html?id=DKDM_113025_V03&perfectMatch=true&z=4&x=1896.65226222502&y=1947.01200792682&modelId=571&backgroundId=2&searchValue=element:70274",
    "iconPlaceholder": false
  }
]   /* ← end of cells array — NO semicolon here, still inside the object */

};  /* ← THIS is the real end of the DKDM object */

if (typeof window !== "undefined") { window.DKDM = DKDM; }
if (typeof module !== "undefined") { module.exports = DKDM; }
