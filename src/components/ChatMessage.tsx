interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  agentColor?: string;
}

export default function ChatMessage({ role, content, agentName, agentColor }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-blue-600 text-white text-sm leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        {agentName && (
          <div className="flex items-center gap-1.5 mb-1.5 ml-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: agentColor }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: agentColor }}
            >
              {agentName}
            </span>
          </div>
        )}
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-surface border border-border text-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
