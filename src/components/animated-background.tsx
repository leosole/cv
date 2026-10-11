import { motion, useMotionValue } from "motion/react"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import {
	createPhysicsBodies,
	resizePhysicsBodies,
	stepPhysics,
	type BlobDefinition,
	type CursorObstacle,
	type PhysicsBody
} from "@/lib/ambient-physics"
import "./animated-background.css"

export const BLOB_DEFINITIONS = [
	{ id: "purple-0", color: "#8b5cf6", size: 440, speed: 25, blur: 92 },
	{ id: "purple-1", color: "#8b5cf6", size: 530, speed: 19, blur: 112 },
	{ id: "purple-2", color: "#8b5cf6", size: 365, speed: 31, blur: 78 },
	{ id: "green-0", color: "#34d399", size: 480, speed: 22, blur: 100 },
	{ id: "green-1", color: "#34d399", size: 320, speed: 35, blur: 70 },
	{ id: "green-2", color: "#34d399", size: 565, speed: 17, blur: 118 }
] as const satisfies readonly BlobDefinition[]

const POINTER_RADIUS = 48
const MAX_DELTA_SECONDS = 1 / 30

function useBlobMotionValues() {
	const x = useMotionValue(0)
	const y = useMotionValue(0)
	const diameter = useMotionValue(0)
	const scaleX = useMotionValue(1)
	const scaleY = useMotionValue(1)

	return useMemo(
		() => ({
			x,
			y,
			diameter,
			scaleX,
			scaleY
		}),
		[x, y, diameter, scaleX, scaleY]
	)
}

function setMotionValues(
	bodies: PhysicsBody[],
	values: ReturnType<typeof useBlobMotionValues>[]
) {
	for (const [index, body] of bodies.entries()) {
		const motionValues = values[index]
		if (!motionValues) continue
		motionValues.x.set(body.x - body.radius)
		motionValues.y.set(body.y - body.radius)
		motionValues.diameter.set(body.radius * 2)
		motionValues.scaleX.set(body.scaleX)
		motionValues.scaleY.set(body.scaleY)
	}
}

export function AnimatedBackground() {
	const rose = useBlobMotionValues()
	const sky = useBlobMotionValues()
	const violet = useBlobMotionValues()
	const mint = useBlobMotionValues()
	const amber = useBlobMotionValues()
	const coral = useBlobMotionValues()
	const motionValues = useMemo(
		() => [rose, sky, violet, mint, amber, coral],
		[rose, sky, violet, mint, amber, coral]
	)
	const backgroundRef = useRef<HTMLDivElement>(null)
	const bodiesRef = useRef<PhysicsBody[]>([])
	const boundsRef = useRef({ width: 0, height: 0 })
	const cursorClientPositionRef = useRef({ x: 0, y: 0 })
	const cursorRef = useRef<CursorObstacle>({
		x: 0,
		y: 0,
		radius: POINTER_RADIUS,
		active: false
	})

	useLayoutEffect(() => {
		const width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
		const height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
		boundsRef.current = { width, height }
		if (backgroundRef.current) {
			backgroundRef.current.style.width = `${width}px`
			backgroundRef.current.style.height = `${height}px`
		}
		bodiesRef.current = createPhysicsBodies(BLOB_DEFINITIONS, width, height)
		setMotionValues(bodiesRef.current, motionValues)
	}, [motionValues])

	useEffect(() => {
		let animationFrame = 0
		let previousTimestamp = 0
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

		const updateMotion = () => setMotionValues(bodiesRef.current, motionValues)
		const handleResize = () => {
			const { width: oldWidth, height: oldHeight } = boundsRef.current
			const width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
			const height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
			boundsRef.current = { width, height }
			if (backgroundRef.current) {
				backgroundRef.current.style.width = `${width}px`
				backgroundRef.current.style.height = `${height}px`
			}
			resizePhysicsBodies(
				bodiesRef.current,
				BLOB_DEFINITIONS,
				oldWidth,
				oldHeight,
				width,
				height
			)
			updateMotion()
		}
		const handlePointerMove = (event: PointerEvent) => {
			const cursor = cursorRef.current
			cursorClientPositionRef.current = { x: event.clientX, y: event.clientY }
			cursor.x = event.pageX
			cursor.y = event.pageY
			cursor.active = true
		}
		const handleScroll = () => {
			const cursor = cursorRef.current
			if (!cursor.active) return
			cursor.x = cursorClientPositionRef.current.x + window.scrollX
			cursor.y = cursorClientPositionRef.current.y + window.scrollY
		}
		const handlePointerLeave = () => {
			cursorRef.current.active = false
		}
		const handleMotionPreference = () => {
			previousTimestamp = 0
		}
		const animate = (timestamp: number) => {
			const deltaSeconds =
				previousTimestamp === 0
					? 0
					: Math.min((timestamp - previousTimestamp) / 1000, MAX_DELTA_SECONDS)
			previousTimestamp = timestamp

			const { width, height } = boundsRef.current
			const cursor = cursorRef.current
			const motionScale = reducedMotion.matches ? 0.35 : 1
			stepPhysics(
				bodiesRef.current,
				width,
				height,
				deltaSeconds,
				cursor,
				motionScale
			)
			updateMotion()
			animationFrame = window.requestAnimationFrame(animate)
		}

		window.addEventListener("resize", handleResize)
		window.addEventListener("scroll", handleScroll, { passive: true })
		window.addEventListener("pointermove", handlePointerMove, { passive: true })
		window.addEventListener("pointerleave", handlePointerLeave)
		reducedMotion.addEventListener("change", handleMotionPreference)
		const resizeObserver = new ResizeObserver(handleResize)
		resizeObserver.observe(document.body)

		animationFrame = window.requestAnimationFrame(animate)

		return () => {
			window.cancelAnimationFrame(animationFrame)
			window.removeEventListener("resize", handleResize)
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("pointermove", handlePointerMove)
			window.removeEventListener("pointerleave", handlePointerLeave)
			reducedMotion.removeEventListener("change", handleMotionPreference)
			resizeObserver.disconnect()
		}
	}, [motionValues])

	return (
		<div
			ref={backgroundRef}
			className="animated-background mix-blend-multiply dark:mix-blend-lighten"
			aria-hidden="true"
		>
			{BLOB_DEFINITIONS.map((blob, index) => {
				const values = motionValues[index]
				if (!values) return null

				return (
					<motion.div
						key={blob.id}
						className="animated-background__blob"
						style={{
							x: values.x,
							y: values.y,
							width: values.diameter,
							height: values.diameter,
							scaleX: values.scaleX,
							scaleY: values.scaleY,
							backgroundColor: blob.color,
							filter: `blur(min(${blob.blur}px, 11vw, 11vh))`
						}}
					/>
				)
			})}
		</div>
	)
}
