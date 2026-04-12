'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import AgentIndicator from '@/components/AgentIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  agentName?: string;
  agentColor?: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Ciao! Sono FleetMind Dispatch, il tuo co-pilota per la pianificazione trasporti. Posso aiutarti con la gestione ordini, assegnazione autisti e mezzi, e ottimizzazione delle rotte. Come posso aiutarti?',
  agent: 'dispatch',
  agentName: 'FleetMind Dispatch',
  agentColor: '#3B82F6',
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>('dispatch');
  const [currentAgentName, setCurrentAgentName] = useState('FleetMind Dispatch');
  const [currentAgentColor, setCurrentAgentColor] = useState('#3B82F6');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Prepare messages for API (exclude welcome metadata)
    const apiMessages = updatedMessages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.agent ? { agent: m.agent } : {}),
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          currentAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read agent info from headers
      const agentType = response.headers.get('X-Agent-Type') || currentAgent;
      const agentName = response.headers.get('X-Agent-Name') || currentAgentName;
      const agentColor = response.headers.get('X-Agent-Color') || currentAgentColor;

      setCurrentAgent(agentType);
      setCurrentAgentName(agentName);
      setCurrentAgentColor(agentColor);

      // Create assistant message placeholder
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        agent: agentType,
        agentName,
        agentColor,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const currentText = accumulated;
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: currentText } : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Si e verificato un errore. Riprova tra qualche secondo.',
        agent: currentAgent,
        agentName: currentAgentName,
        agentColor: currentAgentColor,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm">
            FM
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">FleetMind Assistant</h1>
            <p className="text-xs text-muted">Multi-agent AI chatbot</p>
          </div>
        </div>
        <AgentIndicator agentName={currentAgentName} agentColor={currentAgentColor} />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              agentName={msg.agentName}
              agentColor={msg.agentColor}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start mb-4">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-surface border border-border">
                <div className="flex gap-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full shrink-0">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
