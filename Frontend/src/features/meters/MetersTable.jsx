import React, { useState } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import MeterRow from "./MeterRow";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { getMeters } from "../../services/getRequests";
import PaginationWrapper from "../../ui/PaginationWrapper";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
  width: 100%;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 0.3fr 1fr 1fr 1fr 1fr 1fr 0.35fr;
  column-gap: 2.4rem;
  align-items: center;

  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
  padding: 1.6rem 2.4rem;
`;

function MetersTable() {
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState(1); // Separate state for the input value

  // Use pageNumber in query function
  const { isLoading, data: meters } = useQuery({
    queryKey: ["meters", pageNumber],
    queryFn: () => getMeters(pageNumber),
    keepPreviousData: true,
  });

  if (isLoading) return <Spinner />;

  const metersArray = meters?.data || [];
  const totalPages = meters?.totalPages || 1;

  // Function to change the page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      setInputValue(newPage); // Sync the input value with the selected page
    }
  };

  // Handle changes in the input field
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value); // Allow only numbers
    }
  };

  // Handle input submission
  const handleInputSubmit = () => {
    const newPage = parseInt(inputValue, 10);
    if (!isNaN(newPage)) {
      handlePageChange(newPage);
    } else {
      setInputValue(pageNumber); // Reset to the current page if input is invalid
    }
  };

  // Function to export the meters data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      metersArray.map((meter) => ({
        Plant: meter.nombre_planta,
        IP: meter.ip,
        Code: meter.id_punto,
        Substation: meter.subestacion,
        Series: meter.serie,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meters");
    XLSX.writeFile(workbook, "Meters.xlsx");
  };

  return (
    <Table role="table">
      <PaginationWrapper
        handleInputChange={handleInputChange}
        handlePageChange={handlePageChange}
        handleInputSubmit={handleInputSubmit}
        pageNumber={pageNumber}
        totalPages={totalPages}
        inputValue={inputValue}
      ></PaginationWrapper>

      <TableHeader role="row">
        <div></div>
        <div>PLANTA/SUBESTACION</div>
        <div>IP</div>
        <div>CODIGO DEL PUNTO</div>
        <div>SUBESTACION</div>
        <div>SERIE</div>
        <Button size="medium" variation="primary" onClick={exportToExcel}>
          <FaDownload />
        </Button>
      </TableHeader>
      {metersArray.map((meter) => (
        <MeterRow meter={meter} key={meter.id}></MeterRow>
      ))}
      <PaginationWrapper
        handleInputChange={handleInputChange}
        handlePageChange={handlePageChange}
        handleInputSubmit={handleInputSubmit}
        pageNumber={pageNumber}
        totalPages={totalPages}
        inputValue={inputValue}
      ></PaginationWrapper>
    </Table>
  );
}

export default MetersTable;
