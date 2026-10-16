import type { Info, Links } from "@/types/cv"
import { IoToday, IoMail, IoLocationSharp } from "react-icons/io5";
import { PiPhoneFill } from "react-icons/pi";
import useMenu from "@/hooks/use-menu";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
	info: Info
	links: Links,
}
export function Header({ info, links }: HeaderProps) {
	const { name, location, email, phone, birthdate } = info
	const menuButtons = useMenu(links)
	const { glassEnabled } = useTheme()
	return (
		<>
			<div className="header-glass glass-gradient-border glass-gradient-border--no-top hidden sm:flex top-0 w-full z-200 -ml-4 rounded-b-xl shadow-lg">
				{glassEnabled && <div aria-hidden="true" className="header-glass__backdrop" />}
				<div className="relative z-10 gap-2 py-2 px-3 justify-end flex container m-auto">
					{menuButtons}
				</div>
			</div>
			<header className="container mx-auto flex flex-col mt-4 sm:mt-14 z-30">
				<div className="flex justify-between items-start">
					<h1 className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[200px] font-black leading-[0.85]">{name}</h1>
				</div>
				<span className="flex items-center gap-2"><IoLocationSharp /><h2 className="text-lg">{location}</h2></span>
				<span className="flex items-center gap-2"><IoToday /><h2 className="text-lg">{birthdate}</h2></span>
				<span className="flex items-center gap-2"><IoMail /><h3><a href={`mailto:${email}`} className="text-md">{email}</a></h3></span>
				<span className="flex items-center gap-2"><PiPhoneFill /><h3><a href={`https://wa.me/${phone.replace(/[\s\+]/g, "")}`} className="text-md">{phone}</a></h3></span>
			</header>
		</>
	)
}
