
import { useOutletContext } from 'react-router-dom'
import FarmLocationMap from '../components/FarmLocationMap'
import './FarmAssessment.css'

function FarmAssessment() {
  const { farmLocation, setFarmLocation } = useOutletContext()

  return (
    <div className="assessment-page">
      <section className="assessment-header">
        <div>
          <span className="assessment-eyebrow">
            FARM INFORMATION
          </span>

          <h1>Farm Assessment</h1>

          <p>
            Identify your farm location to prepare environmental
            information for agricultural analysis.
          </p>
        </div>

        <div className="assessment-step">
          <span>STEP 01</span>
          <strong>Location Selection</strong>
        </div>
      </section>

      <section className="assessment-instructions">
        <div className="assessment-instruction-icon">i</div>

        <div>
          <h3>Why is your farm location important?</h3>
          <p>
            Your selected coordinates help AgroShift request
            location-specific climate observations from NASA POWER.
            Choose a point that represents your farm as accurately
            as possible.
          </p>
        </div>
      </section>

      <FarmLocationMap
        location={farmLocation}
        onLocationChange={setFarmLocation}
      />

      <section className="assessment-next-step">
        <div>
          <span className="assessment-eyebrow">
            NEXT STEP
          </span>

          <h2>Explore your farm's climate conditions</h2>

          <p>
            Continue to Climate Insights to examine temperature,
            rainfall and solar radiation for your selected coordinates.
          </p>
        </div>

        <a href="/climate">
          Continue to Climate Insights →
        </a>
      </section>
    </div>
  )
}

export default FarmAssessment
