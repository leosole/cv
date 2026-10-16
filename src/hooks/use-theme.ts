import { createContext, useContext } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
	isDark: boolean
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
	backgroundEnabled: boolean
	setBackgroundEnabled: (enabled: boolean) => void
	glassEnabled: boolean
	setGlassEnabled: (enabled: boolean) => void
}

export const ThemeContext = createContext<ThemeContextType>(
	{} as ThemeContextType
)
export const useTheme = () => {
	return useContext(ThemeContext)
}
