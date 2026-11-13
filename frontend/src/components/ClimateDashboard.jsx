
import { useEffect, useState, useCallback } from "react";
import "./ClimateDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";

// Automatically calculate the current year's date range.
function getCurrentYearDateRange() {
  const today = new Date();
  const year = today.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // On January 1, use January 1 as the end date.
  const endDate =
    yesterday.getFullYear() === year ? yesterday : today;

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  };

  return {
    start: `${year}-01-01`,
    end: formatDate(endDate),
  };
}

function ClimateDashboard({ latitude, longitude }) {
  const [climate, setClimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Automatically initialize dates using the current calendar year.
  const [initialDateRange] = useState(getCurrentYearDateRange);

  const [startDate, setStartDate] = useState(initialDateRange.start);
  const [endDate, setEndDate] = useState(initialDateRange.end);

  const [appliedStartDate, setAppliedStartDate] = useState(
    initialDateRange.start
  );

  const [appliedEndDate, setAppliedEndDate] = useState(
    initialDateRange.end
  );

  const [dateError, setDateError] = useState("");

  const loadClimateData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        start_date: appliedStartDate,
        end_date: appliedEndDate,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/climate/point?${params.toString()}`
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.detail || `Server error: ${response.status}`
        );
      }

      const result = await response.json();
      setClimate(result);
    } catch (err) {
      setError(err.message || "Unable to load climate data.");
      setClimate(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    loadClimateData();
  }, [loadClimateData]);

  function applyDateRange(event) {
    event.preventDefault();
    setDateError("");

    if (!startDate || !endDate) {
      setDateError(
        "Please select both a start date and an end date."
      );
      return;
    }

    if (endDate < startDate) {
      setDateError(
        "End date cannot be earlier than start date."
      );
      return;
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  }

  if (loading) {
    return (
      <section className="climate-dashboard">
        <p>
          Loading NASA climate observations for your selected farm...
        </p>
        <p>
          Coordinates: {latitude}, {longitude}
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="climate-dashboard">
        <h2>Unable to load climate data</h2>
        <p>{error}</p>
        <p>
          Selected coordinates: {latitude}, {longitude}
        </p>

        <button
          className="refresh-button"
          onClick={loadClimateData}
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!climate?.data?.T2M) {
    return (
      <section className="climate-dashboard">
        <h2>No climate data available</h2>
        <p>NASA POWER returned an unexpected response.</p>
      </section>
    );
  }

  const data = climate.data;

  const observations = Object.keys(data.T2M)
    .map((date) => ({
      date,
      temperature: data.T2M[date],
      maximum: data.T2M_MAX?.[date],
      minimum: data.T2M_MIN?.[date],
      rainfall: data.PRECTOTCORR?.[date],
      solar: data.ALLSKY_SFC_SW_DWN?.[date],
    }))
    .filter((item) =>
      [
        item.temperature,
        item.maximum,
        item.minimum,
        item.rainfall,
        item.solar,
      ].every(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value) &&
          value !== -999
      )
    );

  if (observations.length === 0) {
    return (
      <section className="climate-dashboard">
        <h2>No valid observations available</h2>
        <p>
          NASA POWER did not return usable values for this period.
        </p>
      </section>
    );
  }

  const averageTemperature =
    observations.reduce(
      (sum, item) => sum + item.temperature,
      0
    ) / observations.length;

  const totalRainfall = observations.reduce(
    (sum, item) => sum + item.rainfall,
    0
  );

  const averageSolar =
    observations.reduce(
      (sum, item) => sum + item.solar,
      0
    ) / observations.length;

  const maxRainfall = Math.max(
    ...observations.map((item) => item.rainfall),
    1
  );

  function formatDate(date) {
    return `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`;
  }

  return (
    <section
      className="climate-dashboard"
      id="climate-dashboard"
    >
      <div className="climate-header">
        <div>
          <span className="section-label">
            NASA EARTH OBSERVATIONS
          </span>

          <h2>Climate Dashboard</h2>

          <p>
            Environmental observations for your selected farm location.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadClimateData}
        >
          ↻ Refresh Data
        </button>
      </div>

      {/* Date range selection */}
      <form
        className="climate-date-form"
        onSubmit={applyDateRange}
      >
        <div className="climate-date-heading">
          <div>
            <h3>Select Climate Data Period</h3>
            <p>
              Choose the period you want to examine.
            </p>
          </div>
        </div>

        <div className="climate-date-controls">
          <label>
            <span>Start Date</span>

            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
          </label>

          <label>
            <span>End Date</span>

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </label>

          <button
            type="submit"
            className="apply-date-button"
            disabled={loading}
          >
            Apply Dates
          </button>
        </div>

        {dateError && (
          <p className="climate-date-error">
            {dateError}
          </p>
        )}

        <p className="climate-date-note">
          Displayed period: {appliedStartDate} to {appliedEndDate}
        </p>
      </form>

      <div className="climate-meta">
        <span>🛰️ Source: {climate.source}</span>

        <span>
          Latitude: {climate.coordinates?.latitude ?? latitude}
        </span>

        <span>
          Longitude: {climate.coordinates?.longitude ?? longitude}
        </span>

        <span>
          Period: {climate.period.start} to {climate.period.end}
        </span>
      </div>

      <div className="climate-stat-grid">
        <article className="climate-stat-card">
          <span></span>
          <p>Average Temperature</p>
          <h3>{averageTemperature.toFixed(2)}°C</h3>
          <small>Daily average</small>
        </article>

        <article className="climate-stat-card">
          <span></span>
          <p>Total Rainfall</p>
          <h3>{totalRainfall.toFixed(2)} mm</h3>
          <small>Across the selected period</small>
        </article>

        <article className="climate-stat-card">
          <span></span>
          <p>Average Solar Radiation</p>
          <h3>{averageSolar.toFixed(2)}</h3>
          <small>MJ/m²/day</small>
        </article>

        <article className="climate-stat-card">
          <span></span>
          <p>Observations</p>
          <h3>{observations.length}</h3>
          <small>Valid daily records</small>
        </article>
      </div>

      <div className="climate-chart-grid">
        <article className="climate-chart-card">
          <h3>Daily Temperature</h3>
          <p>Average temperature in °C</p>

          <div className="climate-bars">
            {observations.map((item) => (
              <div
                className="climate-bar-item"
                key={item.date}
              >
                <span>{item.temperature.toFixed(1)}°</span>

                <div className="climate-bar-track">
                  <div
                    className="temperature-bar"
                    style={{
                      height: `${Math.max(
                        5,
                        (item.temperature / 40) * 100
                      )}%`,
                    }}
                  />
                </div>

                <small>{formatDate(item.date)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="climate-chart-card">
          <h3>Daily Rainfall</h3>
          <p>Corrected precipitation in mm/day</p>

          <div className="climate-bars">
            {observations.map((item) => (
              <div
                className="climate-bar-item"
                key={item.date}
              >
                <span>{item.rainfall.toFixed(1)}</span>

                <div className="climate-bar-track">
                  <div
                    className="rainfall-bar"
                    style={{
                      height: `${Math.max(
                        3,
                        (item.rainfall / maxRainfall) * 100
                      )}%`,
                    }}
                  />
                </div>

                <small>{formatDate(item.date)}</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="climate-table-card">
        <h3>Daily Climate Records</h3>

        <div className="climate-table-scroll">
          <table className="climate-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Average °C</th>
                <th>Maximum °C</th>
                <th>Minimum °C</th>
                <th>Rainfall mm</th>
                <th>Solar MJ/m²/day</th>
              </tr>
            </thead>

            <tbody>
              {observations.map((item) => (
                <tr key={item.date}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.temperature.toFixed(2)}</td>
                  <td>{item.maximum.toFixed(2)}</td>
                  <td>{item.minimum.toFixed(2)}</td>
                  <td>{item.rainfall.toFixed(2)}</td>
                  <td>{item.solar.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="climate-disclaimer">
        Source: NASA POWER. These are gridded environmental observations
        and estimates, not direct measurements from a farm-installed
        weather station. Results represent the selected coordinates
        and requested data period.
      </p>
    </section>
  );
}

export default ClimateDashboard;
