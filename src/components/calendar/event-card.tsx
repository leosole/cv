import type { ProfessionalExperience, Education } from "@/types/cv";
import type { EventType } from "@/types/calendar";
import { CardDescription } from "@/components/ui/card";
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from "@/components/ui/collapsible-card";


interface EventCardProps {
    type: EventType
    info: ProfessionalExperience | Education
    ref?: React.Ref<HTMLDivElement>
    className?: string
    onMouseEnter: () => void
    onMouseLeave: () => void
    onToggle: (open: boolean) => void
}


export default function EventCard({ type, info, ref, className, onMouseEnter, onMouseLeave, onToggle }: EventCardProps) {
    return (
        <CollapsibleCard ref={ref} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onOpenChange={e => onToggle(e)}>
            {type === 'work' ? <WorkCard info={info as ProfessionalExperience} /> : <EducationCard info={info as Education} />}
        </CollapsibleCard>
    )
}

interface WorkCardProps {
    info: ProfessionalExperience
}

export function WorkCard({ info }: WorkCardProps) {
    return (
        <>
            <CollapsibleCardHeader>{info.company}</CollapsibleCardHeader>
            <CollapsibleCardContent>
                {info.positions.map(position => (
                    <div key={position.role} className="mb-2">
                        <CardDescription>{position.role}</CardDescription>
                        <p className="text-sm text-muted-foreground">
                            {position.start_date} - {position.end_date}
                        </p>
                        <ul className="list-disc list-inside mt-2">
                            {position.tasks.map(task => (
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
    info: Education
}

export function EducationCard({ info }: EducationCardProps) {
    return (
        <>
            <CollapsibleCardHeader>
                {info.institution}
            </CollapsibleCardHeader>
            <CollapsibleCardContent>
                <CardDescription>{info.degree}</CardDescription>
                <p className="text-sm text-muted-foreground">
                    {info.start_date} - {info.end_date}
                </p>
            </CollapsibleCardContent>
        </>
    )
}