
import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  {
    number: '01',
    title: 'Climate Intelligence',
    description:
      'Explore rainfall, temperature and solar radiation observations from NASA POWER.',
    link: '/climate',
    action: 'Explore climate data',
  },
  {
    number: '02',
    title: 'Farm Assessment',
    description:
      'Select your farm location and prepare the environmental information for analysis.',
    link: '/farm-assessment',
    action: 'Assess your farm',
  },
  {
    number: '03',
    title: 'Crop Rotation',
    description:
      'Compare crop rotation options based on crop characteristics and farming priorities.',
    link: '/crop-planner',
    action: 'Plan crop rotation',
  },
]

const advertisements = [
  '🌱 Welcome to AgroShift — Smarter tools for better farming decisions.',
  '🌦️ Explore climate observations powered by NASA POWER.',
  '🚜 Assess your farm location and understand its environmental conditions.',
  '🌾 Discover crop rotation options for more informed farming.',
  '📊 Use environmental information to support your agricultural planning.',
]

function Home() {
  return (
    <div className="home-page">

      {/* Continuous Advertisement Banner */}
      <section
        className="home-advert-banner"
        aria-label="AgroShift announcements"
      >
        <div className="home-advert-label">
          <span className="home-advert-live-dot" />
          <span>AGROSHIFT UPDATES</span>
        </div>

        <div className="home-advert-track">
          <div className="home-advert-content">
            {[...advertisements, ...advertisements].map((advert, index) => (
              <span className="home-advert-item" key={index}>
                {advert}
                <span className="home-advert-separator">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            SMART AGRICULTURE • EARTH OBSERVATION
          </span>

          <h1>
            Grow smarter.
            <br />
            <span>Farm for tomorrow.</span>
          </h1>

          <p>
            Make more informed crop rotation decisions by bringing
            together NASA Earth observations, farm location information
            and agricultural knowledge.
          </p>

          <div className="home-hero-actions">
            <Link to="/dashboard" className="home-primary-button">
              Explore Dashboard <span>→</span>
            </Link>

            <Link to="/farm-assessment" className="home-secondary-button">
              Assess Your Farm
            </Link>
          </div>

          <div className="home-hero-note">
            <span className="home-note-dot" />
            Data-informed agricultural decision support
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-image-card">
            <img
              src="/images/agriculture-hero.jpg"
              alt="Green agricultural field"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />

            <div className="home-image-overlay">
              <span>AGRICULTURE MEETS EARTH SCIENCE</span>
              <h2>Better information. Better farming decisions.</h2>
            </div>
          </div>

          <div className="home-floating-card">
            <span className="floating-card-icon">✦</span>
            <div>
              <strong>Earth observation</strong>
              <small>NASA POWER climate data</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-introduction">
        <div>
          <span className="home-section-label">ABOUT AGROSHIFT</span>
          <h2>
            Helping agriculture adapt to a changing climate.
          </h2>
        </div>

        <p>
          Farming decisions are influenced by climate, water availability,
          soil conditions and crop characteristics. AgroShift brings
          relevant information together to help users explore more
          informed crop rotation strategies.
        </p>
      </section>

      <section className="home-features">
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">EXPLORE THE PLATFORM</span>
            <h2>Tools for smarter farming</h2>
          </div>

          <Link to="/dashboard" className="home-text-link">
            Open workspace →
          </Link>
        </div>

        <div className="home-feature-grid">
          {features.map((feature) => (
            <article className="home-feature-card" key={feature.number}>
              <span className="home-feature-number">
                {feature.number}
              </span>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <Link to={feature.link}>
                {feature.action} <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-technology">
        <div>
          <span className="home-section-label">OUR APPROACH</span>
          <h2>Connecting environmental data with agricultural knowledge.</h2>
          <p>
            AgroShift uses NASA POWER environmental datasets alongside
            farmer-provided information and crop characteristics.
            Climate observations provide useful context, but they do
            not replace direct soil testing or local agronomic advice.
          </p>

          <Link to="/climate" className="home-primary-button">
            View Climate Insights <span>→</span>
          </Link>
        </div>

        <div className="home-technology-points">
          <div>
            <span>01</span>
            <p>NASA POWER climate observations</p>
          </div>
          <div>
            <span>02</span>
            <p>Farm location and local information</p>
          </div>
          <div>
            <span>03</span>
            <p>Crop rotation decision support</p>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <span className="home-section-label">START EXPLORING</span>
        <h2>Your next farming decision starts with better information.</h2>
        <p>
          Select your farm location, explore climate observations
          and compare crop rotation options.
        </p>
        <Link to="/farm-assessment" className="home-primary-button">
          Get Started <span>→</span>
        </Link>
      </section>

    </div>
  )
}

export default Home
