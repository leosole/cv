import "./index.css"
import { Header } from "@/components/header"
import cv_json from "@/static/cv.json"
import type { CV } from "./types/cv"
import Calendar from "./components/calendar/calendar"
import { useState } from "react"
import Summary from "./components/summary"
import Footer from "./components/footer"
import { useTheme } from "@/hooks/use-theme"

const cv: CV = cv_json
const calendarEvents = [...cv.professional_experience, ...cv.education]

function App() {
	const { glassEnabled } = useTheme()
	const [highlightedSkills, setHighlightedSkills] = useState<string[]>([])
	return (
	<div className={`${glassEnabled ? "" : "glass-effect-off "}relative isolate min-h-screen`}>
		<div className="relative z-0 px-4 pb-8 bg-background">
			<div>
				<Header info={cv.info} links={cv.links} />
				<Summary
					summary={cv.summary}
					skills={cv.technical_skills}
					languages={cv.languages}
					highlightedSkills={highlightedSkills}
				/>
			</div>
			<div className="flex-col sm:flex-row flex container sm:w-[80%] sm:min-w-160 max-w-240 mx-auto gap-2 mt-8 mb-4 pr-4 sm:pr-20">
				<Calendar events={calendarEvents} />
			</div>
			<Footer links={cv.links} onSkillsHighlighted={setHighlightedSkills} />
		</div>
	</div>
    )
}

export default App
