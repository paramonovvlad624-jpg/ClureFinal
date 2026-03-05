import Head from 'next/head'
import client from '../lib/sanity'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import ArticlesList from '../components/ArticlesList'
import Footer from '../components/Footer'

export default function Home({ page, articles = [] }) {
  const title = page?.title || 'Clure.'

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Navigation />
      <Hero />
      <main style={{ background: '#87c1d3' }}>
        <ArticlesList items={articles} />
      </main>
      <Footer />
    </>
  )
}

export async function getStaticProps() {
  let page = null
  let articles = []
  try {
    page = await client.fetch('*[_type == "page"][0]{title, body}')
    articles = await client.fetch('*[_type == "article"] | order(publishedAt desc)[0...4]{_id, title, excerpt, slug, publishedAt, mainImage, author->{name, slug, image}}')
  } catch (e) {
    // ignore if Sanity is not configured yet
  }
  return { props: { page: page || null, articles: articles || [] } }
}
