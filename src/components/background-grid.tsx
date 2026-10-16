import "./background-grid.css"
import { useEffect, useRef } from "react"

export function BackgroundGrid() {
	const gridRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const grid = gridRef.current
		if (!grid) return

		const moveHighlight = (event: PointerEvent) => {
			const bounds = grid.getBoundingClientRect()
			const x = event.clientX - bounds.left
			const y = event.clientY - bounds.top

			if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
				grid.style.setProperty("--mouse-x", "-1000px")
				grid.style.setProperty("--mouse-y", "-1000px")
				return
			}

			grid.style.setProperty("--mouse-x", `${x}px`)
			grid.style.setProperty("--mouse-y", `${y}px`)
		}

		window.addEventListener("pointermove", moveHighlight)
		return () => window.removeEventListener("pointermove", moveHighlight)
	}, [])

	return (
		<div
			ref={gridRef}
			aria-hidden="true"
			className="background-grid pointer-events-none absolute inset-0 z-0 mix-blend-multiply dark:mix-blend-lighten"
		/>
	)
}