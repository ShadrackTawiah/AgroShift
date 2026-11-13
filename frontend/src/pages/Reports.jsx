
import { Link, useOutletContext } from 'react-router-dom'
import './Reports.css'

function Reports() {
  const { farmLocation } = useOutletContext()

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">FARM RECORDS</span>
          <h1>Reports & Summaries</h1>
          <p>
            Review your current farm location and access the tools
            needed to assess your farm and plan crop rotations.
          </p>
        </div>
      </div>

      <section className="report-overview-card">
        <div className="report-overview-top">
          <div>
            <span className="report-label">CURRENT FARM LOCATION</span>
            <h2>Farm Location Summary</h2>
          </div>
          <span className="report-status">Current session</span>
        </div>

        <div className="report-coordinates">
          <div className="report-coordinate-item">
            <span>Latitude</span>
            <strong>{farmLocation.latitude.toFixed(4)}°</strong>
          </div>

          <div className="report-coordinate-item">
            <span>Longitude</span>
            <strong>{farmLocation.longitude.toFixed(4)}°</strong>
          </div>
        </div>

        <p className="report-note">
          These coordinates represent the farm location currently selected
          in this application. They remain available while you navigate
          between pages during the current app session.
        </p>
      </section>

      <section className="reports-section">
        <div className="reports-section-heading">
          <span>AVAILABLE TOOLS</span>
          <h2>Continue Your Farm Assessment</h2>
          <p>Open a tool to explore your farm information and planning options.</p>
        </div>

        <div className="report-tools-grid">
          <Link to="/farm-assessment" className="report-tool-card">
            <span className="report-tool-icon">⌖</span>
            <h3>Farm Assessment</h3>
            <p>Select or update your farm location using the interactive map.</p>
            <span className="report-tool-link">Open assessment →</span>
          </Link>

          <Link to="/climate" className="report-tool-card">
            <span className="report-tool-icon">☀</span>
            <h3>Climate Insights</h3>
            <p>Explore NASA POWER climate information for your selected coordinates.</p>
            <span className="report-tool-link">View climate data →</span>
          </Link>

          <Link to="/crop-planner" className="report-tool-card">
            <span className="report-tool-icon">♧</span>
            <h3>Crop Rotation Planner</h3>
            <p>Generate crop rotation suggestions using the available planning inputs.</p>
            <span className="report-tool-link">Plan crop rotation →</span>
          </Link>

          <Link to="/dashboard" className="report-tool-card">
            <span className="report-tool-icon">▦</span>
            <h3>Farm Dashboard</h3>
            <p>Return to your main dashboard and access the application tools.</p>
            <span className="report-tool-link">Open dashboard →</span>
          </Link>
        </div>
      </section>

      <section className="reports-development-note">
        <h3>Report history is not connected yet</h3>
        <p>
          AgroShift does not currently save assessment history or generate
          downloadable PDF reports. This page displays your current session
          information only. Database storage and report generation can be
          added in a later development stage.
        </p>
      </section>
    </div>
  )
}

export default Reports
