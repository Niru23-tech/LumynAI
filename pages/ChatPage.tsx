
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Message } from '../types';
import { getChatResponse } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';

const AIMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => (
    <div className="flex items-end gap-3">
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBSjWuE2zvdtJW4WaYHs2F_o-zgPzIE2cF0YylVbqMCEoAGVpwLs5cSLv8yVd1wQmsrnlzaXJeZISAGyiQupdO5x8CbfAD0xH5hVQ7vzfhsbVHY9d8pgI9a5GKKGg6C_QfVYN_OAzYxuhcnFNlgVI1ZuOn8xi5kJDwiR4gO7gwFmMwP4b9BsPe8N0sx6stuwmhNkWBQxQ2iUe8KWv2Opzmao1rsUAtrLRGKnRaCFO-lDbyQzElL1HQs2YzLPjegra1724m2t5mFUxc")` }}></div>
        <div className="flex flex-1 flex-col items-start gap-1.5">
            <div className="max-w-md rounded-xl rounded-bl-none bg-slate-100 px-4 py-3 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <p className="text-base font-normal leading-relaxed">{message}</p>
            </div>
             <p className="text-slate-400 text-[11px] font-medium leading-normal dark:text-slate-500">{timestamp}</p>
        </div>
    </div>
);

const UserMessage: React.FC<{ message: string; timestamp: string, seen: boolean }> = ({ message, timestamp, seen }) => (
    <div className="flex items-end justify-end gap-3">
        <div className="flex flex-1 flex-col items-end gap-1.5">
            <div className="max-w-md rounded-xl rounded-br-none bg-primary px-4 py-3 text-white">
                <p className="text-base font-normal leading-relaxed">{message}</p>
            </div>
             <div className="flex items-center gap-1">
                <p className="text-slate-400 text-[11px] font-medium leading-normal dark:text-slate-500">{timestamp}</p>
                <span className={`material-symbols-outlined !text-base ${seen ? 'text-blue-500' : 'text-slate-400'}`}>done_all</span>
            </div>
        </div>
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAELkrmFHYRUv8mrM29bJ8k8_8n1tYnG6pJ7Dq-uS7xJ3raW5LF1cR2X9eCKBlEhL0aQuR2H5DZVuJ19laopBDcFIL1z0lAUCbkuTiI5ZUOfpcev-OcT8nuT_UDd8S2hPRWmFXgruzi6VeuG4oD1gSL-4d-Qqfqw-UaOOY0RYiLDKdhZ8pyS9vYapeRnXHUIrXYmb5izq-vWr-MvEMEKmLZ9DWnnEif5zQqWKbfkve9M4eFGtooceJiCyDlD42gl695IGnLalK6vhk")` }}></div>
    </div>
);


