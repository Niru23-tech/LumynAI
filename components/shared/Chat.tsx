import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, Message, Role } from '../../types';
import { getConversations, sendMessage as apiSendMessage, getUsers } from '../../services/api';
import { supabase } from '../../services/supabaseClient';
import { SendIcon } from './icons/Icons';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserRole = currentUser.role === Role.STUDENT ? Role.COUNSELLOR : Role.STUDENT;

  useEffect(() => {
    getUsers(otherUserRole).then(setAllUsers);
    getConversations(currentUser.id).then(setConversations);
  }, [currentUser.id, otherUserRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${currentUser.id}`)
      .on<any>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` },
        (payload) => {
          const receivedMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            receiverId: payload.new.receiver_id,
            text: payload.new.text,
            timestamp: new Date(payload.new.timestamp),
            status: payload.new.status,
          };
          
          if(receivedMessage.senderId === selectedConversation.participant2.id) {
             setSelectedConversation(prev => {
                if (!prev) return null;
                return {...prev, messages: [...prev.messages, receivedMessage]};
             });
          }

          setConversations(prevConvos => prevConvos.map(c => {
              if((c.participant1.id === receivedMessage.senderId && c.participant2.id === receivedMessage.receiverId) || (c.participant1.id === receivedMessage.receiverId && c.participant2.id === receivedMessage.senderId)) {
                  return {...c, messages: [...c.messages, receivedMessage]};
              }
              return c;
          }));

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, currentUser.id]);

  const handleSelectConversation = (otherUser: User) => {
    const existingConvo = conversations.find(c => c.participant2.id === otherUser.id);
    if (existingConvo) {
      setSelectedConversation(existingConvo);
    } else {
      const newConvo: Conversation = {
        id: `${currentUser.id}-${otherUser.id}`,
        participant1: currentUser,
        participant2: otherUser,
        messages: []
      };
      setSelectedConversation(newConvo);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversation) return;

    const sentMessage = await apiSendMessage(currentUser.id, selectedConversation.participant2.id, newMessage);

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, sentMessage]
    };
    setSelectedConversation(updatedConversation);
    
    // Update or add conversation in the list
    setConversations(prev => {
        const existing = prev.find(c => c.id === updatedConversation.id);
        if (existing) {
            return prev.map(c => c.id === updatedConversation.id ? updatedConversation : c);
        }
        return [...prev, updatedConversation];
    });

    setNewMessage('');
  };

  const MessageBubble: React.FC<{ message: Message; isOwnMessage: boolean }> = ({ message, isOwnMessage }) => (
    <div className={`flex items-end ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${isOwnMessage ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'}`}>
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'} flex items-center justify-end`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Conversations with {otherUserRole}s</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {allUsers.map(user => {
            const convo = conversations.find(c => c.participant2.id === user.id);
            const lastMessage = convo?.messages[convo.messages.length - 1];
            return (
              <div
                key={user.id}
                onClick={() => handleSelectConversation(user)}
                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700 ${selectedConversation?.participant2.id === user.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <div className="flex items-center">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {lastMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message View */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <img src={ selectedConversation.participant2.avatarUrl } alt="avatar" className="w-10 h-10 rounded-full mr-3" />
              <h3 className="text-lg font-semibold">{ selectedConversation.participant2.name }</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {selectedConversation.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === currentUser.id} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 w-full px-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                />
                <button type="submit" className="ml-4 p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <SendIcon />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;