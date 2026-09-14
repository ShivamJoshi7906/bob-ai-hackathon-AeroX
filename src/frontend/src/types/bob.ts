export interface BobQueryResponse {
  answer: string;
  evidence: {
    asset_id?: string;
    predicted_rul?: number;
    mission_cycles_required?: number;
    buffer_cycles?: number;
    risk_level?: string;
    readiness_category?: string;
    recommended_action?: string;
  };
  tools_called: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bob';
  timestamp: string;
  text: string;
  evidence?: BobQueryResponse['evidence'];
  tools_called?: string[];
}
