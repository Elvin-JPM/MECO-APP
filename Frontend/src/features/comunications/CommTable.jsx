import { useState, useEffect } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import PaginationWrapper from "../../ui/PaginationWrapper";
import { getMetersCommStatusTime } from "../../services/getRequests";
import Heading from "../../ui/Heading";
import CommTableRow from "./CommTableRow";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 0.3fr 1.5fr 1fr 1fr 1fr 1fr 1fr 0.35fr;
  column-gap: 2.4rem;
  align-items: center;
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
  padding: 1.6rem 2.4rem;
  position: relative;
`;

const EmptyTableMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-500);
  background-color: var(--color-grey-0);
  border-radius: 7px;
  border: 1px solid var(--color-grey-200);
`;

const BackgroundForHeading = styled.div`
  background-color: var(--color-grey-50);
  padding: 1rem 2.4rem;
  border-radius: 7px;
  margin: 1.2rem 0;
  border: 1px solid var(--color-grey-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.3rem;
  background-color: var(--color-grey-50);
  border-top: ${(props) =>
    props.$top ? "none" : "1px solid var(--color-grey-200)"};
  border-bottom: ${(props) =>
    props.$top ? "1px solid var(--color-grey-200)" : "none"};
`;

const TableContent = styled.div`
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: none;
`;

function CommTable() {
  const queryClient = useQueryClient();
  const [meterCommStatusPage, setMeterCommStatusPage] = useState(1);
  const [meterCommStatusInputValue, setMeterCommStatusInputValue] = useState(1);

  const itemsPerPage = 20;
  const socketUrl =
    import.meta.env.VITE_APP_ENV === "production"
      ? window.location.origin
      : `${import.meta.env.VITE_APP_SOCKET_IO_URL}:${
          import.meta.env.VITE_APP_SOCKET_IO_PORT
        }`;

  useEffect(() => {
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("meterStatusUpdated", () => {
      queryClient.invalidateQueries(["meterCommStatusTime"]);
      console.log("Received real-time update notification");
    });

    return () => socket.disconnect();
  }, [queryClient]);

  const { isLoading, data: metersCommStatusTimeData } = useQuery({
    queryKey: ["meterCommStatusTime"],
    queryFn: () => getMetersCommStatusTime(),
    keepPreviousData: true,
    refetchInterval: 300000, // Refetch every 5 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });

  if (isLoading) return <Spinner />;

  const meterCommStatusTimeTotalPages = Math.ceil(
    metersCommStatusTimeData.length / itemsPerPage
  );
  const paginatedMeterCommStatusData = metersCommStatusTimeData.slice(
    (meterCommStatusPage - 1) * itemsPerPage,
    meterCommStatusPage * itemsPerPage
  );

  // Handle page change for checked reports
  const handleMeterCommStatusPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meterCommStatusTimeTotalPages) {
      setMeterCommStatusPage(newPage);
      setMeterCommStatusInputValue(newPage);
    }
  };

  // Handle input change for checked reports
  const handleMeterCommStatusInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setMeterCommStatusInputValue(value);
    }
  };

  // Handle input submission for checked reports
  const handleMeterCommStatusInputSubmit = () => {
    const newPage = parseInt(meterCommStatusInputValue, 20);
    if (!isNaN(newPage)) {
      handleMeterCommStatusPageChange(newPage);
    } else {
      setMeterCommStatusInputValue(meterCommStatusPage);
    }
  };

  return (
    <>
      <BackgroundForHeading>
        <Heading as="h4">
          Reportes de sustitucion pendientes de revision
        </Heading>
      </BackgroundForHeading>
      {metersCommStatusTimeData.length === 0 ? (
        <EmptyTableMessage>No se encontraron los medidores</EmptyTableMessage>
      ) : (
        <Table role="table">
          <PaginationContainer $top>
            <PaginationWrapper
              handlePageChange={handleMeterCommStatusPageChange}
              handleInputChange={handleMeterCommStatusInputChange}
              handleInputSubmit={handleMeterCommStatusInputSubmit}
              pageNumber={meterCommStatusPage}
              totalPages={meterCommStatusTimeTotalPages}
              inputValue={meterCommStatusInputValue}
            />
          </PaginationContainer>
          <TableHeader role="row">
            <div></div>
            <div>NOMBRE CENTRAL</div>
            <div>TIPO MEDIDOR</div>
            <div>DIRECCION IP</div>
            <div>ESTADO COM</div>
            <div>FECHA ULTIMO PING</div>
            <div>TIEMPO FUERA</div>
            <div></div>
          </TableHeader>
          <TableContent>
            {paginatedMeterCommStatusData.map((meterCommStatusRow) => (
              <CommTableRow
                meterCommStatusRow={meterCommStatusRow}
                key={meterCommStatusRow.id}
              ></CommTableRow>
            ))}
          </TableContent>
          <PaginationContainer>
            <PaginationWrapper
              handlePageChange={handleMeterCommStatusPageChange}
              handleInputChange={handleMeterCommStatusInputChange}
              handleInputSubmit={handleMeterCommStatusInputSubmit}
              pageNumber={meterCommStatusPage}
              totalPages={meterCommStatusTimeTotalPages}
              inputValue={meterCommStatusInputValue}
            />
          </PaginationContainer>
        </Table>
      )}
    </>
  );
}

export default CommTable;
