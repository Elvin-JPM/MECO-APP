import React from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import { getHourlyDemand, getNodesNames } from "../../services/getRequests";
import DemandRow from "./DemandRow";

const TableContainer = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: auto; // Enable scrolling
  max-height: 80vh; // Set a maximum height
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse; // Ensure table borders are collapsed
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0; // Stick to the top
  z-index: 2; // Ensure the header stays above the rows
  background-color: var(--color-grey-50);
`;

const HeaderRow = styled.tr`
  display: grid;
  grid-template-columns: 130px 80px repeat(77, minmax(100px, 1fr)); // Match the row layout
`;

const HeaderCell = styled.th`
  padding: 1.5rem 2.4rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  color: var(--color-grey-600);
  font-size: 1.3rem;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-grey-200);

  // Make the first column sticky
  &:nth-child(1) {
    position: sticky;
    left: 0;
    z-index: 3; // Ensure the header column stays above the rows
    background-color: var(--color-grey-50); // Match the header background
  }

  // Make the second column sticky
  &:nth-child(2) {
    position: sticky;
    left: 130px; // Offset by the width of the first column
    z-index: 3; // Ensure the header column stays above the rows
    background-color: var(--color-grey-50); // Match the header background
    border-right: 1px solid var(--color-grey-100); // Add a border to separate sticky columns
  }
`;

const TableBody = styled.tbody`
  display: block; // Allow scrolling within the table body
`;

function DemandTable() {
  const { isLoading: isLoadingDemand, data: demand } = useQuery({
    queryKey: ["demand"],
    queryFn: () => getHourlyDemand(),
    keepPreviousData: true,
  });

  const { isLoading: isLoadingNodes, data: nodes } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => getNodesNames(),
    keepPreviousData: true,
  });

  if (isLoadingNodes || isLoadingDemand) return <Spinner />;

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <HeaderRow>
            <HeaderCell>FECHA</HeaderCell>
            <HeaderCell>HORA</HeaderCell>
            {nodes?.map((node) => (
              <HeaderCell key={node[0]}>{node[1]}</HeaderCell>
            ))}
          </HeaderRow>
        </TableHeader>
        <TableBody>
          {demand?.map((demand_hour, index) => (
            <DemandRow demand_hour={demand_hour} key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DemandTable;
