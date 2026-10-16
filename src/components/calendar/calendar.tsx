import type { Education, ProfessionalExperience } from "@/types/cv"
import { parseISO, differenceInMonths, add, format } from "date-fns"
import EventCard from "./event-card"
import EventBar from "./event-bar"
import type { ProcessedEvent } from "@/types/calendar"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { getEventId } from "@/lib/strings"
import { cn } from "@/lib/utils"
import { useCardState } from "@/hooks/use-card-state"

interface CalendarProps {
	events: (ProfessionalExperience | Education)[]
}

const COLLAPSED_CARD_HEIGHT_REM = 4
const CARD_MARGIN_REM = 1

function Calendar({ events }: CalendarProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const cursorLabelRef = useRef<HTMLSpanElement>(null)
	const pendingPointerYRef = useRef<number | null>(null)
	const pointerFrameRef = useRef<number | null>(null)
	const [hoveredCard, setHoveredCard] = useState<number | undefined>()
	const { openedCards, setOpenedCards } = useCardState()

	const processedEvents = useMemo<ProcessedEvent[]>(
		() => events.map((event) => {
			const isWork = "company" in event
			const startDate = parseISO(
				isWork
					? event.positions[event.positions.length - 1].start_date
					: event.start_date
			)
			const endDateString = isWork
				? event.positions[0].end_date
				: event.end_date
			const endDate =
				endDateString.toLowerCase() === "present"
					? new Date()
					: parseISO(endDateString)
			return {
				...event,
				startDate,
				endDate,
				durationInMonths: differenceInMonths(endDate, startDate) || 1,
				eventType: (isWork ? "work" : "education") as "work" | "education"
			}
		}).sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
		[events]
	)

	const timelineStart = useMemo(() => new Date(), [])
	const timelineEnd =
		processedEvents.length > 0
			? processedEvents[processedEvents.length - 1].startDate
			: new Date()
	const totalTimelineMonths = differenceInMonths(timelineStart, timelineEnd)

	const years = useMemo(
		() => Array.from(new Set(processedEvents.map((event) => event.endDate.getFullYear()))).sort((a, b) => b - a),
		[processedEvents]
	)

	const getMonthOffset = (date: Date) => {
		return differenceInMonths(timelineStart, date)
	}

	const eventColumnIndexById = useMemo(() => {
		const sortedEvents = [...processedEvents].sort(
			(a, b) => a.startDate.getTime() - b.startDate.getTime()
		)
		const columnEndTimes: number[] = []
		const columnByEventId = new Map<string, number>()

		for (const event of sortedEvents) {
			const startTime = event.startDate.getTime()
			let columnIndex = columnEndTimes.findIndex((endTime) => endTime < startTime)
			if (columnIndex === -1) columnIndex = columnEndTimes.length
			columnEndTimes[columnIndex] = event.endDate.getTime()
			columnByEventId.set(getEventId(event), columnIndex)
		}

		return columnByEventId
	}, [processedEvents])
	const totalMinHeightRem =
		processedEvents.length * (COLLAPSED_CARD_HEIGHT_REM + CARD_MARGIN_REM)
	const hoverHandlers = useMemo(
		() => processedEvents.map((_, index) => () => setHoveredCard(index)),
		[processedEvents]
	)
	const clearHoveredCard = useMemo(() => () => setHoveredCard(undefined), [])
	const openHandlers = useMemo(
		() => processedEvents.map((_, index) => (open: boolean) => {
			setOpenedCards((previous) => {
				if (open) return previous.includes(index) ? previous : [...previous, index]
				return previous.filter((cardIndex) => cardIndex !== index)
			})
		}),
		[processedEvents, setOpenedCards]
	)

	useEffect(() => () => {
		if (pointerFrameRef.current !== null) {
			cancelAnimationFrame(pointerFrameRef.current)
		}
	}, [])

	const onMouseMove = (event: React.MouseEvent) => {
		pendingPointerYRef.current = event.clientY
		if (pointerFrameRef.current !== null) return

		pointerFrameRef.current = requestAnimationFrame(() => {
			pointerFrameRef.current = null
			const container = containerRef.current
			const label = cursorLabelRef.current
			const pointerY = pendingPointerYRef.current
			if (!container || !label || pointerY === null) return

			const bounds = container.getBoundingClientRect()
			if (bounds.height <= 0) return
			const position = Math.max(0, Math.min(bounds.height, pointerY - bounds.top))
			const months = Math.floor((totalTimelineMonths * (bounds.height - position)) / bounds.height)
			label.textContent = format(add(timelineEnd, { months }), "yyyy")
			label.style.transform = `translateY(${position}px)`
			label.style.visibility = "visible"
		})
	}

	const onMouseLeave = () => {
		if (pointerFrameRef.current !== null) {
			cancelAnimationFrame(pointerFrameRef.current)
			pointerFrameRef.current = null
		}
		pendingPointerYRef.current = null
		if (cursorLabelRef.current) cursorLabelRef.current.style.visibility = "hidden"
	}

	if (processedEvents.length === 0) {
		return null
	}

	return (
		<div
			ref={containerRef}
			className="relative container mx-auto pl-8 z-10"
			style={{ minHeight: `${totalMinHeightRem}rem`, position: "relative" }}
		>
			<div 
				className="hidden sm:block absolute left-0 top-0 bottom-0 w-20 z-50" 
				onMouseEnter={onMouseMove} 
				onMouseMove={onMouseMove} 
				onMouseLeave={onMouseLeave}
			>
				<span
					ref={cursorLabelRef}
					className="absolute rounded bg-pink-500 px-1 text-xs pointer-events-none"
					style={{ left: 12, top: 0, visibility: "hidden" }}
				/>
			</div>
			<div className="absolute left-0 sm:left-10 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"/>

			{years.map((year) => {
				const yearDate = new Date(year, 11, 31)
				const topPosition =
					(getMonthOffset(yearDate) / totalTimelineMonths) * 100
				if (topPosition < 0 || topPosition > 100) return null

				return (
					<div
						key={year}
						className="absolute left-0 w-full hidden sm:block"
						style={{ top: `${topPosition}%` }}
					>
						<div className="absolute left-0 ">
							<span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
								{year}
							</span>
						</div>
					</div>
				)
			})}

			{processedEvents.map((event, index) => {
				const topPositionPercent =
					(getMonthOffset(event.endDate) / totalTimelineMonths) * 100
				const heightPercent =
					(event.durationInMonths / totalTimelineMonths) * 100
				const eventColumnIndex = eventColumnIndexById.get(getEventId(event)) ?? 0
				const barMarginLeftRem = eventColumnIndex * 0.5 + 0.5

				return (
					<button
						key={`${getEventId(event)}`}
						className="absolute left-0 sm:left-10 group cursor-pointer z-20"
						style={{
							top: `${topPositionPercent}%`,
							height: `${heightPercent}%`,
							marginLeft: `${barMarginLeftRem}rem`
						}}
						onClick={() => {
							setOpenedCards( prev => {
								if (prev.includes(index)) return prev.filter(p => p!== index)
								else return [...prev, index]
							})
						}}
						onMouseEnter={hoverHandlers[index]}
						onMouseLeave={clearHoveredCard}
					>
						<EventBar
							className={cn(
								event.eventType === "work" ? "bg-primary" : "bg-accent",
								hoveredCard === index && "outline outline-foreground",
								"group-hover:outline group-hover:outline-foreground transition-[outline] duration-300"
							)}
						/>
					</button>
				)
			})}

			<div className="relative flex flex-col gap-4 ml-2 sm:ml-14">
				{processedEvents.map((event, index) => {
					return (
						<EventCard
							onMouseEnter={hoverHandlers[index]}
							onMouseLeave={clearHoveredCard}
							key={`${getEventId(event)}`}
							type={event.eventType}
							info={event}
							hover={hoveredCard === index}
							open={openedCards.includes(index)}
							setOpen={openHandlers[index]}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default memo(Calendar)
