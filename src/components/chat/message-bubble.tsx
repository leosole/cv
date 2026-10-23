import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react"
import type { Message } from "./chat"

// The markdown renderer is only needed once a message is shown, so it loads
// outside the critical bundle; the plain text is rendered until it arrives.
const ReactMarkdown = lazy(() => import("react-markdown"))

interface MessageBubbleProps {
	message?: Message
	allowedLinks?: ReadonlySet<string>
	children?: React.ReactNode
}

interface BubbleSize {
	width: number
	height: number
}

const TAIL_WIDTH = 20
const TAIL_HEIGHT = 10
const CORNER_RADIUS = 8

const getBubblePath = (width: number, height: number, isUser: boolean) => {
	const tailHeight = Math.min(TAIL_HEIGHT, height / 2)
	const bodyBottom = height - tailHeight
	const radius = Math.min(CORNER_RADIUS, width / 2, bodyBottom / 2)
	const tailWidth = Math.min(TAIL_WIDTH, Math.max(0, width - radius))

	if (isUser) {
		return [
			`M ${radius} 0`,
			`H ${width - radius}`,
			`Q ${width} 0 ${width} ${radius}`,
			`V ${bodyBottom - radius}`,
			`Q ${width} ${bodyBottom} ${width - radius} ${bodyBottom}`,
			`L ${width} ${height}`,
			`L ${width - tailWidth} ${bodyBottom}`,
			`H ${radius}`,
			`Q 0 ${bodyBottom} 0 ${bodyBottom - radius}`,
			`V ${radius}`,
			`Q 0 0 ${radius} 0`,
			"Z"
		].join(" ")
	}

	return [
		`M ${radius} 0`,
		`H ${width - radius}`,
		`Q ${width} 0 ${width} ${radius}`,
		`V ${bodyBottom - radius}`,
		`Q ${width} ${bodyBottom} ${width - radius} ${bodyBottom}`,
		`H ${tailWidth}`,
		`L 0 ${height}`,
		`L ${radius} ${bodyBottom}`,
		`Q 0 ${bodyBottom} 0 ${bodyBottom - radius}`,
		`V ${radius}`,
		`Q 0 0 ${radius} 0`,
		"Z"
	].join(" ")
}

export const MessageBubble = ({ message, allowedLinks, children }: MessageBubbleProps) => {
	const bubbleRef = useRef<HTMLDivElement>(null)
	const [size, setSize] = useState<BubbleSize>({ width: 0, height: 0 })
	const isUser = message?.role === "user"

	useLayoutEffect(() => {
		const bubble = bubbleRef.current
		if (!bubble) return

		const updateSize = () => {
			const { width, height } = bubble.getBoundingClientRect()
			setSize((current) =>
				current.width === width && current.height === height
					? current
					: { width, height }
			)
		}

		updateSize()
		const observer = new ResizeObserver(updateSize)
		observer.observe(bubble)
		return () => observer.disconnect()
	}, [])

	const shapeClasses = isUser
		? "fill-bubble-user/40 stroke-bubble-user"
		: "fill-bubble-bot/40 stroke-bubble-bot"

	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				ref={bubbleRef}
				className="relative inline-block max-w-xs break-words p-2 pb-4 text-gray-900 dark:text-gray-100"
			>
				{size.width > 0 && size.height > 0 && (
					<svg
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 size-full overflow-visible"
						viewBox={`0 0 ${size.width} ${size.height}`}
						preserveAspectRatio="none"
					>
						<path
							d={getBubblePath(size.width, size.height, isUser)}
							className={shapeClasses}
							strokeWidth="1.5"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
				)}
				<div className="relative z-10">
					<Suspense fallback={<p className="m-0">{message?.text}</p>}>
					<ReactMarkdown
						components={{
							p: ({ children }) => <p className="m-0">{children}</p>,
							a: ({ href, children }) => allowedLinks?.has(href ?? "")
								? <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="underline underline-offset-2">{children}</a>
								: <span>{children}</span>,
							code: ({ className, children, ...props }) => (
								<code
									className={`rounded bg-slate-100 px-1 py-0.5 text-sm ${className ?? ""}`}
									{...props}
								>
									{children}
								</code>
							)
						}}
					>
						{message?.text}
					</ReactMarkdown>
					</Suspense>
					{children}
				</div>
			</div>
		</div>
	)
}
