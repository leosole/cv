import { useEffect, useState } from "react"
import { ThemeContext, type Theme } from "@/hooks/use-theme"
import { isPageColorVariable, type PageColorVariable } from "@/lib/page-colors"

const PAGE_COLORS_KEY = "page-colors"

type PageColorOverrides = Partial<Record<PageColorVariable, string>>

function isValidCssColor(value: unknown): value is string {
	return typeof value === "string" &&
		value.length <= 80 &&
		!/[;{}]/.test(value) &&
		!/(?:var|url)\s*\(/i.test(value) &&
		typeof CSS !== "undefined" &&
		CSS.supports("color", value)
}

function readPageColorOverrides(): PageColorOverrides {
	try {
		const stored = localStorage.getItem(PAGE_COLORS_KEY)
		if (!stored) return {}
		const parsed: unknown = JSON.parse(stored)
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}

		return Object.fromEntries(
			Object.entries(parsed).filter(([variable, color]) =>
				isPageColorVariable(variable) && isValidCssColor(color)
			)
		) as PageColorOverrides
	} catch {
		return {}
	}
}

export default function ThemeProvider({
	children
}: {
	children: React.ReactNode
}) {
	const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark")
	const [glassEnabled, setGlassEnabledState] = useState(
		localStorage.getItem("glass-enabled") !== "false"
	)
	const [pageColorOverrides, setPageColorOverrides] = useState(readPageColorOverrides)
	useEffect(() => {
		if (isDark) document.body.classList.add("dark")
		else document.body.classList.remove("dark")
	}, [isDark])
	useEffect(() => {
		for (const [variable, color] of Object.entries(pageColorOverrides)) {
			document.body.style.setProperty(variable, color)
		}
		localStorage.setItem(PAGE_COLORS_KEY, JSON.stringify(pageColorOverrides))
	}, [pageColorOverrides])

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

	function setPageColors(colors: unknown) {
		if (!Array.isArray(colors)) return

		setPageColorOverrides((current) => {
			const next = { ...current }
			for (const item of colors) {
				if (!item || typeof item !== "object") continue
				const { variable, color } = item as Record<string, unknown>
				if (typeof variable === "string" && isPageColorVariable(variable) && isValidCssColor(color)) {
					next[variable] = color.trim()
				}
			}
			return next
		})
	}

	return (
		<ThemeContext.Provider
			value={{
				isDark,
				setTheme,
				toggleTheme,
				glassEnabled,
				setGlassEnabled,
				setPageColors
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
