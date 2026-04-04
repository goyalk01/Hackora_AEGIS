"""
attribution_engine.py
Ranks nodes and identifies the most likely command node.
Uses weighted scoring based on network topology and behavioral fingerprints.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone


# Attribution weights (must sum reasonably for interpretable scores)
W1_OUT_DEGREE = 0.4
W2_FINGERPRINT_MATCHES = 0.35
W3_CENTRALITY = 0.25


def detect_command_node(graph_payload: dict, fingerprint_payload: dict) -> dict:
    """
    Analyze graph topology and fingerprint clusters to identify the command node.
    
    Returns attribution result with:
    - command_node: Most likely controlling node
    - confidence_score: 0.0 to 0.99 confidence
    - reasons: Human-readable attribution reasons
    - candidates: Top 5 candidates with detailed scores
    - top_candidates: Simplified list for UI display
    """
    nodes = graph_payload.get("nodes", []) if isinstance(graph_payload, dict) else []
    links = graph_payload.get("links", []) if isinstance(graph_payload, dict) else []
    centrality = graph_payload.get("centrality", {}) if isinstance(graph_payload, dict) else {}

    fingerprints = (
        fingerprint_payload.get("fingerprints", [])
        if isinstance(fingerprint_payload, dict)
        else []
    )

    if not nodes:
        return {
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "command_node": None,
            "confidence_score": 0.0,
            "reasons": ["No graph data available"],
            "candidates": [],
            "top_candidates": [],
        }

    # Build fingerprint match counts per node
    fp_matches_by_node = defaultdict(int)
    for fp in fingerprints:
        occurrences = int(fp.get("occurrences", 0))
        for node_id in fp.get("nodes", []):
            fp_matches_by_node[str(node_id)] += occurrences

    # Build outgoing interval data for timing analysis
    outgoing_intervals_by_node = defaultdict(list)
    outgoing_counts_by_node = defaultdict(int)
    for link in links:
        src = str(link.get("source", "")).strip()
        interval = link.get("interval", -1)
        count = int(link.get("count", 1))
        if src:
            outgoing_counts_by_node[src] += count
            if isinstance(interval, (int, float)) and interval >= 0:
                outgoing_intervals_by_node[src].append(float(interval))

    candidates = []
    for node in nodes:
        node_id = str(node.get("node_id") or node.get("id") or "").strip()
        if not node_id:
            continue

        out_degree = int(node.get("out_degree", 0))
        fp_matches = int(fp_matches_by_node.get(node_id, 0))
        cent = float(centrality.get(node_id, 0.0))
        total_requests = outgoing_counts_by_node.get(node_id, 0)

        # Noise filter: ignore nodes with very weak signals
        if out_degree <= 0 and fp_matches <= 1:
            continue

        # Calculate weighted score
        score = (out_degree * W1_OUT_DEGREE) + (fp_matches * W2_FINGERPRINT_MATCHES) + (cent * W3_CENTRALITY)

        # Build detailed attribution reasons
        reasons = []
        
        if cent >= 0.2:
            reasons.append("High centrality")
        elif cent >= 0.05:
            reasons.append("Moderate centrality")
            
        if fp_matches >= 10:
            reasons.append("Repeated fingerprint")
        elif fp_matches >= 3:
            reasons.append("Multiple fingerprint matches")

        # Check for timing consistency (indicates automation)
        intervals = outgoing_intervals_by_node.get(node_id, [])
        if len(intervals) >= 3:
            span = max(intervals) - min(intervals)
            if span <= 5:
                reasons.append("Highly consistent timing")
            elif span <= 15:
                reasons.append("Consistent intervals")

        # High connection volume
        if out_degree >= 25:
            reasons.append("High outgoing connections")
        elif out_degree >= 15:
            reasons.append("Significant connection count")

        # Default reason if none matched
        if not reasons:
            reasons.append("Elevated network activity")

        candidates.append(
            {
                "node_id": node_id,
                "score": round(score, 4),
                "out_degree": out_degree,
                "fingerprint_matches": fp_matches,
                "centrality": round(cent, 4),
                "reasons": reasons,
            }
        )

    if not candidates:
        return {
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "command_node": None,
            "confidence_score": 0.0,
            "reasons": ["No strong command node signal found"],
            "candidates": [],
            "top_candidates": [],
        }

    # Sort by score descending
    candidates.sort(key=lambda c: c["score"], reverse=True)
    top = candidates[0]

    # Calculate confidence based on score distribution
    max_score = candidates[0]["score"] if candidates else 1.0
    second_score = candidates[1]["score"] if len(candidates) > 1 else 0.0
    
    # Higher confidence if there's a clear winner
    score_gap = (max_score - second_score) / max_score if max_score > 0 else 0
    base_confidence = 0.55 + (max_score / (max_score + 3.0))
    confidence = min(0.99, round(base_confidence + (score_gap * 0.15), 2))

    # Build simplified top candidates for UI
    top_candidates = [
        {"node": c["node_id"], "score": round(c["score"], 4)}
        for c in candidates[:3]
    ]

    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "command_node": top["node_id"],
        "confidence_score": confidence,
        "reasons": top["reasons"],
        "candidates": candidates[:5],
        "top_candidates": top_candidates,
    }
