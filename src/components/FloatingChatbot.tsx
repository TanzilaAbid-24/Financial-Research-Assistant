import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, RefreshCw, Layers } from 'lucide-react';
import { ChatMessage } from '../types';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to the Quantitative Research Suite. I am your financial co-analyst. Ask me any targeted follow-up calculations, competitor moat inquiries, or SEC disclosure questions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `m-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error('API key unconfigured or invalid.');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `m-${Date.now()}-bot`,
        role: 'assistant',
        content: data.answer || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      // Elegant key unconfigured explanation/demo answer to ensure perfect preview functionality
      const botMessageFallback: ChatMessage = {
        id: `m-${Date.now()}-bot`,
        role: 'assistant',
        content: `I've registered your question: "${text}". To fetch fully customized, live analytical insights from the Google Gemini 2.5 API, make sure to add your **GEMINI_API_KEY** in the Secrets panel on the left navigation bar. Under local baseline settings, I can confirm that active corporate files (AAPL, MSFT, TSLA, NVDA, META) are fully modeled in the diagnostic workspace. Switch workspace tabs to view full comparisons, risk vectors, and custom reports.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessageFallback]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Icon */}
      <button
        id="btn-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-950 border border-slate-900 hover:border-slate-950 text-white shadow-xl transition-all duration-200 outline-none select-none cursor-pointer transform hover:scale-105"
      >
        {isOpen ? <X className="w-5 h-5 animate-pulse" /> : <MessageSquare className="w-5 h-5 animate-pulse" />}
        {!isOpen && <span className="text-xs font-sans font-bold tracking-wide pr-1">Quant Chatbot</span>}
      </button>

      {/* Floating Chat Panel Drawer */}
      {isOpen && (
        <div 
          id="chatbot-drawer"
          className="fixed bottom-20 right-0 sm:right-6 w-full sm:w-[410px] max-w-full h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in z-50 mr-0 sm:mr-0 max-sm:bottom-16 max-sm:rounded-none max-sm:h-[calc(100vh-4rem)]"
        >
          {/* Header Panel */}
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between border-b border-slate-950">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600/30 p-1.5 rounded-lg border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Workspace Quantitative Assistant</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Analyst co-adviser live sessions</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Messages Feed scroll segment */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans shadow-xs ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 border border-indigo-700 text-white rounded-br-none' 
                    : 'bg-white border border-slate-150 text-slate-800 rounded-bl-none leading-relaxed'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pl-1">
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Compiler is structuring response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Shelf */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-white space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Analyst Inquiries:</span>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handleSuggestClick("Compare NVDA and TSLA strategic R&D spendings")}
                  className="text-left py-1 px-2 border border-slate-150 rounded text-[10px] font-sans text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  "Compare NVDA and TSLA R&D budgets"
                </button>
                <button 
                  onClick={() => handleSuggestClick("Summarize the standard SEC 10-K sections")}
                  className="text-left py-1 px-2 border border-slate-150 rounded text-[10px] font-sans text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  "What are the mandatory SEC 10-K sections?"
                </button>
              </div>
            </div>
          )}

          {/* Input field with Send controls */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask ratios, competitors, models..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 hover:border-slate-300 transition font-sans"
            />
            <button 
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
