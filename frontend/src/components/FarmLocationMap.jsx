
import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./FarmLocationMap.css";

// Fix Leaflet marker icons in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Automatically move the map when coordinates change
function MapViewUpdater({ location }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(
      [location.latitude, location.longitude],
      12,
      { duration: 1.5 }
    );
  }, [location, map]);

  return null;
}

// Allow users to select a location by clicking the map
function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function FarmLocationMap({ location, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Search for places using Photon
  async function searchLocation(event) {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setSearchError("Please enter a location to search.");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setSearchResults([]);

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Location search is temporarily unavailable.");
      }

      const result = await response.json();

      if (!result.features || result.features.length === 0) {
        setSearchError("No matching locations found. Try another search.");
        return;
      }

      setSearchResults(result.features);

    } catch (error) {
      setSearchError(error.message);
    } finally {
      setSearching(false);
    }
  }

  // Select a search result and update the map
  function selectLocation(place) {
    const [longitude, latitude] = place.geometry.coordinates;

    onLocationChange({
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    });

    const properties = place.properties;

    const placeName = [
      properties.name,
      properties.city,
      properties.state,
      properties.country,
    ]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .join(", ");

    setSearchQuery(placeName);
    setSearchResults([]);
    setSearchError("");
  }

  return (
    <section className="farm-location-section">

      <div className="farm-location-heading">
        <span className="section-label">FARM LOCATION</span>

        <h2>Find and select your farm</h2>

        <p>
          Search for your farm location or click directly
          on the map to select it.
        </p>
      </div>

      {/* Location Search */}
      <form
        className="farm-search-form"
        onSubmit={searchLocation}
      >
        <div className="farm-search-input-wrapper">
          <span className="farm-search-icon">📍</span>

          <input
            type="text"
            placeholder="Search town, village, region or country..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchResults([]);
              setSearchError("");
            }}
          />

          <button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="farm-search-results">
          {searchResults.map((place, index) => {
            const properties = place.properties;

            const placeName = [
              properties.name,
              properties.city,
              properties.state,
              properties.country,
            ]
              .filter(Boolean)
              .filter(
                (value, i, array) => array.indexOf(value) === i
              )
              .join(", ");

            return (
              <button
                type="button"
                key={`${placeName}-${index}`}
                className="farm-search-result"
                onClick={() => selectLocation(place)}
              >
                <span>📍</span>

                <span>
                  <strong>
                    {properties.name || properties.city || "Unnamed location"}
                  </strong>

                  <small>{placeName}</small>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {searchError && (
        <p className="farm-search-error">
          {searchError}
        </p>
      )}

      {/* Interactive Map */}
      <div className="farm-map-container">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={7}
          scrollWheelZoom={true}
          className="farm-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewUpdater location={location} />

          <LocationSelector
            onLocationSelect={onLocationChange}
          />

          <Marker
            position={[
              location.latitude,
              location.longitude,
            ]}
            icon={defaultIcon}
          />
        </MapContainer>
      </div>

      {/* Selected Coordinates */}
      <div className="selected-location-card">
        <div>
          <span>Selected latitude</span>
          <strong>{location.latitude}</strong>
        </div>

        <div>
          <span>Selected longitude</span>
          <strong>{location.longitude}</strong>
        </div>
      </div>

      <p className="farm-map-note">
        Select a search result or click on the map to update
        your farm coordinates. NASA climate data will reload
        for the selected location.
      </p>

      <p className="farm-map-attribution">
        Location search: Photon by Komoot · Map data © OpenStreetMap contributors.
      </p>

    </section>
  );
}

export default FarmLocationMap;
