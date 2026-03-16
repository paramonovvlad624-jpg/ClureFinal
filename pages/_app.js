import '../styles/globals.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'
import '@fontsource/geist-sans/900.css'
import dynamic from 'next/dynamic'
const Analytics = dynamic(() => import('@vercel/analytics/next').then((mod) => mod.Analytics || mod), { ssr: false })
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Preload hero and banner images to improve LCP */}
        <link rel="preload" as="image" href="/images/bg.webp" type="image/webp" />
        <link rel="preload" as="image" href="/images/Banner.webp" type="image/webp" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/images/favicon-16/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/images/favicon-16/favicon.svg" />
        <link rel="shortcut icon" href="/images/favicon-16/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon-16/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Clure" />
        <link rel="manifest" href="/images/favicon-16/site.webmanifest" />
        {/* Structured data to help search engines show site sections (replace example.com with your site URL) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Clure",
              "url": "https://clure.ru",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://example.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Clure"
              },
              "mainEntity": [
                {
                  "@type": "SiteNavigationElement",
                  "name": "Home",
                  "url": "https://clure.ru/"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "About",
                  "url": "https://clure.ru/about"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Articles",
                  "url": "https://clure.ru/articles"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Playlists",
                  "url": "https://clure.ru/playlists"
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Theory Fest",
                  "url": "https://clure.ru/theory-fest"
                }
              ]
            })
          }}
        />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
