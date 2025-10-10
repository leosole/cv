const tailwindColors = ["red", "blue", "green", "yellow", "indigo"]
const lightShades = ["100", "200", "300", "400", "500"]
const darkShades = ["500", "600", "700", "800", "900"]

export function getRandomTailwindColorClass(
	baseClass: string,
	isDark: boolean
): string {
	const randomColor =
		tailwindColors[Math.floor(Math.random() * tailwindColors.length)]
	const shades = isDark ? darkShades : lightShades
	const randomShade = shades[Math.floor(Math.random() * shades.length)]
	return `${baseClass}-${randomColor}-${randomShade}`
}
