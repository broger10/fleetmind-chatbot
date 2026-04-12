interface Attachment {
  name: string;
  type: string;
  url?: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  agentColor?: string;
  attachments?: Attachment[];
}

export default function ChatMessage({ role, content, agentName, agentColor, attachments }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3 msg-enter">
        <div className="max-w-[85%] md:max-w-[70%]">
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {attachments.map((att, i) => (
                <div key={i}>
                  {att.type.startsWith('image/') && att.url ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="max-w-[200px] max-h-[150px] rounded-2xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="text-xs truncate max-w-[120px]">{att.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {content && (
            <div className="px-4 py-2.5 rounded-[20px] rounded-br-md bg-user-bubble text-user-text text-[15px] leading-relaxed shadow-sm">
              {content}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3 msg-enter">
      <div className="max-w-[85%] md:max-w-[70%]">
        {agentName && (
          <div className="flex items-center gap-1.5 mb-1 ml-3">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: agentColor }}
            />
            <span
              className="text-[11px] font-semibold tracking-wide uppercase"
              style={{ color: agentColor }}
            >
              {agentName}
            </span>
          </div>
        )}
        <div className="px-4 py-2.5 rounded-[20px] rounded-bl-md bg-surface text-text text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
