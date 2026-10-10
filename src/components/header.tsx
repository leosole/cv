import type { Info, Links } from "@/types/cv"
import { IoToday, IoMail, IoLocationSharp } from "react-icons/io5";
import { PiPhoneFill } from "react-icons/pi";
import useMenu from "@/hooks/use-menu";

interface HeaderProps {
	info: Info
	links: Links,
}
export function Header({ info, links }: HeaderProps) {
	const { name, location, email, phone, birthdate } = info
	const menuButtons = useMenu(links)
	return (
		<>
			<div className="hidden bg-background sm:flex top-0 fixed w-full z-200 -ml-4">
				<div className="gap-2 pt-4 justify-end flex container m-auto">
				{menuButtons} 
				</div>
			</div>
			<header className="container mx-auto flex flex-col">
				<div className="flex justify-between items-start mt-4">
					<h1 className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[200px] font-black leading-none">{name}</h1>
					
				</div>
				<span className="flex items-center gap-2"><IoLocationSharp /><h2 className="text-lg">{location}</h2></span>
				<span className="flex items-center gap-2"><IoToday /><h2 className="text-lg">{birthdate}</h2></span>
				<span className="flex items-center gap-2"><IoMail /><h3><a href={`mailto:${email}`} className="text-md">{email}</a></h3></span>
				<span className="flex items-center gap-2"><PiPhoneFill /><h3><a href={`https://wa.me/${phone.replace(/[\s\+]/g, "")}`} className="text-md">{phone}</a></h3></span>
			</header>
		</>
	)
}
