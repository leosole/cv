import { useContext } from 'react'
import { CardStateContext } from '@/providers/card-state-provider'

export function useCardState() {
  const context = useContext(CardStateContext)
  if (!context) {
    throw new Error('useCardState must be used within a CardStateProvider')
  }
  return context
}
