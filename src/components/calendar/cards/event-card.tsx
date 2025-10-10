import type { ProfessionalExperience, Education } from "@/types/cv";
import EducationCard from "./education-card";
import WorkCard from "./work-card";
import type { EventType } from "@/types/calendar";


interface EventCardProps {
    type: EventType
    info: ProfessionalExperience | Education
}


export default function EventCard({ type, info }: EventCardProps) {
    if (type === "work") {
        return <WorkCard info={info as ProfessionalExperience} />
    } else {
        return <EducationCard info={info as Education} />
    }
}