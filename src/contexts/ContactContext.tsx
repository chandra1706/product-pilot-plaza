
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'contact' | 'support' | 'feedback';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface ContactContextType {
  messages: ContactMessage[];
  submitMessage: (message: Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
  getMessagesByStatus: (status: ContactMessage['status']) => ContactMessage[];
  getMessagesByUser: (userId: string) => ContactMessage[];
}

const ContactContext = createContext<ContactContextType | null>(null);

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Product inquiry',
      message: 'I have a question about the wireless headphones.',
      type: 'contact',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1'
    }
  ]);

  const submitMessage = async (messageData: Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: `msg-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const updateMessageStatus = async (id: string, status: ContactMessage['status']) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id 
          ? { ...msg, status, updatedAt: new Date().toISOString() }
          : msg
      )
    );
  };

  const getMessagesByStatus = (status: ContactMessage['status']) => {
    return messages.filter(msg => msg.status === status);
  };

  const getMessagesByUser = (userId: string) => {
    return messages.filter(msg => msg.userId === userId);
  };

  return (
    <ContactContext.Provider value={{
      messages,
      submitMessage,
      updateMessageStatus,
      getMessagesByStatus,
      getMessagesByUser
    }}>
      {children}
    </ContactContext.Provider>
  );
};
