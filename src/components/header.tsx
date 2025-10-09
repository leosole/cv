import type { Info } from "@/types/cv"
import { Button } from "./ui/button"
import { MdLightMode, MdDarkMode } from "react-icons/md"
import { useTheme } from "@/hooks/use-theme"

interface HeaderProps {
	info: Info
}
export function Header({ info }: HeaderProps) {
	const { name } = info
	const { isDark, toggleTheme } = useTheme()
	return (
		<header className="container mx-auto flex flex-col">
			<span className="flex justify-between items-center">
				<h1 className="text-3xl font-bold mt-4">{name}</h1>
				<Button size="icon" variant="ghost" onClick={toggleTheme}>
					{isDark ? <MdLightMode /> : <MdDarkMode color="black" />}
				</Button>
			</span>
		</header>
	)
}
