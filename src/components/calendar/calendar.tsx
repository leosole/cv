import type { Education, ProfessionalExperience } from "@/types/cv";
import { parseISO, differenceInMonths } from 'date-fns';
import EventCard from "./cards/event-card";
import EventBar from "./event-bar";
import type { ProcessedEvent } from "@/types/calendar";
import { useRef, useLayoutEffect, useState } from "react";
import { getEventId } from "@/lib/strings";

interface CalendarProps {
    events: (ProfessionalExperience | Education)[]
}

const COLLAPSED_CARD_HEIGHT_REM = 4;
const CARD_MARGIN_REM = 1;

export default function Calendar({ events }: CalendarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        return () => window.removeEventListener('resize', updateDimensions);
    }, [events]);

    const processedEvents: ProcessedEvent[] = events.map(event => {
        const isWork = 'company' in event;
        const startDate = parseISO(isWork ? event.positions[0].start_date : event.start_date);
        const endDateString = isWork ? event.positions[event.positions.length - 1].end_date : event.end_date;
        const endDate = endDateString.toLowerCase() === 'present' ? new Date() : parseISO(endDateString);

        return {
            ...event,
            startDate,
            endDate,
            durationInMonths: differenceInMonths(endDate, startDate) || 1,
            type: (isWork ? 'work' : 'education') as 'work' | 'education',
        };
    }).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    if (processedEvents.length === 0) {
        return null;
    }

    const timelineStart = new Date();
    const timelineEnd = processedEvents.length > 0 ? processedEvents[processedEvents.length - 1].startDate : new Date();
    const totalTimelineMonths = differenceInMonths(timelineStart, timelineEnd);

    const years = Array.from(new Set(processedEvents.map(e => e.startDate.getFullYear()).concat(timelineStart.getFullYear()))).sort((a, b) => b - a);

    const getMonthOffset = (date: Date) => {
        return differenceInMonths(timelineStart, date);
    };

    const getOverlapColumns = (events: ProcessedEvent[]) => {
        const sortedEvents = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        const columns: ProcessedEvent[][] = [];

        for (const event of sortedEvents) {
            let placed = false;
            for (const column of columns) {
                const lastEvent = column[column.length - 1];
                if (lastEvent.endDate.getTime() < event.startDate.getTime()) {
                    column.push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([event]);
            }
        }

        return columns;
    }

    const overlapColumns = getOverlapColumns(processedEvents);
    const totalMinHeightRem = processedEvents.length * (COLLAPSED_CARD_HEIGHT_REM + CARD_MARGIN_REM);

    return (
        <div ref={containerRef} className="relative container mx-auto p-4 md:p-8" style={{ minHeight: `${totalMinHeightRem}rem`, position: 'relative' }}>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700" />

            {years.map(year => {
                const yearDate = new Date(year, 11, 31);
                const topPosition = (getMonthOffset(yearDate) / totalTimelineMonths) * 100;
                if (topPosition < 0 || topPosition > 100) return null;

                return (
                    <div key={year} className="absolute left-0 w-full" style={{ top: `${topPosition}%` }}>
                        <div className="absolute left-0 -translate-x-12 -translate-y-2.5">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{year}</span>
                        </div>
                    </div>
                );
            })}

            {processedEvents.map(event => {
                const topPositionPercent = (getMonthOffset(event.endDate) / totalTimelineMonths) * 100;
                const heightPercent = (event.durationInMonths / totalTimelineMonths) * 100;
                const eventColumnDetails = overlapColumns.map((col, i) => ({ col, i })).find(({ col }) => col.includes(event));
                const eventColumnIndex = eventColumnDetails ? eventColumnDetails.i : 0;
                const barMarginLeftRem = eventColumnIndex * 1.2 + 0.5;

                return (
                    <div
                        key={`${getEventId(event)}`}
                        className="absolute left-0"
                        style={{
                            top: `${topPositionPercent}%`,
                            height: `${heightPercent}%`,
                            marginLeft: `${barMarginLeftRem}rem`
                        }}
                    >
                        <EventBar />
                    </div>
                );
            })}

            <div className="relative flex flex-col gap-4 mt-8 ml-8">
                {processedEvents.map((event) => (
                    <EventCard
                        key={`${getEventId(event)}`}
                        type={event.type}
                        info={event}
                    />
                ))}
            </div>
        </div>
    );
}