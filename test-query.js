const sanityClient = require('@sanity/client').default || require('@sanity/client')
const client = sanityClient({
  projectId: 'j89ku3zb',
  dataset: 'production',
  apiVersion: '2026-01-01',
  useCdn: false,
})

client
  .fetch('*[_type == "interview" && defined(slug.current)]{ "slug": slug.current }')
  .then((res) => {
    console.log('Slug query result:')
    console.log(JSON.stringify(res, null, 2))
  })
  .catch((err) => console.error('Error:', err.message))
