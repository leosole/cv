import "./index.css"
import { Header } from "@/components/header"
import cv_json from "@/static/cv.json"
import type { CV } from "./types/cv"
import Calendar from "./components/calendar/calendar"
import { useEffect, useRef, useState } from "react"
import Summary from "./components/summary"

const cv: CV = cv_json

function App() {
	const headerRef = useRef<HTMLDivElement>(null)
	const [headerHeight, setHeaderHeight] = useState(0);
	const handleResize = () => {
		setHeaderHeight(headerRef.current?.offsetHeight || 0);
	}
	useEffect(() => {
      window.addEventListener('resize', handleResize);
	  handleResize()
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
	return (
		<div className="px-4 pb-8">
			<div ref={headerRef}>
				<Header info={cv.info} />
				<Summary links={cv.links} summary={cv.summary} skills={cv.technical_skills}/>
			</div>
			<div className="flex-col sm:flex-row flex container sm:w-[80%] sm:min-w-160 max-w-240 mx-auto gap-2 mt-8 pr-8 sm:pr-20">
				<Calendar events={[...cv.professional_experience, ...cv.education]} headerHeight={headerHeight}/>
			</div>
		</div>
	)
}

export default App
