import { useEffect } from 'react'
import Head from 'next/head'
import client from '../../lib/sanity'
import { useNavigation } from '../../context/NavigationContext'
import Hero from '../../components/Hero'
import InterviewsList from '../../components/InterviewsList'
import Footer from '../../components/Footer'

const INTERVIEWS_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/meropriyatiya', label: 'Мероприятия' },
  { href: '/about', label: 'О нас' },
]

const queryAllInterviews = `*[_type == "interview"]| order(publishedAt desc){
  _id, title, excerpt, slug, publishedAt, mainImage, guest, interviewer->{name}
}`

export async function getStaticProps() {
  const interviews = await client.fetch(queryAllInterviews)

  return {
    props: { interviews: interviews || [] },
  }
}

export default function InterviewsPage({ interviews = [] }) {
  const { setNavLinks } = useNavigation()

  useEffect(() => {
    setNavLinks(INTERVIEWS_NAV)
  }, [setNavLinks])

  return (
    <>
      <Head>
        <title>Интервью — Clure</title>
      </Head>
      <Hero title="Интервью." fontFamily="sans" scrollTarget="interviews" badgeLeft="75%" />

      <InterviewsList items={interviews} max={100} showAllButton={false} />

      <Footer />
    </>
  )
}
