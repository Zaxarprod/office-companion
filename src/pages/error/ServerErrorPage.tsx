import { ErrorScreen, IconBadge } from '~/shared/ui'

export const ServerErrorPage = () => (
  <ErrorScreen
    title='Что-то сломалось'
    description='Мы уже знаем и чиним. Попробуй обновить — обычно помогает.'
    image={<IconBadge icon='alert-triangle' tone='danger' shape='circle' size={72} iconSize={36} />}
    actionLabel='Обновить'
    onAction={() => window.location.reload()}
  />
)
