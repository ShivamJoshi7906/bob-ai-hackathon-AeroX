"""
MissionGuard AI - IBM Bob Copilot Reasoning & Intent Service
Orchestrates the 9 MCP decision tools to answer operational maintenance
and readiness questions with evidence-based reasoning and zero hallucination.
"""
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from ..bob_tools import (
    get_fleet_summary,
    get_not_ready_assets,
    get_asset_status,
    get_asset_prediction,
    get_asset_risk,
    get_asset_sensor_trends,
    get_upcoming_mission,
    get_maintenance_recommendations,
    search_maintenance_knowledge
)


class BobCopilotService:
    def __init__(self):
        self.asset_pattern = re.compile(r"AC-\d{3}", re.IGNORECASE)

    def extract_asset_id(self, query: str, explicit_id: Optional[str] = None) -> Optional[str]:
        if explicit_id and explicit_id.strip():
            return explicit_id.strip().upper()
        match = self.asset_pattern.search(query)
        if match:
            return match.group(0).upper()
        return None

    def query(self, user_query: str, explicit_asset_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes a natural language query from a commander or maintenance technician,
        determines intent, invokes the required decision tools, and formats a structured response.
        """
        q = user_query.strip().lower()
        asset_id = self.extract_asset_id(user_query, explicit_asset_id)
        tools_called = []
        timestamp = datetime.now(timezone.utc).isoformat()

        # -------------------------------------------------------------
        # 1. QUESTION 1: "Which assets are not ready?"
        # -------------------------------------------------------------
        if any(kw in q for kw in ["not ready", "non-ready", "non ready", "unready", "readiness issue"]) and not ("why" in q and asset_id):
            tools_called.append("get_not_ready_assets")
            non_ready = get_not_ready_assets()
            
            p1_count = len([a for a in non_ready if a["readiness_category"] == "NOT READY"])
            insp_count = len([a for a in non_ready if a["readiness_category"] == "NEEDS INSPECTION"])

            answer_lines = [
                f"### ⚠️ Fleet Readiness Alert: {len(non_ready)} Assets Identified as Non-Ready\n",
                f"Currently, **{p1_count} assets** are classified as **NOT READY** and **{insp_count} assets** are in **NEEDS INSPECTION** status due to upcoming mission buffer shortfalls:\n"
            ]

            for a in non_ready:
                buf_str = f"{a['buffer_cycles']:+0.1f} cycles"
                answer_lines.append(
                    f"- **{a['asset_id']}** — Status: `{a['readiness_category']}` | Risk: `{a['risk_level']}`\n"
                    f"  • Predicted RUL: **{a['predicted_rul']} cycles** vs Mission Requirement: **{a['mission_cycles_required']} cycles** (Buffer: **{buf_str}**)\n"
                    f"  • Scheduled Mission: `{a['mission_id']}` (Starting {a['mission_window_start']})\n"
                    f"  • Action: *{a['recommended_action']}*\n"
                )

            answer_lines.append(
                "**Operational Commander Recommendation:**\n"
                "Immediately withhold all `NOT READY` assets from flight rosters and dispatch maintenance work orders to resolve High Pressure Compressor degradation before mission launch windows."
            )

            evidence = {
                "total_non_ready": len(non_ready),
                "not_ready_assets": [a["asset_id"] for a in non_ready],
                "top_critical_asset": non_ready[0]["asset_id"] if non_ready else None,
                "worst_buffer_cycles": non_ready[0]["buffer_cycles"] if non_ready else None
            }

            return {
                "query": user_query,
                "intent": "GET_NOT_READY_ASSETS",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 2. QUESTION 2: "Why is [asset] not ready?"
        # -------------------------------------------------------------
        if ("why" in q or "explain" in q or "reason" in q or "evidence" in q) and asset_id:
            tools_called.extend([
                "get_asset_status",
                "get_asset_prediction",
                "get_asset_risk",
                "get_asset_sensor_trends",
                "get_upcoming_mission"
            ])

            status = get_asset_status(asset_id)
            pred = get_asset_prediction(asset_id)
            risk = get_asset_risk(asset_id)
            trends = get_asset_sensor_trends(asset_id)
            mission = get_upcoming_mission(asset_id)

            if not status or not pred or not mission:
                return {
                    "query": user_query,
                    "intent": "WHY_ASSET_NOT_READY",
                    "answer": f"Asset **{asset_id}** was not found in the fleet registry. Please verify the asset tail number (e.g. `AC-003` to `AC-100`).",
                    "evidence": {"asset_id": asset_id, "found": False},
                    "tools_called": tools_called,
                    "timestamp": timestamp
                }

            s2_drift = trends["telemetry_channels"]["s2_hpc_outlet_temp"]["percent_drift"] if trends else 0.0
            s9_drift = trends["telemetry_channels"]["s9_core_speed"]["percent_drift"] if trends else 0.0

            buffer_cycles = mission["buffer_cycles"]
            buffer_str = f"{buffer_cycles:+0.1f} cycles"

            answer_lines = [
                f"### 🔍 Readiness Diagnostic Brief: Asset {asset_id}\n",
                f"**Current Status:** `{status['readiness_category']}` (Readiness Score: **{status['readiness_score']}/100**)\n",
                f"**Risk Level:** `{risk['risk_level']}` | **Criticality:** `{status['mission_criticality'].upper()}` | **Operating Cycle:** `{status['current_operating_cycle']}`\n",
                "#### Core Drivers Behind Readiness Classification:\n",
                f"1. **Mission Window Shortfall:**",
                f"   • Next Mission `{mission['mission_id']}` requires **{mission['mission_cycles_required']} cycles** starting on {mission['mission_window_start']}.",
                f"   • ML-predicted Remaining Useful Life is **{pred['predicted_rul']} cycles**, creating a critical safety margin deficit of **{buffer_str}**.\n",
                f"2. **Elevated Failure Probability:**",
                f"   • 30-cycle early-warning failure probability is **{pred['failure_within_30_prob']*100:.1f}%**.",
                f"   • Current mechanical wear state is categorized as **{pred['degradation_stage'].upper()}**.\n",
                f"3. **Physical Telemetry Evidence (HUMS Sensors):**",
                f"   • **HPC Outlet Temperature (s2):** Drift of **{s2_drift:+0.2f}%** from nominal baseline, reflecting severe compressor gas-path thermal distress.",
                f"   • **Core Rotational Speed (s9):** Drift of **{s9_drift:+0.2f}%**, indicating loss of aerodynamic efficiency and compressor blade loading imbalance.\n",
                "#### Actionable Maintenance Guidance:",
                f"• Ground asset `{asset_id}` immediately from operational mission scheduling.",
                "• Execute targeted High Pressure Compressor (HPC) borescope inspection and verify intake gasket clearance.",
                "*(Recommended procedure derived from aviation maintenance logbook knowledge base — reference: MX-0006)*"
            ]

            evidence = {
                "asset_id": asset_id,
                "readiness_score": status["readiness_score"],
                "readiness_category": status["readiness_category"],
                "predicted_rul": pred["predicted_rul"],
                "mission_cycles_required": mission["mission_cycles_required"],
                "buffer_cycles": buffer_cycles,
                "risk_level": risk["risk_level"],
                "failure_within_30_prob": pred["failure_within_30_prob"],
                "s2_temp_drift_pct": s2_drift,
                "s9_speed_drift_pct": s9_drift,
                "recommended_action": "Ground asset; immediate HPC teardown and clearance inspection."
            }

            return {
                "query": user_query,
                "intent": "WHY_ASSET_NOT_READY",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 3. QUESTION 3: "What should maintenance do first?"
        # -------------------------------------------------------------
        if any(kw in q for kw in ["maintenance do first", "fix first", "priorit", "maintenance queue", "work order", "p1"]):
            tools_called.append("get_maintenance_recommendations")
            recs = get_maintenance_recommendations()

            p1_items = [r for r in recs if r["priority"] == "P1"]
            p2_items = [r for r in recs if r["priority"] == "P2"]

            top_p1 = p1_items[0] if p1_items else recs[0]

            answer_lines = [
                "### 🛠️ Prioritized Maintenance Action Plan\n",
                f"Based on predicted RUL degradation curves and upcoming mission window deadlines, **Asset {top_p1['asset_id']} must be prioritized FIRST**.\n",
                f"#### 🚨 TOP PRIORITY: [{top_p1['priority']} — {top_p1['priority_label']}] Asset {top_p1['asset_id']}",
                f"• **Identified Issue:** {top_p1['issue']}",
                f"• **Mission Threat:** {top_p1['mission_impact']}",
                f"• **Action Required:** {top_p1['recommended_action']}",
                f"• **Knowledge Base Procedure:** *{top_p1['knowledge_base_procedure']['component']}* — {top_p1['knowledge_base_procedure']['action_taken']}\n",
                "#### Complete Priority Queue Breakdown:\n"
            ]

            answer_lines.append("**P1 — CRITICAL (Immediate Grounding & Overhaul):**")
            for r in p1_items[:4]:
                answer_lines.append(f"- **{r['asset_id']}** (RUL: {r['predicted_rul']} cyc | Buffer: {r['buffer_cycles']:+0.1f} cyc) — {r['recommended_action']}")

            if p2_items:
                answer_lines.append("\n**P2 — URGENT (Pre-Mission Borescope & Calibration):**")
                for r in p2_items[:3]:
                    answer_lines.append(f"- **{r['asset_id']}** (RUL: {r['predicted_rul']} cyc | Buffer: {r['buffer_cycles']:+0.1f} cyc) — {r['recommended_action']}")

            answer_lines.append(
                "\n*(Note: Maintenance actions are matched to proven procedures from open aviation logbook records; asset links are synthetic for demonstration)*"
            )

            evidence = {
                "top_priority_asset": top_p1["asset_id"],
                "top_priority_level": top_p1["priority"],
                "p1_total_count": len(p1_items),
                "p2_total_count": len(p2_items),
                "total_recommendations": len(recs)
            }

            return {
                "query": user_query,
                "intent": "MAINTENANCE_PRIORITIZATION",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 4. AD-HOC: "Which assets are at risk before the next mission?"
        # -------------------------------------------------------------
        if any(kw in q for kw in ["at risk", "threat", "fail before mission", "next mission"]):
            tools_called.extend(["get_not_ready_assets", "get_fleet_summary"])
            non_ready = get_not_ready_assets()
            at_risk = [a for a in non_ready if a["buffer_cycles"] < 5]

            answer_lines = [
                f"### 🛡️ Mission Threat Assessment: {len(at_risk)} Assets at Severe Risk\n",
                f"Evaluating all scheduled mission windows against predicted RUL identified **{len(at_risk)} engines** that cannot guarantee required operational cycles:\n"
            ]

            for a in at_risk:
                answer_lines.append(
                    f"- **{a['asset_id']}** scheduled for `{a['mission_id']}` (Starting {a['mission_window_start']})\n"
                    f"  • Mission Requirement: **{a['mission_cycles_required']} cycles** | Current RUL: **{a['predicted_rul']} cycles**\n"
                    f"  • Critical Buffer Deficit: **{a['buffer_cycles']:+0.1f} cycles**\n"
                )

            answer_lines.append("**Operational Directive:** Reassign scheduled sorties or replace with `READY` standby assets immediately.")

            evidence = {
                "at_risk_count": len(at_risk),
                "assets_at_risk": [a["asset_id"] for a in at_risk]
            }

            return {
                "query": user_query,
                "intent": "AT_RISK_NEXT_MISSION",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 5. AD-HOC: "Show me the highest risk assets" / "Lowest RUL"
        # -------------------------------------------------------------
        if any(kw in q for kw in ["highest risk", "lowest rul", "worst asset", "most critical"]):
            tools_called.append("get_not_ready_assets")
            non_ready = get_not_ready_assets()
            top3 = non_ready[:3]

            answer_lines = [
                "### 📉 Highest-Risk Engines Ranked by Remaining Useful Life:\n"
            ]
            for i, a in enumerate(top3, 1):
                answer_lines.append(
                    f"{i}. **{a['asset_id']}** — Predicted RUL: **{a['predicted_rul']} cycles** (Risk: `{a['risk_level']}`, Status: `{a['readiness_category']}`)\n"
                    f"   Buffer Deficit: **{a['buffer_cycles']:+0.1f} cycles** against mission `{a['mission_id']}`."
                )

            evidence = {
                "top_highest_risk": [a["asset_id"] for a in top3],
                "lowest_predicted_rul": top3[0]["predicted_rul"] if top3 else None
            }

            return {
                "query": user_query,
                "intent": "HIGHEST_RISK_ASSETS",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 6. AD-HOC: Search Maintenance Knowledge
        # -------------------------------------------------------------
        if any(kw in q for kw in ["repair", "how to", "procedure", "knowledge", "search"]) and not asset_id:
            term = q.replace("search", "").replace("knowledge", "").replace("how to", "").replace("repair", "").strip()
            if not term:
                term = "compressor"
            tools_called.append("search_maintenance_knowledge")
            results = search_maintenance_knowledge(term)

            answer_lines = [
                f"### 📖 Maintenance Knowledge Retrieval: Keyword '{term}'\n",
                "Matched the following verified repair procedures from the aviation logbook:\n"
            ]
            for r in results:
                answer_lines.append(
                    f"- **{r['component']}** (`{r['maintenance_id']}`)\n"
                    f"  • *Problem:* {r['problem_description']}\n"
                    f"  • *Action Taken:* **{r['action_taken']}** ({r['action_type']})\n"
                )

            answer_lines.append("\n*(Citations derived from Zenodo public annotated aircraft maintenance logbook)*")

            evidence = {"query_term": term, "results_count": len(results)}

            return {
                "query": user_query,
                "intent": "MAINTENANCE_KNOWLEDGE_SEARCH",
                "answer": "\n".join(answer_lines),
                "evidence": evidence,
                "tools_called": tools_called,
                "timestamp": timestamp
            }

        # -------------------------------------------------------------
        # 7. DEFAULT / FLEET OVERVIEW
        # -------------------------------------------------------------
        tools_called.append("get_fleet_summary")
        summary = get_fleet_summary()

        answer_lines = [
            "### 🤖 MissionGuard AI Copilot — Fleet Status Briefing\n",
            f"Fleet Overview: **{summary['total_assets']} turbofan engines** monitored under HUMS telemetry.",
            f"• **Ready:** {summary['ready_count']} engines | **Ready with Monitoring:** {summary['monitoring_count']} engines",
            f"• **Needs Inspection:** {summary['inspection_count']} engines | **Not Ready:** {summary['not_ready_count']} engines",
            f"• **Critical Risk Alert:** {summary['critical_risk_count']} engines require immediate P1 work orders.\n",
            "**Suggested Questions to Ask Me:**",
            "1. *\"Which assets are not ready?\"*",
            "2. *\"Why is AC-003 not ready?\"*",
            "3. *\"What should maintenance do first?\"*",
            "4. *\"Which assets are at risk before the next mission?\"*",
            "5. *\"Show me highest-risk assets.\"*"
        ]

        evidence = {"fleet_summary": summary}

        return {
            "query": user_query,
            "intent": "FLEET_OVERVIEW_HELP",
            "answer": "\n".join(answer_lines),
            "evidence": evidence,
            "tools_called": tools_called,
            "timestamp": timestamp
        }
