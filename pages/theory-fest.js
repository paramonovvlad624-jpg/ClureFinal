import Head from 'next/head'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import styles from '../components/TheoryFest.module.css'

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/interviews', label: 'Интервью' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/meropriyatiya', label: 'Мероприятия' },
  { href: '/about', label: 'О нас' },
]

export default function TheoryFestPage() {
  return (
    <>
      <Head>
        <title>Clure Theory Fest — 1 year anniversary</title>
        <meta name="theme-color" content="#1b40b0" />
        {/* Preload the hero background as an image to improve LCP discovery */}
        <link rel="preload" as="image" href="/images/theory-fest-bg.webp" type="image/webp" />
        <style>{`
          html, body { background: #1b40b0 !important; }
        `}</style>
      </Head>

      <div className={styles.page}>
        <Navigation links={NAV_LINKS} accentColor="rgba(27, 64, 176, 0.75)" />

        <header className={styles.hero}>
          {/* LCP image injected as an actual <img> so browsers prioritize it reliably */}
          <img
            src="/images/theory-fest-bg.webp"
            alt=""
            aria-hidden="true"
            className={styles.heroBgImg}
            width="1920"
            height="1080"
            loading="eager"
            fetchpriority="high"
          />
          <h1 className={styles.title}>Clure Theory Fest</h1>
          <p className={styles.subtitle}>1 year anniversary</p>
          <div className={styles.infoRow}>
            <span>18<br className={styles.mobileBr} /> апреля</span>
            <span>москва<span className={styles.serifComma}>,</span><br className={styles.mobileBr} /> <a href="https://t.me/npo_melody" target="_blank" rel="noopener noreferrer" className={styles.infoLink}>нпо мелодия</a></span>
            <span>18+</span>
          </div>
          <div className={styles.tape}>
            <div data-piece="piece1" className={`${styles.tapePiece} ${styles.piece1} ${styles.vosmoy}`}>
              <a href="https://vk.ru/8osmoy" target="_blank" rel="noopener noreferrer" className={styles.vosmoyLink}>VOSMOY</a>
            </div>
            <div className={`${styles.tapePiece} ${styles.piece2}`}>
              <div className={styles.piece2CopyRow}>
                <div className={styles.piece2Copy}>
                  <a href="https://t.me/blagennim" target="_blank" rel="noopener noreferrer" className={`${styles.papinySlesy} ${styles.papinySlesyLong}`}>
                    жизнь блаженным
                  </a>
                </div>
                <div className={styles.piece2Copy}>
                  <a href="https://t.me/hypnobaza" target="_blank" rel="noopener noreferrer" className={`${styles.papinySlesy} ${styles.papinySlesyLong}`}>
                    Гипнобаза
                  </a>
                </div>
              </div>
            </div>
            <div className={`${styles.tapePiece} ${styles.piece3}`}> 
              <a href="https://t.me/sudeall" target="_blank" rel="noopener noreferrer" className={styles.papinySlesy}>
                SUDEAL
              </a>
            </div>
            <div className={`${styles.tapePiece} ${styles.piece4}`}>
              <a href="https://t.me/papinyslezyiworldwide" target="_blank" rel="noopener noreferrer" className={`${styles.papinySlesy} ${styles.papinySlesyLong}`}>
                папины слёзы
              </a>
            </div>
          </div>
        </header>

        <section style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '50px', alignItems: 'flex-start' }}>
          <div style={{ transform: 'rotate(-3deg)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px' }}>
            <img src="/images/A33319-R1-17-18.JPG" alt="Clure event" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ transform: 'rotate(2deg)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px' }}>
            <img src="/images/A33319-R1-18-19.JPG" alt="Clure event" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={{ transform: 'rotate(-2.5deg)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px' }}>
            <img src="/images/A33319-R1-22-23.JPG" alt="Clure event" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </section>

        <Footer overlayColor="#1b40b0" shadowColor="rgba(27, 64, 176, 0.5)" />
      </div>

      {/* Script: copy height of the top tape image to the /images/3.png copy so they match visually */}
      <script
        dangerouslySetInnerHTML={{ __html: `
          (function(){
            function syncHeight(){
              try{
                var src = document.querySelector('[data-piece="piece1"]');
                var target = document.querySelector('[data-piece="piece3copy"]');
                if (!src || !target) return;
                var h = src.getBoundingClientRect().height;
                target.style.height = Math.round(h) + 'px';
                target.style.width = 'auto';
              }catch(e){/* ignore */}
            }
            if (typeof window !== 'undefined'){
              window.addEventListener('load', function(){ syncHeight(); setTimeout(syncHeight, 300); });
              window.addEventListener('resize', function(){ syncHeight(); });
            }
          })();
        ` }}
      />
    </>
  )
}
