'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

const CATEGORY_CONFIG = {
  Tubular:    { keys:['PT','TAL','DCT','ConnectingTubule','PrincipalCell','InterCellA','InterCellB','MaculaDensa'], color:'#1a56db', bg:'#dbeafe' },
  Glomerular: { keys:['Podocyte','ParietalCell','GlomerularCapillary','Mesengial'],                                color:'#7c3aed', bg:'#ede9fe' },
  Vascular:   { keys:['Endothelial','VasaRecta','Pericyte','VSM'],                                                color:'#059669', bg:'#dcfce7' },
  Immune:     { keys:['Bcell','Tcell','NKT','PlasmaCell','M2machrophage','MonocyteDerivedCell','NonClassicalMonocyte'], color:'#d97706', bg:'#fef3c7' },
  Stromal:    { keys:['Fibroblast'],                                                                               color:'#ef4444', bg:'#fee2e2' },
  Combined:   { keys:['all_data_combined'],                                                                        color:'#6b7280', bg:'#f3f4f6' },
}

const DESC = {
  Bcell:'Humoral immunity & antibody production', ConnectingTubule:'Ion transport bridge between DCT and collecting duct',
  DCT:'Fine-tunes electrolyte reabsorption', Endothelial:'Lines blood vessels, regulates permeability',
  Fibroblast:'ECM synthesis and tissue remodeling', GlomerularCapillary:'Primary filtration barrier capillaries',
  InterCellA:'Acid secretion & base reabsorption', InterCellB:'Base secretion & acid reabsorption',
  M2machrophage:'Anti-inflammatory & tissue repair signaling', MaculaDensa:'Tubuloglomerular feedback sensor',
  Mesengial:'Structural support & filtration regulation', MonocyteDerivedCell:'Innate immune differentiation lineage',
  NKT:'Innate-adaptive bridge lymphocytes', NonClassicalMonocyte:'Patrol monocytes, inflammatory signaling',
  PT:'Bulk reabsorption of filtered solutes', ParietalCell:"Bowman's capsule epithelium",
  Pericyte:'Microvascular tone & angiogenesis control', PlasmaCell:'Terminal B cell — antibody secretion',
  Podocyte:'Slit diaphragm filtration — primary DKD target', PrincipalCell:'Water & sodium transport in collecting duct',
  TAL:'Countercurrent multiplier, NaCl reabsorption', Tcell:'Adaptive cellular immunity effectors',
  VSM:'Tone & contractility of renal vasculature', VasaRecta:'Medullary blood supply, osmotic exchange',
  all_data_combined:'Full DKD atlas — all 24 cell type interactions merged',
}

const CELL_TYPES = Object.entries(CATEGORY_CONFIG).flatMap(([cat, cfg]) =>
  cfg.keys.map(id => ({ id, label: CELL_LABELS[id] || id, category: cat, desc: DESC[id] || '' }))
)
const CATEGORY_ORDER = ['All','Tubular','Glomerular','Vascular','Immune','Stromal','Combined']
const CAT_COUNTS = CELL_TYPES.reduce((a,c) => { a[c.category]=(a[c.category]||0)+1; return a }, {})

