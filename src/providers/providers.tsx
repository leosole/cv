import { StrictMode } from "react"
import ThemeProvider from "./theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<StrictMode>
			<TooltipProvider delayDuration={100} skipDelayDuration={0}>
				<ThemeProvider>{children}</ThemeProvider>
			</TooltipProvider>
		</StrictMode>
	)
}
