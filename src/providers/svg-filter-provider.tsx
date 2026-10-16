import { useEffect } from "react"

const complexBackdropFilter = "url(#lg) blur(3px) saturate(180%)"

function supportsSvgBackdropFilters() {
	return (
		typeof window !== "undefined" &&
		"SVGFETurbulenceElement" in window &&
		"SVGFEDisplacementMapElement" in window &&
		typeof CSS !== "undefined" &&
		(CSS.supports("backdrop-filter", complexBackdropFilter) ||
			CSS.supports("-webkit-backdrop-filter", complexBackdropFilter))
	)
}

export default function SvgFilterProvider({
	children
}: {
	children: React.ReactNode
}) {
	useEffect(() => {
		const supported = supportsSvgBackdropFilters()
		document.body.classList.toggle("svg-filters-supported", supported)
		document.body.classList.toggle("svg-filters-unsupported", !supported)

		return () => {
			document.body.classList.remove(
				"svg-filters-supported",
				"svg-filters-unsupported"
			)
		}
	}, [])

	return children
}
