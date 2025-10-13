import type { ProfessionalExperience, Education } from "@/types/cv"
import type { EventType, ProcessedEvent } from "@/types/calendar"
import { CardDescription } from "@/components/ui/card"
import {
	CollapsibleCard,
	CollapsibleCardHeader,
	CollapsibleCardContent
} from "@/components/ui/collapsible-card"
import { format, parseISO } from "date-fns"
import { FaGraduationCap } from "react-icons/fa";
import { RiTerminalBoxFill } from "react-icons/ri";
import { IoMdBriefcase } from "react-icons/io";
import { RiSurveyFill } from "react-icons/ri";
import { cn } from "@/lib/utils"

interface EventCardProps {
	type: EventType
	info: ProcessedEvent
	className?: string
	hover?: boolean
	onMouseEnter: () => void
	onMouseLeave: () => void
	open?: boolean
	setOpen: (open: boolean) => void
}

export default function EventCard({
	type,
	info,
	className,
	hover,
	onMouseEnter,
	onMouseLeave,
	open,
	setOpen,
}: EventCardProps) {
	return (
		<CollapsibleCard
			open={open}
			onOpenChange={() => {
				setOpen(!open)
			}}
			className={cn("hover:bg-muted transition-colors duration-200", hover && "bg-muted", className)}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{type === "work" ? (
				<WorkCard info={info} />
			) : (
				<EducationCard info={info} />
			)}
		</CollapsibleCard>
	)
}

interface WorkCardProps {
	info: ProcessedEvent
}

export function WorkCard({ info }: WorkCardProps) {
	const work = info as ProfessionalExperience
	const icon = () => {
		switch(work.type) {
			case "Research": return <RiSurveyFill/>
			case "Software Development": return <RiTerminalBoxFill/>
			default: return <IoMdBriefcase/>
		}
	}
	return (
		<>
			<CollapsibleCardHeader>
				<span>{icon()}</span>
				{work.company}
			</CollapsibleCardHeader>
			<CollapsibleCardContent>
				{work.positions.map((position) => {
					const startDate = format(parseISO(position.start_date), "MMM, yyyy")
					const endDateString = position.end_date
					const endDate =
						endDateString.toLowerCase() === "present"
							? "present"
							: format(parseISO(endDateString), "MMM, yyyy")
					return(
						<div key={position.role} className="mb-2">
							<CardDescription>{position.role}</CardDescription>
							<DateRange start={startDate} end={endDate} />
							<ul className="list-disc list-inside mt-2">
								{position.tasks.map((task) => (
									<li key={task} className="text-sm">
										{task}
									</li>
								))}
							</ul>
						</div>
					)
				})}
			</CollapsibleCardContent>
		</>
	)
}

interface EducationCardProps {
	info: ProcessedEvent
}

export function EducationCard({ info }: EducationCardProps) {
	const education = info as Education
	return (
		<>
			<CollapsibleCardHeader>
				<span><FaGraduationCap/></span>
				{education.institution}
			</CollapsibleCardHeader>
			<CollapsibleCardContent>
				<CardDescription>{education.degree}</CardDescription>
				<DateRange start={format(info.startDate, "MMM, yyyy")} end={format(info.endDate, "MMM, yyyy")} />
			</CollapsibleCardContent>
		</>
	)
}

function DateRange({ start, end }: { start: string; end: string }) {
	return (
		<span className="text-sm text-muted-foreground">
			{start} - {end}
		</span>
	)
}