import type { Links } from "@/types/cv";
import { IoLogoGithub, IoLogoLinkedin  } from "react-icons/io";
import { Button } from "./ui/button";

interface SummaryProps {
    links: Links,
    summary: string
}

export default function Summary({ links, summary }: SummaryProps) {
    return (
        <div className="container mx-auto my-4 flex flex-col gap-2">
            <span>{summary}</span>
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
        </div>
    )
}