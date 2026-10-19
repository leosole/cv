import { createContext, useContext } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
	isDark: boolean
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
	glassEnabled: boolean
	setGlassEnabled: (enabled: boolean) => void
	setPageColors: (colors: unknown) => void
}

export const ThemeContext = createContext<ThemeContextType>(
	{} as ThemeContextType
)
export const useTheme = () => {
	return useContext(ThemeContext)
}
