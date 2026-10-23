import { useEffect, useLayoutEffect, useState } from "react"
import { ThemeContext, type Theme } from "@/hooks/use-theme"
import { isPageColorVariable, type PageColorVariable } from "@/lib/page-colors"

const PAGE_COLORS_KEY = "page-colors"
const THEME_KEY = "theme"
const GLASS_KEY = "glass-enabled"
const DARK_CLASS = "dark"
const GLASS_OFF_CLASS = "glass-effect-off"

const isBrowser = typeof window !== "undefined"
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

type PageColorOverrides = Partial<Record<PageColorVariable, string>>

interface Preferences {
	isDark: boolean
	glassEnabled: boolean
}

// The prerendered markup cannot know the visitor's stored preferences, so these
// defaults are what both the server and the client's first render use.
const DEFAULT_PREFERENCES: Preferences = { isDark: false, glassEnabled: true }

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

function readStoredPreferences(): Preferences {
	try {
		return {
			isDark: localStorage.getItem(THEME_KEY) === "dark",
			glassEnabled: localStorage.getItem(GLASS_KEY) !== "false"
		}
	} catch {
		return DEFAULT_PREFERENCES
	}
}

export default function ThemeProvider({
	children
}: {
	children: React.ReactNode
}) {
	const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
	const [pageColorOverrides, setPageColorOverrides] = useState<PageColorOverrides>(() =>
		isBrowser ? readPageColorOverrides() : {}
	)

	// index.html already applied the stored preferences before first paint; this
	// only syncs them into React state without making the first render differ
	// from the prerendered markup.
	useIsomorphicLayoutEffect(() => {
		setPreferences(readStoredPreferences())
	}, [])

	useIsomorphicLayoutEffect(() => {
		document.body.classList.toggle(DARK_CLASS, preferences.isDark)
		document.body.classList.toggle(GLASS_OFF_CLASS, !preferences.glassEnabled)
	}, [preferences])

	useEffect(() => {
		for (const [variable, color] of Object.entries(pageColorOverrides)) {
			document.body.style.setProperty(variable, color)
		}
		localStorage.setItem(PAGE_COLORS_KEY, JSON.stringify(pageColorOverrides))
	}, [pageColorOverrides])

	function setTheme(theme: Theme) {
		localStorage.setItem(THEME_KEY, theme)
		setPreferences((current) => ({ ...current, isDark: theme === "dark" }))
	}

	function toggleTheme() {
		setTheme(preferences.isDark ? "light" : "dark")
	}

	function setGlassEnabled(enabled: boolean) {
		localStorage.setItem(GLASS_KEY, String(enabled))
		setPreferences((current) => ({ ...current, glassEnabled: enabled }))
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

	function revertPageColors() {
		localStorage.removeItem(PAGE_COLORS_KEY)
		window.location.reload()
	}

	return (
		<ThemeContext.Provider
			value={{
				isDark: preferences.isDark,
				setTheme,
				toggleTheme,
				glassEnabled: preferences.glassEnabled,
				setGlassEnabled,
				setPageColors,
				revertPageColors
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}
