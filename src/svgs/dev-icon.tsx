import { motion } from "motion/react"
import { useId } from "react"
import { useAnimatedIcon, type AnimatedIconProps } from "@/hooks/use-animated-icon"

export default function DevIcon({animate}: AnimatedIconProps) {
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
            d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z"
            fill="white"
          />
          <motion.path
            key={`cursor-${animationKey}`}
            d="M12 15V17H18V15H12Z"
            fill="black"
            animate={
              animationKey > 0
                ? {
                    y: [0, 1.25, 0],
                  }
                : undefined
            }
            transition={{
              duration: 0.25,
              times: [0, 0.45, 1],
              ease: "easeOut",
            }}
          />
          <motion.path
            key={`prompt-${animationKey}`}
            d="M8.41421 12L5.58579 14.8284L7 16.2426L11.2426 12L7 7.75736L5.58579 9.17157L8.41421 12Z"
            fill="black"
            animate={
              animationKey > 0
                ? {
                    y: [0, 1.25, 0],
                  }
                : undefined
            }
            transition={{
              duration: 0.25,
              times: [0, 0.45, 1],
              ease: "easeOut",
            }}
          />
        </mask>
      </defs>
      <path
        d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}
