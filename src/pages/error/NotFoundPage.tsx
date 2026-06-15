import { useNavigate } from 'react-router-dom'

import { ErrorScreen, IconBadge } from '~/shared/ui'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <ErrorScreen
      title='Страница не найдена'
      description='Кажется, такой страницы нет — бывает. Вернёмся на главную.'
      image={<IconBadge icon='frown' tone='ochre' shape='circle' size={72} iconSize={36} />}
      actionLabel='На главную'
      onAction={() => navigate('/')}
    />
  )
}
