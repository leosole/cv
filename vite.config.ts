import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(() => {
	const resolvedPath = resolve(__dirname, "./src")
	console.log("Resolved path:", resolvedPath)
	console.log("Current working directory:", process.cwd())
	console.log("__dirname:", __dirname)
	
	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": resolvedPath
			}
		},
		root: process.cwd()
	}
})
