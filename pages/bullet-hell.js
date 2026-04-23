import { useRef, useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../components/Game.module.css'

/* ─── constants ─── */
const VIEWPORT_W = 800
const VIEWPORT_H = 600
const PLAYER_W = 20
const PLAYER_H = 20
const PLAYER_SPEED = 7.5
const PLAYER_SLOW_SPEED = 3.2
const PLAYER_HP = 100
const PLAYER_HITBOX_RADIUS = 3

const BULLET_W = 4
const BULLET_H = 10
const BULLET_SPEED = 9

const ENEMY_W = 16
const ENEMY_H = 16
const ENEMY_SPEED = 2
const ENEMY_HP = 20
const ENEMY_BULLET_SPEED = 5

const GRAZE_DISTANCE = 20
const GRAZE_COOLDOWN = 10

/* enemy type stats */
const ENEMY_STATS = {
  glider: { hp: 8, speed: 3, shootInterval: 60 },
  seeker: { hp: 12, speed: 2, shootInterval: 50 },
  cannon: { hp: 15, speed: 1.5, shootInterval: 70 },
  pulsar: { hp: 18, speed: 2, shootInterval: 80 },
  grunt: { hp: 20, speed: 2, shootInterval: 60 },
  sniper: { hp: 22, speed: 1, shootInterval: 120 },
}

/* ─── helpers ─── */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function circlesOverlap(a, b, distThreshold) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist < distThreshold
}

function angleToTarget(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX)
}

function snapTo8Directions(angle) {
  const directions = 8
  const angleStep = (Math.PI * 2) / directions
  return Math.round(angle / angleStep) * angleStep
}

function getDirectionVector(angle) {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  }
}

function createEnemy(type = 'grunt', x, y) {
  const stats = ENEMY_STATS[type] || ENEMY_STATS.grunt
  return {
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: stats.hp,
    maxHp: stats.hp,
    shootTimer: 0,
    shootInterval: stats.shootInterval,
    bulletPattern: Math.floor(Math.random() * 3),
    flash: 0,
    chargeTimer: 0, /* for pulsar */
    spiralOffset: 0, /* for spanner-like patterns */
  }
}

function createWaves(waveNum) {
  const waves = []
  const enemyCount = 3 + waveNum * 2
  let types = ['glider']
  if (waveNum > 0) types.push('seeker')
  if (waveNum > 1) types.push('cannon')
  if (waveNum > 2) types.push('pulsar')
  if (waveNum > 3) types.push('grunt')
  if (waveNum > 4) types.push('sniper')
  
  for (let i = 0; i < enemyCount; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    waves.push(
      createEnemy(type, Math.random() * (VIEWPORT_W - ENEMY_W), -40 - i * 50)
    )
  }
  return waves
}

/* ─── Touhou-like movement system ─── */
class PlayerMovement {
  constructor(config = {}) {
    this.maxSpeed = config.maxSpeed || 280
    this.focusSpeedMultiplier = config.focusSpeedMultiplier || 0.4
    this.acceleration = config.acceleration || 2.2
    this.friction = config.friction || 2.0

    this.x = config.x || 0
    this.y = config.y || 0
    this.vx = 0
    this.vy = 0

    this.inputX = 0
    this.inputY = 0
    this.isFocused = false

    this.minX = config.minX || 0
    this.maxX = config.maxX || 800
    this.minY = config.minY || 0
    this.maxY = config.maxY || 600
    this.width = config.width || 20
    this.height = config.height || 20
    this.hp = config.hp || 100
  }

  setInput(keys) {
    this.inputX = 0
    this.inputY = 0

    if (keys.w || keys.arrowup) this.inputY -= 1
    if (keys.s || keys.arrowdown) this.inputY += 1
    if (keys.a || keys.arrowleft) this.inputX -= 1
    if (keys.d || keys.arrowright) this.inputX += 1

    const inputLength = Math.hypot(this.inputX, this.inputY)
    if (inputLength > 0) {
      this.inputX /= inputLength
      this.inputY /= inputLength
    }

    this.isFocused = keys.shift || false
  }

