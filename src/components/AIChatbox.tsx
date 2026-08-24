"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Mic, Send, X, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationContext';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  image?: string;
}

export default function AIChatbox() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: t('chat.welcome'),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync welcome message if language changes
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[0]?.id === 'welcome') {
        newMessages[0].content = t('chat.welcome');
      }
      return newMessages;
    });
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const [contextLocation, setContextLocation] = useState<string>('');

  const generateSmartResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // Handle quick greetings instantly without hitting the API to save time
    if (/^(hi|hello|hey|hii|namaste|hola)(\s|$)/.test(lowerQuery)) {
      return "Hello! I am your Localite AI assistant ✨ How can I help you explore today?";
    }

    try {
      // Craft a system prompt to guide the AI's behavior
      const systemPrompt = `You are Localite AI, a highly intelligent, friendly travel and local exploration assistant. 
Keep your answers direct, helpful, and very concise (maximum 2-3 sentences). Do not use markdown. 
User asks: ${query}`;

      // Call the free, no-auth LLM endpoint (Pollinations AI)
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemPrompt)}`);
      
      if (res.ok) {
        const text = await res.text();
        return text;
      } else {
        throw new Error('API Error');
      }
    } catch (e) {
      // Ultimate Fallback if the free API is down
      const fallbacks = [
        "I'm having a little trouble connecting to my brain right now! Could you try asking again?",
        "Oops, my connection dropped for a second! What were you asking?",
        "I can definitely help you find the best spots, but I'm offline at the moment. Try again in a few seconds!"
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), type: 'user', content: inputValue };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    generateSmartResponse(inputValue).then(botResponse => {
      // Simulate AI thinking delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: botResponse
        }]);
      }, 1200);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        content: "What's in this image?",
        image: result
      }]);
      
      setIsTyping(true);

      // Mock AI response for image
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "That looks like an interesting place! I can analyze landmarks, menus, or street signs to help you out."
        }]);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Mock voice recognition turning into text
      setTimeout(() => {
        setIsListening(false);
        setInputValue("What's the best place for dinner around here?");
      }, 3000);
    }
  };

  return (
    <div className="fixed bottom-4 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 w-[320px] sm:w-[360px] h-[450px] sm:h-[520px] rounded-3xl shadow-2xl flex flex-col mb-4 overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-[#0a0a0a] p-3.5 flex items-center justify-between relative overflow-hidden border-b border-gray-800">
              <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(255,111,97,0.3)]">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-sora font-bold text-[15px] leading-tight">{t('chat.title')}</h3>
                  <p className="text-white/80 text-[11px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> {t('chat.online')}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-1">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 transition-colors text-white"
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-foreground text-background dark:bg-white dark:text-black rounded-br-sm' 
                        : 'bg-white dark:bg-[#1a1a20] text-foreground border border-gray-100 dark:border-white/5 rounded-bl-sm'
                    }`}
                  >
                    {msg.image && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                        <img src={msg.image} alt="Uploaded" className="w-full h-auto max-h-[150px] object-cover" />
                      </div>
                    )}
                    <p className="text-[13px] font-inter whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#1a1a20] border border-gray-100 dark:border-white/5 rounded-2xl rounded-bl-sm p-3 flex gap-1 items-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#0f0f13] border-t border-gray-100 dark:border-white/5">
              <form onSubmit={handleSend} className="relative flex items-end gap-1.5">
                <input 
                  type="file" 
                  accept="image/*"
                  capture="environment" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-gray-400 hover:text-accent bg-gray-50 dark:bg-white/5 hover:bg-accent/10 rounded-xl transition-colors flex-shrink-0"
                  title="Upload image"
                >
                  <Camera className="w-4 h-4" />
                </button>
                
                <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center overflow-hidden focus-within:ring-1 focus-within:ring-accent focus-within:border-accent transition-all">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Listening..." : t('chat.placeholder')}
                    className="w-full bg-transparent px-3 py-2.5 outline-none text-[13px] text-foreground placeholder:text-gray-400"
                    disabled={isListening}
                  />
                  <button 
                    type="button" 
                    onClick={toggleMic}
                    className={`p-2.5 transition-colors ${isListening ? 'text-accent animate-pulse bg-accent/10' : 'text-gray-400 hover:text-accent'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isListening}
                  className="p-2.5 bg-accent text-white rounded-xl shadow-md shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 bg-gradient-to-tr from-accent to-purple-500 rounded-full shadow-[0_4px_15px_rgba(255,111,97,0.15)] flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="w-6 h-6 relative z-10 text-white" /> : <Sparkles className="w-6 h-6 relative z-10 text-white group-hover:animate-pulse" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-[#0a0a0a]"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
