export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const secret = process.env.SANITY_REVALIDATE_SECRET
  const provided = req.query.secret || req.headers['x-sanity-webhook-secret']

  if (!secret || provided !== secret) {
    return res.status(401).json({ message: 'Invalid secret' })
  }

  try {
    const payload = req.body || {}

    // Always revalidate the homepage
    await res.revalidate('/')

    // If the webhook payload contains a document with a slug, revalidate its page
    const doc = payload.document || payload.result || payload
    const type = doc && doc._type
    const slug = doc && (doc.slug?.current || doc.slug)

    if (type === 'article' && slug) {
      await res.revalidate(`/articles/${slug}`)
    }

    return res.json({ revalidated: true })
  } catch (err) {
    console.error('Revalidation error:', err)
    return res.status(500).json({ message: 'Revalidation failed' })
  }
}
