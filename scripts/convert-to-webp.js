const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')
const MIN_SIZE_BYTES = 1024 // skip very small images
const QUALITY = 80

function walk(dir) {
  const results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results.push(...walk(filePath))
    } else {
      results.push(filePath)
    }
  })
  return results
}

async function convert(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') return
  const stat = fs.statSync(file)
  if (stat.size < MIN_SIZE_BYTES) return
  const out = file.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  // skip if webp exists and is newer
  if (fs.existsSync(out)) {
    const outStat = fs.statSync(out)
    if (outStat.mtimeMs >= stat.mtimeMs) return
  }
  try {
    await sharp(file)
      .webp({ quality: QUALITY })
      .toFile(out)
    console.log('converted', path.relative(IMAGES_DIR, file), '->', path.relative(IMAGES_DIR, out))
  } catch (err) {
    console.error('failed', file, err.message)
  }
}

async function run() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('images dir not found:', IMAGES_DIR)
    process.exit(1)
  }
  const files = walk(IMAGES_DIR)
  for (const f of files) {
    // ignore already webp and icons folder
    if (f.toLowerCase().endsWith('.webp') || f.toLowerCase().includes('favicon-16')) continue
    await convert(f)
  }
}

run().then(() => console.log('done')).catch((e) => { console.error(e); process.exit(1) })
