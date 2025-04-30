import CentralAmericaMap from "./CentralAmericaMap";
import { useQuery } from "@tanstack/react-query";
import {
  getMeasurementPoints,
  getSubstations,
} from "../../services/getRequests";
import Spinner from "../../ui/Spinner";
import PropTypes from "prop-types";

function Map({ searchTerm, activeTag }) {
  // Fetch measurement points data
  const { isLoading: isLoadingPoints, data: measurementPoints } = useQuery({
    queryKey: ["measurementPoints"],
    queryFn: getMeasurementPoints,
    enabled: activeTag === "P. Medición",
  });

  // Fetch substations data
  const { isLoading: isLoadingSubestaciones, data: subestaciones } = useQuery({
    queryKey: ["subestaciones"],
    queryFn: getSubstations,
    enabled: activeTag === "Subestaciones",
  });

  if (isLoadingPoints || isLoadingSubestaciones) return <Spinner />;

  // Helper function to validate coordinates
  const isValidCoordinate = (value) => {
    if (typeof value === "string") {
      // Remove any whitespace and check if it's a valid number
      const trimmed = value.trim();
      const num = parseFloat(trimmed);
      return !isNaN(num) && isFinite(num);
    }
    return !isNaN(value) && isFinite(value);
  };

  // Transform and filter the data based on active tag
  const locations = (() => {
    if (activeTag === "P. Medición") {
      return (
        measurementPoints
          ?.filter((point) => {
            if (!searchTerm) return true;
            return point.nombre_planta
              .toLowerCase()
              .startsWith(searchTerm.toLowerCase());
          })
          .filter(
            (point) =>
              isValidCoordinate(point.latitud) &&
              isValidCoordinate(point.longitud)
          )
          .map((point) => ({
            lat: parseFloat(point.latitud),
            lng: parseFloat(point.longitud),
            name: point.nombre,
            description: point.nombre_planta,
          })) || []
      );
    }

    if (activeTag === "Subestaciones") {
      return (
        subestaciones
          ?.filter((subestacion) => {
            if (!searchTerm) return true;
            return subestacion[1] // Using index 1 for the name since it's an array
              .toLowerCase()
              .startsWith(searchTerm.toLowerCase());
          })
          .filter((subestacion) => {
            const lat = subestacion[3]; // Using index 3 for latitude
            const lng = subestacion[4]; // Using index 4 for longitude
            const isValid = isValidCoordinate(lat) && isValidCoordinate(lng);
            if (!isValid) {
              console.log("Invalid coordinates for substation:", subestacion);
            }
            return isValid;
          })
          .map((subestacion) => ({
            lat: parseFloat(subestacion[3]), // Using index 3 for latitude
            lng: parseFloat(subestacion[4]), // Using index 4 for longitude
            name: subestacion[1], // Using index 1 for the name
            description: subestacion[2] || "Subestación", // Using index 2 for nomenclatura
          })) || []
      );
    }

    return [];
  })();

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <CentralAmericaMap locations={locations} />
    </div>
  );
}

Map.propTypes = {
  searchTerm: PropTypes.string,
  activeTag: PropTypes.string.isRequired,
};

export default Map;
