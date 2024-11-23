// app/page.tsx
'use client';
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

type MessageType = {
  role: 'user' | 'coa' | 'adversary' | 'judge';
  content: string;
  id: string;
  actions?: string[]; // Only for COA responses
};

// Mock responses
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

export default function ChatInterface() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<string | null>(null);
  const [lastEnemyAction, setLastEnemyAction] = useState<string | null>(null);
  const [lastVerdict, setLastVerdict] = useState<string | null>(null);

  const handleActionSelect = async (action: string) => {
    // Log the selected action
    setMessages(prev => [...prev, {
      role: 'user',
      content: `Selected action: ${action}`,
      id: Date.now().toString()
    }]);

    setLastUserAction(action);
    setIsLoading(true);

    // Get adversary response
    const adversaryResponse = mockResponses.adversary(action);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => [...prev, {
      role: 'adversary',
      content: adversaryResponse.content,
      id: Date.now().toString()
    }]);
    setLastEnemyAction(adversaryResponse.content);

    // Get judge verdict
    const judgeResponse = mockResponses.judge(action, adversaryResponse.content);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    const coaResponse = mockResponses.coa(query);
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
        <CardContent className="flex flex-col h-full p-6">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div className={`rounded-lg p-4 ${getMessageStyle(message.role)}`}>
                    {message.content}
                    {message.actions && (
                      <div className="mt-4 space-y-2">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            onClick={() => handleActionSelect(action)}
                            disabled={isLoading}
                            variant="secondary"
                            className="w-full text-left justify-start"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}