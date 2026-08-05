'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const NetworkGraph = dynamic(() => import('../../../components/NetworkGraph'), { ssr: false })
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

const CELL_LABELS = {
  Bcell:'B Cell', ConnectingTubule:'Connecting Tubule Cell', DCT:'Distal Convoluted Tubule',
  Endothelial:'Endothelial Cell', Fibroblast:'Fibroblast Cell', GlomerularCapillary:'Glomerular Capillary Cell',
  InterCellA:'Intercalated Cell A', InterCellB:'Intercalated Cell B', M2machrophage:'M2 Macrophage',
  MaculaDensa:'Macula Densa', Mesengial:'Mesangial Cell', MonocyteDerivedCell:'Monocyte Cell',
  NKT:'Natural Killer T Cell', NonClassicalMonocyte:'Non-classical Monocyte Cell', PT:'Proximal Convoluted Tubule',
  ParietalCell:'Parietal Cell', Pericyte:'Pericyte Cell', PlasmaCell:'Plasma Cell',
  Podocyte:'Podocyte Cell', PrincipalCell:'Principal Cell', TAL:'Thick Ascending Limb Cell',
  Tcell:'T Cell', VSM:'Vascular Smooth Muscle Cell', VasaRecta:'Vasa Recta Cell',
  all_data_combined:'All Cells Combined',
}

const NODE_TYPE_CONFIG = {
  protein:{ color:'#3E2C73', bg:'#ede9fe', label:'Protein',       desc:'Active protein species' },
  phospho:{ color:'#d97706', bg:'#fef3c7', label:'Phosphoprotein', desc:'Phosphorylated form (_p)' },
  gene:   { color:'#059669', bg:'#dcfce7', label:'Gene',           desc:'Gene locus (_g)' },
  rna:    { color:'#7C5BD0', bg:'#f0ebff', label:'mRNA',           desc:'RNA transcript (_rna)' },
}
const EDGE_TYPE_CONFIG = {
  association: { color:'#3E2C73', style:'solid',  label:'Association',  desc:'K(n,1)·[A]·[B] − K(n,2)·[A|B]' },
  dissociation:{ color:'#6b7280', style:'dashed', label:'Dissociation', desc:'K(n,1)·[A|B] → free species' },
  degradation: { color:'#C8425A', style:'dotted', label:'Degradation',  desc:'K(n,1)·[X] → ∅' },
  catalysis:   { color:'#059669', style:'solid',  label:'Catalysis',    desc:'K(n,1)·[E]·[S] → [P]' },
}

function DownloadBtn({ href, label }) {
  return (
    <a href={href} download className="btn btn-ghost btn-sm"
       style={{ border:'1.5px solid rgba(255,255,255,.35)', color:'#fff', background:'rgba(255,255,255,.12)' }}
       onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.22)'}
       onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.12)'}>
      ↓ {label}
    </a>
  )
}

