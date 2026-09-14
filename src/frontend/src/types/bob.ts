export interface BobEvidence {
  asset_id?: string;
  predicted_rul?: number;
  mission_cycles_required?: number;
  buffer_cycles?: number;
  risk_level?: string;
  readiness_category?: string;
  recommended_action?: string;
  [key: string]: any;
}

export interface BobQueryResponse {
  query?: string;
  intent?: string;
  answer: string;
  evidence?: BobEvidence;
  tools_called: string[];
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bob';
  timestamp: string;
  text: string;
  evidence?: BobQueryResponse['evidence'];
  tools_called?: string[];
}
