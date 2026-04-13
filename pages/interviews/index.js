import Head from 'next/head'
import client from '../../lib/sanity'
import Navigation from '../../components/Navigation'
import Hero from '../../components/Hero'
import InterviewsList from '../../components/InterviewsList'
import Footer from '../../components/Footer'

const INTERVIEWS_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
  { href: '/theory-fest', label: 'Theory Fest' },
]

const queryAllInterviews = `*[_type == "interview"]| order(publishedAt desc){
  _id, title, excerpt, slug, publishedAt, mainImage, guest, interviewer
}`

export async function getStaticProps() {
  const interviews = await client.fetch(queryAllInterviews)

  return {
    props: { interviews: interviews || [] },
  }
}

export default function InterviewsPage({ interviews = [] }) {
  return (
    <>
      <Head>
        <title>Интервью — Clure</title>
      </Head>
      <Navigation links={INTERVIEWS_NAV} />
      <Hero title="Интервью." fontFamily="sans" scrollTarget="interviews" badgeLeft="75%" />

      <InterviewsList items={interviews} max={100} showAllButton={false} />

      <Footer />
    </>
  )
}
