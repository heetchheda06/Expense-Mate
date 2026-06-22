import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useProfiles } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AiChatBot = () => {
  const { activeProfile } = useProfiles();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hi! I'm your ExpenseMate AI assistant. I have access to your active profile, monthly budget, transactions, and savings goals. How can I help you optimize your finances today?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "How is my budget looking?",
    "Give me AI budget tips",
    "Am I on track for my goals?",
    "Analyze my recent spending"
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim() || !activeProfile) return;

    // Add user message to state
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    try {
      // Map conversation history to format expected by the backend
      const history = messages
        .filter((_, idx) => idx > 0) // Skip welcome message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          text: msg.text
        }));

      const res = await api.post(`/profiles/${activeProfile._id}/ai-recommendations/chat`, {
        message: text,
        history
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
      } else {
        showToast('Sorry, I couldn\'t generate a reply right now.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to AI bot.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!activeProfile) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-white/20 focus:outline-none relative overflow-hidden"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-indigo-600 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] sm:h-[550px] rounded-3xl bg-[#0e131f]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Glowing Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

            {/* Header */}
            <div className="p-4 bg-slate-900/60 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    ExpenseMate AI
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online • Context-Aware
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([
                    {
                      sender: 'bot',
                      text: `Conversation restarted. I am ready to analyze your active profile details again. Ask me anything!`
                    }
                  ])}
                  title="Clear Conversation"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_2px_10px_rgba(99,102,241,0.2)]'
                        : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bot Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 text-slate-400 rounded-2xl rounded-bl-none border border-white/5 px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="text-[10px] font-semibold tracking-wide uppercase">AI is analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-slate-900/30 border-t border-white/5">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-full transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 bg-slate-900/60 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your budget, goals, or savings..."
                className="flex-1 bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !message.trim()}
                className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiChatBot;
