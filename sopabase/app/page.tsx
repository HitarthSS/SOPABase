// app/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MessageType = {
  role: 'user' | 'coa' | 'adversary' | 'judge';
  content: string;
  id: string;
  actions?: string[];
};

// Mock responses (same as before)
const mockResponses = {
  coa: (query: string) => ({
    content: "Based on your scenario, here are your options:",
    actions: [
      "Deploy defensive perimeter with overlapping fields of fire",
      "Conduct tactical retreat to prepared positions",
      "Launch counter-offensive with artillery support",
      "Establish observation posts on high ground"
    ]
  }),
  adversary: (userAction: string) => ({
    content: `In response to your ${userAction}, enemy forces are conducting a flanking maneuver with mechanized infantry support.`
  }),
  judge: (userAction: string, enemyAction: string) => ({
    content: `Analyzing outcome... Based on the defensive position and enemy maneuver, blue forces maintain tactical advantage due to superior positioning.`
  })
};

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    y: 10,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<string | null>(null);
  const [lastEnemyAction, setLastEnemyAction] = useState<string | null>(null);
  const [lastVerdict, setLastVerdict] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionSelect = async (action: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLastUserAction(action);

    // Log the selected action
    setMessages(prev => [...prev, {
      role: 'user',
      content: `Selected action: ${action}`,
      id: Date.now().toString()
    }]);

    // Get adversary response
    await new Promise(resolve => setTimeout(resolve, 1000));
    const adversaryResponse = mockResponses.adversary(action);
    setMessages(prev => [...prev, {
      role: 'adversary',
      content: adversaryResponse.content,
      id: Date.now().toString()
    }]);
    setLastEnemyAction(adversaryResponse.content);

    // Get judge verdict
    await new Promise(resolve => setTimeout(resolve, 1000));
    const judgeResponse = mockResponses.judge(action, adversaryResponse.content);
    setMessages(prev => [...prev, {
      role: 'judge',
      content: judgeResponse.content,
      id: Date.now().toString()
    }]);
    setLastVerdict(judgeResponse.content);

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const query = input;
    setInput('');

    // Add user query to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: query,
      id: Date.now().toString()
    }]);

    // Get COA response with options
    await new Promise(resolve => setTimeout(resolve, 1000));
    const coaResponse = mockResponses.coa(query);
    setMessages(prev => [...prev, {
      role: 'coa',
      content: coaResponse.content,
      actions: coaResponse.actions,
      id: Date.now().toString()
    }]);

    setIsLoading(false);
  };

  const getMessageStyle = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-500 text-white';
      case 'adversary':
        return 'bg-red-500 text-white';
      case 'judge':
        return 'bg-white border border-gray-200 text-gray-900';
      default:
        return 'bg-blue-100 text-blue-900';
    }
  };

  
  const getMessageInfo = (role: string) => {
    switch (role) {
      case 'user':
        return {
          title: 'You',
          style: 'bg-blue-500 text-white',
          titleColor: 'text-blue-600'
        };
      case 'coa':
        return {
          title: 'Course of Action Agent',
          style: 'bg-blue-100 text-blue-900',
          titleColor: 'text-blue-600'
        };
      case 'adversary':
        return {
          title: 'Adversary',
          style: 'bg-red-500 text-white',
          titleColor: 'text-red-600'
        };
      case 'judge':
        return {
          title: 'Judge',
          style: 'bg-white border border-gray-200 text-gray-900',
          titleColor: 'text-gray-600'
        };
      default:
        return {
          title: 'System',
          style: 'bg-gray-100 text-gray-900',
          titleColor: 'text-gray-600'
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      {/* Left Panel (Display Area) */}
      <div className="w-2/3 h-[90vh] bg-gray-100 p-4">
        {/* Add content for the display area here */}
        <h2 className="text-lg font-semibold mb-4">Display Area</h2>
        <p className="text-gray-700">This is the area for additional display content, such as information, stats, or other elements.</p>
        {/* You can include charts, maps, or any other content */}
      </div>
      <Card className="w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
        <CardContent className="flex flex-col h-full p-6">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm font-medium mb-1 ${getMessageInfo(message.role).titleColor}`}
                    >
                      {getMessageInfo(message.role).title}
                    </motion.span>
                    <div className={`rounded-lg p-4 w-fit max-w-[80%] ${getMessageInfo(message.role).style}`}>
                      {message.content}
                      {message.actions && (
                        <motion.div 
                          className="mt-4 space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              onClick={() => handleActionSelect(action)}
                              disabled={isLoading}
                              variant="secondary"
                              className="w-full text-left justify-start hover:bg-gray-100"
                            >
                              {action}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your tactical situation..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-6"
              asChild
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}