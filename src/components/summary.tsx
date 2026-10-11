import type { Language } from "@/types/cv";
import { Badge } from "./ui/badge";
import Flag from "./flags";

interface SummaryProps {
    summary: string
    skills: string[]
    languages: Language[]
    highlightedSkills: string[]
}

export default function Summary({ summary, skills, languages, highlightedSkills }: SummaryProps) {
    const highlightedSkillNames = new Set(highlightedSkills.map(skill => skill.trim().toLowerCase()))

    return (
        <div className="container mx-auto my-4 flex flex-col gap-2">
                <div className="flex gap-2">
                    {languages.map(lang =>
                        <Flag country={lang.country} key={lang.country} percent={lang.percent} title={`${lang.language}: ${lang.proficiency}`}/>
                    )}
                </div>
            <div className="flex flex-col gap-2">
                <span>{summary}</span>
                <div>
                    {skills.map(skill => (
                        <Badge
                            key={skill}
                            className="mx-1"
                            variant={highlightedSkillNames.has(skill.trim().toLowerCase()) ? "default" : "outline"}
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    )
}