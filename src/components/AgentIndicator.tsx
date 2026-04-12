interface AgentIndicatorProps {
  agentName: string;
  agentColor: string;
}

export default function AgentIndicator({ agentName, agentColor }: AgentIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border w-fit transition-all duration-300">
      <span
        className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
        style={{ backgroundColor: agentColor }}
      />
      <span
        className="text-sm font-medium transition-colors duration-300"
        style={{ color: agentColor }}
      >
        {agentName}
      </span>
    </div>
  );
}
