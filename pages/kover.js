import { useRef, useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { db } from '../lib/firebase'
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore'
import styles from '../components/Game.module.css'

/* ─── constants ─── */
const BASE_W = 480
const BASE_H = 640
const PLAYER_W = 36
const PLAYER_H = 28
const BULLET_W = 3
const BULLET_H = 14
const ENEMY_W = 40
const ENEMY_H = 30
const ENEMY_COLS = 8
const ENEMY_ROWS = 4
const ENEMY_PAD = 14
const ENEMY_BULLET_SPEED = 3.5
const STAR_COUNT = 80
const MAX_LEADERBOARD = 10
const LB_COLLECTION = 'kover_leaderboard'

/* ─── boss constants ─── */
const BOSS_W = 120
const BOSS_H = 120
const BOSS_HP = 30
const BOSS_SPEED = 0.8
const BOSS_SHOOT_INTERVAL = 50
const BOSS_BULLET_SPEED = 3
const BOSS_EVERY_N_WAVES = 3

/* ─── helpers ─── */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function createStars() {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * BASE_W,
    y: Math.random() * BASE_H,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.4 + 0.1,
  }))
}

function createEnemies() {
  const enemies = []
  const gridW = ENEMY_COLS * (ENEMY_W + ENEMY_PAD) - ENEMY_PAD
  const startX = (BASE_W - gridW) / 2
  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      enemies.push({
        x: startX + col * (ENEMY_W + ENEMY_PAD),
        y: 40 + row * (ENEMY_H + ENEMY_PAD),
        alive: true,
        flash: 0,
      })
    }
  }
  return enemies
}

async function fetchLeaderboard() {
  try {
    const q = query(collection(db, LB_COLLECTION), orderBy('score', 'desc'), limit(MAX_LEADERBOARD))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  } catch {
    return []
  }
}

async function addScoreEntry(entry) {
  try {
    await addDoc(collection(db, LB_COLLECTION), entry)
  } catch { /* ignore */ }
}

/* ─── preload sprites ─── */
let enemyImg = null
let vladosPlayerImg = null
let bossImg = null
if (typeof window !== 'undefined') {
  const _v = '?v=2'
  enemyImg = new Image()
  enemyImg.src = '/images/Vlados.png' + _v
  vladosPlayerImg = new Image()
  vladosPlayerImg.src = '/images/Vlados.png' + _v
  bossImg = new Image()
  bossImg.src = '/images/Vlados.png' + _v
}

/* ─── draw helpers ─── */
function drawPlayer(ctx, x, y, color, useVladosImg) {
  if (useVladosImg && vladosPlayerImg && vladosPlayerImg.complete) {
    const aspect = vladosPlayerImg.naturalWidth / vladosPlayerImg.naturalHeight
    let dw = PLAYER_W
    let dh = PLAYER_W / aspect
    if (dh > PLAYER_H) { dh = PLAYER_H; dw = PLAYER_H * aspect }
    const dx = x + (PLAYER_W - dw) / 2
    const dy = y + (PLAYER_H - dh) / 2
    ctx.drawImage(vladosPlayerImg, dx, dy, dw, dh)
    return
  }
  ctx.fillStyle = color || '#7fbacd'
  ctx.fillRect(x + 6, y + 10, PLAYER_W - 12, PLAYER_H - 10)
  ctx.fillRect(x + 14, y, 8, 12)
  ctx.fillRect(x, y + 18, 6, 10)
  ctx.fillRect(x + PLAYER_W - 6, y + 18, 6, 10)
  ctx.fillStyle = color === '#a855f7' ? '#d8b4fe' : '#b6e4f0'
  ctx.fillRect(x + 15, y + 6, 6, 5)
}

