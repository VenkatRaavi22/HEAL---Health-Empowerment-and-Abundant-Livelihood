import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../utils/api';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
}

const QUICK_REPLIES = [
    'What is PCOD?',
    'What does my risk score mean?',
    'What foods should I eat?',
    'Suggest yoga for PCOD',
    'Ayurvedic remedies?',
    'When should I see a doctor?',
];

const WELCOME_MESSAGE: Message = {
    id: 0,
    role: 'assistant',
    text: `Hi there! 🌸 I'm **HEAL's AI Health Assistant**.\n\nI'm here to help you understand your hormonal health, interpret your risk scores, and guide you with personalized tips on diet, yoga, ayurveda, and more.\n\nWhat would you like to know today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [nextId, setNextId] = useState(1);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const userMsg: Message = { id: nextId, role: 'user', text: text.trim(), timestamp: ts };
        setMessages(prev => [...prev, userMsg]);
        setNextId(prev => prev + 1);
        setInput('');
        setIsTyping(true);

        try {
            const data = await api('/chatbot/message', {
                method: 'POST',
                body: JSON.stringify({ message: text.trim() }),
            });

            const botMsg: Message = {
                id: nextId + 1,
                role: 'assistant',
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, botMsg]);
            setNextId(prev => prev + 2);
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                {
                    id: nextId + 1,
                    role: 'assistant',
                    text: `Error: ${err.message || "I'm having trouble connecting right now. Please try again in a moment. 🙏"}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
            setNextId(prev => prev + 2);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleReset = () => {
        setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setNextId(1);
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg leading-tight">HEAL AI Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-xs text-gray-500 font-medium">Hormonal Health Expert</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all font-medium"
                    title="Reset conversation"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3 animate-fade-in`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-md'
                                    : 'bg-white text-gray-800 rounded-tl-md border border-gray-100'
                                    } prose prose-sm max-w-none`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                            <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-gray-600">
                                U
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && !isTyping && (
                <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex flex-wrap gap-2">
                    {QUICK_REPLIES.map(qr => (
                        <button
                            key={qr}
                            onClick={() => sendMessage(qr)}
                            className="text-xs bg-white hover:bg-primary hover:text-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:border-primary hover:scale-105 active:scale-95"
                        >
                            {qr}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <form
                onSubmit={handleSubmit}
                className="px-4 py-4 bg-white border-t border-gray-100 rounded-b-2xl shadow-sm"
            >
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about PCOD, diet, yoga, risk scores..."
                        disabled={isTyping}
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none py-1 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center disabled:opacity-40 disabled:grayscale hover:scale-105 active:scale-95 transition-transform shadow-md shadow-primary/20"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    For educational purposes only · Not a substitute for medical advice
                </p>
            </form>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.25s ease-out;
                }
            `}</style>
        </div>
    );
}
