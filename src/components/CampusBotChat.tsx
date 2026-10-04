import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  GraduationCap,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Tag,
  X,
} from 'lucide-react';
import { ChatMessage, TaskMode, CampusItem } from '../types';

interface CampusBotChatProps {
  initialItemContext?: CampusItem | null;
  onClearItemContext?: () => void;
  onNavigateToItem?: (item: CampusItem) => void;
}

export const CampusBotChat: React.FC<CampusBotChatProps> = ({
  initialItemContext,
  onClearItemContext,
  onNavigateToItem,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('campus_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Hey there! I'm **CampusBot**, your peer-to-peer rental advisor on CampusShare ♻️.\n\nI can help you:\n- **Find & Compare** gear across campus instead of buying new\n- **Recommend fair rental pricing** & refundable security deposits\n- **Draft polite messages** to owners for pickups, exams, or extensions\n- **Check safety** & safe handover spots (Library, Student Center, Quad)\n\nWhat are you looking to rent or share today?`,
        timestamp: 'Just now',
        modelUsed: 'gemini-3.5-flash',
        taskMode: 'general',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [taskMode, setTaskMode] = useState<TaskMode>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [itemContext, setItemContext] = useState<CampusItem | null>(initialItemContext || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync itemContext if prop changes
  useEffect(() => {
    if (initialItemContext) {
      setItemContext(initialItemContext);
    }
  }, [initialItemContext]);

  // Save conversation history
  useEffect(() => {
    localStorage.setItem('campus_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested prompt chips based on task mode & item context
  const getPromptSuggestions = () => {
    if (itemContext) {
      return [
        `Is ₹${itemContext.price}/day a fair price for ${itemContext.name}?`,
        `Draft a polite request message to ${itemContext.owner.split(' ')[0]} to borrow this for 3 days`,
        `What safety precautions should I check before picking up ${itemContext.name}?`,
        `How much refundable deposit should I expect for this?`,
      ];
    }

    if (taskMode === 'fast') {
      return [
        '⚡ Draft a friendly WhatsApp message asking if an iron is still available tonight',
        '⚡ Quick checklist for borrowing a DSLR camera before handing over money',
        '⚡ Polite message asking for a 1-day rental extension due to exam delay',
      ];
    }

    if (taskMode === 'complex') {
      return [
        '🧠 Calculate fair weekly rental & deposit for a ₹45,000 Sony mirrorless camera',
        '🧠 How to handle accidental minor scratches on a rented drafting kit during return?',
        '🧠 What are standard campus rental agreement clauses for expensive electronics?',
      ];
    }

    return [
      '🎓 What are the best items to rent during semester exam week?',
      '🎓 Where are the safest handover spots on campus after 7 PM?',
      '🎓 How can I earn pocket money by renting my unused scientific calculator?',
      '🎓 Draft a borrow request for a football tournament this Sunday',
    ];
  };

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history to backend Gemini endpoint
      const payload = {
        messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
        taskType: taskMode,
        itemContext: itemContext
          ? {
              name: itemContext.name,
              cat: itemContext.cat,
              price: itemContext.price,
              condition: itemContext.condition,
              owner: itemContext.owner,
              location: itemContext.location,
              desc: itemContext.desc,
            }
          : undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini.');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model,
        taskMode,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'CampusBot is temporarily unreachable.');
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        text: `⚠️ I had trouble connecting to the Gemini server. (${err.message}). Please check the API configuration or try again in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'offline-fallback',
        taskMode,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear conversation history?')) {
      localStorage.removeItem('campus_chat_history');
      setMessages([
        {
          id: 'msg-welcome-new',
          role: 'model',
          text: `Conversation reset! What can I help you with today on CampusShare?`,
          timestamp: 'Just now',
          modelUsed: 'gemini-3.5-flash',
          taskMode: 'general',
        },
      ]);
    }
  };

  // Format markdown helper (bold, bullets)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-indigo-500 font-bold">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[82vh] bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:px-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
            <Bot className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base tracking-tight">CampusBot AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Multi-Turn Active
              </span>
            </div>
            <div className="text-[11px] text-indigo-200">
              Peer Rental Advisor • Negotiation • Handover Safety
            </div>
          </div>
        </div>

        {/* Task Mode / Model Selector Pills */}
        <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-2xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setTaskMode('fast')}
            title="Fast Tasks: Quick drafting & templates using gemini-3.1-flash-lite"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              taskMode === 'fast'
                ? 'bg-amber-400 text-gray-900 shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast (Lite)</span>
          </button>

          <button
            type="button"
            onClick={() => setTaskMode('general')}
            title="General Tasks: Recommendations & Campus FAQ using gemini-3.5-flash"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              taskMode === 'general'
                ? 'bg-indigo-500 text-white shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>General (3.5 Flash)</span>
          </button>

          <button
            type="button"
            onClick={() => setTaskMode('complex')}
            title="Complex Tasks: Valuation, wear-and-tear & deposit disputes using gemini-3.1-pro-preview"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              taskMode === 'complex'
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Complex (3.1 Pro)</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Item Context Banner (if discussing a specific item) */}
      {itemContext && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 flex items-center justify-between text-xs text-purple-900 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Tag className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="font-semibold">Context:</span>
            <span className="font-extrabold truncate">{itemContext.name}</span>
            <span className="text-purple-600 font-bold shrink-0">
              (₹{itemContext.price}/day • {itemContext.owner})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToItem && (
              <button
                onClick={() => onNavigateToItem(itemContext)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View Item
              </button>
            )}
            <button
              onClick={() => {
                setItemContext(null);
                onClearItemContext?.();
              }}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col group">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{renderFormattedText(msg.text)}</div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Metadata & Timestamp */}
                <div
                  className={`flex items-center gap-2 mt-1 text-[10px] text-gray-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-mono text-[9px] border border-gray-200">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 bg-white border border-gray-200 rounded-2xl rounded-tl-none text-xs text-gray-600 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>CampusBot is thinking with {taskMode === 'complex' ? 'gemini-3.1-pro-preview' : taskMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
          Suggestions:
        </span>
        {getPromptSuggestions().map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(suggestion)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
        {errorMsg && (
          <div className="mb-2 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask CampusBot (${taskMode === 'complex' ? 'Deep 3.1 Pro Reasoning' : taskMode === 'fast' ? 'Fast 3.1 Lite Drafter' : 'General 3.5 Flash Concierge'})...`}
            className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs sm:text-sm text-gray-800 border border-gray-200 focus:border-indigo-500 rounded-2xl outline-none transition-all placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