function drawEnemy(ctx, e) {
  if (!e.alive) return
  if (enemyImg && enemyImg.complete) {
    const aspect = enemyImg.naturalWidth / enemyImg.naturalHeight
    let dw = ENEMY_W
    let dh = ENEMY_W / aspect
    if (dh > ENEMY_H) { dh = ENEMY_H; dw = ENEMY_H * aspect }
    const dx = e.x + (ENEMY_W - dw) / 2
    const dy = e.y + (ENEMY_H - dh) / 2
    ctx.drawImage(enemyImg, dx, dy, dw, dh)
    if (e.flash > 0) {
      ctx.save()
      ctx.globalAlpha = 0.6
      ctx.fillStyle = '#fff'
      ctx.fillRect(dx, dy, dw, dh)
      ctx.restore()
    }
  } else {
    ctx.fillStyle = e.flash > 0 ? '#fff' : '#e85d75'
    ctx.fillRect(e.x + 4, e.y + 4, ENEMY_W - 8, ENEMY_H - 8)
  }
}

function drawBoss(ctx, boss) {
  if (!boss) return
  // draw boss sprite
  if (bossImg && bossImg.complete) {
    const aspect = bossImg.naturalWidth / bossImg.naturalHeight
    let dw = BOSS_W
    let dh = BOSS_W / aspect
    if (dh > BOSS_H) { dh = BOSS_H; dw = BOSS_H * aspect }
    const dx = boss.x + (BOSS_W - dw) / 2
    const dy = boss.y + (BOSS_H - dh) / 2
    if (boss.flash > 0) {
      ctx.drawImage(bossImg, dx, dy, dw, dh)
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.fillStyle = '#fff'
      ctx.fillRect(dx, dy, dw, dh)
      ctx.restore()
    } else {
      ctx.drawImage(bossImg, dx, dy, dw, dh)
    }
  } else {
    ctx.fillStyle = boss.flash > 0 ? '#fff' : '#e85d75'
    ctx.fillRect(boss.x, boss.y, BOSS_W, BOSS_H)
  }
  // health bar
  const barW = BOSS_W
  const barH = 6
  const barX = boss.x
  const barY = boss.y - 12
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(barX, barY, barW, barH)
  ctx.fillStyle = '#e85d75'
  ctx.fillRect(barX, barY, barW * (boss.hp / boss.maxHp), barH)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.strokeRect(barX, barY, barW, barH)
}

function createBoss() {
  return {
    x: BASE_W / 2 - BOSS_W / 2,
    y: 30,
    hp: BOSS_HP,
    maxHp: BOSS_HP,
    dir: 1,
    shootTimer: 0,
    flash: 0,
  }
}

function drawBullet(ctx, b) {
  ctx.fillStyle = '#7fbacd'
  ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H)
}

function drawEnemyBullet(ctx, b) {
  ctx.fillStyle = '#e85d75'
  ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H)
}

function drawStars(ctx, stars) {
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  for (const s of stars) {
    const size = s.r * 2
    ctx.fillRect(s.x, s.y, size, size)
  }
}

function drawExplosion(ctx, exp) {
  const alpha = 1 - exp.t / exp.dur
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  const r = 8 + (exp.t / exp.dur) * 18
  ctx.fillStyle = '#ffaa44'
  ctx.fillRect(exp.cx - r, exp.cy - r, r * 2, r * 2)
  ctx.fillStyle = '#fff'
  const ri = r * 0.4
  ctx.fillRect(exp.cx - ri, exp.cy - ri, ri * 2, ri * 2)
  ctx.restore()
}

