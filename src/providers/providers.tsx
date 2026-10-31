import { StrictMode } from "react"
import ThemeProvider from "./theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CardStateProvider } from "./card-state-provider"

interface ProvidersProps {
	children: React.ReactNode
	initialOpenedCards?: number[]
}

export default function Providers({ children, initialOpenedCards = [] }: ProvidersProps) {
	return (
		<StrictMode>
			<TooltipProvider delayDuration={100} skipDelayDuration={0}>
				<ThemeProvider>
					<CardStateProvider initialOpenedCards={initialOpenedCards}>
						{children}
					</CardStateProvider>
				</ThemeProvider>
			</TooltipProvider>
		</StrictMode>
	)
}
