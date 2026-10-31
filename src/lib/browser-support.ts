interface NavigatorUserAgentData {
	brands?: Array<{ brand: string }>
}

export function isChromiumBrowser(): boolean {
	if (typeof navigator === "undefined") return false

	const { userAgentData } = navigator as Navigator & {
		userAgentData?: NavigatorUserAgentData
	}
	const brands = userAgentData?.brands
	if (brands && brands.length > 0) {
		return brands.some(({ brand }) => /chromium/i.test(brand))
	}

	return /Chrome\//.test(navigator.userAgent)
}
