import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import faroUploader from '@grafana/faro-rollup-plugin';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(), 
		tailwindcss(),
		faroUploader({
			appName: 'cv',
			endpoint: 'https://faro-api-prod-sa-east-1.grafana.net/faro/api/v1',
			appId: '1663',
			stackId: '1884019',
			apiKey: process.env.FARO_API_KEY ?? "",
			gzipContents: true,
		})
		],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
  	build: { sourcemap: 'hidden' },
	base: "/"
})
