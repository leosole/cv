import type { Language, Links } from "@/types/cv";
import { Badge } from "./ui/badge";
import Flag from "./flags";

interface SummaryProps {
    summary: string
    skills: string[]
    languages: Language[]
}

export default function Summary({ summary, skills, languages }: SummaryProps) {
    return (
        <div className="container mx-auto my-4 flex flex-col gap-2">
                <div className="flex gap-2">
                    {languages.map(lang =>
                        <Flag country={lang.country} percent={lang.percent} title={`${lang.language}: ${lang.proficiency}`}/>
                    )}
                </div>
            <div className="flex flex-col gap-2">
                <span>{summary}</span>
                <div>
                    {skills.map(skill => <Badge key={skill} className="mx-1" variant="outline">{skill}</Badge>)}
                </div>
            </div>
        </div>
    )
}