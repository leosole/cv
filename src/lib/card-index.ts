import type { CV, Education, ProfessionalExperience } from "@/types/cv"
import { parseISO, differenceInMonths } from "date-fns"
import type { ProcessedEvent } from "@/types/calendar"

export interface ActionItem {
	id: string
}

/**
 * Convert action items (IDs) to card indices in the combined timeline
 * This replicates the logic from Calendar component
 */
export function convertActionToCardIndices(cv: CV, actions?: ActionItem | ActionItem[] | null): number[] {
	if (!actions) return []
    console.log("Converting actions to card indices:", actions)
	const actionsArray = Array.isArray(actions) ? actions : [actions]

	// Build the combined events list, same as Calendar component
	const allEvents: (ProfessionalExperience | Education)[] = [
		...cv.professional_experience,
		...cv.education,
	]

	// Build mapping from ID to events
	const eventMap = new Map<string, ProfessionalExperience | Education>()

	cv.professional_experience.forEach((event) => {
		eventMap.set(event.id, event)
	})

	cv.education.forEach((event) => {
		eventMap.set(event.id, event)
	})

	// Process events the same way Calendar does
	const processedEvents: ProcessedEvent[] = allEvents
		.map((event) => {
			const isWork = "company" in event
			const startDate = parseISO(
				isWork
					? event.positions[event.positions.length - 1].start_date
					: event.start_date
			)
			const endDateString = isWork ? event.positions[0].end_date : event.end_date
			const endDate =
				endDateString.toLowerCase() === "present"
					? new Date()
					: parseISO(endDateString)
			return {
				...(event as any),
				startDate,
				endDate,
				durationInMonths: differenceInMonths(endDate, startDate) || 1,
				eventType: (isWork ? "work" : "education") as "work" | "education",
			}
		})
		.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

	// Find card indices for each action
	const cardIndices: number[] = []

	for (const action of actionsArray) {
		const targetEvent = eventMap.get(action.id)

		if (!targetEvent) {
			console.warn(`Event not found: ${action.id}`)
			continue
		}

		console.log(`Finding card index for event: ${action.id}`, targetEvent)
        console.log("Processed events to search through:", processedEvents)
		const cardIndex = processedEvents.findIndex((pe) => {
			return pe.id === targetEvent.id
		})

		if (cardIndex !== -1) {
			cardIndices.push(cardIndex)
		}
	}
    console.log("Mapped action items to card indices:", cardIndices)
	return cardIndices
}
