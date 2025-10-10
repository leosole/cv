import { CardDescription } from "@/components/ui/card";
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from "@/components/ui/collapsible-card";
import type { Education } from "@/types/cv";

interface EducationCardProps {
    info: Education
}

export default function EducationCard({ info }: EducationCardProps) {
    return (
        <CollapsibleCard>
            <CollapsibleCardHeader>
                {info.institution}
            </CollapsibleCardHeader>
            <CollapsibleCardContent>
                <CardDescription>{info.degree}</CardDescription>
                <p className="text-sm text-muted-foreground">
                    {info.start_date} - {info.end_date}
                </p>
            </CollapsibleCardContent>
        </CollapsibleCard>
    )
}