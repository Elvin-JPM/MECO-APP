import Heading from "../ui/Heading";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getMetersCommStatusTime } from "../services/getRequests";
import Spinner from "../ui/Spinner";
import ComCard from "../features/comunications/ComCard";
import Input from "../ui/Input";
import { useState } from "react";

const StyledCommunications = styled.div`
  display: grid;
  gap: 10px;
  grid-auto-flow: row;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  max-width: 100%;
  margin-top: 1rem;
`;

const StyleInputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

function groupMetersByMeasurementPoint(meters) {
  const measurementPointGroups = {};
  const result = [];

  meters.forEach((meter) => {
    const measurementPointId = meter.idPuntoMedicion;
    if (!measurementPointId) return; // Skip if no measurement point ID

    if (!measurementPointGroups[measurementPointId]) {
      measurementPointGroups[measurementPointId] = [];
    }
    measurementPointGroups[measurementPointId].push(meter);
  });

  for (const measurementPointId in measurementPointGroups) {
    result.push(measurementPointGroups[measurementPointId]);
  }

  return result;
}

function sortGroupedMetersByFirstDescription(groupedMeters) {
  return groupedMeters.sort((a, b) => {
    const descriptionA = a[0]?.description
      ? a[0].description.toUpperCase()
      : "";
    const descriptionB = b[0]?.description
      ? b[0].description.toUpperCase()
      : "";
    if (descriptionA < descriptionB) {
      return -1;
    }
    if (descriptionA > descriptionB) {
      return 1;
    }
    return 0;
  });
}

function Communications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIp, setSearchIp] = useState("");
  const [isDisabledNameSearch, setIsDisabledNameSearch] = useState(false);
  const [isDisabledIpSearch, setIsDisabledIpSearch] = useState(false);
  let filteredGroupedMeters = [];

  const { isLoading, data: metersCommStatusTimeData } = useQuery({
    queryKey: ["meterCommStatusTime"],
    queryFn: () => getMetersCommStatusTime(),
    keepPreviousData: true,
    refetchInterval: 300000, // 5 minutes as fallback
    refetchIntervalInBackground: true,
  });

  if (isLoading) return <Spinner />;

  let groupedMeters = groupMetersByMeasurementPoint(metersCommStatusTimeData);
  groupedMeters = sortGroupedMetersByFirstDescription(groupedMeters);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsDisabledIpSearch(true);
    if (event.target.value === "") {
      setIsDisabledIpSearch(false);
    }
    if (event.target.value === "") {
      setIsDisabledNameSearch(false);
    }
  };

  const handleSearchIpChange = (event) => {
    setSearchIp(event.target.value);
    setIsDisabledNameSearch(true);
    if (event.target.value === "") {
      setIsDisabledNameSearch(false);
    }
    if (event.target.value === "") {
      setIsDisabledIpSearch(false);
    }
  };

  if (searchTerm) {
    filteredGroupedMeters = groupedMeters.filter((group) =>
      group[0]?.description.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
  } else if (searchIp) {
    filteredGroupedMeters = groupedMeters.filter((group) =>
      group[0]?.ip.toLowerCase().startsWith(searchIp.toLowerCase())
    );
  } else {
    filteredGroupedMeters = groupedMeters;
  }

  let metersToDisplay = filteredGroupedMeters;

  return (
    <>
      <Heading>ESTADO DE COMUNICACIÓN CON LOS MEDIDORES</Heading>
      <StyleInputGroup>
        <Input
          placeholder="Buscar por nombre..."
          type="text"
          onChange={handleSearchChange}
          disabled={isDisabledNameSearch}
        />
        <Input
          placeholder="Buscar por IP..."
          type="text"
          onChange={handleSearchIpChange}
          disabled={isDisabledIpSearch}
        />
      </StyleInputGroup>
      <StyledCommunications>
        {metersToDisplay.map((group, index) => (
          <ComCard key={index} group={group} />
        ))}
      </StyledCommunications>
    </>
  );
}

export default Communications;
