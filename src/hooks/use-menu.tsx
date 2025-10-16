import { Button } from "@/components/ui/button"
import { useTheme } from "./use-theme"
import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io";
import generateDocxFromJson from "@/lib/docx";
import type { Links } from "@/types/cv";
import { FaDownload } from "react-icons/fa6";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function useMenu(links: Links) {
	const { isDark, toggleTheme } = useTheme()
	const menuButtons = [
		<Button asChild variant="ghost" size="icon" title="GitHub">
			<a href={links.github} aria-label="GitHub">
				<IoLogoGithub className="h-5 w-5 sm:h-4 sm:w-4" />
			</a>
		</Button>,
		<Button asChild variant="ghost" size="icon" title="LinkedIn">
			<a href={links.linkedin} aria-label="LinkedIn">
				<IoLogoLinkedin className="h-5 w-5 sm:h-4 sm:w-4" />
			</a>
		</Button>,
		<Button size="icon" variant="ghost" onClick={generateDocxFromJson} title="Download CV">
			<FaDownload className="h-5 w-5 sm:h-4 sm:w-4" />
		</Button>,
		<Button size="icon" variant="ghost" onClick={toggleTheme} title="Toggle theme">
			{isDark ? <MdLightMode className="h-5 w-5 sm:h-4 sm:w-4" /> : <MdDarkMode color="black" className="h-5 w-5 sm:h-4 sm:w-4" />}
		</Button>
	]
    return menuButtons
}