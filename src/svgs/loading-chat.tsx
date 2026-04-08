import { motion } from "motion/react";

export function LoadingChat() {
	return (
		<div className="flex items-center justify-center gap-1">
			{[0, 1, 2].map((index) => (
				<motion.div
					key={index}
					className="w-1 h-1 rounded-full bg-current"
					animate={{ y: [0, -4, 2, 0] }}
					transition={{
						delay: index * 0.2,
						duration: 0.8,
						repeat: Infinity,
						repeatDelay: 0.1,
					}}
				/>
			))}
		</div>
	);
}
