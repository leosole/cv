export interface CV {
	info: Info
	links: Links
	summary: string
	professional_experience: ProfessionalExperience[]
	education: Education[]
	technical_skills: string[]
	languages: Language[]
}

export interface Info {
	name: string
	location: string
	nationality: string
	email: string
	phone: string
	birthdate: string
}

export interface Links {
	linkedin: string
	github: string
}

export interface ProfessionalExperience {
	company: string
	type: string
	positions: Position[]
}

export interface Position {
	role: string
	start_date: string
	end_date: string
	tasks: string[]
	publications?: Publication[]
}

export interface Education {
	institution: string
	type: string
	degree: string
	start_date: string
	end_date: string
}

export interface Language {
	language: string
	proficiency: string
}

export interface Publication {
	title: string
	link: string
	year: number
}
