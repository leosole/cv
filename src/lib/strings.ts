import type { ProcessedEvent } from "@/types/calendar";

export function safeId(str: string) {
    return str.normalize("NFD").replace(/[()\u0300-\u036f\s]/g, "");
}
//.replace(/[()]/g, "").replace(/\s/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")

export function getEventId(event: ProcessedEvent) {
    return `${safeId(event.type)}-${'company' in event ? safeId(event.company) : safeId(event.institution)}`;
}