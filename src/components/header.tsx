import type { Info, Links } from "@/types/cv"
import { Button } from "./ui/button"
import { MdLightMode, MdDarkMode } from "react-icons/md"
import { useTheme } from "@/hooks/use-theme"
import { IoToday, IoMail, IoLocationSharp  } from "react-icons/io5";
import { PiPhoneFill } from "react-icons/pi";
import { IoLogoGithub, IoLogoLinkedin  } from "react-icons/io";
import { FaDownload } from "react-icons/fa6";

import generateDocxFromJson from "@/lib/docx";

interface HeaderProps {
	info: Info
    links: Links,
}
export function Header({ info, links }: HeaderProps) {
	const { name, location, email, phone, birthdate } = info
	const { isDark, toggleTheme } = useTheme()
	return (
		<header className="container mx-auto flex flex-col">
			<div className="flex justify-between items-start mt-4">
				<div>
					<h1 className="text-3xl font-bold">{name}</h1>
					<span className="flex items-center gap-2"><IoLocationSharp/><h2 className="text-lg">{location}</h2></span>
					<span className="flex items-center gap-2"><IoToday/><h2 className="text-lg">{birthdate}</h2></span>
					<span className="flex items-center gap-2"><IoMail/><h3><a href={`mailto:${email}`} className="text-md">{email}</a></h3></span>
					<span className="flex items-center gap-2"><PiPhoneFill/><h3><a href={`https://wa.me/${phone.replace(/[\s\+]/g, "")}`} className="text-md">{phone}</a></h3></span>
				</div>
				<div className="flex gap-2">
					<Button asChild variant="ghost" size="icon" title="GitHub">
						<a href={links.github} aria-label="GitHub">
							<IoLogoGithub />
						</a>
					</Button>
					<Button asChild variant="ghost" size="icon" title="LinkedIn">
						<a href={links.linkedin} aria-label="LinkedIn">
							<IoLogoLinkedin />
						</a>
					</Button>
					<Button size="icon" variant="ghost" onClick={generateDocxFromJson} title="Download CV">
						<FaDownload />
					</Button>
					<Button size="icon" variant="ghost" onClick={toggleTheme} title="Toggle theme">
						{isDark ? <MdLightMode /> : <MdDarkMode color="black" />}
					</Button>
				</div>
			</div>
		</header>
	)
}
