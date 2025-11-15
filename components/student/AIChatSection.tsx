
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SendIcon } from '../shared/icons/Icons';
import { useAuth } from '../../hooks/useAuth';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AIChatSection: React.FC = () => {
    const { user } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hello! I am Lumyn AI, your personal assistant. How can I help you today with your academic or personal well-being goals?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            // IMPORTANT: The API key is securely managed by the environment and is not hardcoded.
            // The value of process.env.API_KEY is injected at build time or on the server.
            if (!process.env.API_KEY) {
                console.error("API Key not found. Please set the API_KEY environment variable.");
                setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am unable to connect right now. The API key is missing.' }]);
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a helpful AI assistant named Lumyn AI, designed for students. Provide supportive and encouraging guidance on academic, time management, stress, and personal well-being topics. Keep your responses concise and easy to understand.',
                },
            });
            setChat(chatSession);
        } catch (error) {
            console.error("Error initializing AI chat:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, there was an error initializing the chat service.' }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || loading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        const currentInput = input;
        setInput('');

        try {
            const response = await chat.sendMessage({ message: currentInput });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'I seem to be having trouble connecting. Please try again in a moment.' }]);
        } finally {
            setLoading(false);
        }
    };

    const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
        const isUser = message.role === 'user';
        return (
            <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && <img src="https://i.pravatar.cc/150?u=lumynai" alt="AI" className="w-8 h-8 rounded-full mr-2 self-start" />}
                <div className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${isUser ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                </div>
                {isUser && <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full ml-2 self-start" />}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <img src="https://i.pravatar.cc/150?u=lumynai" alt="AI Assistant" className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h3 className="text-lg font-semibold">Lumyn AI Assistant</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your personal guide for support</p>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <img src="https://i.pravatar.cc/150?u=lumynai" alt="AI" className="w-8 h-8 rounded-full mr-2 self-start" />
                        <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                           <div className="flex items-center space-x-1">
                             <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                             <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                             <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        disabled={!chat || loading}
                        className="flex-1 w-full px-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    />
                    <button type="submit" disabled={!chat || loading} className="ml-4 p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatSection;
