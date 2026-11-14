
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import './Reports.css'

function Reports() {
  const { user } = useAuth()

  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadReports() {
      if (!user?.id) {
        setReports([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('farm_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return

      if (fetchError) {
        setError(fetchError.message)
        setReports([])
      } else {
        setReports(data || [])
      }

      setLoading(false)
    }

    loadReports()

    return () => {
      active = false
    }
  }, [user?.id])

  function formatDate(date) {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatLabel(value) {
    if (!value) return 'Not available'

    return value
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  const climate = selectedReport?.climate_summary

  return (
    <div className="reports-page">
      <section className="reports-header">
        <div>
          <span className="reports-eyebrow">FARM RECORDS</span>
          <h1>Reports & Summaries</h1>
          <p>
            Review your saved farm assessments, climate summaries
            and crop rotation recommendations.
          </p>
        </div>

        <Link to="/crop-planner" className="report-new-button">
          New Assessment →
        </Link>
      </section>

      <section className="reports-summary-grid">
        <article className="reports-summary-card">
          <span>Total Assessments</span>
          <strong>{reports.length}</strong>
          <small>Saved farm assessments</small>
        </article>

        <article className="reports-summary-card">
          <span>Latest Assessment</span>
          <strong>
            {reports.length
              ? new Date(reports[0].created_at).toLocaleDateString('en-GB')
              : '—'}
          </strong>
          <small>Most recent saved record</small>
        </article>

        <article className="reports-summary-card">
          <span>Crop Recommendations</span>
          <strong>
            {reports.reduce(
              (total, report) =>
                total + (report.crop_recommendations?.length || 0),
              0
            )}
          </strong>
          <small>Across saved assessments</small>
        </article>
      </section>

      {loading && (
        <div className="reports-state">
          <p>Loading your assessment history...</p>
        </div>
      )}

      {error && (
        <div className="reports-state reports-error">
          <h3>Unable to load reports</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="reports-empty">
          <span className="reports-empty-icon">▤</span>
          <h2>No saved assessments yet</h2>
          <p>
            Complete a crop rotation assessment to create your
            first farm report. Your saved results will appear here.
          </p>
          <Link to="/crop-planner" className="report-new-button">
            Start Your First Assessment →
          </Link>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <section className="reports-history">
          <div className="reports-section-heading">
            <div>
              <span>ASSESSMENT HISTORY</span>
              <h2>Your saved farm reports</h2>
            </div>
            <span>{reports.length} RECORDS</span>
          </div>

          <div className="reports-history-list">
            {reports.map((report) => (
              <article className="report-history-card" key={report.id}>
                <div className="report-history-date">
                  <span>ASSESSMENT DATE</span>
                  <strong>{formatDate(report.created_at)}</strong>
                </div>

                <div className="report-history-location">
                  <span>FARM COORDINATES</span>
                  <strong>
                    {Number(report.latitude).toFixed(4)},{' '}
                    {Number(report.longitude).toFixed(4)}
                  </strong>
                </div>

                <div className="report-history-crop">
                  <span>PREVIOUS CROP</span>
                  <strong>{formatLabel(report.previous_crop)}</strong>
                </div>

                <div className="report-history-count">
                  <span>RECOMMENDATIONS</span>
                  <strong>
                    {report.crop_recommendations?.length || 0} crops
                  </strong>
                </div>

                <button
                  type="button"
                  className="report-view-button"
                  onClick={() => setSelectedReport(report)}
                >
                  View Report →
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <section
            className="report-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="report-detail-header">
              <div>
                <span>FARM ASSESSMENT REPORT</span>
                <h2 id="report-detail-title">Assessment Details</h2>
                <p>{formatDate(selectedReport.created_at)}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
                className="report-close-button"
              >
                ×
              </button>
            </div>

            <div className="report-detail-section">
              <h3>Farm Information</h3>

              <p>
                Latitude: {Number(selectedReport.latitude).toFixed(4)}°
              </p>

              <p>
                Longitude: {Number(selectedReport.longitude).toFixed(4)}°
              </p>

              <p>
                Previous crop: {formatLabel(selectedReport.previous_crop)}
              </p>

              <p>
                Farming priority: {formatLabel(selectedReport.priority)}
              </p>

              <p>
                Water availability:{' '}
                {formatLabel(selectedReport.water_availability)}
              </p>
            </div>

            <div className="report-detail-section">
              <h3>Climate Summary</h3>

              {climate ? (
                <>
                  <p>Source: {climate.source || 'Not available'}</p>
                  <p>
                    Average temperature:{' '}
                    {climate.average_temperature != null
                      ? `${climate.average_temperature.toFixed(2)} °C`
                      : 'Not available'}
                  </p>
                  <p>
                    Total rainfall:{' '}
                    {climate.total_rainfall != null
                      ? `${climate.total_rainfall.toFixed(2)} mm`
                      : 'Not available'}
                  </p>
                  <p>
                    Average solar radiation:{' '}
                    {climate.average_solar_radiation != null
                      ? `${climate.average_solar_radiation.toFixed(2)} MJ/m²/day`
                      : 'Not available'}
                  </p>
                  <p>
                    Climate period:{' '}
                    {climate.period?.start || 'Not available'} to{' '}
                    {climate.period?.end || 'Not available'}
                  </p>
                </>
              ) : (
                <p>Climate information was unavailable for this assessment.</p>
              )}
            </div>

            <div className="report-detail-section">
              <h3>Crop Recommendations</h3>

              {(selectedReport.crop_recommendations || []).map(
                (crop, index) => (
                  <article className="report-detail-crop" key={crop.crop_id || index}>
                    <div>
                      <span>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h4>{crop.crop_name}</h4>
                      <p>{crop.crop_details?.type || 'Crop'}</p>
                    </div>

                    <strong>{crop.score} points</strong>

                    <ul>
                      {(crop.reasons || []).map((reason, reasonIndex) => (
                        <li key={reasonIndex}>{reason}</li>
                      ))}
                    </ul>

                    {typeof crop.climate_adjustment === 'number' && (
                      <p>
                        Climate adjustment: {crop.climate_adjustment > 0 ? '+' : ''}
                        {crop.climate_adjustment}
                      </p>
                    )}
                  </article>
                )
              )}
            </div>

            {selectedReport.assessment_notice && (
              <div className="report-detail-notice">
                <strong>Important information</strong>
                <p>{selectedReport.assessment_notice}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Reports
