import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDarkMode } from "../../context/DarkModeContext";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

// Custom marker icons
const createCustomIcon = (color = "red") => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Marker options
const markerOptions = {
  red: createCustomIcon("red"),
  blue: createCustomIcon("blue"),
  green: createCustomIcon("green"),
  orange: createCustomIcon("orange"),
  yellow: createCustomIcon("yellow"),
  violet: createCustomIcon("violet"),
  grey: createCustomIcon("grey"),
  black: createCustomIcon("black"),
  // Custom SVG marker
  custom: new L.Icon({
    iconUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ff0000"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  }),
};

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const CleanMapContainer = styled(MapContainer)`
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: ${(props) =>
    props.$darkMode ? "var(--color-grey-50)" : "var(--color-grey-100)"};
  width: 100%;
  aspect-ratio: 16/9;
  height: 74vh;

  @media (min-width: 1367px) {
    aspect-ratio: 16/9;
    height: 81vh;
  }

  /* Dark mode map styling */
  ${(props) =>
    props.$darkMode &&
    `
    .leaflet-layer,
    .leaflet-control-zoom-in,
    .leaflet-control-zoom-out,
    .leaflet-control-attribution {
      filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
    }

    /* Adjust marker colors for dark mode */
    .leaflet-marker-icon {
      filter: brightness(0.8) saturate(1.2);
    }
  `}
`;

const ThemedPopup = styled(Popup)`
  .leaflet-popup-content-wrapper {
    background: ${(props) =>
      props.$darkMode ? "var(--color-grey-100)" : "var(--color-grey-0)"};
    color: ${(props) =>
      props.$darkMode ? "var(--color-grey-700)" : "var(--color-grey-800)"};
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    padding: 1.2rem;
    border: 1px solid
      ${(props) =>
        props.$darkMode ? "var(--color-grey-600)" : "var(--color-grey-200)"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .leaflet-popup-tip {
    background: ${(props) =>
      props.$darkMode ? "var(--color-grey-100)" : "var(--color-grey-0)"};
  }
  strong {
    color: var(--color-institucional-rojo);
  }
`;

const PopupContent = styled.div`
  padding: 0.2rem;
  font-size: 1.4rem;

  strong {
    font-size: 1.6rem;
  }

  p {
    margin-top: 0.2rem;
    font-size: 1.4rem;
  }

  a {
    display: inline-block;
    margin-top: 0.2rem;
    color: var(--color-institucional-celeste);
    text-decoration: none;
    font-size: 1.2rem;
    transition: color 0.3s;

    &:hover {
      color: var(--color-institucional-rojo);
      text-decoration: underline;
    }
  }
`;

// Add a component to handle zoom changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

ChangeView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
};

const useResponsiveZoom = () => {
  const [zoomLevel, setZoomLevel] = useState(7);

  useEffect(() => {
    const handleResize = () => {
      const newZoom = window.innerWidth >= 1367 ? 8 : 7;
      setZoomLevel(newZoom);
    };

    // Set initial zoom level
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return zoomLevel;
};

const CentralAmericaMap = ({ locations }) => {
  const { isDarkMode } = useDarkMode();
  const hondurasCenter = [14.5, -86.5];
  const zoomLevel = useResponsiveZoom();
  const [mapKey, setMapKey] = useState(0); // Add key for forcing re-render

  // Force map re-render when dark mode changes
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [isDarkMode]);

  // Use OpenStreetMap standard tiles
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <CleanMapContainer
      key={mapKey} // Add key to force re-render
      center={hondurasCenter}
      zoom={zoomLevel}
      minZoom={7}
      maxZoom={18}
      maxBounds={[
        [10.5, -89.5],
        [18.5, -83.5],
      ]}
      $darkMode={isDarkMode}
    >
      <ChangeView center={hondurasCenter} zoom={zoomLevel} />
      <TileLayer
        url={tileUrl}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[location.lat, location.lng]}
          icon={markerOptions.orange}
        >
          <ThemedPopup $darkMode={isDarkMode}>
            <PopupContent>
              <strong style={{ color: "var(--color-grey-700)" }}>
                {location.description || "Sin descripción"}
              </strong>
              <p
                style={{
                  color: isDarkMode
                    ? "var(--color-grey-600)"
                    : "var(--color-grey-700)",
                }}
              >
                {location.name || "Sin nombre"}
              </p>
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en Google Maps
              </a>
            </PopupContent>
          </ThemedPopup>
        </Marker>
      ))}
    </CleanMapContainer>
  );
};

CentralAmericaMap.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default CentralAmericaMap;
