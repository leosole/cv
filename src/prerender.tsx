import { renderToString } from "react-dom/server"
import App from "./App"
import Providers from "./providers/providers"
import cv_json from "@/static/cv.json"

// Build-time entry: renders the CV to static HTML so the page can paint before
// the client bundle executes. `scripts/prerender.mjs` injects the result into
// dist/index.html and src/main.tsx hydrates it.
export function render() {
	const initialOpenedCards = Array.from(
		{ length: cv_json.professional_experience.length + cv_json.education.length },
		(_, index) => index
	)

	return renderToString(
		<Providers initialOpenedCards={initialOpenedCards}>
			<App />
		</Providers>
	)
}
