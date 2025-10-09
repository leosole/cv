import { useEffect, useState } from "react"
import { ThemeContext } from "@/hooks/use-theme"

export default function ThemeProvider({
	children
}: {
	children: React.ReactNode
}) {
	const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark")
	useEffect(() => {
		if (isDark) document.body.classList.add("dark")
		else document.body.classList.remove("dark")
	}, [isDark])

	function toggleTheme() {
		localStorage.setItem("theme", isDark ? "light" : "dark")
		setIsDark(!isDark)
	}

	return (
		<ThemeContext.Provider value={{ isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}
