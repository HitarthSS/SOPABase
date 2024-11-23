// app/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex space-x-2 p-3 bg-gray-100 rounded-lg w-fit"
  >
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ y: ["0%", "-50%", "0%"] }}
      transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      id: Date.now().toString() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

  //   try {
  //     const response = await fetch('/api/chat', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ message: input }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to get response');
  //     }

  //     const data = await response.json();
  //     setMessages(prev => [...prev, { 
  //       role: 'assistant', 
  //       content: data.response,
  //       id: (Date.now() + 1).toString()
  //     }]);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setMessages(prev => [...prev, { 
  //       role: 'assistant', 
  //       content: 'I apologize, but I encountered an error processing your request.',
  //       id: (Date.now() + 1).toString()
  //     }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  try {
    // Update the fetch call to use Flask backend
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: data.response,
      id: (Date.now() + 1).toString()
    }]);
  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'I apologize, but I encountered an error processing your request.',
      id: (Date.now() + 1).toString()
    }]);
  } finally {
    setIsLoading(false);
  }
};

  const messageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
        <CardContent className="flex flex-col h-full p-6">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <motion.div
                      layoutId={message.id}
                      className={`max-w-[80%] rounded-lg p-4 whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>
                {isLoading && (
                  <div className="flex justify-start">
                    <TypingIndicator />
                  </div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="flex gap-2 pt-4 border-t"
            layout
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-6"
              // whileTap={{ scale: 0.95 }}
              // as={motion.button}
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.form>
        </CardContent>
      </Card>
    </div>
  );
}