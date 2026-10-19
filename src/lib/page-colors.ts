export const pageColorMap = [
	{ variable: "--page-background", usage: "Main page background behind all content" },
	{ variable: "--page-foreground", usage: "Default text color across the page" },
	{ variable: "--glass-background", usage: "Tint behind glass headers, panels, and surfaces" },
	{ variable: "--card", usage: "CV cards and chat panel backgrounds" },
	{ variable: "--card-foreground", usage: "Text inside CV cards and the chat panel" },
	{ variable: "--popover", usage: "Popover and dropdown menu backgrounds" },
	{ variable: "--popover-foreground", usage: "Text inside popovers and dropdown menus" },
	{ variable: "--button-primary", usage: "Primary action buttons" },
	{ variable: "--button-primary-foreground", usage: "Text and icons on primary action buttons" },
	{ variable: "--button-secondary", usage: "Secondary action buttons" },
	{ variable: "--button-secondary-foreground", usage: "Text on secondary action buttons" },
	{ variable: "--tooltip-foreground", usage: "Text inside tooltips" },
	{ variable: "--button-destructive", usage: "Destructive action buttons" },
	{ variable: "--button-destructive-foreground", usage: "Text on destructive action buttons" },
	{ variable: "--button-destructive-hover", usage: "Destructive button hover background" },
	{ variable: "--button-outline-hover", usage: "Outlined button hover background" },
	{ variable: "--button-ghost-hover", usage: "Ghost button hover background" },
	{ variable: "--button-hover-foreground", usage: "Text on hovered outlined and ghost buttons" },
	{ variable: "--timeline-work", usage: "Work entries in the timeline" },
	{ variable: "--timeline-education", usage: "Education entries in the timeline" },
	{ variable: "--chat-launcher", usage: "Floating chat launcher button" },
	{ variable: "--chat-user-message", usage: "User chat message bubble and tail" },
	{ variable: "--chat-bot-message", usage: "Assistant chat message bubble and tail" },
	{ variable: "--badge-primary", usage: "Primary badges" },
	{ variable: "--badge-primary-foreground", usage: "Text inside primary badges" },
	{ variable: "--badge-secondary", usage: "Secondary badges" },
	{ variable: "--badge-secondary-foreground", usage: "Text inside secondary badges" },
	{ variable: "--badge-destructive", usage: "Destructive badges" },
	{ variable: "--badge-destructive-foreground", usage: "Text inside destructive badges" },
	{ variable: "--menu-hover", usage: "Dropdown menu item hover and selected backgrounds" },
	{ variable: "--menu-hover-foreground", usage: "Text on hovered and selected dropdown menu items" },
	{ variable: "--muted", usage: "Muted backgrounds and separators" },
	{ variable: "--muted-foreground", usage: "Secondary and supporting text" },
	{ variable: "--border", usage: "Default borders around page elements" },
	{ variable: "--input", usage: "Input outlines and borders" },
	{ variable: "--ring", usage: "Keyboard focus outlines" },
	{ variable: "--link", usage: "Links throughout the page" },
	{ variable: "--tooltip", usage: "Tooltip backgrounds" },
] as const

export type PageColorVariable = (typeof pageColorMap)[number]["variable"]

export interface PageColorChange {
	variable: PageColorVariable
	color: string
}

const pageColorVariables = new Set<string>(pageColorMap.map(({ variable }) => variable))

export function isPageColorVariable(value: string): value is PageColorVariable {
	return pageColorVariables.has(value)
}