/* ── Sub-header bar (sits below layout header, styled with main-site palette) */
function NetworkBar({ cellLabel, celltype, data, filter, setFilter }) {
  const router = useRouter()
  return (
    <div style={{ background:'var(--indigo)', color:'#fff', padding:'0 24px', height:52, flexShrink:0,
      display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(255,255,255,.15)' }}>
      <button onClick={()=>router.push('/')}
        style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.3)', color:'#fff',
          padding:'4px 12px', borderRadius:8, cursor:'pointer', fontSize:'.84rem', fontWeight:700, fontFamily:'var(--font-body)' }}>
        ← Cell Browser
      </button>
      <div style={{ width:1, height:24, background:'rgba(255,255,255,.22)' }} />
      <div>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem' }}>{cellLabel}</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'.72rem', opacity:.65, marginLeft:10 }}>Parametric ODE Network</span>
      </div>
      {data && (
        <>
          <div style={{ width:1, height:24, background:'rgba(255,255,255,.22)', marginLeft:4 }} />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'.76rem', background:'rgba(255,255,255,.15)', padding:'3px 10px', borderRadius:6 }}>
            <strong>{data.nodes.length}</strong> species
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'.76rem', background:'rgba(255,255,255,.15)', padding:'3px 10px', borderRadius:6 }}>
            <strong>{data.edges.length}</strong> reactions
          </span>
          <div style={{ width:1, height:24, background:'rgba(255,255,255,.22)' }} />
          <DownloadBtn href={`${BASE}/data/${celltype}.xml`} label="SBML Model" />
          <DownloadBtn href={`${BASE}/data/reactions/${celltype}.csv`} label="Reactions CSV" />
          <div style={{ marginLeft:'auto', display:'flex', gap:5, alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'.72rem', opacity:.65 }}>Show:</span>
            {['all','protein','phospho','gene','rna'].map(f => (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:'3px 10px', borderRadius:6, fontSize:'.76rem', fontFamily:'var(--font-body)',
                fontWeight: filter===f ? 700 : 400,
                border: filter===f ? '2px solid rgba(255,255,255,.8)' : '1px solid rgba(255,255,255,.25)',
                background: filter===f ? 'rgba(255,255,255,.2)' : 'transparent',
                color:'#fff', cursor:'pointer',
              }}>{f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function NetworkClient({ celltype: celltypeProp }) {
  const params = useParams()
  const celltype = celltypeProp || params.celltype
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [filter, setFilter] = useState('all')
  const cellLabel = CELL_LABELS[celltype] || celltype

  useEffect(() => {
    if (!celltype) return
    setLoading(true); setError(null); setSelectedNode(null); setSelectedEdge(null)
    fetch(`${BASE}/data/${celltype}.xml`)
      .then(r => { if (!r.ok) throw new Error(`${celltype}.xml not found`); return r.text() })
      .then(xml => { setData(parseSBML(xml)); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [celltype])

  const handleSelectNode = useCallback(n => { setSelectedNode(n); setSelectedEdge(null) }, [])
  const handleSelectEdge = useCallback(e => { setSelectedEdge(e); setSelectedNode(null) }, [])

  /* ── graph area height: viewport minus fixed header, footer, and sub-bar ── */
  const graphH = 'calc(100vh - var(--header-h) - var(--footer-h) - 52px)'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:`calc(100vh - var(--header-h) - var(--footer-h))`, overflow:'hidden' }}>
      <NetworkBar cellLabel={cellLabel} celltype={celltype} data={data} filter={filter} setFilter={setFilter} />

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Loading */}
        {loading && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, background:'var(--paper)' }}>
            <div style={{ width:40, height:40, border:'4px solid var(--line)', borderTopColor:'var(--violet)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
            <div style={{ fontFamily:'var(--font-display)', fontSize:15, color:'var(--indigo)', fontWeight:600 }}>Loading {cellLabel}…</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-soft)' }}>Parsing SBML model</div>
          </div>
        )}
        {/* Error */}
        {error && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--paper)' }}>
            <div style={{ background:'var(--card)', border:`2px solid var(--crimson)`, borderRadius:16, padding:'36px 44px', maxWidth:460, textAlign:'center', boxShadow:'var(--shadow-lg)' }}>
              <div style={{ fontSize:32, marginBottom:14 }}>⚠️</div>
              <h2 style={{ color:'var(--crimson)', marginBottom:10 }}>File Not Found</h2>
              <p style={{ color:'var(--ink-soft)', fontSize:14, lineHeight:1.6 }}>{error}</p>
            </div>
          </div>
        )}
        {/* Graph + sidebar */}
        {data && !loading && (
          <>
            <NetworkGraph data={data} filter={filter} onSelectNode={handleSelectNode} onSelectEdge={handleSelectEdge} />
            <div style={{ width:300, background:'var(--card)', borderLeft:'1px solid var(--line)',
              display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', boxShadow:'-3px 0 12px rgba(36,27,58,.06)' }}>
              {!selectedNode && !selectedEdge && <DefaultPanel data={data} cellLabel={cellLabel} celltype={celltype} />}
              {selectedNode && <NodePanel node={selectedNode} data={data} onClose={() => setSelectedNode(null)} />}
              {selectedEdge && <EdgePanel edge={selectedEdge} onClose={() => setSelectedEdge(null)} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Sidebar panels ─────────────────────────────────────── */
function MiniStat({label,value,color,bg}) {
  return (
    <div style={{ background:bg, border:`1px solid ${color}44`, borderRadius:9, padding:'8px 10px', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color }}>{value}</div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-soft)', marginTop:1 }}>{label}</div>
    </div>
  )
}

function DefaultPanel({ data, cellLabel }) {
  const typeCount = data.nodes.reduce((a,n)=>{ a[n.type]=(a[n.type]||0)+1; return a }, {})
  const reactionCount = data.edges.reduce((a,e)=>{ a[e.reactionType]=(a[e.reactionType]||0)+1; return a }, {})
  return (
    <div style={{ padding:'18px 16px' }}>
      <div style={{ background:'var(--paper-2)', border:`2px solid var(--indigo)`, borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:'var(--indigo)', textTransform:'uppercase', letterSpacing:.8, marginBottom:5 }}>Network Summary</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--indigo)', marginBottom:2 }}>{cellLabel}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
          <MiniStat label="Species"   value={data.nodes.length} color="var(--indigo)"  bg="var(--paper-2)" />
          <MiniStat label="Reactions" value={data.edges.length} color="var(--teal)"    bg="var(--paper-2)" />
        </div>
      </div>
      <div style={{ background:'var(--paper-2)', border:'1px solid var(--gold)', borderRadius:9, padding:'12px 14px', marginBottom:16 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'#92400e', marginBottom:6 }}>💡 How to Explore</div>
        <ul style={{ fontSize:12, color:'#78350f', lineHeight:1.7, paddingLeft:16, margin:0 }}>
          <li>Click a <strong>node</strong> → d[X]/dt ODE</li>
          <li>Click an <strong>edge</strong> → kinetic rate law V(n)</li>
          <li>Use filters above to show Protein/Phospho/Gene/mRNA</li>
          <li>Scroll to zoom · drag to pan</li>
        </ul>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Species Types</div>
        {Object.entries(NODE_TYPE_CONFIG).map(([key,cfg]) => (
          <div key={key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:14, height:14, borderRadius:'50%', background:cfg.bg, border:`2px solid ${cfg.color}`, flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:600, color:cfg.color, flex:1 }}>{cfg.label}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'var(--ink)' }}>{typeCount[key]||0}</span>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Reaction Types</div>
        {Object.entries(EDGE_TYPE_CONFIG).map(([key,cfg]) => (
          <div key={key} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
              <div style={{ width:28, height:0, flexShrink:0, borderTop:`3px ${cfg.style==='dotted'?'dotted':cfg.style==='dashed'?'dashed':'solid'} ${cfg.color}` }} />
              <span style={{ fontSize:13, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
              <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700 }}>{reactionCount[key]||0}</span>
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-soft)', paddingLeft:36 }}>{cfg.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NodePanel({ node, data, onClose }) {
  const ntc = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG.protein
  const production  = data.edges.filter(e => e.target === node.id)
  const consumption = data.edges.filter(e => e.source === node.id)
  const [showAllProd, setShowAllProd] = useState(false)
  const [showAllCons, setShowAllCons] = useState(false)
  return (
    <div style={{ padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ background:ntc.bg, border:`2px solid ${ntc.color}`, borderRadius:10, padding:'10px 14px', flex:1, marginRight:8 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:ntc.color, textTransform:'uppercase', letterSpacing:.8, marginBottom:3 }}>{ntc.label}</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:ntc.color, lineHeight:1.2 }}>{node.label}</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-soft)', marginTop:3 }}>{node.degree} connections</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'1px solid var(--line)', borderRadius:6, cursor:'pointer', fontSize:16, color:'var(--ink-soft)', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
      </div>
      <div style={{ background:'var(--paper-2)', border:`2px solid var(--indigo)`, borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--indigo)', marginBottom:8 }}>ODE Governing Equation</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--indigo)', lineHeight:1.9 }}>
          <strong>d[{node.label}]/dt =</strong>
          <div style={{ paddingLeft:10, marginTop:4 }}>
            {production.length>0 && <div style={{ color:'var(--green)' }}>{production.slice(0,5).map(e=>`+V(${e.reactionId})`).join(' ')}{production.length>5&&<span style={{color:'var(--ink-soft)'}}> +…({production.length-5} more)</span>}</div>}
            {consumption.length>0 && <div style={{ color:'var(--crimson)' }}>{consumption.slice(0,5).map(e=>`-V(${e.reactionId})`).join(' ')}{consumption.length>5&&<span style={{color:'var(--ink-soft)'}}> -…({consumption.length-5} more)</span>}</div>}
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        <MiniStat label="Production"  value={production.length}  color="var(--green)"   bg="var(--paper-2)" />
        <MiniStat label="Consumption" value={consumption.length} color="var(--crimson)" bg="var(--paper-2)" />
      </div>
      <ReactionList title="Produced by" items={production}  color="var(--green)"   expanded={showAllProd} onToggle={()=>setShowAllProd(v=>!v)} />
      <ReactionList title="Consumed in" items={consumption} color="var(--crimson)" expanded={showAllCons} onToggle={()=>setShowAllCons(v=>!v)} />
    </div>
  )
}

function EdgePanel({ edge, onClose }) {
  const etc = EDGE_TYPE_CONFIG[edge.reactionType] || EDGE_TYPE_CONFIG.association
  return (
    <div style={{ padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ background:`${etc.color}12`, border:`2px solid ${etc.color}`, borderRadius:10, padding:'10px 14px', flex:1, marginRight:8 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:etc.color, textTransform:'uppercase', letterSpacing:.8, marginBottom:4 }}>{etc.label} Reaction</div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--ink)', lineHeight:1.3 }}>{edge.source} → {edge.target}</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'1px solid var(--line)', borderRadius:6, cursor:'pointer', fontSize:16, color:'var(--ink-soft)', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
      </div>
      <div style={{ background:'var(--paper-2)', border:`2px solid var(--indigo)`, borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--indigo)', marginBottom:8 }}>Kinetic Rate Law</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--indigo)', lineHeight:1.7, wordBreak:'break-word' }}>{edge.equation || 'No equation available'}</div>
      </div>
      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius:9, padding:'10px 12px', fontSize:12, color:'var(--ink-soft)', lineHeight:1.8 }}>
        <div><strong>Reaction:</strong> V({edge.reactionId})</div>
        <div><strong>Type:</strong> {etc.label}</div>
        <div><strong>Pattern:</strong> <span style={{ fontFamily:'var(--font-mono)', fontSize:11 }}>{etc.desc}</span></div>
      </div>
    </div>
  )
}

