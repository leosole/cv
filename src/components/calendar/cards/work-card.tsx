import { CardDescription } from "@/components/ui/card";
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from "@/components/ui/collapsible-card";
import type { ProfessionalExperience } from "@/types/cv";

interface WorkCardProps {
    info: ProfessionalExperience
}

export default function WorkCard({ info }: WorkCardProps) {
    return (
        <CollapsibleCard>
            <CollapsibleCardHeader>{info.company}</CollapsibleCardHeader>
            <CollapsibleCardContent>
                {info.positions.map(position => (
                    <div key={position.role} className="mb-4">
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
        </CollapsibleCard>
    )
}