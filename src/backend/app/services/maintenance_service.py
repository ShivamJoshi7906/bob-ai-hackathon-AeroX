from sqlalchemy.orm import Session
from src.backend.app.services.prediction_service import prediction_service
from src.backend.app.services.readiness_service import evaluate_asset_readiness
from src.backend.app.models.asset import Asset
from src.backend.app.models.maintenance import MaintenanceRecord

def get_prioritized_maintenance(db: Session, priority_filter: str = None) -> list[dict]:
    assets = db.query(Asset).all()
    queue = []

    for asset in assets:
        readiness = evaluate_asset_readiness(db, asset.asset_id)
        rul = readiness["predicted_rul"]
        category = readiness["readiness_category"]
        risk = readiness["risk_level"]

        # Rank tier
        if category == "NOT READY" or risk == "CRITICAL":
            p_code = "P1"
            p_label = "CRITICAL"
            issue = f"Severe HPC degradation on {asset.asset_id} with imminent mission threat"
            impact = f"Will fail during upcoming mission (requires {readiness['mission_cycles_required']} cycles)"
            action = "Immediate teardown and replacement of HPC rotor assembly"
            comp = "INTAKE GASKET / COMPRESSOR"
            act_type = "REMOVED & REPLACED"
            act_taken = "REMOVED & REPLACED HPC GASKET AND VERIFIED CLEARANCES"
        elif category == "NEEDS INSPECTION" or risk == "HIGH":
            p_code = "P2"
            p_label = "URGENT"
            issue = f"Combustor Outlet Temperature exceedance & pressure drift on {asset.asset_id}"
            impact = "Potential thermal stress erosion during high payload takeoff"
            action = "Borescope inspection of compressor blades & fuel flow calibration"
            comp = "COMBUSTOR LINER & NOZZLE"
            act_type = "INSPECTED & REPLACED"
            act_taken = "REPLACED FUEL NOZZLE ASSEMBLY AND RE-COATED BARRIER"
        elif category == "READY WITH MONITORING" or risk == "MEDIUM":
            p_code = "P3"
            p_label = "SCHEDULED"
            issue = f"Routine telemetry drift on {asset.asset_id}"
            impact = "Minor fuel consumption drift; routine maintenance required"
            action = "Scheduled servicing at next turnaround; monitor telemetry"
            comp = "LUBRICATION SUMP"
            act_type = "SERVICED"
            act_taken = "DRAINED LUBRICANT SUMP AND CLEANED CHIP DETECTOR"
        else:
            continue

        item = {
            "priority": p_code,
            "priority_label": p_label,
            "asset_id": asset.asset_id,
            "risk_level": risk,
            "predicted_rul": rul,
            "readiness_category": category,
            "issue": issue,
            "mission_impact": impact,
            "recommended_action": action,
            "knowledge_base_match": {
                "relevant_component": comp,
                "action_type": act_type,
                "action_taken": act_taken,
                "synthetic_linkage_note": "Derived from public aircraft maintenance knowledge base"
            }
        }
        queue.append(item)

    # Sort queue: P1 first, then P2, then P3
    priority_order = {"P1": 1, "P2": 2, "P3": 3}
    queue.sort(key=lambda x: (priority_order.get(x["priority"], 99), x["predicted_rul"]))

    if priority_filter and priority_filter.upper() != "ALL":
        queue = [i for i in queue if i["priority"] == priority_filter.upper() or i["priority_label"] == priority_filter.upper()]

    return queue
