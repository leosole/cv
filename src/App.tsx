import "./index.css"
import { Header } from "@/components/header"
import cv_json from "@/static/cv.json"
import type { CV } from "./types/cv"

const cv: CV = cv_json

function App() {
	return (
		<>
			<Header info={cv.info} />
		</>
	)
}

export default App
