'use client';

import { useState, useEffect, useRef } from 'react';
import { IconSend, IconLoader, IconRobot, IconUser, IconMessageChatbot, IconArrowsDiagonalMinimize2, IconCornerDownLeft } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BookChatProps {
  bookTitle: string;
  bookAuthor?: string | null;
  isSidebar?: boolean;
  preferredLanguage?: string;
  onClose?: () => void;
}

export default function BookChat({ bookTitle, bookAuthor, isSidebar = false, preferredLanguage = 'Tamil', onClose }: BookChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your study companion for "${bookTitle}". I can help you with translations or answer questions about the book's content. What's on your mind?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          bookTitle,
          bookAuthor,
          preferredLanguage
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        const errorMsg: Message = { 
          role: 'assistant', 
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." 
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      // Handle both potential naming conventions
      const aiMsgContent = data.content || data.text;
      
      if (!aiMsgContent || aiMsgContent.trim() === "") {
        const apologyMsg: Message = { 
          role: 'assistant', 
          content: "I'm sorry, I'm finding it hard to phrase my response for this part of the book. Could you try asking in a slightly different way?" 
        };
        setMessages(prev => [...prev, apologyMsg]);
        return;
      }

      const aiMsg: Message = { role: 'assistant', content: aiMsgContent };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white/40 backdrop-blur-xl border-l border-slate-200/60 overflow-hidden ${isSidebar ? 'border-none bg-transparent' : ''}`}>

      {/* Header */}
      <div className="p-5 border-b border-slate-100/50 bg-white/60 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10175b] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#10175b]/20 ring-1 ring-white/20">
            <IconMessageChatbot size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#10175b] tracking-tight">Book Buddy AI</h3>
            <div className="flex items-center gap-1.5">
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Online Context Assistance</p>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#10175b] transition-all p-1"
            title="Minimize Chat"
          >
            <IconArrowsDiagonalMinimize2 size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`group relative max-w-[85%] p-4 text-[14px] leading-relaxed transition-all duration-300 ${m.role === 'user'
                ? 'bg-[#10175b] text-white rounded-[24px] rounded-tr-none shadow-lg shadow-[#10175b]/10'
                : 'bg-white border border-slate-100 text-slate-700 rounded-[24px] rounded-tl-none shadow-sm'
                }`}>
                {m.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }: any) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({ node, ...props }: any) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }: any) => <ol className="list-decimal ml-4 mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
                      strong: ({ node, ...props }: any) => <strong className="font-bold text-[#10175b]" {...props} />,
                      em: ({ node, ...props }: any) => <em className="italic opacity-80" {...props} />,
                      code: ({ node, ...props }: any) => <code className="bg-slate-100 px-1 rounded text-pink-600 font-mono text-xs" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/80 border border-slate-100 text-slate-400 p-4 rounded-[24px] rounded-tl-none flex items-center gap-3 italic text-[13px] shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Structured Input Area (Corner Border + Blue Box Submit) */}
      <div className="p-4 bg-white shrink-0 border-t border-slate-100">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 border border-slate-200 rounded-lg p-1 focus-within:border-[#10175b]/30 focus-within:ring-4 focus-within:ring-[#10175b]/5 transition-all bg-slate-50/30"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-2.5 px-3 text-[13px] text-[#10175b] focus:outline-none font-serif placeholder:text-slate-300 resize-none max-h-24 scrollbar-hide"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-[#10175b] text-white rounded-lg flex items-center justify-center hover:bg-[#1a2066] transition-all shadow-md disabled:opacity-20 active:scale-95 shrink-0"
            title="Submit"
          >
            <IconCornerDownLeft size={20} strokeWidth={2.5} />
          </button>
        </form>
        <div className="mt-2 text-center">
          <p className="text-[7px] text-slate-300 font-medium uppercase tracking-[0.2em] italic">Powered by Gemini</p>
        </div>
      </div>
    </div>
  );
}
