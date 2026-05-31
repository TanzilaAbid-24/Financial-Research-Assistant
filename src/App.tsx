import React, { useState, useEffect } from 'react';
import { AgentState } from './types';
import { COMPANYS_DATA } from './data/mockFinancialData';
import AgentWorkflow from './components/AgentWorkflow';
import DashboardTab from './components/DashboardTab';
import SECOverviewTab from './components/SECOverviewTab';
import EarningsTab from './components/EarningsTab';
import CompetitorTab from './components/CompetitorTab';
import RiskTab from './components/RiskTab';
import ReportsTab from './components/ReportsTab';
import NewsTab from './components/NewsTab';
import FloatingChatbot from './components/FloatingChatbot';
import { LayoutDashboard, FileSearch, MessageSquare, GitCompare, ShieldAlert, FileMinus, Key, HelpCircle, Activity, Globe, Menu, X, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [selectedTicker, setSelectedTicker] = useState<string>('AAPL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'sec' | 'earnings' | 'competitors' | 'risk' | 'reports'>('dashboard');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Get active company info for high-fidelity header KPI indicators
  const activeCompany = COMPANYS_DATA.find(c => c.ticker === selectedTicker) || COMPANYS_DATA[0];
  const activeYearData = activeCompany.financials[activeCompany.financials.length - 1];
  const prevYearData = activeCompany.financials[activeCompany.financials.length - 2];
  const growthRate = ((activeYearData.revenue - prevYearData.revenue) / prevYearData.revenue) * 100;

  // Global Agent Logging and Workflow States
  const [agentState, setAgentState] = useState<AgentState>({
    currentAgent: 'Idle',
    logs: [
      { timestamp: new Date().toLocaleTimeString(), message: 'System startup complete. Financial Research Assistant ready.', type: 'info' }
    ]
  });

  const pushAgentLog = (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => {
    setAgentState(prev => {
      const activeAgent = state === 'active' 
        ? (agentName as any) 
        : (state === 'success' ? 'Idle' : prev.currentAgent);
      
      const newLog = {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type: state === 'active' ? 'info' : (state === 'warning' ? 'warning' : 'success') as any
      };

      return {
        currentAgent: activeAgent,
        logs: [newLog, ...prev.logs].slice(0, 50) // keep top 50 logs
      };
    });
  };

  useEffect(() => {
    // Healthcheck check if server exposes a loaded Gemini API key
    const checkServerHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHasApiKey(data.geminiKey === 'configured');
        }
      } catch (err) {
        console.error('Core server check failed:', err);
      } finally {
        setIsLoadingHealth(false);
      }
    };
    checkServerHealth();
  }, []);

  const tabs = [
    { id: 'dashboard', name: 'Performance Workspace', icon: LayoutDashboard },
    { id: 'news', name: 'Real-time News Feed', icon: Globe },
    { id: 'sec', name: 'SEC RAG Research', icon: FileSearch },
    { id: 'earnings', name: 'Earnings Conversations', icon: MessageSquare },
    { id: 'competitors', name: 'Competitor Benchmark', icon: GitCompare },
    { id: 'risk', name: 'CRO Risk Stressors', icon: ShieldAlert },
    { id: 'reports', name: 'Research Memo Generator', icon: FileMinus },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans select-none antialiased overflow-x-hidden">
      
      {/* 1. Sidebar - Left Side (Visible on Desktop, Drawer overlay on Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-[#1e293b] transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header Branding */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
              <h1 className="text-white font-bold text-base tracking-tight italic">Financial Desk</h1>
            </div>
            {/* Close button for mobile sidebar */}
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] mt-1.5 uppercase tracking-widest text-[#6366f1] font-bold">LANGGRAPH FINANCIAL ENGINE</p>
        </div>

        {/* Sidebar Scrollable Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1.5 tracking-wider font-mono">Core Analysis Workspace</div>
          <div className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  id={`btn-tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileSidebarOpen(false); // Auto-close on mobile selection
                    pushAgentLog('Supervisor', 'info', `Supervisor route change requested: switching frame context to ${tab.name}.`);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-sans font-medium tracking-tight transition duration-150 outline-none cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600/15 text-white font-bold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Real-time Agent Grid in Sidebar */}
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1.5 tracking-wider font-mono mt-5">Agent Diagnostics Grid</div>
          <div className="px-3 space-y-2 mt-2 text-[11px] font-sans">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Supervisor</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agentState.currentAgent === 'Supervisor' ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={agentState.currentAgent === 'Supervisor' ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
                  {agentState.currentAgent === 'Supervisor' ? 'ACTIVE' : 'STANDBY'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Filing Analyst</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agentState.currentAgent === 'FilingAgent' ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={agentState.currentAgent === 'FilingAgent' ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {agentState.currentAgent === 'FilingAgent' ? 'ACTIVE' : 'STANDBY'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Earnings Analyst</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agentState.currentAgent === 'EarningsAgent' ? 'bg-blue-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={agentState.currentAgent === 'EarningsAgent' ? 'text-blue-400 font-semibold' : 'text-slate-500'}>
                  {agentState.currentAgent === 'EarningsAgent' ? 'ACTIVE' : 'STANDBY'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">CRO Risk Advisor</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agentState.currentAgent === 'RiskAgent' ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={agentState.currentAgent === 'RiskAgent' ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                  {agentState.currentAgent === 'RiskAgent' ? 'ACTIVE' : 'STANDBY'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Research Architect</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agentState.currentAgent === 'ResearchAgent' ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`}></span>
                <span className={agentState.currentAgent === 'ResearchAgent' ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                  {agentState.currentAgent === 'ResearchAgent' ? 'ACTIVE' : 'STANDBY'}
                </span>
              </span>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer User Info block */}
        <div className="p-4 bg-[#090d16] mt-auto shrink-0 border-t border-slate-900">
          <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 text-xs shadow-md">
              JD
            </div>
            <div className="flex-grow overflow-hidden leading-tight">
              <p className="text-xs text-white font-medium">Senior Quant</p>
              <p className="text-[10px] text-slate-400 truncate">tanzilaabid24@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar slide out */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-45 md:hidden"
        />
      )}

      {/* 2. Main Area Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Core Top Navigation Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-xs">
          
          {/* Quick Header Left side: Mobile Toggler & Current Selection details */}
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition shrink-0"
              title="Open Navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="leading-tight">
              <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">WORKSPACE MONITOR</h2>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-sm font-semibold truncate text-slate-900 font-display tracking-tight">
                  {activeCompany.name} ({activeCompany.ticker})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Right side: Ticker Market Stats & Compile Memorandum Direct CTA */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            
            {/* Dynamic Financial Overview metrics from COMPANYS_DATA */}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-[#6366f1] font-bold uppercase tracking-wider font-mono">FINANCIAL RATIO</p>
              <p className="text-xs font-mono font-semibold text-slate-800">
                ${(activeYearData.revenue / 1000).toFixed(1)}B Rev 
                <span className="text-emerald-600 ml-1.5 font-bold">
                  (+{growthRate.toFixed(1)}%)
                </span>
              </p>
            </div>

            {/* Quick action button to trigger reports/compilation */}
            <button
              onClick={() => {
                setActiveTab('reports');
                pushAgentLog('Supervisor', 'info', 'Supervisor quick-action triggered: switching context to report compiler.');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 font-sans text-xs font-semibold text-white px-3.5 py-2 rounded-lg transition-all duration-150 shadow-sm shadow-indigo-100 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Compile Report</span>
              <span className="xs:hidden">Report</span>
            </button>
          </div>
        </header>

        {/* Global Key Alert for missing Gemini Secrets */}
        {!isLoadingHealth && !hasApiKey && (
          <div className="bg-indigo-900 border-b border-indigo-950 text-white p-3.5 text-center flex items-center justify-center gap-2 text-[11px] font-sans">
            <Key className="w-3.5 h-3.5 text-indigo-300 shrink-0 animate-bounce" />
            <span>
              <strong>Gemini API Key Required:</strong> Real-time indexing and diagnostics require a valid API key. Add <strong>GEMINI_API_KEY</strong> under <strong>Settings &gt; Secrets (Top Right)</strong> to activate Gemini models!
            </span>
          </div>
        )}

        {/* Main Section Content Wrapper */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Agent workflow terminal monitor */}
          <AgentWorkflow agentState={agentState} />

          {/* Render Active Tab components with absolute layout perfection */}
          <div className="transition-opacity duration-300">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                selectedTicker={selectedTicker} 
                onSelectTicker={(tick) => {
                  setSelectedTicker(tick);
                  pushAgentLog('Supervisor', 'success', `Active workspace corporate focus updated to ${tick}.`);
                }} 
              />
            )}

            {activeTab === 'news' && (
              <NewsTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}

            {activeTab === 'sec' && (
              <SECOverviewTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}

            {activeTab === 'earnings' && (
              <EarningsTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}

            {activeTab === 'competitors' && (
              <CompetitorTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}

            {activeTab === 'risk' && (
              <RiskTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab 
                selectedTicker={selectedTicker} 
                onSetAgentActive={pushAgentLog} 
              />
            )}
          </div>
        </main>

        {/* Main Area Footer bar */}
        <footer className="h-12 bg-white border-t border-slate-200 px-6 md:px-8 mt-auto flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-sans tracking-tight">
          <div className="flex gap-2 sm:gap-4 truncate">
            <span>LangChain &amp; LangGraph</span>
            <span className="hidden sm:inline">•</span>
            <span>Google Gemini 3.5 Models</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">Active Host: Cloud Run Ingress</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-600 text-[10px]">API Connection Secure</span>
          </div>
        </footer>

        {/* Global Floating AI Chatbot co-analyst */}
        <FloatingChatbot />

      </div>
    </div>
  );
}
