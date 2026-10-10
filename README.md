# CV

This is a React project that renders my curriculum vitae. You can view it here: [https://leosole-cv.netlify.app/](https://leosole-cv.netlify.app/)

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- GitHub Pages for deployment

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/leosole/cv.git
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
npx netlify dev
```

## Animated background

The CV uses a six-blob animated background implemented with React, TypeScript, and
Motion. Motion is already included in this project. To use the component in another
project, install it with `yarn add motion`, then import it and keep foreground content
in a higher stacking layer:

```tsx
import { AnimatedBackground } from "@/components/animated-background"

export function Page() {
	return (
		<>
			<AnimatedBackground />
			<main className="relative z-10">Page content</main>
		</>
	)
}
```

The six colors, sizes, speeds, blur radii, and optional normalized initial positions
are configured together in `src/components/animated-background.tsx`. The physics
implementation is in `src/lib/ambient-physics.ts`. Animation pauses when the visitor
prefers reduced motion.

## Build and Deploy

Deployment happens automatically to GitHub Pages when there's a push to the main branch. To build locally:
```bash
yarn build
```

## Project Structure

- `src/components/` - Reusable React components
- `src/hooks/` - Custom hooks
- `src/lib/` - Utility functions
- `src/static/` - CV static data
- `src/types/` - TypeScript type definitions

## License

MIT
