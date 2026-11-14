
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

const features = [
  {
    number: '01',
    icon: '',
    title: 'Climate Insights',
    description:
      'Explore rainfall, temperature and solar radiation observations using NASA POWER climate data.',
    details: 'Understand environmental conditions around your farm.',
  },
  {
    number: '02',
    icon: '',
    title: 'Farm Assessment',
    description:
      'Select your farm location and use geographical coordinates to explore relevant environmental information.',
    details: 'Connect your farm location with climate information.',
  },
  {
    number: '03',
    icon: '',
    title: 'Crop Rotation Advisor',
    description:
      'Explore crop rotation recommendations using available climate information and agricultural knowledge.',
    details: 'Make more informed crop planning decisions.',
  },
  {
    number: '04',
    icon: '',
    title: 'Agricultural Reports',
    description:
      'Access information and reports that help you understand your farm assessment and planning.',
    details: 'Keep useful agricultural information together.',
  },
]

function Landing() {
  const videoRef = useRef(null)
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="landing-page">

      {/* NAVIGATION */}
      <header className="landing-header">
        <nav className="landing-nav">
          <Link to="/" className="landing-brand">
            <img src="/images/logo.jpeg" alt="AgroShift logo" />
            <span>
              <strong>AgroShift</strong>
              <small>SMART AGRICULTURE</small>
            </span>
          </Link>

          <div className="landing-nav-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#tutorial">Tutorial</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login">
              Sign In
            </Link>
            <Link to="/register" className="landing-nav-button">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>

        {/* HERO */}
        <section className="landing-hero">
          <div className="landing-hero-background" />

          <div className="landing-hero-content">
            <span className="landing-eyebrow">
              SMART AGRICULTURE · EARTH OBSERVATION
            </span>

            <h1>
              Make smarter
              <span> farming decisions.</span>
            </h1>

            <p>
              Explore climate information, assess your farm location
              and discover crop rotation options with AgroShift —
              agricultural decision support designed to help you
              plan with better information.
            </p>

            <div className="landing-hero-actions">
              <Link to="/register" className="landing-primary-button">
                Create Your Free Account <span>→</span>
              </Link>

              <a href="#about" className="landing-outline-button">
                Discover AgroShift
              </a>
            </div>

            <div className="landing-trust-note">
              <span className="landing-status-dot" />
              Data-informed agricultural decision support
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-hero-card-top">
              <span>AGROSHIFT</span>
              <span className="landing-live-label">● SMART FARMING</span>
            </div>

            <h3>Understand your farm.</h3>
            <p>
              Explore environmental information and plan your next steps.
            </p>

            <div className="landing-hero-card-footer">
              <span>Climate data</span>
              <span>Crop planning</span>
              <span>Farm insights</span>
            </div>
          </div>

          <div className="landing-hero-bottom">
            <span>01 / SMARTER AGRICULTURE</span>
            <span>Explore · Understand · Plan</span>
          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="landing-about" id="about">
          <div className="landing-about-heading">
            <span className="landing-section-label">ABOUT AGROSHIFT</span>
            <h2>
              Bringing agricultural information
              <span> together for better decisions.</span>
            </h2>
          </div>

          <div className="landing-about-copy">
            <p>
              Agriculture is influenced by changing climate conditions,
              geographical location, water availability and crop
              characteristics.
            </p>

            <p>
              AgroShift brings environmental observations and agricultural
              decision-support tools together in one platform. It helps
              users explore climate conditions, assess farm locations
              and compare crop rotation options.
            </p>

            <Link to="/register" className="landing-text-link">
              Start exploring AgroShift →
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <div>
              <span className="landing-section-label">
                WHAT AGROSHIFT OFFERS
              </span>
              <h2>Tools designed for smarter farming.</h2>
              <p>
                Explore the capabilities that bring farm information
                and agricultural planning together.
              </p>
            </div>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article className="landing-feature-card" key={feature.number}>
                <div className="landing-feature-top">
                  <span className="landing-feature-icon">
                    {feature.icon}
                  </span>

                  <span className="landing-feature-number">
                    {feature.number}
                  </span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <span className="landing-feature-detail">
                  {feature.details}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* VIDEO TUTORIAL */}
        <section className="landing-tutorial" id="tutorial">
          <div className="landing-tutorial-heading">
            <span className="landing-section-label">
              YOUR GUIDE TO AGROSHIFT
            </span>

            <h2>
              See how AgroShift
              <span> works.</span>
            </h2>

            <p>
              Watch the step-by-step demonstration to learn how to
              navigate the platform, explore climate insights,
              assess your farm and use the crop rotation advisor.
            </p>
          </div>

          <div className="landing-video-wrapper">
            {!videoError ? (
              <video
                ref={videoRef}
                className="landing-video"
                src="/videos/landing%20video.mp4"
                controls
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
              >
                Your browser does not support HTML video.
              </video>
            ) : (
              <div className="landing-video-error">
                <h3>Video unavailable</h3>
                <p>
                  Please check the tutorial video file in the
                  AgroShift website.
                </p>
              </div>
            )}
          </div>

          <p className="landing-video-caption">
            AgroShift platform walkthrough · Step-by-step tutorial
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="landing-how" id="how-it-works">
          <div className="landing-how-heading">
            <span className="landing-section-label">GETTING STARTED</span>
            <h2>Start using AgroShift in four steps.</h2>
            <p>
              Your journey from account creation to informed farm planning.
            </p>
          </div>

          <div className="landing-steps">
            <article>
              <span>01</span>
              <h3>Create an account</h3>
              <p>
                Register for an AgroShift account to access the platform.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Set up your farm</h3>
              <p>
                Select your farm location and provide the required
                geographical information.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Explore climate insights</h3>
              <p>
                Review available environmental observations for
                your selected location.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Plan crop rotation</h3>
              <p>
                Explore available crop rotation recommendations
                to support your planning.
              </p>
            </article>
          </div>
        </section>

        {/* TECHNOLOGY */}
        <section className="landing-technology">
          <div>
            <span className="landing-section-label">
              THE TECHNOLOGY
            </span>

            <h2>
              Environmental data meets
              <span> agricultural knowledge.</span>
            </h2>

            <p>
              AgroShift uses NASA POWER environmental datasets and
              farm location information to provide climate context
              for agricultural planning.
            </p>

            <p>
              Climate observations are useful decision-support
              information. They do not replace soil testing,
              field observations or professional agronomic advice.
            </p>
          </div>

          <div className="landing-technology-list">
            <div>
              <span>01</span>
              <strong>NASA POWER</strong>
              <small>Environmental observations</small>
            </div>

            <div>
              <span>02</span>
              <strong>Farm coordinates</strong>
              <small>Location-based information</small>
            </div>

            <div>
              <span>03</span>
              <strong>Crop rotation</strong>
              <small>Agricultural decision support</small>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="landing-final-cta">
          <span className="landing-section-label">
            YOUR FARMING JOURNEY STARTS HERE
          </span>

          <h2>
            Better information.
            <span> Smarter farming decisions.</span>
          </h2>

          <p>
            Create your AgroShift account and start exploring
            agricultural decision-support tools.
          </p>

          <Link to="/register" className="landing-primary-button">
            Create Your Account <span>→</span>
          </Link>

          <small>
            Already have an account? <Link to="/login">Sign in</Link>
          </small>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <img src="/images/logo.jpeg" alt="AgroShift logo" />
          <span>
            <strong>AgroShift</strong>
            <small>SMART AGRICULTURE</small>
          </span>
        </Link>

        <p>
          Earth Data. Smarter Agriculture. Stronger Farms.
        </p>

        <div className="landing-footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <a href="#about">About</a>
        </div>

        <span className="landing-copyright">
          © {new Date().getFullYear()} AgroShift. All rights reserved.
        </span>

        <p className="landing-developer-credit">
          Designed &amp; Developed by{' '}
          <a
            href="https://skofieldjunior.live"
            target="_blank"
            rel="noopener noreferrer"
          >
            SkofieldJunior
          </a>
        </p>
      </footer>

    </div>
  )
}

export default Landing