function ReactionList({ title, items, color, expanded, onToggle }) {
  if (!items.length) return null
  const shown = expanded ? items : items.slice(0,4)
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color, marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>{title} ({items.length})</div>
      {shown.map((e,i) => (
        <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:11, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:5, padding:'4px 8px', marginBottom:3, lineHeight:1.4 }}>
          <span style={{ fontWeight:700, color }}>{e.source} → {e.target}</span><br/>
          <span style={{ color:'var(--ink-soft)', fontSize:10 }}>{e.equation}</span>
        </div>
      ))}
      {items.length>4 && (
        <button onClick={onToggle} style={{ fontSize:12, color:'var(--indigo-2)', background:'none', border:'none', cursor:'pointer', padding:'2px 0', fontFamily:'var(--font-body)' }}>
          {expanded?'▲ Show less':`▼ +${items.length-4} more`}
        </button>
      )}
    </div>
  )
}

/* ── SBML parser (unchanged) ────────────────────────────── */
function parseSBML(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  const NS = 'http://www.sbml.org/sbml/level3/version2/core'
  const HTML_NS = 'http://www.w3.org/1999/xhtml'
  const nodes = []
  for (let s of doc.getElementsByTagNameNS(NS,'species')) {
    const id=s.getAttribute('id'), name=s.getAttribute('name')||id
    let type='protein'
    if(id.endsWith('_g')) type='gene'; else if(id.endsWith('_rna')) type='rna'; else if(id.endsWith('_p')) type='phospho'
    nodes.push({ id, label:name||id, type, degree:0 })
  }
  const edges=[]
  for (let r of doc.getElementsByTagNameNS(NS,'reaction')) {
    const rid=r.getAttribute('id').replace('R','')
    const reactantsEl=r.getElementsByTagNameNS(NS,'listOfReactants')[0]
    const productsEl=r.getElementsByTagNameNS(NS,'listOfProducts')[0]
    const reactants=reactantsEl?Array.from(reactantsEl.getElementsByTagNameNS(NS,'speciesReference')).map(s=>s.getAttribute('species')):[]
    const products=productsEl?Array.from(productsEl.getElementsByTagNameNS(NS,'speciesReference')).map(s=>s.getAttribute('species')):[]
    const noteEl=r.getElementsByTagNameNS(HTML_NS,'p')[0]
    const equation=noteEl?noteEl.textContent.trim():''
    const hasNeg=equation.includes('-K'), hasComplex=equation.includes('|'), noProd=products.length===0
    let reactionType='association'
    if(noProd) reactionType='degradation'
    else if(hasComplex&&hasNeg) reactionType='association'
    else if(hasComplex&&!hasNeg) reactionType='dissociation'
    else if(hasNeg) reactionType='catalysis'
    for(const src of reactants) for(const tgt of products) if(src!==tgt) edges.push({id:`${src}-${tgt}-${rid}`,source:src,target:tgt,reactionId:rid,equation,reactionType})
  }
  const degreeMap={}
  for(const e of edges) { degreeMap[e.source]=(degreeMap[e.source]||0)+1; degreeMap[e.target]=(degreeMap[e.target]||0)+1 }
  for(const n of nodes) n.degree=degreeMap[n.id]||0
  return { nodes, edges }
}
