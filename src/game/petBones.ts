/** Lightweight spring bones for MTT2-like soft-puppet secondary motion. */

export interface SpringBone {
  angle: number
  vel: number
  target: number
}

export function createBone(angle = 0): SpringBone {
  return { angle, vel: 0, target: angle }
}

export function stepBone(b: SpringBone, dt: number, stiffness = 52, damping = 9.5) {
  const accel = (b.target - b.angle) * stiffness - b.vel * damping
  b.vel += accel * dt
  b.angle += b.vel * dt
  // Soft clamp so limbs never spin wildly
  if (b.angle > 1.4) {
    b.angle = 1.4
    b.vel *= -0.35
  } else if (b.angle < -1.4) {
    b.angle = -1.4
    b.vel *= -0.35
  }
}

export function impulseBone(b: SpringBone, impulse: number) {
  b.vel += impulse
}

export type BoneId = 'earL' | 'earR' | 'armL' | 'armR' | 'jaw' | 'legL' | 'legR' | 'tail'

export type BoneSet = Record<BoneId, SpringBone>

export function createBoneSet(): BoneSet {
  return {
    earL: createBone(),
    earR: createBone(),
    armL: createBone(),
    armR: createBone(),
    jaw: createBone(),
    legL: createBone(),
    legR: createBone(),
    tail: createBone(),
  }
}

export function stepBoneSet(bones: BoneSet, dt: number) {
  stepBone(bones.earL, dt, 60, 8)
  stepBone(bones.earR, dt, 60, 8)
  stepBone(bones.armL, dt, 40, 10)
  stepBone(bones.armR, dt, 40, 10)
  stepBone(bones.jaw, dt, 70, 11)
  stepBone(bones.legL, dt, 48, 10)
  stepBone(bones.legR, dt, 48, 10)
  stepBone(bones.tail, dt, 36, 7.5)
}
