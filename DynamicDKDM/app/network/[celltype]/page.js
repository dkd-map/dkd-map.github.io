import NetworkClient from './NetworkClient'

const CELL_KEYS = [
  'Bcell','ConnectingTubule','DCT','Endothelial','Fibroblast','GlomerularCapillary',
  'InterCellA','InterCellB','M2machrophage','MaculaDensa','Mesengial','MonocyteDerivedCell',
  'NKT','NonClassicalMonocyte','PT','ParietalCell','Pericyte','PlasmaCell','Podocyte',
  'PrincipalCell','TAL','Tcell','VSM','VasaRecta','all_data_combined',
]

export function generateStaticParams() {
  return CELL_KEYS.map(celltype => ({ celltype }))
}

export default function Page({ params }) {
  return <NetworkClient celltype={params.celltype} />
}
