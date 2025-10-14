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
import { TbExternalLink } from "react-icons/tb";
import { FaRegFilePdf } from "react-icons/fa6";

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
								{position.tasks.map((task, index) => (
									<li key={task} className="text-sm">
										{task}
										{position.publications && position.publications.length > 0 && (
											<a key={position.publications[index].title} className="mb-2 inline" href={position.publications[index].link}>
												<span className="font-bold"> {position.publications[index].title}</span>
												<span className="italic"> {position.publications[index].year}</span>
												{position.publications[index].link.endsWith(".pdf") ? <FaRegFilePdf className="inline mb-1 ml-1"/> : <TbExternalLink className="inline mb-1 ml-1"/>}
											</a>
										)}
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