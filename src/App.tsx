import "./index.css"
import { Header } from "@/components/header"
import cv_json from "@/static/cv.json"
import type { CV } from "./types/cv"
import Calendar from "./components/calendar/calendar"
import { useEffect, useRef, useState } from "react"

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
		<div className="px-4">
			<Header info={cv.info} ref={headerRef} />
			<Calendar events={[...cv.professional_experience, ...cv.education]} headerHeight={headerHeight}/>
		</div>
	)
}

export default App
