import type { Publication } from "@/types/cv"

interface PublicationsProps {
    publications: Publication[]
}
export default function Publications({ publications }: PublicationsProps) {
    return (
        <div className="flex flex-col">
            <h2>Research</h2>
            {publications.map(pub => (
                <a key={pub.title} className="mb-2 inline" href={pub.link}>
                    <span className="font-bold">{pub.title}</span>
                    <span className="italic"> {pub.year}</span>
                </a>
            ))}
        </div>
    )
}