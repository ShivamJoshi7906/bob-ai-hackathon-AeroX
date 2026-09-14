"""
MissionGuard AI - Maintenance Decision Tools for IBM Bob
Implements get_maintenance_recommendations and search_maintenance_knowledge.
Enforces transparent data provenance for public maintenance logbooks.
"""
from typing import Dict, Any, List
from .data_adapter import MissionGuardDataAdapter


def get_maintenance_recommendations() -> List[Dict[str, Any]]:
    """
    Retrieve prioritized maintenance actions ranked by operational criticality:
    P1 - CRITICAL (Imminent failure or mission window deficit)
    P2 - URGENT (Narrow buffer or rising sensor anomalies)
    P3 - SCHEDULED (Routine monitoring)
    """
    adapter = MissionGuardDataAdapter()
    assets = adapter.assets_df["asset_id"].tolist()
    maint_list = []

    # Map of representative maintenance knowledge from aviation logbook
    knowledge_lookup = {
        "HPC": {
            "component": "HIGH PRESSURE COMPRESSOR / INTAKE GASKET",
            "action_type": "REMOVED & REPLACED",
            "action_taken": "REMOVED & REPLACED #2 INTAKE GASKET, CHECKED ROTOR ACCUMULATOR CLEARANCE",
            "source_citation": "Annotated Maintenance Logbook (Zenodo 10.5281/zenodo.17903357)",
            "synthetic_linkage_note": "Recommended action derived from public aviation maintenance knowledge base"
        },
        "VALVE": {
            "component": "CYLINDER VALVE & GUIDE",
            "action_type": "CHECKED & CLEANED",
            "action_taken": "CHECKED VALVE GUIDE CLEARANCE, STAKED INTAKE VALVE, VERIFIED COMPRESSION",
            "source_citation": "Annotated Maintenance Logbook (Zenodo 10.5281/zenodo.17903357)",
            "synthetic_linkage_note": "Recommended action derived from public aviation maintenance knowledge base"
        },
        "STANDOFF": {
            "component": "FUEL LINE STAND OFF & CLAMP",
            "action_type": "CLAMPED & SECURED",
            "action_taken": "CLAMPED STAND OFF AT PUSH ROD TUBE, SECURED LACING CORD",
            "source_citation": "Annotated Maintenance Logbook (Zenodo 10.5281/zenodo.17903357)",
            "synthetic_linkage_note": "Recommended action derived from public aviation maintenance knowledge base"
        }
    }

    for aid in assets:
        readiness = adapter.get_asset_readiness_data(aid)
        if not readiness:
            continue

        cat = readiness["readiness_category"]
        risk = readiness["risk_level"]
        buffer = readiness["buffer_cycles"]
        rul = readiness["predicted_rul"]
        req = readiness["mission_cycles_required"]
        mid = readiness["mission_id"]

        if cat == "NOT READY" or risk == "CRITICAL" or buffer < 0:
            priority = "P1"
            priority_label = "CRITICAL"
            issue = f"Severe High Pressure Compressor degradation with negative mission buffer ({buffer:+0.1f} cycles)."
            mission_impact = f"Asset will fail before or during scheduled mission {mid} (requires {req} cycles; RUL is {rul} cycles)."
            rec_action = "Ground asset immediately. Perform comprehensive High Pressure Compressor overhaul and clearance check."
            km = knowledge_lookup["HPC"]
        elif cat == "NEEDS INSPECTION" or risk == "HIGH" or buffer < 15:
            priority = "P2"
            priority_label = "URGENT"
            issue = f"Elevated thermal drift on HPC outlet temp s2 and narrow mission safety buffer ({buffer:+0.1f} cycles)."
            mission_impact = f"Asset at risk of in-mission failure on {mid} without targeted intervention."
            rec_action = "Perform targeted borescope inspection of compressor blades and check fuel nozzle stand-off."
            km = knowledge_lookup["VALVE"]
        elif cat == "READY WITH MONITORING":
            priority = "P3"
            priority_label = "SCHEDULED"
            issue = "Early thermal wear detectable but sufficient mission buffer available."
            mission_impact = f"Cleared for mission {mid} with mandatory turnaround telemetry logging."
            rec_action = "Inspect fuel line standoff clamp and monitor vibration telemetry at next turnaround."
            km = knowledge_lookup["STANDOFF"]
        else:
            continue  # READY assets do not require active maintenance queues

        maint_list.append({
            "priority": priority,
            "priority_label": priority_label,
            "asset_id": aid,
            "risk_level": risk,
            "predicted_rul": rul,
            "readiness_category": cat,
            "buffer_cycles": buffer,
            "issue": issue,
            "mission_impact": mission_impact,
            "recommended_action": rec_action,
            "knowledge_base_procedure": km
        })

    # Sort P1 first, then by buffer cycles ascending (worst deficit first)
    priority_order = {"P1": 1, "P2": 2, "P3": 3}
    maint_list.sort(key=lambda x: (priority_order.get(x["priority"], 99), x["buffer_cycles"]))
    return maint_list


def search_maintenance_knowledge(query: str) -> List[Dict[str, Any]]:
    """
    Search public aviation maintenance logbook knowledge base for relevant historical problem
    descriptions, actions taken, and component repair procedures.
    """
    adapter = MissionGuardDataAdapter()
    maint_df = adapter.maint_df
    q = query.lower()

    matches = maint_df[
        maint_df["problem_description"].str.lower().str.contains(q, na=False) |
        maint_df["action_taken"].str.lower().str.contains(q, na=False) |
        maint_df["component"].str.lower().str.contains(q, na=False)
    ]

    if matches.empty:
        # Fallback to general sample if no exact keyword match
        matches = maint_df.head(5)

    results = []
    for _, r in matches.head(5).iterrows():
        results.append({
            "maintenance_id": r["maintenance_id"],
            "component": r["component"],
            "problem_description": r["problem_description"],
            "action_taken": r["action_taken"],
            "action_type": r["action_type"],
            "problem_type": r["problem_type"],
            "source_dataset": r["source_dataset"],
            "synthetic_linkage": bool(r.get("synthetic_asset_linkage", True)),
            "provenance_disclaimer": "This record is from an open aviation maintenance logbook for general reference; it is not a historical event on a specific C-MAPSS simulated engine."
        })

    return results