  update(deltaTime) {
    const currentMaxSpeed = this.isFocused ? this.maxSpeed * this.focusSpeedMultiplier : this.maxSpeed

    const targetVx = this.inputX * currentMaxSpeed
    const targetVy = this.inputY * currentMaxSpeed

    const hasInput = this.inputX !== 0 || this.inputY !== 0
    const accelRate = hasInput ? this.acceleration : this.friction

    this.vx += (targetVx - this.vx) * accelRate * deltaTime
    this.vy += (targetVy - this.vy) * accelRate * deltaTime

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.x = Math.max(this.minX, Math.min(this.maxX - this.width, this.x))
    this.y = Math.max(this.minY, Math.min(this.maxY - this.height, this.y))
  }

  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }
  }
}

/* ─── bullet pool system ─── */
class Bullet {
  constructor() {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.lifetime = Infinity
    this.age = 0
    this.active = false
    this.radius = 2
  }

  reset(x, y, vx, vy, lifetime = Infinity) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.lifetime = lifetime
    this.age = 0
    this.active = true
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime
    this.age += deltaTime

    if (this.age > this.lifetime) {
      this.active = false
    }
  }

  isOutOfBounds(viewW, viewH, margin = 50) {
    return this.x < -margin || this.x > viewW + margin || this.y < -margin || this.y > viewH + margin
  }
}

class BulletPool {
  constructor(initialSize = 1000) {
    this.pool = []
    this.active = []

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Bullet())
    }
  }

  spawn(x, y, vx, vy, lifetime = Infinity) {
    let bullet
    if (this.pool.length > 0) {
      bullet = this.pool.pop()
    } else {
      bullet = new Bullet()
    }

    bullet.reset(x, y, vx, vy, lifetime)
    this.active.push(bullet)
    return bullet
  }

  update(deltaTime, viewW, viewH) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const bullet = this.active[i]
      bullet.update(deltaTime)

      if (!bullet.active || bullet.isOutOfBounds(viewW, viewH)) {
        this.active.splice(i, 1)
        this.pool.push(bullet)
      }
    }
  }

  getActive() {
    return this.active
  }

  clear() {
    this.active.forEach((b) => this.pool.push(b))
    this.active = []
  }

  getActiveCount() {
    return this.active.length
  }
}

/* ─── game tempo system ─── */
class GameTempo {
  constructor(config = {}) {
    this.difficultyMultiplier = config.difficultyMultiplier || 1.0
    this.bulletSpeedMultiplier = config.bulletSpeedMultiplier || 1.0
    this.spawnRateMultiplier = config.spawnRateMultiplier || 1.0
    this.elapsedTime = 0
    this.beatDuration = 0.5
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime
  }

  getAdjustedBulletSpeed(baseSpeed) {
    return baseSpeed * this.difficultyMultiplier * this.bulletSpeedMultiplier
  }

  setDifficulty(multiplier) {
    this.difficultyMultiplier = multiplier
  }
}

