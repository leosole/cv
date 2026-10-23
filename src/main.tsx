import { createRoot, hydrateRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import Providers from "./providers/providers.tsx"
import cv_json from "@/static/cv.json"

const initialOpenedCards = Array.from(
	{ length: cv_json.professional_experience.length + cv_json.education.length },
	(_, i) => i
)

const rootElement = document.getElementById("root")!
const app = (
	<Providers initialOpenedCards={initialOpenedCards}>
		<App />
	</Providers>
)

// `yarn build` prerenders the CV into index.html, so the page hydrates in place
// and can paint before this bundle finishes executing.
if (rootElement.firstElementChild) {
	hydrateRoot(rootElement, app)
} else {
	createRoot(rootElement).render(app)
}

function whenIdle(callback: () => void) {
	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(callback, { timeout: 2000 })
	} else {
		window.setTimeout(callback, 200)
	}
}

// Monitoring and tracing are not needed for first paint, so they are fetched
// once the page is idle and stay off the critical path.
async function loadMonitoring() {
	try {
		const { getWebInstrumentations, initializeFaro } = await import("@grafana/faro-web-sdk")
		const { TracingInstrumentation } = await import("@grafana/faro-web-tracing")

		initializeFaro({
			url: "https://faro-collector-prod-sa-east-1.grafana.net/collect/b40940759306cb2d804f2a068d150b3d",
			app: {
				name: "cv",
				version: "1.0.0",
				environment: "production"
			},
			instrumentations: [
				...getWebInstrumentations(),
				new TracingInstrumentation()
			]
		})
	} catch {
		// Monitoring must never break the page.
	}
}

if (document.readyState === "complete") {
	whenIdle(loadMonitoring)
} else {
	window.addEventListener("load", () => whenIdle(loadMonitoring), { once: true })
}
