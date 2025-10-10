import type { ProfessionalExperience, Education } from "./cv"

export type EventType = "work" | "education"

export type ProcessedEvent = (ProfessionalExperience | Education) & {
	startDate: Date
	endDate: Date
	durationInMonths: number
	type: EventType
}
