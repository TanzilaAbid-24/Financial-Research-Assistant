import React from 'react';
import { AgentState } from '../types';
import { Network, Database, MessageSquare, AlertTriangle, FileText, Settings, HelpCircle, Activity } from 'lucide-react';

interface AgentWorkflowProps {
  agentState: AgentState;
}

export default function AgentWorkflow({ agentState }: AgentWorkflowProps) {
  const agents = [
    { id: 'Supervisor', name: 'Supervisor Agent', icon: Settings, x: 250, y: 50, color: 'border-slate-800 bg-slate-900 text-slate-100' },
    { id: 'FilingAgent', name: 'Filing Analyst', icon: Database, x: 80, y: 180, color: 'border-emerald-700 bg-emerald-950 text-emerald-200' },
    { id: 'EarningsAgent', name: 'Earnings Analyst', icon: MessageSquare, x: 190, y: 180, color: 'border-blue-700 bg-blue-950 text-blue-200' },
    { id: 'CompetitorAgent', name: 'Competitor Analyst', icon: Network, x: 310, y: 180, color: 'border-indigo-700 bg-indigo-950 text-indigo-300' },
    { id: 'RiskAgent', name: 'Risk Officer', icon: AlertTriangle, x: 420, y: 180, color: 'border-rose-700 bg-rose-950 text-rose-200' },
    { id: 'ResearchAgent', name: 'Research Architect', icon: FileText, x: 250, y: 300, color: 'border-amber-700 bg-amber-950 text-amber-200' },
  ];

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 mb-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="font-sans font-medium tracking-tight">LangGraph Orchestrator Real-time Monitor</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Current Active State:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold ${
            agentState.currentAgent === 'Idle' 
              ? 'bg-slate-900 text-slate-400 border border-slate-800' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse'
          }`}>
            {agentState.currentAgent}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* SVG Graph Visualization */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900/80 rounded-lg p-3 relative flex items-center justify-center min-h-[340px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 340">
            {/* Draw Paths from Supervisor to Sub-Agents */}
            {agents.slice(1, 5).map((agent, i) => {
              const active = agentState.currentAgent === 'Supervisor' || agentState.currentAgent === agent.id;
              return (
                <path
                  key={i}
                  d={`M 250 80 Q ${(250 + agent.x) / 2} 115 ${agent.x} 180`}
                  fill="none"
                  stroke={active ? '#10b981' : '#334155'}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={active ? '5,5' : '0'}
                  className={active ? 'animate-[dash_1s_linear_infinite]' : ''}
                />
              );
            })}

            {/* Draw Paths from Sub-Agents to Research Agent */}
            {agents.slice(1, 5).map((agent, i) => {
              const active = agentState.currentAgent === agent.id || agentState.currentAgent === 'ResearchAgent';
              return (
                <path
                  key={i}
                  d={`M ${agent.x} 180 Q ${(agent.x + 250) / 2} 240 250 300`}
                  fill="none"
                  stroke={active ? '#eab308' : '#344155'}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={active ? '4,4' : '0'}
                  className={active ? 'animate-[dash_1s_linear_infinite]' : ''}
                />
              );
            })}
          </svg>

          {/* Node Renderers */}
          <div className="relative w-[500px] h-[340px] flex-shrink-0">
            {agents.map((agent) => {
              const isActive = agentState.currentAgent === agent.id;
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  style={{ left: `${agent.x - 65}px`, top: `${agent.y - 25}px` }}
                  className={`absolute w-[130px] p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-300 ${agent.color} ${
                    isActive 
                      ? 'scale-105 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400' 
                      : 'opacity-70 grayscale-[25%]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isActive ? 'animate-bounce' : ''}`} />
                  <span className="text-[10px] font-sans font-semibold tracking-tight">{agent.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Console Logs Status */}
        <div className="lg:col-span-5 flex flex-col flex-grow bg-slate-900/60 border border-slate-900 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 mb-2 border-b border-slate-900 pb-1.5 flex items-center justify-between">
            <span>Graph Activity Terminal Logs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </span>
          <div className="flex-grow overflow-y-auto max-h-[240px] space-y-1.5 pr-1 font-mono text-[10px] leading-relaxed">
            {agentState.logs.length === 0 ? (
              <div className="text-slate-600 text-center py-10">Agent orchestrator is offline. Execute research queries to track live graph state resolution.</div>
            ) : (
              agentState.logs.map((log, index) => (
                <div key={index} className={`flex items-start gap-1 p-1 rounded ${
                  log.type === 'success' ? 'text-emerald-400 bg-emerald-950/20' :
                  log.type === 'warning' ? 'text-amber-400 bg-amber-950/20' :
                  'text-slate-300'
                }`}>
                  <span className="text-[9px] text-slate-500">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
