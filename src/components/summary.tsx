import type { Links } from "@/types/cv";
import { IoLogoGithub, IoLogoLinkedin  } from "react-icons/io";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface SummaryProps {
    links: Links,
    summary: string
    skills: string[]
}

export default function Summary({ links, summary, skills }: SummaryProps) {
    return (
        <div className="container mx-auto my-4 flex flex-col gap-2">
            <div className="flex gap-2">
                <Button asChild variant="ghost" size="icon" title="GitHub">
                    <a href={links.github} aria-label="GitHub">
                        <IoLogoGithub />
                    </a>
                </Button>
                <Button asChild variant="ghost" size="icon" title="LinkedIn">
                    <a href={links.linkedin} aria-label="LinkedIn">
                        <IoLogoLinkedin />
                    </a>
                </Button>
            </div>
            <div>
                <span>{summary}</span>
                <div>
                    {skills.map(skill => <Badge key={skill} className="mx-1" variant="outline">{skill}</Badge>)}
                </div>
            </div>
        </div>
    )
}