/* ─── component ─── */
export default function GamePage() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const keysRef = useRef({})
  const [phase, setPhase] = useState('idle') // idle | name | playing | over
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [finalScore, setFinalScore] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [showBoard, setShowBoard] = useState(false)

  /* load leaderboard on mount */
  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard)
  }, [])

  const initGame = useCallback(() => {
    return {
      player: { x: BASE_W / 2 - PLAYER_W / 2, y: BASE_H - 60 },
      bullets: [],
      enemyBullets: [],
      enemies: createEnemies(),
      stars: createStars(),
      explosions: [],
      enemyDir: 1,
      enemySpeed: 0.4,
      enemyShootTimer: 0,
      score: 0,
      lives: 3,
      cooldown: 0,
      wave: 1,
      invincible: 0,
      boss: null,
    }
  }, [])

  /* go to name input screen */
  const promptName = useCallback(() => {
    setShowBoard(false)
    setPhase('name')
  }, [])

  const VLADOS_NAMES = new Set([
    'vlados', 'владос', 'владосик', 'tsarrvladossik',
  ])

  function isVladosName(name) {
    return VLADOS_NAMES.has(name.trim().toLowerCase())
  }

  const BANNED_NAMES = new Set([
    'бобёр', 'бобер', 'бобёр', 'федя бобёр',
    'bober', 'energybober',
  ])

  function isBannedName(name) {
    return BANNED_NAMES.has(name.trim().toLowerCase().replace(/ё/g, 'ё'))
  }

  /* submit name — start game */
  const submitName = useCallback(() => {
    if (!playerName.trim()) return
    const g = initGame()
    gameRef.current = g
    setScore(0)
    setLives(3)
    setPhase('playing')
  }, [initGame, playerName])

  /* start after entering name */
  const startGame = useCallback(() => {
    if (!playerName.trim()) return
    const g = initGame()
    gameRef.current = g
    setScore(0)
    setLives(3)
    setPhase('playing')
  }, [initGame, playerName])

  /* save score & show game over */
  const endGame = useCallback((finalPts) => {
    setFinalScore(finalPts)
    const entry = { name: playerName.trim() || '???', score: finalPts, date: new Date().toLocaleDateString('ru-RU') }
    addScoreEntry(entry).then(() => fetchLeaderboard()).then(setLeaderboard)
    setPhase('over')
  }, [playerName])

  /* main loop */
  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    function tick() {
      const g = gameRef.current
      if (!g) return
      const keys = keysRef.current

      const speed = 5
      if (keys.ArrowLeft || keys.left) g.player.x -= speed
      if (keys.ArrowRight || keys.right) g.player.x += speed
      g.player.x = Math.max(0, Math.min(BASE_W - PLAYER_W, g.player.x))

      g.cooldown = Math.max(0, g.cooldown - 1)
      if ((keys.Space || keys.fire) && g.cooldown === 0) {
        g.bullets.push({ x: g.player.x + PLAYER_W / 2 - BULLET_W / 2, y: g.player.y - BULLET_H })
        g.cooldown = 12
      }

      for (const b of g.bullets) b.y -= 7
      g.bullets = g.bullets.filter((b) => b.y + BULLET_H > 0)

      g.enemyBullets = g.enemyBullets.filter((b) => b.y < BASE_H + 10 && b.x > -20 && b.x < BASE_W + 20)

      let edgeHit = false
      for (const e of g.enemies) {
        if (!e.alive) continue
        e.x += g.enemySpeed * g.enemyDir
        if (e.x <= 0 || e.x + ENEMY_W >= BASE_W) edgeHit = true
        if (e.flash > 0) e.flash--
      }
      if (edgeHit) {
        g.enemyDir *= -1
        for (const e of g.enemies) {
          if (e.alive) e.y += 14
        }
      }

      g.enemyShootTimer++
      if (g.enemyShootTimer > 50) {
        g.enemyShootTimer = 0
        const alive = g.enemies.filter((e) => e.alive)
        if (alive.length > 0) {
          const shooter = alive[Math.floor(Math.random() * alive.length)]
          g.enemyBullets.push({ x: shooter.x + ENEMY_W / 2 - BULLET_W / 2, y: shooter.y + ENEMY_H })
        }
      }

      for (const b of g.bullets) {
        for (const e of g.enemies) {
          if (!e.alive) continue
          if (rectsOverlap({ x: b.x, y: b.y, w: BULLET_W, h: BULLET_H }, { x: e.x, y: e.y, w: ENEMY_W, h: ENEMY_H })) {
            e.alive = false
            b.y = -100
            g.score += 10
            setScore(g.score)
            g.explosions.push({ cx: e.x + ENEMY_W / 2, cy: e.y + ENEMY_H / 2, t: 0, dur: 20 })
          }
        }
      }

      if (g.invincible > 0) {
        g.invincible--
      } else {
        for (const b of g.enemyBullets) {
          if (
            rectsOverlap(
              { x: b.x, y: b.y, w: BULLET_W, h: BULLET_H },
              { x: g.player.x, y: g.player.y, w: PLAYER_W, h: PLAYER_H }
            )
          ) {
            b.y = BASE_H + 100
            g.lives--
            g.invincible = 90
            setLives(g.lives)
            g.explosions.push({ cx: g.player.x + PLAYER_W / 2, cy: g.player.y + PLAYER_H / 2, t: 0, dur: 30 })
            if (g.lives <= 0) {
              endGame(g.score)
              return
            }
          }
        }
      }

      for (const e of g.enemies) {
        if (e.alive && e.y + ENEMY_H >= g.player.y) {
          endGame(g.score)
          return
        }
      }

      /* ── boss logic ── */
      if (g.boss) {
        // move boss
        g.boss.x += BOSS_SPEED * g.boss.dir
        if (g.boss.x <= 0 || g.boss.x + BOSS_W >= BASE_W) g.boss.dir *= -1
        if (g.boss.flash > 0) g.boss.flash--

        // boss shooting (3 bullets in a spread)
        g.boss.shootTimer++
        if (g.boss.shootTimer >= BOSS_SHOOT_INTERVAL) {
          g.boss.shootTimer = 0
          const cx = g.boss.x + BOSS_W / 2
          const by = g.boss.y + BOSS_H
          g.enemyBullets.push({ x: cx - BULLET_W / 2, y: by, vx: 0 })
          g.enemyBullets.push({ x: cx - BULLET_W / 2 - 12, y: by, vx: -1 })
          g.enemyBullets.push({ x: cx - BULLET_W / 2 + 12, y: by, vx: 1 })
        }

        // bullets vs boss
        for (const b of g.bullets) {
          if (rectsOverlap({ x: b.x, y: b.y, w: BULLET_W, h: BULLET_H }, { x: g.boss.x, y: g.boss.y, w: BOSS_W, h: BOSS_H })) {
            b.y = -100
            g.boss.hp--
            g.boss.flash = 4
            g.score += 5
            setScore(g.score)
            if (g.boss.hp <= 0) {
              g.explosions.push({ cx: g.boss.x + BOSS_W / 2, cy: g.boss.y + BOSS_H / 2, t: 0, dur: 40 })
              g.explosions.push({ cx: g.boss.x + BOSS_W * 0.25, cy: g.boss.y + BOSS_H * 0.3, t: 0, dur: 30 })
              g.explosions.push({ cx: g.boss.x + BOSS_W * 0.75, cy: g.boss.y + BOSS_H * 0.7, t: 0, dur: 30 })
              g.score += 100
              setScore(g.score)
              g.boss = null
              g.wave++
              g.enemies = createEnemies()
              g.enemySpeed = Math.min(2, 0.4 + g.wave * 0.15)
              g.enemyBullets = []
              break
            }
          }
        }
      }

      /* ── enemy bullet movement (with spread for boss bullets) ── */
      for (const b of g.enemyBullets) {
        b.y += (b.vx !== undefined ? BOSS_BULLET_SPEED : ENEMY_BULLET_SPEED)
        if (b.vx) b.x += b.vx
      }

      if (!g.boss && g.enemies.every((e) => !e.alive)) {
        g.wave++
        if (g.wave % BOSS_EVERY_N_WAVES === 1 && g.wave > 1) {
          // boss wave
          g.boss = createBoss()
          g.enemies = []
          g.enemyBullets = []
        } else {
          g.enemies = createEnemies()
          g.enemySpeed = Math.min(2, 0.4 + g.wave * 0.15)
          g.enemyBullets = []
        }
      }

      for (const exp of g.explosions) exp.t++
      g.explosions = g.explosions.filter((exp) => exp.t < exp.dur)

      for (const s of g.stars) {
        s.y += s.speed
        if (s.y > BASE_H) { s.y = 0; s.x = Math.random() * BASE_W }
      }

      ctx.clearRect(0, 0, BASE_W, BASE_H)
      drawStars(ctx, g.stars)
      for (const b of g.bullets) drawBullet(ctx, b)
      for (const b of g.enemyBullets) drawEnemyBullet(ctx, b)
      for (const e of g.enemies) drawEnemy(ctx, e)
      if (g.boss) drawBoss(ctx, g.boss)
      for (const exp of g.explosions) drawExplosion(ctx, exp)

      if (g.invincible === 0 || Math.floor(g.invincible / 4) % 2 === 0) {
        const vladosMode = isVladosName(playerName)
        drawPlayer(ctx, g.player.x, g.player.y, isBannedName(playerName) ? '#a855f7' : '#7fbacd', vladosMode)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, endGame])

  /* keyboard input */
  useEffect(() => {
    function down(e) {
      if (['ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) e.preventDefault()
      const key = e.key === ' ' ? 'Space' : e.key
      keysRef.current[key] = true
    }
    function up(e) {
      const key = e.key === ' ' ? 'Space' : e.key
      keysRef.current[key] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const touchStart = (key) => () => { keysRef.current[key] = true }
  const touchEnd = (key) => () => { keysRef.current[key] = false }

  /* touch drag controls on canvas */
  const touchRef = useRef(null)
  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = BASE_W / rect.width
    touchRef.current = { startX: touch.clientX, playerStartX: gameRef.current?.player.x ?? 0, scaleX }
    keysRef.current.fire = true
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    if (!touchRef.current || !gameRef.current) return
    const touch = e.touches[0]
    const dx = (touch.clientX - touchRef.current.startX) * touchRef.current.scaleX
    const newX = touchRef.current.playerStartX + dx
    gameRef.current.player.x = Math.max(0, Math.min(BASE_W - PLAYER_W, newX))
  }, [])

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault()
    touchRef.current = null
    keysRef.current.fire = false
  }, [])

  /* ── leaderboard table ── */
  const boardTable = (
    <div className={styles.leaderboard}>
      <h3 className={styles.boardTitle}>Таблица рекордов</h3>
      {leaderboard.length === 0 ? (
        <p className={styles.boardEmpty}>Пока нет результатов</p>
      ) : (
        <table className={styles.boardTable}>
          <thead>
            <tr><th>#</th><th>Имя</th><th>Очки</th><th>Дата</th></tr>
          </thead>
          <tbody>
            {leaderboard.map((e, i) => (
              <tr key={i} className={e.name === playerName.trim() && e.score === finalScore ? styles.boardHighlight : ''}>
                <td>{i + 1}</td>
                <td>{e.name}</td>
                <td>{e.score}</td>
                <td>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

  return (
    <>
      <Head>
        <title>Ковёр</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#0a0a2e" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>Ковёр</h1>
        <p className={styles.subtitle}>← → двигаться &nbsp;|&nbsp; Пробел — стрелять &nbsp;|&nbsp; На телефоне: тяни</p>

        <div className={styles.hud}>
          <span>ОЧКИ: {score}</span>
          <span>ЖИЗНИ: {'♥'.repeat(Math.max(0, lives))}</span>
        </div>

        <div className={styles.canvasWrap}>
          <img src="/images/kover.PNG" alt="" className={styles.canvasBg} />
          <canvas
            ref={canvasRef}
            width={BASE_W}
            height={BASE_H}
            className={styles.canvas}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />

          {/* ── idle screen ── */}
          {phase === 'idle' && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>Ковёр</h2>
              <button className={styles.startBtn} onClick={promptName}>
                ИГРАТЬ
              </button>
              {leaderboard.length > 0 && (
                <button className={styles.boardToggle} onClick={() => setShowBoard((v) => !v)}>
                  {showBoard ? 'Скрыть рекорды' : 'Таблица рекордов'}
                </button>
              )}
              {showBoard && boardTable}
            </div>
          )}

          {/* ── name input screen ── */}
          {phase === 'name' && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>Как тебя зовут?</h2>
              <input
                className={styles.nameInput}
                type="text"
                maxLength={16}
                placeholder="Введи имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitName() }}
                autoFocus
              />
              <button className={styles.startBtn} onClick={submitName} disabled={!playerName.trim()}>
                НАЧАТЬ
              </button>
            </div>
          )}

          {/* ── game over screen ── */}
          {phase === 'over' && (
            <div className={styles.overlay}>
              <h2 className={styles.overlayTitle}>Игра окончена</h2>
              <p className={styles.finalScore}>Очки: {finalScore}</p>
              {boardTable}
              <button className={styles.startBtn} onClick={startGame}>
                ЗАНОВО
              </button>
            </div>
          )}
        </div>

        <Link href="/" className={styles.backLink}>
          ← Назад на Clure
        </Link>
      </div>
    </>
  )
}
