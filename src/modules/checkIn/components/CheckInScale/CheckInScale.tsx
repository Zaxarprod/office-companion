import cn from 'classnames'

import { Grid, HStack, Text, VStack } from '~/shared/ui'

import type { CheckInScaleProps } from './types'

import styles from './CheckInScale.module.scss'

export const CheckInScale = ({ options, value, onChange, lowText, highText }: CheckInScaleProps) => {
  const columns = Math.min(options.length, 5)
  const wide = options.length > 5

  return (
    <VStack gap={8}>
      {!wide && (
        <HStack justify='between'>
          <Text variant='caption' color='ink-soft'>
            {lowText}
          </Text>
          <Text variant='caption' color='ink-soft'>
            {highText}
          </Text>
        </HStack>
      )}
      {wide && (
        <Text variant='caption' color='ink-soft'>
          {lowText}
        </Text>
      )}

      <Grid columns={columns} gap={9}>
        {options.map((option) => (
          <button
            key={option.value}
            type='button'
            className={cn(styles.cell, value === option.value && styles.on)}
            onClick={() => onChange(option.value)}
          >
            {option.value}
          </button>
        ))}
      </Grid>

      {wide && (
        <HStack justify='end'>
          <Text variant='caption' color='ink-soft'>
            {highText}
          </Text>
        </HStack>
      )}
    </VStack>
  )
}
