import { createContext, useState } from 'react'
import type { ReactNode } from 'react'

interface CardStateContextType {
  openedCards: number[]
  setOpenedCards: React.Dispatch<React.SetStateAction<number[]>>
}

export const CardStateContext = createContext<CardStateContextType | undefined>(undefined)

export function CardStateProvider({ children, initialOpenedCards }: { children: ReactNode; initialOpenedCards: number[] }) {
  const [openedCards, setOpenedCards] = useState<number[]>(initialOpenedCards)

  return (
    <CardStateContext.Provider value={{ openedCards, setOpenedCards }}>
      {children}
    </CardStateContext.Provider>
  )
}
