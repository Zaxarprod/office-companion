import { InteractiveCard } from '~/shared/ui'

import type { Tool } from '../../model'

export interface ToolCardProps {
  tool: Tool
  onClick?: () => void
}

export const ToolCard = ({ tool, onClick }: ToolCardProps) => (
  <InteractiveCard
    icon={tool.icon}
    tint={tool.tint}
    title={tool.title}
    subtitle={tool.subtitle}
    extraLabel={tool.pro ? 'PRO' : undefined}
    onClick={onClick}
  />
)
