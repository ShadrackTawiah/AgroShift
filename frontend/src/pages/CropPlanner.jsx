
import { Link, useOutletContext } from 'react-router-dom'
import CropRotationPlanner from '../components/CropRotationPlanner'
import './CropPlanner.css'

function CropPlanner() {
  const { farmLocation } = useOutletContext()

  return (
    <div className="crop-planner-page">
      <section className="crop-planner-header">
        <div>
          <span className="crop-planner-eyebrow">
            INTELLIGENT AGRICULTURE
          </span>

          <h1>Crop Rotation Planner</h1>

          <p>
            Explore crop rotation options using your previous crop,
            farming priorities, water availability and available
            environmental information.
          </p>
        </div>

        <Link
          to="/farm-assessment"
          className="crop-location-button"
        >
          Update Farm Location →
        </Link>
      </section>

      <section className="crop-location-summary">
        <div>
          <span>ACTIVE FARM COORDINATES</span>
          <strong>
            {farmLocation.latitude.toFixed(4)},{' '}
            {farmLocation.longitude.toFixed(4)}
          </strong>
        </div>

        <span>FARM LOCATION</span>
      </section>

      <CropRotationPlanner
        latitude={farmLocation.latitude}
        longitude={farmLocation.longitude}
      />

<section className="crop-planner-disclaimer">
  <strong>Important information</strong>
  <p>
    Crop recommendations use preliminary rule-based scoring.
    When available, NASA POWER historical temperature and
    rainfall information can make small adjustments to crop
    scores. These observations are not weather forecasts,
    and the adjustment thresholds have not been scientifically
    calibrated for individual crops or locations. Solar
    radiation is collected but is not currently used in scoring.
    Recommendations are not yield predictions or guarantees.
    Confirm soil conditions, planting seasons, pest risks and
    crop suitability with local agricultural experts before
    planting.
  </p>
</section>
    </div>
  )
}

export default CropPlanner
