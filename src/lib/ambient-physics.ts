export interface BlobDefinition {
	id: string
	color: string
	size: number
	speed: number
	blur: number
	initialPosition?: { x: number; y: number }
}

export interface PhysicsBody {
	id: string
	x: number
	y: number
	radius: number
	collisionRadius: number
	visualRadius: number
	mass: number
	vx: number
	vy: number
	directionX: number
	directionY: number
	minSpeed: number
	scaleX: number
	scaleY: number
}

export interface CursorObstacle {
	x: number
	y: number
	vx: number
	vy: number
	radius: number
	active: boolean
	lastMoveTime?: number
}

const MIN_DISTANCE = 0.001
const COLLISION_RADIUS_SCALE = 0.72
const RESTITUTION = 0.38
const WALL_RESTITUTION = 0.42
const CURSOR_RESTITUTION = 0.3
const SPEED_RECOVERY_RATE = 0.2
const SHAPE_RECOVERY_RATE = 7

function randomBetween(min: number, max: number, random: () => number) {
	return min + random() * (max - min)
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value))
}

function getRadii(definition: BlobDefinition, width: number, height: number) {
	const smallestDimension = Math.min(width, height)
	const sizeScale = Math.min(1, smallestDimension / 900)
	const blur = Math.min(definition.blur * sizeScale, smallestDimension * 0.11)
	const radius = Math.min((definition.size * sizeScale) / 2, width * 0.47, height * 0.47)
	const visualRadius = Math.min(radius + blur * 0.45, width / 2, height / 2)
	return { radius, visualRadius }
}

export function createPhysicsBodies(
	definitions: readonly BlobDefinition[],
	width: number,
	height: number,
	random: () => number = Math.random
): PhysicsBody[] {
	return definitions.map((definition) => {
		const { radius, visualRadius } = getRadii(definition, width, height)
		const angle = randomBetween(0, Math.PI * 2, random)
		const speed = randomBetween(definition.speed * 0.82, definition.speed * 1.18, random)
		const position = definition.initialPosition
		const x = position
			? clamp(position.x * width, visualRadius, width - visualRadius)
			: randomBetween(visualRadius, Math.max(visualRadius, width - visualRadius), random)
		const y = position
			? clamp(position.y * height, visualRadius, height - visualRadius)
			: randomBetween(visualRadius, Math.max(visualRadius, height - visualRadius), random)

		return {
			id: definition.id,
			x,
			y,
			radius,
			collisionRadius: radius * COLLISION_RADIUS_SCALE,
			visualRadius,
			mass: (radius * COLLISION_RADIUS_SCALE) ** 2,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			directionX: Math.cos(angle),
			directionY: Math.sin(angle),
			minSpeed: definition.speed * 0.5,
			scaleX: 1,
			scaleY: 1
		}
	})
}

function deformOnImpact(body: PhysicsBody, normalX: number, normalY: number, impactSpeed: number) {
	const squeeze = clamp(impactSpeed / 450, 0.06, 0.24)
	const stretch = squeeze * 0.35
	const nextScaleX = 1 - squeeze * Math.abs(normalX) + stretch * Math.abs(normalY)
	const nextScaleY = 1 - squeeze * Math.abs(normalY) + stretch * Math.abs(normalX)
	body.scaleX = nextScaleX < 1 ? Math.min(body.scaleX, nextScaleX) : Math.max(body.scaleX, nextScaleX)
	body.scaleY = nextScaleY < 1 ? Math.min(body.scaleY, nextScaleY) : Math.max(body.scaleY, nextScaleY)
}

function clampToBounds(body: PhysicsBody, width: number, height: number) {
	const minX = body.collisionRadius
	const maxX = width - body.collisionRadius
	const minY = body.collisionRadius
	const maxY = height - body.collisionRadius

	if (body.x < minX) {
		body.x = minX
		const impactSpeed = Math.abs(body.vx)
		if (body.vx < 0) {
			deformOnImpact(body, 1, 0, impactSpeed)
			body.vx = impactSpeed * WALL_RESTITUTION
		}
	} else if (body.x > maxX) {
		body.x = maxX
		const impactSpeed = Math.abs(body.vx)
		if (body.vx > 0) {
			deformOnImpact(body, -1, 0, impactSpeed)
			body.vx = -impactSpeed * WALL_RESTITUTION
		}
	}

	if (body.y < minY) {
		body.y = minY
		const impactSpeed = Math.abs(body.vy)
		if (body.vy < 0) {
			deformOnImpact(body, 0, 1, impactSpeed)
			body.vy = impactSpeed * WALL_RESTITUTION
		}
	} else if (body.y > maxY) {
		body.y = maxY
		const impactSpeed = Math.abs(body.vy)
		if (body.vy > 0) {
			deformOnImpact(body, 0, -1, impactSpeed)
			body.vy = -impactSpeed * WALL_RESTITUTION
		}
	}
}

