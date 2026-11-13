
import { Link, useOutletContext } from 'react-router-dom'
import ClimateDashboard from '../components/ClimateDashboard'
import './ClimateInsights.css'

function ClimateInsights() {
  const { farmLocation } = useOutletContext()

  return (
    <div className="climate-insights-page">
      <section className="climate-insights-header">
        <div>
          <span className="climate-insights-eyebrow">
            ENVIRONMENTAL INTELLIGENCE
          </span>

          <h1>Climate Insights</h1>

          <p>
            Examine historical environmental observations for your
            selected farm location using NASA POWER data.
          </p>
        </div>

        <Link to="/farm-assessment" className="climate-location-button">
          Change Farm Location →
        </Link>
      </section>

      <section className="climate-location-summary">
        <div className="climate-location-symbol">◎</div>

        <div>
          <span>ACTIVE FARM COORDINATES</span>
          <strong>
            {farmLocation.latitude}, {farmLocation.longitude}
          </strong>
        </div>

        <span className="climate-data-source">
          NASA POWER
        </span>
      </section>

      <section className="climate-data-information">
        <div className="climate-info-symbol">i</div>

        <p>
          Climate information is based on gridded NASA POWER
          environmental observations and estimates. It does not
          represent direct measurements from a weather station
          installed on your farm.
        </p>
      </section>

      <ClimateDashboard
        latitude={farmLocation.latitude}
        longitude={farmLocation.longitude}
      />
    </div>
  )
}

export default ClimateInsights

