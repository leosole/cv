import type { Info } from "@/types/cv"
import { Button } from "./ui/button"
import { MdLightMode, MdDarkMode } from "react-icons/md"
import { useTheme } from "@/hooks/use-theme"

interface HeaderProps {
	info: Info
	ref?: React.Ref<HTMLDivElement>
}
export function Header({ info, ref }: HeaderProps) {
	const { name, location, nationality, email, phone, birthdate } = info
	const { isDark, toggleTheme } = useTheme()
	return (
		<header className="container mx-auto flex flex-col" ref={ref}>
			<div className="flex justify-between items-start mt-4">
				<div>
					<h1 className="text-3xl font-bold">{name}</h1>
					<h2 className="text-lg">{nationality}</h2>
					<h2 className="text-lg">{location}</h2>
					<h2 className="text-lg">{birthdate}</h2>
					<h3><a href={`mailto:${email}`} className="text-md">{email}</a></h3>
					<h3><a href={`https://wa.me/${phone.replace(/[\s\+]/g, "")}`} className="text-md">{phone}</a></h3>
				</div>
				<Button size="icon" variant="ghost" onClick={toggleTheme}>
					{isDark ? <MdLightMode /> : <MdDarkMode color="black" />}
				</Button>
			</div>
		</header>
	)
}
