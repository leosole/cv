import type { Education, ProfessionalExperience } from "@/types/cv"
import { parseISO, differenceInMonths, add, format } from "date-fns"
import EventCard from "./event-card"
import EventBar from "./event-bar"
import type { ProcessedEvent } from "@/types/calendar"
import { useRef, useState } from "react"
import { getEventId } from "@/lib/strings"
import { cn } from "@/lib/utils"

interface CalendarProps {
	events: (ProfessionalExperience | Education)[]
	headerHeight?: number
}

const COLLAPSED_CARD_HEIGHT_REM = 4
const CARD_MARGIN_REM = 1

export default function Calendar({ events, headerHeight = 0 }: CalendarProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [hoveredCard, setHoveredCard] = useState<number>()
	const [mouseYear, setMouseYear] = useState<string>()
	const [mousePosition, setMousePosition] = useState<number>()
	const [openedCards, setOpenedCards] = useState<number[]>(events.map((_, i) => i))

	const processedEvents: ProcessedEvent[] = events
		.map((event) => {
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
		})
		.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

	if (processedEvents.length === 0) {
		return null
	}

	const timelineStart = new Date()
	const timelineEnd =
		processedEvents.length > 0
			? processedEvents[processedEvents.length - 1].startDate
			: new Date()
	const totalTimelineMonths = differenceInMonths(timelineStart, timelineEnd)

	const years = Array.from(
		new Set(
			processedEvents
				.map((e) => e.endDate.getFullYear())
		)
	).sort((a, b) => b - a)

	const getMonthOffset = (date: Date) => {
		return differenceInMonths(timelineStart, date)
	}

	const getOverlapColumns = (events: ProcessedEvent[]) => {
		const sortedEvents = [...events].sort(
			(a, b) => a.startDate.getTime() - b.startDate.getTime()
		)
		const columns: ProcessedEvent[][] = []

		for (const event of sortedEvents) {
			let placed = false
			for (const column of columns) {
				const lastEvent = column[column.length - 1]
				if (lastEvent.endDate.getTime() < event.startDate.getTime()) {
					column.push(event)
					placed = true
					break
				}
			}
			if (!placed) {
				columns.push([event])
			}
		}

		return columns
	}

	const overlapColumns = getOverlapColumns(processedEvents)
	const totalMinHeightRem =
		processedEvents.length * (COLLAPSED_CARD_HEIGHT_REM + CARD_MARGIN_REM)

	const getYearFromOffset = () => {
		const totalHeight = containerRef.current?.getBoundingClientRect().height
		if (totalHeight && mousePosition) {
			const months = Math.floor((totalTimelineMonths * (totalHeight - mousePosition))/totalHeight)
			setMouseYear(format(add(timelineEnd, { months }), "yyyy"))
		}
	}

	const onMouseMove = (e: React.MouseEvent) => {
		setMousePosition(e.pageY-headerHeight-32)
		getYearFromOffset()
	}
	return (
		<div
			ref={containerRef}
			className="relative container mx-auto pl-8"
			style={{ minHeight: `${totalMinHeightRem}rem`, position: "relative" }}
		>
			<div 
				className="absolute left-0 top-0 bottom-0 w-20 z-10" 
				onMouseEnter={onMouseMove} 
				onMouseMove={onMouseMove} 
				onMouseLeave={() => setMousePosition(undefined)}
			>
				<span 
					className="absolute rounded bg-pink-500 px-1 text-xs pointer-events-none"
					style={{left: mousePosition ? 12 : -1000, top: mousePosition ? mousePosition : -1000}}
				>
					{mouseYear}
				</span>
			</div>
			<div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"/>

			{years.map((year) => {
				const yearDate = new Date(year, 11, 31)
				const topPosition =
					(getMonthOffset(yearDate) / totalTimelineMonths) * 100
				if (topPosition < 0 || topPosition > 100) return null

				return (
					<div
						key={year}
						className="absolute left-0 w-full"
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
				const eventColumnDetails = overlapColumns
					.map((col, i) => ({ col, i }))
					.find(({ col }) => col.includes(event))
				const eventColumnIndex = eventColumnDetails ? eventColumnDetails.i : 0
				const barMarginLeftRem = eventColumnIndex * 0.5 + 0.5

				return (
					<button
						key={`${getEventId(event)}`}
						className="absolute left-10 group cursor-pointer z-20"
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
						onMouseEnter={() => setHoveredCard(index)}
						onMouseLeave={() => setHoveredCard(undefined)}
					>
						<EventBar
							className={cn(
								event.eventType === "work" ? "bg-blue-500" : "bg-green-500",
								hoveredCard === index && "outline outline-foreground",
								"group-hover:outline group-hover:outline-foreground transition-[outline] duration-300"
							)}
						/>
					</button>
				)
			})}

			<div className="relative flex flex-col gap-4 ml-14 lg:ml-12">
				{processedEvents.map((event, index) => {
					return (
						<EventCard
							onMouseEnter={() => setHoveredCard(index)}
							onMouseLeave={() => setHoveredCard(undefined)}
							key={`${getEventId(event)}`}
							type={event.eventType}
							info={event}
							hover={hoveredCard === index}
							open={openedCards.includes(index)}
							setOpen={e => setOpenedCards( prev => {
								if (e) return [...prev, index]
								else return prev.filter(p => p!== index)
							})}
						/>
					)
				})}
			</div>
		</div>
	)
}
