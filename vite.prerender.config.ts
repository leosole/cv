import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

// Builds src/prerender.tsx for Node so the CV can be rendered to static HTML
// after the client build. Run through `yarn build`.
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	build: {
		ssr: "src/prerender.tsx",
		outDir: "dist-ssr",
		emptyOutDir: true,
		sourcemap: false,
		minify: false
	}
})
