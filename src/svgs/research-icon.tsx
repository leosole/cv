import { motion } from "motion/react"
import { useId } from "react"
import { useAnimatedIcon, type AnimatedIconProps } from "@/hooks/use-animated-icon"

export default function ResearchIcon({ animate }: AnimatedIconProps) {
	const { animationKey } = useAnimatedIcon(animate)
	const maskId = useId()

	return (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			height="1em"
			width="1em"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
					<path
						d="M6 4V8H18V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H6ZM16 2V6H8V2H16Z"
						fill="white"
					/>
					<motion.path
						key={`dot-top-${animationKey}`}
						d="M9 11H7V13H9V11Z"
						fill="black"
						animate={
							animationKey > 0
								? {
										y: [0, 1.1, 0],
								  }
								: undefined
						}
						transition={{
							duration: 0.24,
							times: [0, 0.45, 1],
							ease: "easeOut",
							delay: 0,
						}}
					/>
					<motion.path
						key={`dot-middle-${animationKey}`}
						d="M9 14H7V16H9V14Z"
						fill="black"
						animate={
							animationKey > 0
								? {
										y: [0, 1.1, 0],
								  }
								: undefined
						}
						transition={{
							duration: 0.24,
							times: [0, 0.45, 1],
							ease: "easeOut",
							delay: 0.03,
						}}
					/>
					<motion.path
						key={`dot-bottom-${animationKey}`}
						d="M9 17H7V19H9V17Z"
						fill="black"
						animate={
							animationKey > 0
								? {
										y: [0, 1.1, 0],
								  }
								: undefined
						}
						transition={{
							duration: 0.24,
							times: [0, 0.45, 1],
							ease: "easeOut",
							delay: 0.06,
						}}
					/>
				</mask>
			</defs>
			<path
				d="M6 4V8H18V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H6ZM16 2V6H8V2H16Z"
				fill="currentColor"
				mask={`url(#${maskId})`}
			/>
		</svg>
	)
}
