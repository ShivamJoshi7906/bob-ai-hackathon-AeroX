"""
MissionGuard AI - IBM Bob Copilot FastAPI Router
Exposes POST /api/bob/query and GET /api/bob/tools
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from ..services.bob_service import BobCopilotService
from ..bob_tools import BOB_TOOL_DEFINITIONS

router = APIRouter(prefix="/api/bob", tags=["IBM Bob Copilot"])
bob_service = BobCopilotService()


class BobQueryRequest(BaseModel):
    query: str = Field(..., json_schema_extra={"example": "Why is AC-003 not ready?"}, description="Natural language question for Bob Copilot")
    asset_id: Optional[str] = Field(None, json_schema_extra={"example": "AC-003"}, description="Optional explicit asset identifier")


class BobQueryResponse(BaseModel):
    query: str
    intent: str
    answer: str
    evidence: Dict[str, Any]
    tools_called: List[str]
    timestamp: str


@router.post("/query", response_model=BobQueryResponse)
def query_bob(request: BobQueryRequest):
    """
    Submit a decision-support query to IBM Bob Copilot.
    Bob analyzes intent, invokes structured domain tools, and returns an evidence-grounded answer.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    
    result = bob_service.query(request.query, request.asset_id)
    return result


@router.get("/tools")
def get_available_tools():
    """
    Returns the list of 9 MCP-standard decision tools available to IBM Bob Copilot.
    """
    return {
        "tools_count": len(BOB_TOOL_DEFINITIONS),
        "tools": BOB_TOOL_DEFINITIONS
    }
