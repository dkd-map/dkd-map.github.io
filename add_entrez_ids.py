"""
Add NCBI Gene IDs (entrezId) to assets/data/gene-index.json.

KEGG GENES entries for human are keyed as  hsa:<NCBI Gene ID>  — a number, not a
symbol. Once each gene carries entrezId, gene-search.js can build a documented
KEGG deep link (https://www.kegg.jp/entry/hsa:4868) instead of a search guess,
and an exact NCBI Gene link instead of a ?term= search.

Run once, from the repo root, on a machine with internet access:

    python add_entrez_ids.py

Writes gene-index.json in place and leaves a .bak alongside it.
Requires: pip install requests
"""

import json
import shutil
from pathlib import Path

import requests

INDEX = Path("assets/data/gene-index.json")
MYGENE = "https://mygene.info/v3/query"
BATCH = 500


def fetch_entrez_ids(symbols):
    """Map gene symbols -> NCBI Gene IDs via mygene.info (human only)."""
    mapping = {}
    for i in range(0, len(symbols), BATCH):
        chunk = symbols[i:i + BATCH]
        resp = requests.post(
            MYGENE,
            data={
                "q": ",".join(chunk),
                "scopes": "symbol,alias",
                "fields": "entrezgene,symbol",
                "species": "human",
            },
            timeout=60,
        )
        resp.raise_for_status()
        for hit in resp.json():
            query = hit.get("query")
            eid = hit.get("entrezgene")
            # Keep the first hit only; mygene returns best match first.
            if eid and query and query not in mapping:
                mapping[query] = str(eid)
        print(f"  resolved {len(mapping)}/{min(i + BATCH, len(symbols))}")
    return mapping


def main():
    data = json.loads(INDEX.read_text(encoding="utf-8"))
    symbols = sorted(data)
    print(f"{len(symbols)} symbols in index")

    mapping = fetch_entrez_ids(symbols)

    hits = 0
    for sym, gene in data.items():
        eid = mapping.get(sym)
        if eid:
            gene["entrezId"] = eid
            hits += 1

    missing = [s for s in symbols if s not in mapping]
    print(f"\nmatched {hits}/{len(symbols)}")
    if missing:
        print(f"unmatched ({len(missing)}): {', '.join(missing[:25])}"
              f"{' …' if len(missing) > 25 else ''}")
        print("These keep the search-style NCBI link and get no KEGG link — "
              "check whether they are deprecated or non-HGNC symbols.")

    shutil.copy(INDEX, INDEX.with_suffix(".json.bak"))
    INDEX.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"\nwrote {INDEX} (backup at {INDEX.with_suffix('.json.bak')})")


if __name__ == "__main__":
    main()
