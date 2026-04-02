import Head from 'next/head'
import Script from 'next/script'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import styles from '../components/TheoryFest.module.css'

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
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

        <div className={styles.ticketSection}>
          <button
            id="buy-ticket-btn"
            type="button"
            className={styles.ticketBtn}
            data-tc-event="69acc131c2a0a8102c515693"
            data-tc-token="eyJhbGciOiJIUzI1NiIsImlzcyI6InRpY2tldHNjbG91ZC5ydSIsInR5cCI6IkpXVCJ9.eyJwIjoiNjlhNzI4NWI4YWQwMTllNzFlODljMjliIn0.7Oreh61Lt5J0lbo4pXAw37BV6uokCjEzuLQNCjcs7ZQ"
          >
            <picture>
              <source srcSet={'/images/Buyticketlong.webp'} type="image/webp" />
              <img src="/images/Buyticketlong.png" alt="Купить билет" className={styles.ticketBtnImg} />
            </picture>
          </button>
        </div>
      </div>

      <Footer overlayColor="#1b40b0" shadowColor="rgba(27, 64, 176, 0.5)" />

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

      {/* Defer loading of the tickets widget until user interaction or idle time to reduce TBT */}
      <script
        dangerouslySetInnerHTML={{ __html: `
          (function(){
            function loadTickets(){
              if (window.__tc_widget_loaded) return;
              window.__tc_widget_loaded = true;
              var s = document.createElement('script');
              s.src = 'https://ticketscloud.com/static/scripts/widget/tcwidget.js';
              s.async = true;
              document.body.appendChild(s);
            }
            // Load on user interaction with buy button
            var btn = document.getElementById('buy-ticket-btn');
            if (btn) {
              btn.addEventListener('mouseenter', loadTickets, { once: true, passive: true });
              btn.addEventListener('focus', loadTickets, { once: true, passive: true });
              btn.addEventListener('touchstart', loadTickets, { once: true, passive: true });
            }
            // Fallback: load during idle after 3s
            if ('requestIdleCallback' in window) {
              requestIdleCallback(loadTickets, { timeout: 3000 });
            } else {
              setTimeout(loadTickets, 3000);
            }
          })();
        ` }}
      />
    </>
  )
}
