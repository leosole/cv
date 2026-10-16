import { useEffect, useState } from "react"
import { ThemeContext, type Theme } from "@/hooks/use-theme"

export default function ThemeProvider({
	children
}: {
	children: React.ReactNode
}) {
	const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark")
	const [glassEnabled, setGlassEnabledState] = useState(
		localStorage.getItem("glass-enabled") !== "false"
	)
	useEffect(() => {
		if (isDark) document.body.classList.add("dark")
		else document.body.classList.remove("dark")
	}, [isDark])

	function setTheme(theme: Theme) {
		localStorage.setItem("theme", theme)
		setIsDark(theme === "dark")
	}

	function toggleTheme() {
		setTheme(isDark ? "light" : "dark")
	}

	function setGlassEnabled(enabled: boolean) {
		localStorage.setItem("glass-enabled", String(enabled))
		setGlassEnabledState(enabled)
	}

	return (
		<ThemeContext.Provider
			value={{
				isDark,
				setTheme,
				toggleTheme,
				glassEnabled,
				setGlassEnabled
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
