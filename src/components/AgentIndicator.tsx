interface AgentIndicatorProps {
  agentName: string;
  agentColor: string;
}

export default function AgentIndicator({ agentName, agentColor }: AgentIndicatorProps) {
  return (
    <div className="flex items-center gap-2 transition-all duration-500">
      <span
        className="w-2 h-2 rounded-full transition-colors duration-500"
        style={{ backgroundColor: agentColor }}
      />
      <span
        className="text-xs font-medium tracking-wide transition-colors duration-500"
        style={{ color: agentColor }}
      >
        {agentName}
      </span>
    </div>
  );
}
