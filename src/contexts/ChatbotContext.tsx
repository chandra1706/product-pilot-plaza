
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?: 'text' | 'quick-reply';
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ChatbotContextType {
  currentSession: ChatSession | null;
  isOpen: boolean;
  isTyping: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  startNewSession: (userId?: string) => void;
  endSession: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

const BOT_RESPONSES = [
  "Hello! How can I help you today?",
  "I'm here to assist you with any questions about our products or services.",
  "You can browse our products, check your orders, or contact our support team.",
  "Is there anything specific you'd like to know about our store?",
  "I can help you with product information, shipping details, or account questions.",
  "Feel free to ask me about our return policy, shipping options, or current promotions!",
];

const getRandomResponse = () => {
  return BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
};

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const startNewSession = (userId?: string) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      userId,
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: "Hello! Welcome to ShopHub. How can I assist you today?",
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(newSession);
  };

  const endSession = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'closed',
        updatedAt: new Date().toISOString()
      });
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSession) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(updatedSession);

    // Simulate bot typing
    setIsTyping(true);
    
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: getRandomResponse(),
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, botMessage],
        updatedAt: new Date().toISOString()
      } : null);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  return (
    <ChatbotContext.Provider value={{
      currentSession,
      isOpen,
      isTyping,
      openChat,
      closeChat,
      sendMessage,
      startNewSession,
      endSession
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};
