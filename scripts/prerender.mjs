import { readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

const distDirectory = path.resolve("dist")
const ssrDirectory = path.resolve("dist-ssr")
const appHtmlMarker = "<!--app-html-->"

const { render } = await import(pathToFileURL(path.join(ssrDirectory, "prerender.js")).href)
const appHtml = render()

const indexPath = path.join(distDirectory, "index.html")
let html = await readFile(indexPath, "utf8")

if (html.includes(appHtmlMarker)) {
	html = html.replace(appHtmlMarker, appHtml)
} else if (html.includes('<div id="root"></div>')) {
	html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
} else {
	throw new Error("Could not find the #root placeholder in dist/index.html")
}

// Inline the single compiled stylesheet so the document paints without a
// render-blocking round trip.
const assetDirectory = path.join(distDirectory, "assets")
const assetFiles = await readdir(assetDirectory)
const styleFiles = assetFiles.filter((file) => file.endsWith(".css"))

if (styleFiles.length === 1) {
	const [styleFile] = styleFiles
	const css = await readFile(path.join(assetDirectory, styleFile), "utf8")
	const linkPattern = new RegExp(`<link[^>]*href="[^"]*${styleFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`)

	if (linkPattern.test(html)) {
		const inlinedCss = css.replace(/(url\(\s*['"]?)\.\//g, "$1/assets/")
		html = html.replace(linkPattern, `<style>${inlinedCss}</style>`)
		await rm(path.join(assetDirectory, styleFile))
	}
}

await writeFile(indexPath, html)
await rm(ssrDirectory, { recursive: true, force: true })

console.log(
	`prerendered ${appHtml.length} bytes of HTML and inlined ${styleFiles.length} stylesheet(s) into dist/index.html`
)
