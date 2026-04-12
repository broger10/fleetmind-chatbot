'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import AgentIndicator from '@/components/AgentIndicator';

interface Attachment {
  name: string;
  type: string;
  url?: string;
  base64?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  agentName?: string;
  agentColor?: string;
  attachments?: Attachment[];
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Ciao! Sono il tuo assistente FleetMind. Posso aiutarti con la pianificazione trasporti, la normativa e l\'uso della piattaforma. Scrivi, parla o allega un file per iniziare.',
  agent: 'dispatch',
  agentName: 'FleetMind Dispatch',
  agentColor: '#3B82F6',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('dispatch');
  const [currentAgentName, setCurrentAgentName] = useState('FleetMind Dispatch');
  const [currentAgentColor, setCurrentAgentColor] = useState('#3B82F6');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (content: string, files?: File[]) => {
    // Build attachments
    const attachments: Attachment[] = [];
    if (files) {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        attachments.push({
          name: file.name,
          type: file.type,
          url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          base64,
        });
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Prepare API messages
    const apiMessages = updatedMessages.map(m => {
      const msg: Record<string, unknown> = { role: m.role, content: m.content };
      if (m.agent) msg.agent = m.agent;
      if (m.attachments) {
        msg.attachments = m.attachments.map(a => ({
          name: a.name,
          type: a.type,
          base64: a.base64,
        }));
      }
      return msg;
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, currentAgent }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const agentType = response.headers.get('X-Agent-Type') || currentAgent;
      const agentName = response.headers.get('X-Agent-Name') || currentAgentName;
      const agentColor = response.headers.get('X-Agent-Color') || currentAgentColor;

      setCurrentAgent(agentType);
      setCurrentAgentName(agentName);
      setCurrentAgentColor(agentColor);

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        agent: agentType,
        agentName: agentName,
        agentColor: agentColor,
      }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const text = accumulated;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: text } : m));
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Si e verificato un errore. Riprova tra qualche secondo.',
        agent: currentAgent,
        agentName: currentAgentName,
        agentColor: currentAgentColor,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full h-[100dvh] bg-bg">
      {/* Header — minimal */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 bg-bg-chat border-b border-border-light safe-top shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17H5a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm12-2h-4a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z"/>
              <polyline points="9 17 9 5 21 3 21 15"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text leading-tight">FleetMind</h1>
            <AgentIndicator agentName={currentAgentName} agentColor={currentAgentColor} />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 md:px-4">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              agentName={msg.agentName}
              agentColor={msg.agentColor}
              attachments={msg.attachments}
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start mb-3 msg-enter">
              <div className="px-4 py-3 rounded-[20px] rounded-bl-md bg-surface">
                <div className="flex gap-1">
                  <span className="dot-1 w-1.5 h-1.5 rounded-full bg-text-muted" />
                  <span className="dot-2 w-1.5 h-1.5 rounded-full bg-text-muted" />
                  <span className="dot-3 w-1.5 h-1.5 rounded-full bg-text-muted" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full shrink-0 border-t border-border-light">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