/* ─── component ─── */
export default function BulletHellPage() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const keysRef = useRef({})
  
  const [phase, setPhase] = useState('idle') // idle | playing | over
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(PLAYER_HP)
  const [wave, setWave] = useState(1)
  const [kills, setKills] = useState(0)

  /* force body bg to match game page */
  useEffect(() => {
    const prev = document.documentElement.style.background
    const prevBody = document.body.style.background
    document.documentElement.style.background = '#0a0a2e'
    document.body.style.background = '#0a0a2e'
    return () => {
      document.documentElement.style.background = prev
      document.body.style.background = prevBody
    }
  }, [])

  const initGame = useCallback(() => {
    const playerMovement = new PlayerMovement({
      x: VIEWPORT_W / 2 - PLAYER_W / 2,
      y: VIEWPORT_H - 80,
      maxX: VIEWPORT_W,
      maxY: VIEWPORT_H,
      hp: PLAYER_HP,
    })

    return {
      player: playerMovement,
      bullets: [],
      bulletPool: new BulletPool(1000),
      tempo: new GameTempo({ difficultyMultiplier: 1.0 }),
      enemies: createWaves(1),
      enemyBullets: [],
      score: 0,
      kills: 0,
      grazes: 0,
      wave: 1,
      shootCooldown: 0,
      waveComplete: false,
      screenShakeAmount: 0,
      screenShakeDuration: 0,
    }
  }, [])

  const startGame = useCallback(() => {
    const g = initGame()
    gameRef.current = g
    setScore(0)
    setHp(PLAYER_HP)
    setWave(1)
    setKills(0)
    setPhase('playing')
  }, [initGame])

  const gameOver = useCallback((finalScore) => {
    setScore(finalScore)
    setPhase('over')
  }, [])

  /* main game loop */
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let lastTime = performance.now()
    const TICK_MS = 1000 / 60
    const MAX_TICKS = 4
    let accumulator = 0
    let gameOverTriggered = false

    function update(g, keys, mouse) {
      /* slow mode toggle */
      g.player.slowMode = keys.shift || false

      /* player movement with normalized diagonal speed */
      const moveSpeed = g.player.slowMode ? PLAYER_SLOW_SPEED : PLAYER_SPEED
      let inputX = 0
      let inputY = 0
      if (keys.w || keys.arrowup) inputY -= 1
      if (keys.s || keys.arrowdown) inputY += 1
      if (keys.a || keys.arrowleft) inputX -= 1
      if (keys.d || keys.arrowright) inputX += 1

      /* normalize diagonal movement so diagonal isn't faster */
      const inputLength = Math.sqrt(inputX * inputX + inputY * inputY)
      if (inputLength > 0) {
        inputX /= inputLength
        inputY /= inputLength
      }

      /* calculate target velocity from input */
      const targetVx = inputX * moveSpeed
      const targetVy = inputY * moveSpeed

      /* apply smooth acceleration/deceleration */
      const accelFactor = 0.35
      const decelFactor = 0.6
      g.player.vx += (targetVx - g.player.vx) * (inputLength > 0 ? accelFactor : decelFactor)
      g.player.vy += (targetVy - g.player.vy) * (inputLength > 0 ? accelFactor : decelFactor)

      g.player.x += g.player.vx
      g.player.y += g.player.vy
      g.player.x = Math.max(0, Math.min(VIEWPORT_W - PLAYER_W, g.player.x))
      g.player.y = Math.max(0, Math.min(VIEWPORT_H - PLAYER_H, g.player.y))

      /* decrease graze cooldown */
      g.player.grazeCooldown = Math.max(0, g.player.grazeCooldown - 1)

      /* aim direction - always fire up (straight up) */
      g.player.aimAngle = -Math.PI / 2

      /* auto-fire toward aimed direction - faster in slow mode */
      const fireRate = g.player.slowMode ? 4 : 6
      g.shootCooldown = Math.max(0, g.shootCooldown - 1)
      if (g.shootCooldown === 0) {
        const dir = getDirectionVector(g.player.aimAngle)
        g.bullets.push({
          x: g.player.x + PLAYER_W / 2 - BULLET_W / 2,
          y: g.player.y,
          vx: dir.x * BULLET_SPEED,
          vy: dir.y * BULLET_SPEED,
        })
        g.shootCooldown = fireRate
      }

      /* update bullets */
      for (const b of g.bullets) {
        b.x += b.vx
        b.y += b.vy
      }
      g.bullets = g.bullets.filter(
        (b) => b.x > -20 && b.x < VIEWPORT_W + 20 && b.y > -20 && b.y < VIEWPORT_H + 20
      )

      /* update enemy bullets */
      for (const b of g.enemyBullets) {
        b.x += b.vx
        b.y += b.vy
      }
      g.enemyBullets = g.enemyBullets.filter(
        (b) => b.x > -20 && b.x < VIEWPORT_W + 20 && b.y > -20 && b.y < VIEWPORT_H + 20
      )

      /* update enemies */
      for (const e of g.enemies) {
        const stats = ENEMY_STATS[e.type] || ENEMY_STATS.grunt

        /* enemy movement patterns */
        if (e.type === 'glider') {
          /* straight down */
          e.vy = stats.speed
        } else if (e.type === 'seeker') {
          /* move toward player */
          const dx = g.player.x + PLAYER_W / 2 - (e.x + ENEMY_W / 2)
          const dy = g.player.y + PLAYER_H / 2 - (e.y + ENEMY_H / 2)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 0) {
            e.vx = (dx / dist) * stats.speed
            e.vy = (dy / dist) * stats.speed
          }
        } else if (e.type === 'cannon') {
          /* stay centered horizontally, move down slowly */
          e.vx = (VIEWPORT_W / 2 - (e.x + ENEMY_W / 2)) * 0.02
          e.vy = stats.speed
        } else if (e.type === 'pulsar') {
          /* straight down */
          e.vy = stats.speed
        } else if (e.type === 'grunt') {
          /* straight down */
          e.vy = stats.speed
        } else if (e.type === 'sniper') {
          /* slight down, sinusoidal side-to-side */
          e.vy = stats.speed * 0.5
          e.vx = Math.sin(Date.now() * 0.003) * 1
        }

        e.x += e.vx
        e.y += e.vy
        if (e.flash > 0) e.flash--

        /* enemy shooting with type-specific patterns */
        e.shootTimer++
        const shouldShoot = e.shootTimer >= e.shootInterval

        if (e.type === 'glider') {
          /* single bullet down */
          if (shouldShoot) {
            e.shootTimer = 0
            g.enemyBullets.push({
              x: e.x + ENEMY_W / 2 - BULLET_W / 2,
              y: e.y + ENEMY_H,
              vx: 0,
              vy: 4,
            })
          }
        } else if (e.type === 'seeker') {
          /* single bullet aimed at player with slight variation */
          if (shouldShoot) {
            e.shootTimer = 0
            const angle = angleToTarget(e.x + ENEMY_W / 2, e.y + ENEMY_H / 2, g.player.x + PLAYER_W / 2, g.player.y + PLAYER_H / 2)
            const variation = (Math.random() - 0.5) * 0.175 /* ±5° in radians */
            const fireAngle = angle + variation
            g.enemyBullets.push({
              x: e.x + ENEMY_W / 2 - BULLET_W / 2,
              y: e.y + ENEMY_H,
              vx: Math.cos(fireAngle) * ENEMY_BULLET_SPEED,
              vy: Math.sin(fireAngle) * ENEMY_BULLET_SPEED,
            })
          }
        } else if (e.type === 'cannon') {
          /* 5-way spread directly down */
          if (shouldShoot) {
            e.shootTimer = 0
            const angles = [-Math.PI / 4, -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4]
            for (let i = 0; i < 5; i++) {
              const angle = Math.PI / 2 + angles[i] /* 90° + spread */
              g.enemyBullets.push({
                x: e.x + ENEMY_W / 2 - BULLET_W / 2,
                y: e.y + ENEMY_H,
                vx: Math.cos(angle) * ENEMY_BULLET_SPEED,
                vy: Math.sin(angle) * ENEMY_BULLET_SPEED,
              })
            }
          }
        } else if (e.type === 'pulsar') {
          /* 8-way radial burst */
          if (shouldShoot) {
            e.shootTimer = 0
            for (let i = 0; i < 8; i++) {
              const angle = (i * Math.PI * 2) / 8
              g.enemyBullets.push({
                x: e.x + ENEMY_W / 2 - BULLET_W / 2,
                y: e.y + ENEMY_H / 2 - BULLET_H / 2,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
              })
            }
          }
        } else if (e.type === 'grunt' || e.type === 'sniper') {
          /* original 3-pattern system */
          if (shouldShoot) {
            e.shootTimer = 0
            const angle = angleToTarget(e.x + ENEMY_W / 2, e.y + ENEMY_H / 2, g.player.x + PLAYER_W / 2, g.player.y + PLAYER_H / 2)

            if (e.bulletPattern === 0) {
              /* straight shot */
              g.enemyBullets.push({
                x: e.x + ENEMY_W / 2 - BULLET_W / 2,
                y: e.y + ENEMY_H,
                vx: Math.cos(angle) * ENEMY_BULLET_SPEED,
                vy: Math.sin(angle) * ENEMY_BULLET_SPEED,
              })
            } else if (e.bulletPattern === 1) {
              /* spread 3 bullets */
              for (let i = -1; i <= 1; i++) {
                const spread = angle + (i * 0.4)
                g.enemyBullets.push({
                  x: e.x + ENEMY_W / 2 - BULLET_W / 2,
                  y: e.y + ENEMY_H,
                  vx: Math.cos(spread) * ENEMY_BULLET_SPEED,
                  vy: Math.sin(spread) * ENEMY_BULLET_SPEED,
                })
              }
            } else {
              /* spiral pattern */
              const spiralOffset = (Date.now() / 50) % (Math.PI * 2)
              for (let i = 0; i < 3; i++) {
                const bulletAngle = angle + spiralOffset + (i * (Math.PI * 2 / 3))
                g.enemyBullets.push({
                  x: e.x + ENEMY_W / 2 - BULLET_W / 2,
                  y: e.y + ENEMY_H,
                  vx: Math.cos(bulletAngle) * ENEMY_BULLET_SPEED,
                  vy: Math.sin(bulletAngle) * ENEMY_BULLET_SPEED,
                })
              }
            }
          }
        }
      }

      /* player bullet vs enemy collision */
      for (const b of g.bullets) {
        for (const e of g.enemies) {
          if (rectsOverlap({ x: b.x, y: b.y, w: BULLET_W, h: BULLET_H }, { x: e.x, y: e.y, w: ENEMY_W, h: ENEMY_H })) {
            e.hp -= 10
            e.flash = 4
            b.x = -100
            g.score += 5
            if (e.hp <= 0) {
              g.enemies = g.enemies.filter((en) => en !== e)
              g.kills++
              g.score += 25
            }
          }
        }
      }

      /* enemy bullet vs player collision and graze */
      for (const b of g.enemyBullets) {
        const bulletDist = Math.sqrt(
          Math.pow(b.x - (g.player.x + PLAYER_W / 2), 2) +
          Math.pow(b.y - (g.player.y + PLAYER_H / 2), 2)
        )
        
        if (bulletDist < PLAYER_HITBOX_RADIUS + BULLET_W) {
          /* collision */
          g.player.hp -= 10
          b.y = VIEWPORT_H + 100
          if (g.player.hp <= 0) {
            gameOver(g.score)
            gameOverTriggered = true
            return
          }
        } else if (bulletDist < GRAZE_DISTANCE && g.player.grazeCooldown === 0) {
          /* graze - bullet near but not hitting */
          g.grazes++
          g.score += 50
          g.player.grazeCooldown = GRAZE_COOLDOWN
        }
      }

      /* enemy vs player collision (contact damage) */
      for (const e of g.enemies) {
        if (circlesOverlap(g.player, e, 25)) {
          g.player.hp -= 5
          if (g.player.hp <= 0) {
            gameOver(g.score)
            gameOverTriggered = true
            return
          }
        }
      }

      /* wave complete check */
      if (g.enemies.length === 0 && !g.waveComplete) {
        g.waveComplete = true
        setTimeout(() => {
          g.wave++
          g.enemies = createWaves(g.wave)
          g.waveComplete = false
        }, 2000)
      }

      /* remove enemies that escaped */
      g.enemies = g.enemies.filter((e) => e.y < VIEWPORT_H + 50)
    }

    function draw(g) {
      /* background */
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H)

      /* starfield */
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      for (let i = 0; i < 50; i++) {
        const x = (i * 173) % VIEWPORT_W
        const y = ((i * 97 + Math.floor(Date.now() / 50)) % VIEWPORT_H)
        const size = (i % 3) * 0.5 + 0.5
        ctx.fillRect(x, y, size, size)
      }

      /* draw player */
      ctx.save()
      ctx.translate(g.player.x + PLAYER_W / 2, g.player.y + PLAYER_H / 2)
      
      /* rotate player to face aim direction */
      ctx.rotate(g.player.aimAngle)
      
      /* hitbox indicator in slow mode */
      if (g.player.slowMode) {
        ctx.strokeStyle = 'rgba(127, 186, 205, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, PLAYER_HITBOX_RADIUS, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      /* player ship pointing in aim direction */
      ctx.fillStyle = g.player.slowMode ? 'rgba(127, 186, 205, 1)' : '#7fbacd'
      ctx.beginPath()
      ctx.moveTo(0, -PLAYER_H / 2)
      ctx.lineTo(PLAYER_W / 2, PLAYER_H / 2)
      ctx.lineTo(0, PLAYER_H / 3)
      ctx.lineTo(-PLAYER_W / 2, PLAYER_H / 2)
      ctx.closePath()
      ctx.fill()
      
      /* slow mode aura */
      if (g.player.slowMode) {
        ctx.strokeStyle = 'rgba(127, 186, 205, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, 18, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      ctx.restore()

      /* draw aim direction indicator (8-directional) */
      const aimDir = getDirectionVector(g.player.aimAngle)
      ctx.strokeStyle = 'rgba(127, 186, 205, 0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      const aimStartX = g.player.x + PLAYER_W / 2
      const aimStartY = g.player.y + PLAYER_H / 2
      const aimLength = 40
      ctx.moveTo(aimStartX, aimStartY)
      ctx.lineTo(aimStartX + aimDir.x * aimLength, aimStartY + aimDir.y * aimLength)
      ctx.stroke()

      /* draw bullets */
      ctx.fillStyle = '#7fbacd'
      for (const b of g.bullets) {
        ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H)
      }

      /* draw enemies */
      for (const e of g.enemies) {
        /* choose color based on enemy type */
        let color = '#e85d75'
        if (e.type === 'glider') color = '#a0a0a0'
        else if (e.type === 'seeker') color = '#ff9944'
        else if (e.type === 'cannon') color = '#cc3333'
        else if (e.type === 'pulsar') color = '#ffcc44'
        else if (e.type === 'grunt') color = '#e85d75'
        else if (e.type === 'sniper') color = '#4488cc'

        if (e.flash > 0) ctx.fillStyle = '#fff'
        else ctx.fillStyle = color

        ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H)

        /* draw type indicator for clarity */
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = '10px Arial'
        const typeLabel = e.type.charAt(0).toUpperCase()
        const textW = ctx.measureText(typeLabel).width
        ctx.fillText(typeLabel, e.x + ENEMY_W / 2 - textW / 2, e.y + ENEMY_H / 2 + 3)
      }

      /* draw enemy bullets */
      ctx.fillStyle = '#e85d75'
      for (const b of g.enemyBullets) {
        ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H)
      }

      /* draw hp bar */
      const barW = 200
      const barH = 8
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(10, 10, barW, barH)
      const hpPercent = Math.max(0, g.player.hp / PLAYER_HP)
      ctx.fillStyle = hpPercent > 0.3 ? '#7fbacd' : '#e85d75'
      ctx.fillRect(10, 10, barW * hpPercent, barH)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, barW, barH)

      /* draw UI text */
      ctx.fillStyle = '#7fbacd'
      ctx.font = 'bold 14px monospace'
      ctx.fillText(`Wave: ${g.wave}`, 10, 40)
      ctx.fillText(`Score: ${g.score}`, 10, 60)
      ctx.fillText(`Grazes: ${g.grazes}`, 10, 80)
      ctx.fillText(`Kills: ${g.kills}`, VIEWPORT_W - 150, 40)
      ctx.fillText(`HP: ${g.player.hp}`, VIEWPORT_W - 150, 60)
      
      /* slow mode indicator */
      if (g.player.slowMode) {
        ctx.fillStyle = 'rgba(127, 186, 205, 0.7)'
        ctx.fillText('SLOW MODE', 10, VIEWPORT_H - 20)
      }
    }

    function frame(now) {
      if (gameOverTriggered) return
      const g = gameRef.current
      if (!g) return

      const dt = now - lastTime
      lastTime = now
      accumulator += Math.min(dt, MAX_TICKS * TICK_MS)

      while (accumulator >= TICK_MS) {
        update(g, keysRef.current)
        if (gameOverTriggered) return
        accumulator -= TICK_MS
      }

      draw(g)
      setScore(g.score)
      setHp(g.player.hp)
      setWave(g.wave)
      setKills(g.kills)

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase, gameOver])

  /* keyboard input */
  useEffect(() => {
    function down(e) {
      const key = e.key.toLowerCase()
      keysRef.current[key] = true
    }
    function up(e) {
      const key = e.key.toLowerCase()
      keysRef.current[key] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /* mouse tracking - removed, aiming is movement-based */
  useEffect(() => {
    // No mouse tracking needed - Touhou-style keyboard-only controls
    return () => {}
  }, [])

  return (
    <>
      <Head>
        <title>Bullet Hell</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#0a0a2e" />
      </Head>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>Bullet Hell</h1>
        <p className={styles.subtitle}>WASD to move • Shift = Slow Mode • Dodge enemy fire!</p>

        <div className={styles.hud}>
          <span>Wave: {wave}</span>
          <span>Score: {score}</span>
          <span>HP: {hp}</span>
        </div>

        <div className={styles.canvasWrap}>
          <canvas
            ref={canvasRef}
            width={VIEWPORT_W}
            height={VIEWPORT_H}
            className={styles.canvas}
            style={{ border: '2px solid #7fbacd' }}
          />

          {phase === 'idle' && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>Bullet Hell</h2>
              <button className={styles.startBtn} onClick={startGame}>
                START GAME
              </button>
            </div>
          )}

          {phase === 'over' && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>Game Over</h2>
              <p className={styles.finalScore}>Final Score: {score}</p>
              <button className={styles.startBtn} onClick={startGame}>
                TRY AGAIN
              </button>
            </div>
          )}
        </div>

        <Link href="/" className={styles.backLink}>
          ← Back to Clure
        </Link>
      </div>
    </>
  )
}
