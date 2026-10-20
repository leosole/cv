import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import Providers from "./providers/providers.tsx"
import cv_json from "@/static/cv.json"
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

initializeFaro({
  url: 'https://faro-collector-prod-sa-east-1.grafana.net/collect/b40940759306cb2d804f2a068d150b3d',
  app: {
    name: 'cv',
    version: '1.0.0',
    environment: 'production'
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation(),
  ],
});

const initialOpenedCards = Array.from(
	{ length: cv_json.professional_experience.length + cv_json.education.length },
	(_, i) => i
)

createRoot(document.getElementById("root")!).render(
	<Providers initialOpenedCards={initialOpenedCards}>
		<App />
	</Providers>
)
