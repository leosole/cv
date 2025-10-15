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
				<IoLogoGithub />
			</a>
		</Button>,
		<Button asChild variant="ghost" size="icon" title="LinkedIn">
			<a href={links.linkedin} aria-label="LinkedIn">
				<IoLogoLinkedin />
			</a>
		</Button>,
		<Button size="icon" variant="ghost" onClick={generateDocxFromJson} title="Download CV">
			<FaDownload />
		</Button>,
		<Button size="icon" variant="ghost" onClick={toggleTheme} title="Toggle theme">
			{isDark ? <MdLightMode /> : <MdDarkMode color="black" />}
		</Button>
	]
    return menuButtons
}