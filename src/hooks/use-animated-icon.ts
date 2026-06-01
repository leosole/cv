import { useEffect, useRef, useState } from "react"

export interface AnimatedIconProps {
	animate?: boolean
}

export function useAnimatedIcon(animate?: boolean) {
	const [animationKey, setAnimationKey] = useState(0)
	const hasMounted = useRef(false)
	const previousAnimate = useRef(animate)

	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true
			previousAnimate.current = animate
			return
		}

		if (animate && !previousAnimate.current) {
			setAnimationKey((current) => current + 1)
		}

		previousAnimate.current = animate
	}, [animate])

	return {
		animationKey,
	}
}