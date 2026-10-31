import LiquidGlass from "liquid-glass-react"

interface LiquidGlassLayerProps {
	cornerRadius: number
	overLight: boolean
	tint?: "surface" | "accent"
}

export function LiquidGlassLayer({ cornerRadius, overLight, tint = "surface" }: LiquidGlassLayerProps) {
	return (
		<div aria-hidden="true" className="liquid-glass-layer" data-tint={tint}>
			<LiquidGlass
				className="size-full"
				cornerRadius={cornerRadius}
				elasticity={0}
				overLight={overLight}
				padding="0"
				style={{ width: "100%", height: "100%" }}
			>
				{null}
			</LiquidGlass>
			<span className="liquid-glass-layer__tint" />
		</div>
	)
}
