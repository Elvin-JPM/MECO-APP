import React, { useState } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import PaginationWrapper from "../../ui/PaginationWrapper";
import { getSubstitutionReports } from "../../services/getRequests";
import SubstitutionReportRow from "./SubstitutionReportRow";
import Heading from "../../ui/Heading";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 0.3fr 1fr 1.3fr 1fr 1fr 1fr 0.35fr;
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

function SubstitutionReportsTable() {
  const [checkedPage, setCheckedPage] = useState(1);
  const [checkedInputValue, setCheckedInputValue] = useState(1);
  const [uncheckedPage, setUncheckedPage] = useState(1);
  const [uncheckedInputValue, setUncheckedInputValue] = useState(1);

  const itemsPerPage = 8;

  const { isLoading, data: substitutionReports } = useQuery({
    queryKey: ["substitutionReports"],
    queryFn: () => getSubstitutionReports(),
    keepPreviousData: true,
  });

  if (isLoading) return <Spinner />;

  const checkedReports = substitutionReports.filter(
    (report) =>
      report.aprobado !== null &&
      report.aprobado !== undefined &&
      report.aprobado !== 0
  );

  const uncheckedReports = substitutionReports.filter(
    (report) =>
      report.aprobado === null ||
      report.aprobado === undefined ||
      report.aprobado === 0
  );

  // Pagination logic for checked reports
  const checkedTotalPages = Math.ceil(checkedReports.length / itemsPerPage);
  const paginatedCheckedReports = checkedReports.slice(
    (checkedPage - 1) * itemsPerPage,
    checkedPage * itemsPerPage
  );

  // Pagination logic for unchecked reports
  const uncheckedTotalPages = Math.ceil(uncheckedReports.length / itemsPerPage);
  const paginatedUncheckedReports = uncheckedReports.slice(
    (uncheckedPage - 1) * itemsPerPage,
    uncheckedPage * itemsPerPage
  );

  // Handle page change for checked reports
  const handleCheckedPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= checkedTotalPages) {
      setCheckedPage(newPage);
      setCheckedInputValue(newPage);
    }
  };

  // Handle input change for checked reports
  const handleCheckedInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCheckedInputValue(value);
    }
  };

  // Handle input submission for checked reports
  const handleCheckedInputSubmit = () => {
    const newPage = parseInt(checkedInputValue, 10);
    if (!isNaN(newPage)) {
      handleCheckedPageChange(newPage);
    } else {
      setCheckedInputValue(checkedPage);
    }
  };

  // Handle page change for unchecked reports
  const handleUncheckedPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= uncheckedTotalPages) {
      setUncheckedPage(newPage);
      setUncheckedInputValue(newPage);
    }
  };

  // Handle input change for unchecked reports
  const handleUncheckedInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setUncheckedInputValue(value);
    }
  };

  // Handle input submission for unchecked reports
  const handleUncheckedInputSubmit = () => {
    const newPage = parseInt(uncheckedInputValue, 10);
    if (!isNaN(newPage)) {
      handleUncheckedPageChange(newPage);
    } else {
      setUncheckedInputValue(uncheckedPage);
    }
  };

  return (
    <>
      <BackgroundForHeading>
        <Heading as="h4">
          Reportes de sustitucion pendientes de revision
        </Heading>
      </BackgroundForHeading>
      {uncheckedReports.length === 0 ? (
        <EmptyTableMessage>
          No hay reportes pendientes de revisión.
        </EmptyTableMessage>
      ) : (
        <Table role="table">
          <PaginationContainer $top>
            <PaginationWrapper
              handlePageChange={handleUncheckedPageChange}
              handleInputChange={handleUncheckedInputChange}
              handleInputSubmit={handleUncheckedInputSubmit}
              pageNumber={uncheckedPage}
              totalPages={uncheckedTotalPages}
              inputValue={uncheckedInputValue}
            />
          </PaginationContainer>
          <TableHeader role="row">
            <div></div>
            <div>NOMBRE REPORTE</div>
            <div>CENTRAL</div>
            <div>FECHA CREACION</div>
            <div>FECHA EDICION</div>
            <div>CREADO POR</div>
            <div></div>
          </TableHeader>
          <TableContent>
            {paginatedUncheckedReports.map((reportRow) => (
              <SubstitutionReportRow
                reportRow={reportRow}
                key={reportRow.id}
                iconColor="var(--color-red-500)"
                tipo="unchecked"
              ></SubstitutionReportRow>
            ))}
          </TableContent>
          <PaginationContainer>
            <PaginationWrapper
              handlePageChange={handleUncheckedPageChange}
              handleInputChange={handleUncheckedInputChange}
              handleInputSubmit={handleUncheckedInputSubmit}
              pageNumber={uncheckedPage}
              totalPages={uncheckedTotalPages}
              inputValue={uncheckedInputValue}
            />
          </PaginationContainer>
        </Table>
      )}

      <BackgroundForHeading>
        <Heading as="h4">Reportes de sustitucion revisados</Heading>
      </BackgroundForHeading>
      {checkedReports.length === 0 ? (
        <EmptyTableMessage>No hay reportes revisados.</EmptyTableMessage>
      ) : (
        <Table role="table">
          <PaginationContainer $top>
            <PaginationWrapper
              handlePageChange={handleCheckedPageChange}
              handleInputChange={handleCheckedInputChange}
              handleInputSubmit={handleCheckedInputSubmit}
              pageNumber={checkedPage}
              totalPages={checkedTotalPages}
              inputValue={checkedInputValue}
            />
          </PaginationContainer>
          <TableHeader role="row">
            <div></div>
            <div>NOMBRE REPORTE</div>
            <div>CENTRAL</div>
            <div>FECHA CREACION</div>
            <div>FECHA EDICION</div>
            <div>CREADO POR</div>
            <div></div>
          </TableHeader>
          <TableContent>
            {paginatedCheckedReports.map((reportRow) => (
              <SubstitutionReportRow
                    reportRow={reportRow}
                    key={reportRow.id}
                    iconColor="var(--color-brand-700)"
                    tipo="checked"
              ></SubstitutionReportRow>
            ))}
          </TableContent>
          <PaginationContainer>
            <PaginationWrapper
              handlePageChange={handleCheckedPageChange}
              handleInputChange={handleCheckedInputChange}
              handleInputSubmit={handleCheckedInputSubmit}
              pageNumber={checkedPage}
              totalPages={checkedTotalPages}
              inputValue={checkedInputValue}
            />
          </PaginationContainer>
        </Table>
      )}
    </>
  );
}

export default SubstitutionReportsTable;
