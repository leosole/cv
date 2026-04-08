import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import Providers from "./providers/providers.tsx"
import cv_json from "@/static/cv.json"

const initialOpenedCards = Array.from(
	{ length: cv_json.professional_experience.length + cv_json.education.length },
	(_, i) => i
)

createRoot(document.getElementById("root")!).render(
	<Providers initialOpenedCards={initialOpenedCards}>
		<App />
	</Providers>
)
