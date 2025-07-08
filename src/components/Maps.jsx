import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hasInitializedMap = useRef(false);
  const inputRef = useRef(null);

  // Get user location on mount
  useEffect(() => {
    let isMounted = true;

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isMounted) {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setIsLoading(false);
          // Update address via reverse geocoding
          reverseGeocode(newLocation);
        }
      },
      (err) => {
        if (isMounted) {
          let message = "An unknown error occurred.";
          if (err.code === 1) message = "Location permission denied.";
          else if (err.code === 2) message = "Location information unavailable.";
          else if (err.code === 3) message = "Location request timed out.";
          setError(message);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  // Reverse geocode to fetch address from coordinates
  const reverseGeocode = async (loc) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error("Failed to get address");
      }
      const data = await response.json();
      // Build address string from available components
      const addressComponents = [
        data.address.road,
        data.address.house_number,
        data.address.suburb,
        data.address.city || data.address.town || data.address.village,
        data.address.state,
        data.address.postcode,
        data.address.country
      ].filter(Boolean);
      const formattedAddress = addressComponents.join(", ");
      setAddress(formattedAddress);
    } catch (err) {
      console.error("Error getting address:", err);
      setAddress("Address not available");
    }
  };

  // Initialize or update the map when location changes
  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Initialize the map if it doesn't exist yet
    if (!mapInstanceRef.current) {
      const initMap = () => {
        if (hasInitializedMap.current) return;
        try {
          const map = L.map(mapRef.current).setView([location.lat, location.lng], 15);

          // Add OSM tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Add marker at user's location
          L.marker([location.lat, location.lng])
            .addTo(map)
            .bindPopup("You are here!")
            .openPopup();

          mapInstanceRef.current = map;
          hasInitializedMap.current = true;

          // Invalidate map size after it is rendered
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        } catch (err) {
          console.error("Map initialization error:", err);
          setError("Failed to initialize map. Please refresh the page.");
        }
      };

      // Ensure DOM is ready
      requestAnimationFrame(initMap);
    } else {
      // If map already exists, update its view and marker
      try {
        const map = mapInstanceRef.current;
        map.setView([location.lat, location.lng], 15);

        // Remove existing markers
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
        // Add new marker
        L.marker([location.lat, location.lng])
          .addTo(map)
          .bindPopup("You are here!")
          .openPopup();
      } catch (err) {
        console.error("Map update error:", err);
      }
    }
  }, [location]);

  // Clean up the map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        hasInitializedMap.current = false;
      }
    };
  }, []);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Optionally: implement geocoding to convert address to coordinates here
    // For now, the map view remains at the user's current location.
  };

  return (
    <div>
      <h2>📍 Your Current Location</h2>
      {isLoading && <p>Fetching location...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      
      <form onSubmit={handleAddressSubmit} style={{ marginBottom: "15px" }}>
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter your address"
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc" 
          }}
        />
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Update Location
          </button>
          {location && (
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          )}
        </div>
      </form>

      <div
        ref={mapRef}
        style={{
          height: "500px",
          width: "100%",
          display: location && !error ? "block" : "none",
          borderRadius: "4px",
          overflow: "hidden"
        }}
      />
    </div>
  );
};

export default LocationMap;