const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm here to listen. How are you feeling today?", sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);
    
    useEffect(() => {
        // Mark previous user messages as seen when AI replies
        if (messages.length > 1 && messages[messages.length - 1].sender === 'ai') {
            setMessages(prev => prev.map(msg => msg.sender === 'user' ? { ...msg, seen: true } : msg));
        }
    }, [messages]);


    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            seen: false,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const aiResponseText = await getChatResponse(inputValue);

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };


    return (
        <div className="relative flex h-screen min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
            <div className="flex h-full w-full">
                <aside className="hidden md:flex h-full w-64 flex-col justify-between border-r border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-background-dark/50">
                    <div className="flex flex-col gap-6">
                        <Link to="/" className="flex items-center gap-3 px-2">
                             <div className="size-8 text-primary">
                                <span className="material-symbols-outlined !text-3xl">psychology</span>
                            </div>
                            <h1 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] dark:text-white">MindEase</h1>
                        </Link>
                        <div className="flex flex-col gap-2">
                            <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary dark:bg-primary/20" href="#">
                                <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                <p className="text-sm font-medium leading-normal">AI Chat</p>
                            </a>
                             <Link to="/student/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined text-xl">dashboard</span>
                                <p className="text-sm font-medium leading-normal">Dashboard</p>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" href="#">
                            <span className="material-symbols-outlined text-xl">settings</span>
                            <p className="text-sm font-medium leading-normal">Settings</p>
                        </a>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col">
                    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-3 dark:border-slate-800 dark:bg-background-dark/80 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBSjWuE2zvdtJW4WaYHs2F_o-zgPzIE2cF0YylVbqMCEoAGVpwLs5cSLv8yVd1wQmsrnlzaXJeZISAGyiQupdO5x8CbfAD0xH5hVQ7vzfhsbVHY9d8pgI9a5GKKGg6C_QfVYN_OAzYxuhcnFNlgVI1ZuOn8xi5kJDwiR4gO7gwFmMwP4b9BsPe8N0sx6stuwmhNkWBQxQ2iUe8KWv2Opzmao1rsUAtrLRGKnRaCFO-lDbyQzElL1HQs2YzLPjegra1724m2t5mFUxc")` }}></div>
                                <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500 dark:border-background-dark"></div>
                            </div>
                            <div>
                                <h2 className="text-slate-900 text-base font-bold leading-tight dark:text-white">MindEase AI</h2>
                                <p className="text-slate-500 text-sm font-normal leading-normal dark:text-slate-400">Here to listen</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAELkrmFHYRUv8mrM29bJ8k8_8n1tYnG6pJ7Dq-uS7xJ3raW5LF1cR2X9eCKBlEhL0aQuR2H5DZVuJ19laopBDcFIL1z0lAUCbkuTiI5ZUOfpcev-OcT8nuT_UDd8S2hPRWmFXgruzi6VeuG4oD1gSL-4d-Qqfqw-UaOOY0RYiLDKdhZ8pyS9vYapeRnXHUIrXYmb5izq-vWr-MvEMEKmLZ9DWnnEif5zQqWKbfkve9M4eFGtooceJiCyDlD42gl695IGnLalK6vhk")` }}></div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="mx-auto flex max-w-3xl flex-col gap-6">
                            {messages.map((msg) =>
                                msg.sender === 'ai' ?
                                <AIMessage key={msg.id} message={msg.text} timestamp={msg.timestamp} /> :
                                <UserMessage key={msg.id} message={msg.text} timestamp={msg.timestamp} seen={!!msg.seen} />
                            )}
                            {isLoading && (
                                 <div className="flex items-end gap-3">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBSjWuE2zvdtJW4WaYHs2F_o-zgPzIE2cF0YylVbqMCEoAGVpwLs5cSLv8yVd1wQmsrnlzaXJeZISAGyiQupdO5x8CbfAD0xH5hVQ7vzfhsbVHY9d8pgI9a5GKKGg6C_QfVYN_OAzYxuhcnFNlgVI1ZuOn8xi5kJDwiR4gO7gwFmMwP4b9BsPe8N0sx6stuwmhNkWBQxQ2iUe8KWv2Opzmao1rsUAtrLRGKnRaCFO-lDbyQzElL1HQs2YzLPjegra1724m2t5mFUxc")` }}></div>
                                    <div className="flex flex-1 flex-col items-start gap-1.5">
                                        <div className="max-w-md rounded-xl rounded-bl-none bg-slate-100 px-4 py-3 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <footer className="shrink-0 border-t border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-background-dark/80">
                        <div className="mx-auto max-w-3xl">
                            <div className="relative flex items-center gap-3">
                                <div className="flex w-full items-stretch rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                                    <input
                                        className="form-input w-full flex-1 resize-none overflow-hidden border-none bg-transparent px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-0 focus:ring-0 dark:text-slate-200"
                                        placeholder="Tell me what's on your mind..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                    />
                                    <div className="flex items-center pr-2">
                                        <button className="flex items-center justify-center p-1.5 text-slate-400 hover:text-primary dark:hover:text-primary">
                                            <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                                        </button>
                                    </div>
                                </div>
                                <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary text-white disabled:opacity-50">
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
