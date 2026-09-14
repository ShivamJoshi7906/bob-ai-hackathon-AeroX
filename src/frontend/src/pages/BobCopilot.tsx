import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Wrench,
  ShieldAlert,
  Terminal,
  Cpu,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import { ChatMessage } from '../types/bob';
import { api } from '../api/client';

interface BobCopilotProps {
  initialQuery?: string;
  initialAssetId?: string;
  onSelectAsset?: (assetId: string) => void;
}

const PRESET_CHIPS = [
  'Which assets are not ready?',
  'Why is AC-003 not ready?',
  'What should maintenance do first?',
  'Which assets are at risk before the next mission?',
  'Show me highest-risk assets.',
];

export const BobCopilot: React.FC<BobCopilotProps> = ({
  initialQuery,
  initialAssetId,
  onSelectAsset,
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bob',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Greetings Commander. I am IBM Bob Copilot, specialized in aerospace predictive maintenance, RUL estimation, and mission readiness reasoning. How can I assist your operational decisions today?',
      tools_called: [],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.queryBob(queryText, initialAssetId);

      const bobMsg: ChatMessage = {
        id: `bob-${Date.now()}`,
        sender: 'bob',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        evidence: res.evidence,
        tools_called: res.tools_called,
      };

      setMessages(prev => [...prev, bobMsg]);
    } catch (err) {
      console.error('Error querying Bob:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bob-err-${Date.now()}`,
          sender: 'bob',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Apologies, an error occurred while connecting to the Bob Copilot reasoning backend.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black font-mono text-white tracking-wider">
                IBM BOB COPILOT
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded uppercase tracking-wider">
                AI CONVERSATIONAL TERMINAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive natural language decision-support engine for flight readiness and maintenance priority logic
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>IBM BOB MCP REASONER ONLINE</span>
        </div>
      </div>

      {/* Preset Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
          One-Click Operational Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip)}
              className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono transition shadow-sm text-left flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Canvas */}
      <div className="glass-panel p-6 min-h-[450px] max-h-[600px] overflow-y-auto space-y-6 border border-slate-800/80">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 text-[11px] font-mono text-slate-400">
              <span>{msg.sender === 'user' ? 'COMMANDER' : 'IBM BOB COPILOT'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-3xl p-4 rounded-xl text-xs leading-relaxed space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-br-none shadow-md'
                  : 'bg-slate-950/90 border border-slate-800 text-slate-100 rounded-bl-none shadow-lg'
              }`}
            >
              {/* Text Output */}
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Tools Called Pill (Bob Only) */}
              {msg.tools_called && msg.tools_called.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-mono text-slate-400">TOOLS EXECUTED:</span>
                  {msg.tools_called.map((tool, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Live Evidence Card */}
              {msg.evidence && (
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 font-mono text-xs text-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 border-b border-slate-800 pb-1.5">
                    <span>LIVE EVIDENCE RETRIEVED</span>
                    {msg.evidence.asset_id && (
                      <button
                        onClick={() => onSelectAsset && onSelectAsset(msg.evidence!.asset_id!)}
                        className="hover:underline text-cyan-300"
                      >
                        Target: {msg.evidence.asset_id} →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {msg.evidence.predicted_rul !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">PREDICTED RUL</span>
                        <span className="font-bold text-rose-400">{msg.evidence.predicted_rul} cycles</span>
                      </div>
                    )}
                    {msg.evidence.buffer_cycles !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">MISSION BUFFER</span>
                        <span className={`font-bold ${msg.evidence.buffer_cycles < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {msg.evidence.buffer_cycles} cycles
                        </span>
                      </div>
                    )}
                    {msg.evidence.risk_level && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">RISK LEVEL</span>
                        <span className="font-bold text-rose-400">{msg.evidence.risk_level}</span>
                      </div>
                    )}
                    {msg.evidence.readiness_category && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">READINESS</span>
                        <span className="font-bold text-amber-400">{msg.evidence.readiness_category}</span>
                      </div>
                    )}
                  </div>

                  {msg.evidence.recommended_action && (
                    <div className="pt-1.5 text-[11px] text-emerald-300 border-t border-slate-800/80">
                      <strong>Action:</strong> {msg.evidence.recommended_action}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Bob Copilot is reasoning over telemetry and executing REST tool calls...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendQuery(inputQuery);
        }}
        className="glass-panel p-3 flex items-center space-x-3"
      >
        <Terminal className="w-5 h-5 text-cyan-400 ml-2" />
        <input
          type="text"
          placeholder="Ask Bob Copilot (e.g., 'Which assets are not ready?')..."
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-2 transition"
        >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
