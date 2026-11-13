
import { Link, useOutletContext } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const { farmLocation } = useOutletContext()

  const tools = [
    {
      number: '01',
      title: 'Farm Assessment',
      description: 'Select and review your farm location.',
      path: '/farm-assessment',
      icon: '⌖',
    },
    {
      number: '02',
      title: 'Climate Insights',
      description: 'Explore NASA POWER climate observations.',
      path: '/climate',
      icon: '☼',
    },
    {
      number: '03',
      title: 'Crop Rotation Planner',
      description: 'Generate crop rotation recommendations.',
      path: '/crop-planner',
      icon: '♧',
    },
    {
      number: '04',
      title: 'Reports',
      description: 'Review your current farm assessment summary.',
      path: '/reports',
      icon: '▤',
    },
  ]

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">YOUR AGRICULTURE WORKSPACE</span>
          <h1>Farm Dashboard</h1>
          <p>
            Welcome to your AgroShift workspace. Access your farm
            information, climate observations and crop planning tools.
          </p>
        </div>

        <Link to="/farm-assessment" className="dashboard-main-button">
          Assess Farm <span>→</span>
        </Link>
      </section>

      <section className="dashboard-location">
        <div className="dashboard-location-icon">⌖</div>

        <div className="dashboard-location-info">
          <span>ACTIVE FARM LOCATION</span>
          <h2>Selected Coordinates</h2>
          <p>
            Your current farm location is used when requesting
            location-based climate observations.
          </p>
        </div>

        <div className="dashboard-coordinates">
          <div>
            <span>LATITUDE</span>
            <strong>{farmLocation.latitude}</strong>
          </div>
          <div>
            <span>LONGITUDE</span>
            <strong>{farmLocation.longitude}</strong>
          </div>
        </div>

        <Link to="/farm-assessment" className="dashboard-edit-location">
          Change Location
        </Link>
      </section>

      <section className="dashboard-tools">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-eyebrow">PLATFORM TOOLS</span>
            <h2>Explore your workspace</h2>
          </div>
          <span className="dashboard-tool-count">4 TOOLS</span>
        </div>

        <div className="dashboard-tool-grid">
          {tools.map((tool) => (
            <Link
              to={tool.path}
              className="dashboard-tool-card"
              key={tool.number}
            >
              <div className="dashboard-tool-top">
                <span className="dashboard-tool-icon">{tool.icon}</span>
                <span className="dashboard-tool-number">{tool.number}</span>
              </div>

              <h3>{tool.title}</h3>
              <p>{tool.description}</p>

              <span className="dashboard-tool-action">
                Open tool <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-information">
        <div>
          <span className="dashboard-eyebrow">IMPORTANT INFORMATION</span>
          <h2>Understand your agricultural data</h2>
          <p>
            NASA POWER provides gridded environmental observations
            and estimates. These values are not direct measurements
            from your farm. Soil information and other farm-specific
            details must be supplied or verified separately.
          </p>
        </div>

        <Link to="/climate" className="dashboard-information-link">
          Explore climate data →
        </Link>
      </section>
    </div>
  )
}

export default Dashboard