export default function AtlasHome() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const visible = CELL_TYPES.filter(c =>
    (filter === 'All' || c.category === filter) &&
    (search === '' || c.label.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      {/* ── Page hero ── */}
      <div style={{
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo-2) 60%, var(--violet) 100%)',
        color: '#fff', padding: '32px 32px 28px',
      }}>
        <div style={{ maxWidth: 'var(--maxw)', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', opacity: .75, marginBottom: 8 }}>
              Diabetic Kidney Disease Map
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 10 }}>
              Parametric ODE Interaction Networks
            </h1>
            <p style={{ fontSize: '.95rem', opacity: .9, maxWidth: 480, lineHeight: 1.65 }}>
              {CELL_TYPES.length} DKD-relevant kidney cell types modelled as parametric ODEs (SBML Level 3).
              Click any cell to visualise its reaction graph and explore kinetic rate equations.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              {n: CELL_TYPES.length, label:'Cell Types'},
              {n:'~480',             label:'ODE Reactions / Cell'},
              {n:'~220',             label:'Molecular Species'},
              {n:'SBML L3',          label:'File Format'},
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,.14)', border:'1px solid rgba(255,255,255,.22)', borderRadius:10, padding:'12px 18px', textAlign:'center', minWidth:120 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700 }}>{s.n}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, opacity:.8, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky filter + search ── */}
      <div style={{ background:'var(--card)', borderBottom:'1px solid var(--line)', padding:'10px 32px', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', position:'sticky', top:'var(--header-h)', zIndex:10, boxShadow:'var(--shadow)' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'.74rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--ink-soft)', marginRight:4 }}>Filter:</span>
        {CATEGORY_ORDER.map(cat => {
          const cfg = CATEGORY_CONFIG[cat]
          const active = filter === cat
          const col = cfg?.color || '#3E2C73'
          const bg  = cfg?.bg    || '#F4ECD8'
          const n   = cat === 'All' ? CELL_TYPES.length : (CAT_COUNTS[cat]||0)
          return (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding:'5px 14px', borderRadius:999, fontSize:'.84rem', fontWeight: active ? 700 : 500,
              fontFamily:'var(--font-body)',
              border: active ? `2px solid ${col}` : '2px solid var(--line)',
              background: active ? bg : 'transparent', color: active ? col : 'var(--ink-soft)',
              cursor:'pointer', transition:'all .15s',
            }}>
              {cat} ({n})
            </button>
          )
        })}
        <div style={{ marginLeft:'auto', position:'relative' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cell types…"
            style={{ padding:'7px 14px 7px 34px', borderRadius:999, fontSize:'.88rem', fontFamily:'var(--font-body)',
              border:'1.5px solid var(--line)', outline:'none', background:'var(--paper-2)', width:210, color:'var(--ink)' }} />
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-soft)', fontSize:13, pointerEvents:'none' }}>🔍</span>
        </div>
      </div>

      {/* ── Cell grid ── */}
      <main style={{ maxWidth:'var(--maxw)', margin:'0 auto', padding:'24px 32px 40px' }}>
        <p style={{ marginBottom:16, color:'var(--ink-soft)', fontFamily:'var(--font-mono)', fontSize:'.78rem', letterSpacing:'.06em' }}>
          Showing <strong style={{ color:'var(--ink)' }}>{visible.length}</strong> cell types
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14 }}>
          {visible.map(cell => {
            const cfg = CATEGORY_CONFIG[cell.category] || { color:'#6b7280', bg:'#f3f4f6' }
            return (
              <div key={cell.id} onClick={()=>router.push(`/network/${cell.id}/`)}
                style={{ background:'var(--card)', border:`1.5px solid var(--line)`, borderRadius:'var(--radius)',
                  padding:'18px', cursor:'pointer', transition:'all .18s', boxShadow:'var(--shadow)' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=cfg.color; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow)' }}
              >
                <span style={{ display:'inline-block', fontFamily:'var(--font-mono)', fontSize:'.7rem', fontWeight:700, letterSpacing:.8,
                  textTransform:'uppercase', padding:'2px 9px', borderRadius:999,
                  background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}44`, marginBottom:10 }}>
                  {cell.category}
                </span>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:600, marginBottom:5, color:'var(--ink)', lineHeight:1.2 }}>
                  {cell.label}
                </h3>
                <p style={{ fontSize:'.86rem', color:'var(--ink-soft)', lineHeight:1.5, marginBottom:14 }}>{cell.desc}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, borderTop:'1px solid var(--line)', paddingTop:10,
                  fontFamily:'var(--font-mono)', fontSize:'.72rem', color:cfg.color, fontWeight:700 }}>
                  <span style={{ background:cfg.bg, border:`1px solid ${cfg.color}55`, borderRadius:4, padding:'1px 7px' }}>ODE</span>
                  <span style={{ opacity:.75 }}>d[X]/dt = ΣV(n)</span>
                  <span style={{ marginLeft:'auto', fontSize:16, color:'var(--violet)' }}>→</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
