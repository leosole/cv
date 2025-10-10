import "./index.css"
import { Header } from "@/components/header"
import cv_json from "@/static/cv.json"
import type { CV } from "./types/cv"
import Calendar from "./components/calendar/calendar"

const cv: CV = cv_json

function App() {
	return (
		<>
			<Header info={cv.info} />
			<Calendar events={[...cv.professional_experience, ...cv.education]} />
		</>
	)
}

export default App
