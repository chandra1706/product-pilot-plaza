import {SitemapService} from '../utils/SitemapService';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { set } from 'date-fns';

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

    // Get the base URL of the site where the chatbot is installed
    let baseUrl = window.location.origin;
    console.log('Chatbot base URL:', baseUrl);

    // Test with a real website
    const { success, xml } = await SitemapService.getRawSitemapXml(baseUrl);
    //console.log('getRawSitemapXml response:', xml);
    const sitemapData = await SitemapService.readSitemap(`${baseUrl}/sitemap.xml`);
    //console.log('readSitemap response:', sitemapData);
    let pageContent = '';
    if (sitemapData.success && sitemapData.data.urls && sitemapData.data.urls[0]) {
      const pageContentResult = await SitemapService.getPageContent(sitemapData.data.urls[0].loc);
      pageContent = pageContentResult && pageContentResult.success && typeof pageContentResult.content === 'string'
        ? pageContentResult.content
        : '';
    }
    //console.log('pageContent response:', pageContent);
    
    if (success && typeof xml === 'string' && typeof pageContent === 'string') {
      try {
        const response = await fetch('https://aimonth-sensai-app--0000005.kindmeadow-53087716.westus2.azurecontainerapps.io/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage.content,
            domString: pageContent, 
            siteMap: xml
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('API response:', data);
        
        if (Array.isArray(sitemapData.data.urls)) {
          const inputWords = userMessage.content.toLowerCase().split(/\s+/).filter(Boolean);
          // Find all URLs that match any input word
            const matchedUrls = sitemapData.data.urls.filter(
              (u: { loc: string }) => {
                try {
                  const urlObj = new URL(u.loc);
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
                  const lastSlug = pathSegments[pathSegments.length - 1]?.toLowerCase() || '';
                  return inputWords.some(word => lastSlug.includes(word));
                } catch {
                  return false;
                }
              }
            );
          console.log('Matched URLs:', matchedUrls);          
          // buttons containing matched URLs
          if (matchedUrls.length > 0) {
            const quickReplies: ChatMessage = {
              id: `quick-reply`,
              content: (
                <>
                  {data.narration || getRandomResponse()}
                  <div>Related pages:</div>
                  <div className="flex flex-col gap-2 mt-2">
                    {matchedUrls.map((u: { loc: string }, idx: number) => (
                      <Button
                        key={u.loc}
                        asChild
                        variant="outline"
                        className={`justify-start text-left button${idx}`}
                        onClick={() => window.open(u.loc, '_blank')}
                      >
                        <a href={u.loc} target="_blank" rel="noopener noreferrer">
                          {u.loc.replace(baseUrl, '').replace(/^\//, '') || 'Home'}
                        </a>
                      </Button>
                    ))}
                  </div>
                </>
              ) as unknown as string,
              sender: 'bot' as 'bot',
              timestamp: new Date().toISOString(),
              type: 'quick-reply'
            };

            setCurrentSession(prev =>
              prev
                ? {
                    ...prev,
                    messages: [
                      ...prev.messages,
                      quickReplies
                    ],
                    updatedAt: new Date().toISOString()
                  }
                : data.narration
            );
          } else {
            const botMessage: ChatMessage = {
              id: `msg-${Date.now()}`,
              content: (
                <>
                  {data.narration || getRandomResponse()}
                  <div className="mt-2">
                    <Button
                          key={baseUrl}
                          asChild
                          variant="outline"
                          className="justify-start text-left button0"
                          onClick={() => window.open(baseUrl, '_blank')}
                        >
                          <a href={baseUrl} target="_blank" rel="noopener noreferrer">
                            {'Home'}
                          </a>
                        </Button>
                  </div>
                </>
              ) as unknown as string,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              type: 'text'
            };
            setCurrentSession(prev =>
              prev
                ? {
                    ...prev,
                    messages: [...prev.messages, botMessage],
                    updatedAt: new Date().toISOString()
                  }
                : data.narration
            );
          }
        }
      } catch (error) {
        console.error('Error sending message:', error); 
      }
    } 
    setIsTyping(false); 

    setTimeout(() => {
      useEffect(() => {
      const button =  document.querySelector('.button0') as HTMLButtonElement ;
      console.log('Button found:', button);
        if (button) {
          button.click();
        }
      }, []);
    }, 1000); // Simulate a delay for bot response
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
