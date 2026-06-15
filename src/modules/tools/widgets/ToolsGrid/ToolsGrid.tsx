import { useNavigate } from 'react-router-dom'

import { useUpsell } from '~/modules/subscription'
import { Grid } from '~/shared/ui'

import { ToolCard } from '../../components/ToolCard'
import { TOOLS } from '../../model'

export interface ToolsGridProps {
  /** home — только карточки для главной; all — все. */
  scope?: 'home' | 'all'
}

export const ToolsGrid = ({ scope = 'all' }: ToolsGridProps) => {
  const navigate = useNavigate()
  const upsell = useUpsell()
  const tools = scope === 'home' ? TOOLS.filter((tool) => tool.home) : TOOLS

  return (
    <Grid columns={2} gap={11}>
      {tools.map((tool) => {
        const { pro, route } = tool
        const onClick = pro
          ? () =>
              upsell.open({ feature: tool.title, icon: tool.icon, description: pro.description })
          : route
            ? () => navigate(route)
            : undefined
        return <ToolCard key={tool.id} tool={tool} onClick={onClick} />
      })}
    </Grid>
  )
}
