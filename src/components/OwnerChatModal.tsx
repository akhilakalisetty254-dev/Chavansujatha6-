import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, MapPin, CheckCheck } from 'lucide-react';
import { DirectMessage, CampusItem } from '../types';

interface OwnerChatModalProps {
  ownerName: string;
  item?: CampusItem | null;
  onClose: () => void;
}

export const OwnerChatModal: React.FC<OwnerChatModalProps> = ({
  ownerName,
  item,
  onClose,
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([
    {
      id: 'm1',
      sender: 'owner',
      text: `Hey! Thanks for reaching out about ${item ? item.name : 'the item'}. It's currently in my hostel room and ready to borrow. When do you need it?`,
      timestamp: '10:14 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate owner typing back
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const ownerReplies = [
        `Sounds great! I have class till 3 PM today. Does meeting at the Central Library ground floor foyer work for you?`,
        `Sure thing! I can bring the original carrying case and cables too. Remember to bring your college ID for the quick handover confirmation.`,
        `Works for me! I will keep it charged up so you can test it on the spot before taking it.`,
        `Awesome! See you then. Feel free to inspect everything when we meet!`,
      ];
      const randomReply = ownerReplies[Math.floor(Math.random() * ownerReplies.length)];

      const replyMsg: DirectMessage = {
        id: `dm-rep-${Date.now()}`,
        sender: 'owner',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full h-[600px] max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {ownerName.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <span>{ownerName}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active on Campus • Replies in ~10 mins</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item context strip */}
        {item && (
          <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
            <span className="truncate font-semibold">Discussing: {item.name}</span>
            <span className="font-bold text-indigo-700 shrink-0">₹{item.price}/day</span>
          </div>
        )}

        {/* Messages body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40">
          {messages.map((m) => {
            const isMe = m.sender === 'me';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                  <span>{m.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none w-24 shadow-2xs text-gray-400 text-xs">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${ownerName.split(' ')[0]}...`}
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
