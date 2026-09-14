"""
MissionGuard AI - IBM Bob Decision Tools Registry
Exports all 9 MCP-compliant decision tools and tool definitions.
"""
from .fleet_tools import get_fleet_summary, get_not_ready_assets
from .asset_tools import (
    get_asset_status,
    get_asset_prediction,
    get_asset_risk,
    get_asset_sensor_trends,
    get_upcoming_mission
)
from .maintenance_tools import (
    get_maintenance_recommendations,
    search_maintenance_knowledge
)

# Registry mapping tool names to callable functions
BOB_TOOL_FUNCTIONS = {
    "get_fleet_summary": get_fleet_summary,
    "get_not_ready_assets": get_not_ready_assets,
    "get_asset_status": get_asset_status,
    "get_asset_prediction": get_asset_prediction,
    "get_asset_risk": get_asset_risk,
    "get_asset_sensor_trends": get_asset_sensor_trends,
    "get_upcoming_mission": get_upcoming_mission,
    "get_maintenance_recommendations": get_maintenance_recommendations,
    "search_maintenance_knowledge": search_maintenance_knowledge
}

# MCP (Model Context Protocol) standard tool declarations for IBM Bob
BOB_TOOL_DEFINITIONS = [
    {
        "name": "get_fleet_summary",
        "description": "Retrieve operational fleet-level readiness metrics, risk breakdown, and urgent maintenance totals across all 38 turbofan assets.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "get_not_ready_assets",
        "description": "Retrieve all assets currently classified as NOT READY or NEEDS INSPECTION, including their predicted RUL, mission requirements, and buffer deficits.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "get_asset_status",
        "description": "Retrieve operational specifications, current operating cycle, service age, total operating hours, and readiness category for a specific asset ID (e.g. 'AC-003').",
        "parameters": {
            "type": "object",
            "properties": {
                "asset_id": {
                    "type": "string",
                    "description": "The synthetic asset identifier, formatted as 'AC-0NN' (e.g. 'AC-003')."
                }
            },
            "required": ["asset_id"]
        }
    },
    {
        "name": "get_asset_prediction",
        "description": "Retrieve ML-predicted Remaining Useful Life (RUL), 30-cycle early-warning failure probability, and degradation stage for an asset.",
        "parameters": {
            "type": "object",
            "properties": {
                "asset_id": {
                    "type": "string",
                    "description": "The synthetic asset identifier (e.g. 'AC-003')."
                }
            },
            "required": ["asset_id"]
        }
    },
    {
        "name": "get_asset_risk",
        "description": "Retrieve failure risk tier (LOW, MEDIUM, HIGH, CRITICAL) and dominant degrading sensor telemetry channels for an asset.",
        "parameters": {
            "type": "object",
            "properties": {
                "asset_id": {
                    "type": "string",
                    "description": "The synthetic asset identifier (e.g. 'AC-003')."
                }
            },
            "required": ["asset_id"]
        }
    },
    {
        "name": "get_asset_sensor_trends",
        "description": "Retrieve recent sensor telemetry drift percentages across key physical channels (HPC temp s2, combustor temp s3, core speed s9, static pressure s11) compared to healthy baselines.",
        "parameters": {
            "type": "object",
            "properties": {
                "asset_id": {
                    "type": "string",
                    "description": "The synthetic asset identifier (e.g. 'AC-003')."
                }
            },
            "required": ["asset_id"]
        }
    },
    {
        "name": "get_upcoming_mission",
        "description": "Retrieve upcoming scheduled mission window start/end dates, required operating cycle duration, and calculated safety buffer for an asset.",
        "parameters": {
            "type": "object",
            "properties": {
                "asset_id": {
                    "type": "string",
                    "description": "The synthetic asset identifier (e.g. 'AC-003')."
                }
            },
            "required": ["asset_id"]
        }
    },
    {
        "name": "get_maintenance_recommendations",
        "description": "Retrieve prioritized maintenance action queue ranked by operational urgency (P1 Critical, P2 Urgent, P3 Scheduled), with mission impact and knowledge base procedure matches.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "search_maintenance_knowledge",
        "description": "Search public aviation maintenance log knowledge base for verified repair procedures, problem descriptions, and corrective actions by keyword.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search keyword, component name, or fault term (e.g. 'compressor', 'gasket', 'valve')."
                }
            },
            "required": ["query"]
        }
    }
]

__all__ = [
    "get_fleet_summary",
    "get_not_ready_assets",
    "get_asset_status",
    "get_asset_prediction",
    "get_asset_risk",
    "get_asset_sensor_trends",
    "get_upcoming_mission",
    "get_maintenance_recommendations",
    "search_maintenance_knowledge",
    "BOB_TOOL_FUNCTIONS",
    "BOB_TOOL_DEFINITIONS"
]
