
import { useState } from 'react'
import './CropRotationPlanner.css'

const API_URL = 'http://127.0.0.1:8000'

function getClimateDateRange() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${date.getFullYear()}-${month}-${day}`
  }

  return {
    start: `${today.getFullYear()}-01-01`,
    end: formatDate(yesterday),
  }
}

function CropRotationPlanner({ latitude, longitude }) {
  const [previousCrop, setPreviousCrop] = useState('maize')
  const [priority, setPriority] = useState('soil_improvement')
  const [waterAvailability, setWaterAvailability] = useState('medium')
  const [recommendations, setRecommendations] = useState([])
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [climateMessage, setClimateMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setRecommendations([])
    setNotice('')
    setClimateMessage('Retrieving NASA climate information...')

    try {
      let climateSummary = null
      const dateRange = getClimateDateRange()

      const climateParams = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        start_date: dateRange.start,
        end_date: dateRange.end,
      })

      // Retrieve NASA POWER climate data.
      try {
        const climateResponse = await fetch(
          `${API_URL}/api/climate/point?${climateParams.toString()}`
        )

        if (climateResponse.ok) {
          const climateData = await climateResponse.json()
          const data = climateData.data

          const validValues = (parameter) =>
            Object.values(parameter || {}).filter(
              (value) =>
                typeof value === 'number' &&
                Number.isFinite(value) &&
                value !== -999
            )

          const temperatures = validValues(data?.T2M)
          const rainfall = validValues(data?.PRECTOTCORR)
          const solarRadiation = validValues(
            data?.ALLSKY_SFC_SW_DWN
          )

          const average = (values) =>
            values.length
              ? values.reduce((sum, value) => sum + value, 0) /
                values.length
              : null

          climateSummary = {
            source: 'NASA POWER',
            period: climateData.period,
            coordinates: climateData.coordinates,
            average_temperature: average(temperatures),
            total_rainfall: rainfall.length
              ? rainfall.reduce((sum, value) => sum + value, 0)
              : null,
            average_solar_radiation: average(solarRadiation),
            temperature_observations: temperatures.length,
            rainfall_observations: rainfall.length,
            solar_observations: solarRadiation.length,
          }

          setClimateMessage(
            'NASA POWER climate information retrieved successfully.'
          )
        } else {
          setClimateMessage(
            'NASA climate data is unavailable. Continuing without it.'
          )
        }
      } catch {
        setClimateMessage(
          'NASA climate data could not be reached. Continuing without it.'
        )
      }

      // Send farm and climate information to the crop rotation API.
      const response = await fetch(
        `${API_URL}/api/crop-rotation/recommend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            previous_crop: previousCrop,
            priority,
            water_availability: waterAvailability,
            latitude,
            longitude,
            climate_summary: climateSummary,
            number_of_recommendations: 5,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail || 'Could not generate recommendations.'
        )
      }

      setRecommendations(result.result.recommendations || [])
      setNotice(result.result.notice || '')

      if (!climateSummary) {
        setClimateMessage(
          'Recommendations generated without NASA climate information.'
        )
      }
    } catch (err) {
      setError(
        err.message || 'Unable to connect to the AgroShift server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rotation-planner" id="crop-planner">
      <div className="planner-form-note">
        Farm coordinates: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
      </div>

      <div className="planner-heading">
        <span className="section-label">SMART FARMING TOOL</span>

        <h2>Smart Crop Rotation Planner</h2>

        <p>
          Explore suitable next crops based on your previous
          planting, farming priorities and water availability.
        </p>
      </div>

      <div className="planner-layout">
        <form className="planner-form" onSubmit={handleSubmit}>
          <div className="planner-form-heading">
            <span className="form-step">01</span>

            <div>
              <h3>Farm information</h3>
              <p>Tell us about your current farming conditions.</p>
            </div>
          </div>

          <div className="planner-field">
            <label htmlFor="previousCrop">
              What did you plant previously?
            </label>

            <select
              id="previousCrop"
              value={previousCrop}
              onChange={(event) => setPreviousCrop(event.target.value)}
            >
              <option value="maize">Maize</option>
              <option value="cowpea">Cowpea</option>
              <option value="groundnut">Groundnut</option>
              <option value="soybean">Soybean</option>
              <option value="cassava">Cassava</option>
              <option value="sorghum">Sorghum</option>
              <option value="tomato">Tomato</option>
              <option value="pepper">Pepper</option>
              <option value="okra">Okra</option>
            </select>
          </div>

          <div className="planner-field">
            <label htmlFor="priority">
              What is your main farming priority?
            </label>

            <select
              id="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="soil_improvement">Improve soil health</option>
              <option value="water_conservation">Conserve water</option>
              <option value="drought_resilience">
                Improve drought resilience
              </option>
              <option value="balanced">Balanced farming approach</option>
            </select>
          </div>

          <div className="planner-field">
            <label htmlFor="waterAvailability">
              How much water is available?
            </label>

            <select
              id="waterAvailability"
              value={waterAvailability}
              onChange={(event) => setWaterAvailability(event.target.value)}
            >
              <option value="low">Low availability</option>
              <option value="medium">Moderate availability</option>
              <option value="high">High availability</option>
            </select>
          </div>

          <button
            type="submit"
            className="planner-submit"
            disabled={loading}
          >
            {loading
              ? 'Analysing your farm...'
              : 'Generate Recommendations'}
            <span>→</span>
          </button>

          <p className="planner-form-note">
            AgroShift retrieves NASA POWER climate information and
            includes the climate summary in your recommendation request.
          </p>
        </form>

        <div className="planner-results">
          <div className="results-heading">
            <div>
              <span className="section-label">ANALYSIS RESULTS</span>
              <h3>Recommended next crops</h3>
            </div>

            <span className="results-icon">✓</span>
          </div>

          {climateMessage && (
            <p className="planner-form-note">{climateMessage}</p>
          )}

          {loading && (
            <div className="planner-empty">
              <div className="planner-loader"></div>
              <h4>Analysing your farming conditions</h4>
              <p>Please wait while AgroShift processes your request.</p>
            </div>
          )}

          {!loading && error && (
            <div className="planner-error">
              <strong>Unable to generate recommendations</strong>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && recommendations.length === 0 && (
            <div className="planner-empty">
              <span className="empty-icon">🌱</span>
              <h4>Your recommendations will appear here</h4>
              <p>
                Complete the farm information and click
                Generate Recommendations.
              </p>
            </div>
          )}

          {!loading && recommendations.length > 0 && (
            <div className="recommendation-list">
              {recommendations.map((crop, index) => (
                <article
                  className="recommendation-card"
                  key={crop.crop_id}
                >
                  <div className="recommendation-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="recommendation-info">
                    <h4>{crop.crop_name}</h4>

                    <span>
                      {crop.crop_details?.type || 'Crop'}
                    </span>

                    <ul>
                      {crop.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex}>{reason}</li>
                      ))}
                    </ul>
                  </div>

<div className="recommendation-score">
  <strong>{crop.score}</strong>
  <span>Total Points</span>

  {typeof crop.climate_adjustment === 'number' && (
    <span
      className={`climate-adjustment ${
        crop.climate_adjustment > 0
          ? 'positive'
          : crop.climate_adjustment < 0
            ? 'negative'
            : 'neutral'
      }`}
    >
      Climate: {crop.climate_adjustment > 0 ? '+' : ''}
      {crop.climate_adjustment}
    </span>
  )}
</div>
                </article>
              ))}
            </div>
          )}

          {notice && !loading && recommendations.length > 0 && (
            <div className="planner-notice">
              <strong>Important:</strong> {notice}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CropRotationPlanner
