interface HeaderProps {
	name: string
}
export function Header({ name }: HeaderProps) {
	return (
		<header className="container mx-auto">
			<h1 className="text-3xl font-bold mt-4">{name}</h1>
		</header>
	)
}
