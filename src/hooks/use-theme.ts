import { createContext, useContext } from "react"

interface ThemeContextType {
	isDark: boolean
	toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>(
	{} as ThemeContextType
)
export const useTheme = () => {
	return useContext(ThemeContext)
}
