import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { getMeasures } from "../../services/getRequests";
//import AddMeter from "./AddMeter";
import ButtonArray from "../../ui/ButtonArray";
import MeasureRow from "./MeasureRow";
import { useState } from "react";
import PaginationWrapper from "../../ui/PaginationWrapper";
import { useCallback } from "react";
import useUpdateMeasures from "./useUpdateMeasures";

const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
`;

const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 0.3fr;
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

function ReportTable({ reportData }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState(1);
  const [rowsToEdit, setRowsToEdit] = useState([]);
  const { isUpdating, updateMeasures } = useUpdateMeasures(
    pageNumber,
    reportData
  );

  const {
    isLoading: isLoadingMeasures,
    data: measures,
    // error,
  } = useQuery({
    queryKey: ["measures", pageNumber, reportData],
    queryFn: () => getMeasures(reportData, pageNumber),
    keepPreviousData: true,
  });

  const handleInsertRow = (rowData) => {
    console.log("Row submitted:", rowData);
    // Add database insertion logic here
  };

  const measuresArray = measures?.data || [];
  const totalPages = measures?.totalPages || 1;
  console.log(reportData);

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

  const handleRowChange = useCallback((newRow) => {
    setRowsToEdit((prevRows) => {
      const existingRowIndex = prevRows.findIndex(
        (row) => row.key === newRow.key
      );

      let updatedRows;
      if (existingRowIndex !== -1) {
        const isDifferent =
          JSON.stringify(prevRows[existingRowIndex]) !== JSON.stringify(newRow);

        if (isDifferent) {
          updatedRows = [...prevRows];
          updatedRows[existingRowIndex] = newRow;
        } else {
          updatedRows = prevRows;
        }
      } else {
        updatedRows = [...prevRows, newRow];
      }

      console.log("Updated rowsToEdit:", updatedRows); // Log the updated rows here
      return updatedRows;
    });
  }, []);

  if (isLoadingMeasures) return <Spinner />;
  // Function to export the meters data to Excel
  const exportToExcel = () => {
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(
      measuresArray?.map((measure) => ({
        Fecha: measure.fecha,
        EAG_MP: measure.EAG_MP,
        EAC_MP: measure.EAC_MP,
        EAG_MR: measure.EAG_MR,
        EAC_MR: measure.EAC_MR,
      }))
    );

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Measures");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "Measures.xlsx");
  };

  const onUpdateMeasures = () => {
    if (rowsToEdit?.length > 0) {
      console.log("Rows to edit on onUpdateMeasures : ", rowsToEdit);
      updateMeasures(rowsToEdit);
      setRowsToEdit([]);
    } else {
      console.log("hello");
    }
  };

  return (
    <Table role="table">
      {rowsToEdit?.length > 0 ? (
        <Button onClick={onUpdateMeasures}>SAVE CHANGES</Button>
      ) : (
        ""
      )}
      <PaginationWrapper
        handleInputChange={handleInputChange}
        handlePageChange={handlePageChange}
        handleInputSubmit={handleInputSubmit}
        pageNumber={pageNumber}
        totalPages={totalPages}
        inputValue={inputValue}
      ></PaginationWrapper>
      <TableHeader role="row">
        <div>FECHA</div>
        <div>KWH GENERADOS MP</div>
        <div>KWH RECIBIDOS MP</div>
        <div>KWH GENERADOS MR</div>
        <div>KWH RECIBIDOS MR</div>
        <ButtonArray>
          <Button onClick={exportToExcel} tooltip="Descargar perfil">
            <FaDownload />
          </Button>
        </ButtonArray>
      </TableHeader>
      {measuresArray?.map((measure) => (
        <MeasureRow
          measure={measure}
          key={measuresArray.indexOf(measure)}
          onInsertRow={handleInsertRow}
          rowNum={measuresArray.indexOf(measure)}
          handleRowChange={handleRowChange}
          reportData={reportData}
        ></MeasureRow>
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

export default ReportTable;