function resolveBodyCollision(first: PhysicsBody, second: PhysicsBody) {
	const dx = second.x - first.x
	const dy = second.y - first.y
	const distance = Math.hypot(dx, dy)
	const minimumDistance = first.collisionRadius + second.collisionRadius

	if (distance >= minimumDistance) return

	const normalX = distance > MIN_DISTANCE ? dx / distance : first.id < second.id ? 1 : -1
	const normalY = distance > MIN_DISTANCE ? dy / distance : 0
	const overlap = minimumDistance - distance
	const inverseFirstMass = 1 / first.mass
	const inverseSecondMass = 1 / second.mass
	const inverseMassSum = inverseFirstMass + inverseSecondMass

	// Separate overlapping circles by inverse mass so light bodies move farther.
	const correction = overlap / inverseMassSum
	first.x -= normalX * correction * inverseFirstMass
	first.y -= normalY * correction * inverseFirstMass
	second.x += normalX * correction * inverseSecondMass
	second.y += normalY * correction * inverseSecondMass

	// Apply an elastic normal impulse only while the bodies are moving together.
	const relativeVelocityX = second.vx - first.vx
	const relativeVelocityY = second.vy - first.vy
	const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY
	if (velocityAlongNormal >= 0) return
	const impactSpeed = -velocityAlongNormal
	deformOnImpact(first, -normalX, -normalY, impactSpeed)
	deformOnImpact(second, normalX, normalY, impactSpeed)

	const impulse = (-(1 + RESTITUTION) * velocityAlongNormal) / inverseMassSum
	first.vx -= impulse * inverseFirstMass * normalX
	first.vy -= impulse * inverseFirstMass * normalY
	second.vx += impulse * inverseSecondMass * normalX
	second.vy += impulse * inverseSecondMass * normalY
}

function resolveCursorCollision(body: PhysicsBody, cursor: CursorObstacle) {
	if (!cursor.active) return

	const dx = body.x - cursor.x
	const dy = body.y - cursor.y
	const distance = Math.hypot(dx, dy)
	const minimumDistance = body.collisionRadius + cursor.radius
	if (distance >= minimumDistance) return

	const normalX = distance > MIN_DISTANCE ? dx / distance : 1
	const normalY = distance > MIN_DISTANCE ? dy / distance : 0
	body.x = cursor.x + normalX * minimumDistance
	body.y = cursor.y + normalY * minimumDistance

	// Treat the cursor as a moving, infinite-mass surface so pushing from behind
	// transfers the cursor's velocity to the blob instead of repelling it.
	const velocityTowardCursor =
		(body.vx - cursor.vx) * normalX + (body.vy - cursor.vy) * normalY
	if (velocityTowardCursor < 0) {
		deformOnImpact(body, normalX, normalY, -velocityTowardCursor)
		const bodyNormalVelocity = body.vx * normalX + body.vy * normalY
		const cursorNormalVelocity = cursor.vx * normalX + cursor.vy * normalY

		if (cursorNormalVelocity > bodyNormalVelocity && cursorNormalVelocity > 0) {
			const pushVelocity = cursorNormalVelocity - bodyNormalVelocity
			body.vx += pushVelocity * normalX
			body.vy += pushVelocity * normalY
		} else {
			body.vx -= (1 + CURSOR_RESTITUTION) * velocityTowardCursor * normalX
			body.vy -= (1 + CURSOR_RESTITUTION) * velocityTowardCursor * normalY
		}
	}
}

export function resizePhysicsBodies(
	bodies: PhysicsBody[],
	definitions: readonly BlobDefinition[],
	oldWidth: number,
	oldHeight: number,
	width: number,
	height: number
) {
	const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]))

	for (const body of bodies) {
		const definition = definitionsById.get(body.id)
		if (!definition) continue

		body.x = oldWidth > 0 ? (body.x / oldWidth) * width : width / 2
		body.y = oldHeight > 0 ? (body.y / oldHeight) * height : height / 2
		const { radius, visualRadius } = getRadii(definition, width, height)
		body.radius = radius
		body.collisionRadius = radius * COLLISION_RADIUS_SCALE
		body.visualRadius = visualRadius
		body.mass = body.collisionRadius * body.collisionRadius
		clampToBounds(body, width, height)
	}
}

export function stepPhysics(
	bodies: PhysicsBody[],
	width: number,
	height: number,
	deltaSeconds: number,
	cursor: CursorObstacle,
	motionScale = 1
) {
	const physicsDelta = deltaSeconds * motionScale

	for (const body of bodies) {
		body.x += body.vx * physicsDelta
		body.y += body.vy * physicsDelta
		clampToBounds(body, width, height)
	}

	// A few solver passes stabilize groups of contacts without expensive substeps.
	for (let iteration = 0; iteration < 3; iteration += 1) {
		for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
			const first = bodies[firstIndex]
			if (!first) continue
			for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
				const second = bodies[secondIndex]
				if (second) resolveBodyCollision(first, second)
			}
		}

		for (const body of bodies) {
			resolveCursorCollision(body, cursor)
			clampToBounds(body, width, height)
		}
	}

	for (const body of bodies) {
		const shapeRecovery = Math.exp(-SHAPE_RECOVERY_RATE * physicsDelta)
		body.scaleX = 1 - (1 - body.scaleX) * shapeRecovery
		body.scaleY = 1 - (1 - body.scaleY) * shapeRecovery

		const speed = Math.hypot(body.vx, body.vy)
		if (speed > body.minSpeed) {
			const easedSpeed =
				body.minSpeed + (speed - body.minSpeed) * Math.exp(-SPEED_RECOVERY_RATE * physicsDelta)
			const scale = easedSpeed / speed
			body.vx *= scale
			body.vy *= scale
		} else if (speed < body.minSpeed) {
			const directionX = speed > MIN_DISTANCE ? body.vx / speed : body.directionX
			const directionY = speed > MIN_DISTANCE ? body.vy / speed : body.directionY
			body.vx = directionX * body.minSpeed
			body.vy = directionY * body.minSpeed
		}

		const finalSpeed = Math.hypot(body.vx, body.vy)
		if (finalSpeed > MIN_DISTANCE) {
			body.directionX = body.vx / finalSpeed
			body.directionY = body.vy / finalSpeed
		}
	}
}
