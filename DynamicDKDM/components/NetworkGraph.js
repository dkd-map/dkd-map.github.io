'use client'
import { useEffect, useRef } from 'react'

const NODE_COLORS = {
  protein: { bg: '#dbeafe', border: '#1a56db' },
  phospho: { bg: '#fef3c7', border: '#d97706' },
  gene:    { bg: '#dcfce7', border: '#16a34a' },
  rna:     { bg: '#ede9fe', border: '#7c3aed' },
}

const EDGE_COLORS = {
  association:  '#1a56db',
  dissociation: '#6b7280',
  degradation:  '#ef4444',
  catalysis:    '#059669',
}

const EDGE_STYLES = {
  association:  'solid',
  dissociation: 'dashed',
  degradation:  'dotted',
  catalysis:    'solid',
}

export default function NetworkGraph({ data, filter, searchTerm, onSelectNode, onSelectEdge }) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !data) return

    let isMounted = true

    import('cytoscape').then(({ default: cytoscape }) => {
      if (!isMounted || !containerRef.current) return

      // Destroy existing instance
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null }

      // Build elements — cap at 600 nodes for performance
      const MAX_NODES = 600
      const visibleNodes = data.nodes.slice(0, MAX_NODES)
      const visibleIds = new Set(visibleNodes.map(n => n.id))
      const visibleEdges = data.edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target))

      const elements = [
        ...visibleNodes.map(n => ({
          group: 'nodes',
          data: { id: n.id, label: n.label, cleanSymbol: n.cleanSymbol || n.label, type: n.type, degree: n.degree },
        })),
        ...visibleEdges.map(e => ({
          group: 'edges',
          data: { id: e.id, source: e.source, target: e.target, reactionId: e.reactionId, equation: e.equation, reactionType: e.reactionType },
        })),
      ]

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': (ele) => NODE_COLORS[ele.data('type')]?.bg || '#dbeafe',
              'border-color': (ele) => NODE_COLORS[ele.data('type')]?.border || '#1a56db',
              'border-width': 2,
              'label': 'data(label)',
              'font-size': 9,
              'color': '#111827',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': (ele) => Math.max(30, Math.min(60, 18 + ele.data('degree') * 1.5)),
              'height': (ele) => Math.max(30, Math.min(60, 18 + ele.data('degree') * 1.5)),
              'text-wrap': 'wrap',
              'text-max-width': 55,
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#f59e0b',
              'background-color': '#fef9c3',
            },
          },
          {
            selector: 'edge',
            style: {
              'line-color': (ele) => EDGE_COLORS[ele.data('reactionType')] || '#1a56db',
              'target-arrow-color': (ele) => EDGE_COLORS[ele.data('reactionType')] || '#1a56db',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'width': 1.5,
              'line-style': (ele) => EDGE_STYLES[ele.data('reactionType')] || 'solid',
              'opacity': 0.7,
            },
          },
          {
            selector: 'edge:selected',
            style: { 'width': 3, 'opacity': 1, 'z-index': 10 },
          },
          {
            selector: '.dimmed',
            style: { 'opacity': 0.08 },
          },
        ],
        layout: {
          name: 'cose',
          animate: false,
          randomize: true,
          nodeRepulsion: () => 4500,
          idealEdgeLength: () => 80,
          edgeElasticity: () => 100,
          gravity: 0.25,
          numIter: 1000,
          fit: true,
          padding: 30,
        },
        wheelSensitivity: 0.3,
        minZoom: 0.05,
        maxZoom: 4,
      })

      cyRef.current = cy

      // Click handlers
      cy.on('tap', 'node', (evt) => {
        const n = evt.target.data()
        onSelectNode({ id: n.id, label: n.label, cleanSymbol: n.cleanSymbol, type: n.type, degree: n.degree })
      })
      cy.on('tap', 'edge', (evt) => {
        const e = evt.target.data()
        onSelectEdge({ id: e.id, source: e.source, target: e.target, reactionId: e.reactionId, equation: e.equation, reactionType: e.reactionType })
      })
      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          cy.$(':selected').unselect()
          cy.elements().removeClass('dimmed')
        }
      })

      // Highlight neighbours on select
      cy.on('select', 'node', (evt) => {
        const node = evt.target
        const neighbourhood = node.closedNeighborhood()
        cy.elements().addClass('dimmed')
        neighbourhood.removeClass('dimmed')
      })
      cy.on('unselect', 'node', () => {
        cy.elements().removeClass('dimmed')
      })
    })

    return () => {
      isMounted = false
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null }
    }
  }, [data])

  // Apply filter without rebuilding the graph
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.batch(() => {
      if (filter === 'all') {
        cy.nodes().style({ opacity: 1 })
        cy.edges().style({ opacity: 0.7 })
      } else {
        cy.nodes().forEach(n => {
          n.style({ opacity: n.data('type') === filter ? 1 : 0.08 })
        })
        cy.edges().forEach(e => {
          const srcMatch = cy.$(`#${CSS.escape(e.data('source'))}`).data('type') === filter
          const tgtMatch = cy.$(`#${CSS.escape(e.data('target'))}`).data('type') === filter
          e.style({ opacity: srcMatch || tgtMatch ? 0.7 : 0.04 })
        })
      }
    })
  }, [filter])

  // Apply search highlight — dim non-matching nodes, highlight matches,
  // and center on the first match
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    if (!searchTerm || searchTerm.trim() === '') {
      // Clear search highlight (let filter effect handle opacity)
      cy.nodes().removeClass('search-match')
      return
    }
    const term = searchTerm.trim().toLowerCase()
    cy.batch(() => {
      let firstMatch = null
      cy.nodes().forEach(n => {
        const label = (n.data('label') || '').toLowerCase()
        const cleanSym = (n.data('cleanSymbol') || '').toLowerCase()
        const isMatch = label.includes(term) || cleanSym.includes(term)
        if (isMatch) {
          n.style({ opacity: 1, 'border-color': '#f59e0b', 'border-width': 4 })
          if (!firstMatch) firstMatch = n
        } else {
          n.style({ opacity: 0.06, 'border-color': n.data('type') ? undefined : undefined, 'border-width': 2 })
        }
      })
      cy.edges().style({ opacity: 0.03 })
      if (firstMatch) {
        cy.animate({ center: { eles: firstMatch }, zoom: 1.5 }, { duration: 300 })
        firstMatch.select()
      }
    })
  }, [searchTerm])

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#f8faff' }} />
      {/* Zoom hint */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.85)',
        padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
        pointerEvents: 'none',
      }}>
        Scroll to zoom · Drag to pan · Click node/edge for details
      </div>
    </div>
  )
}
