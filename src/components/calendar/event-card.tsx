import type { ProfessionalExperience, Education } from "@/types/cv"
import type { EventType, ProcessedEvent } from "@/types/calendar"
import { CardDescription } from "@/components/ui/card"
import {
	CollapsibleCard,
	CollapsibleCardHeader,
	CollapsibleCardContent
} from "@/components/ui/collapsible-card"
import { format } from "date-fns"

interface EventCardProps {
	type: EventType
	info: ProcessedEvent
	ref?: React.Ref<HTMLDivElement>
	className?: string
	onMouseEnter: () => void
	onMouseLeave: () => void
	onToggle: (open: boolean) => void
}

export default function EventCard({
	type,
	info,
	ref,
	className,
	onMouseEnter,
	onMouseLeave,
	onToggle
}: EventCardProps) {
	return (
		<CollapsibleCard
			ref={ref}
			className={className}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onOpenChange={(e) => onToggle(e)}
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
	return (
		<>
			<CollapsibleCardHeader>{work.company}</CollapsibleCardHeader>
			<CollapsibleCardContent>
				{work.positions.map((position) => (
					<div key={position.role} className="mb-2">
						<CardDescription>{position.role}</CardDescription>
						<p className="text-sm text-muted-foreground">
							{format(info.startDate, "MMM, yyyy")} -{" "}
							{format(info.endDate, "MMM, yyyy")}
						</p>
						<ul className="list-disc list-inside mt-2">
							{position.tasks.map((task) => (
								<li key={task} className="text-sm">
									{task}
								</li>
							))}
						</ul>
					</div>
				))}
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
			<CollapsibleCardHeader>{education.institution}</CollapsibleCardHeader>
			<CollapsibleCardContent>
				<CardDescription>{education.degree}</CardDescription>
				<p className="text-sm text-muted-foreground">
					{format(info.startDate, "MMM, yyyy")} -{" "}
					{format(info.endDate, "MMM, yyyy")}
				</p>
			</CollapsibleCardContent>
		</>
	)
}
