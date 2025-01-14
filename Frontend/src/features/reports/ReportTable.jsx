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
import Modal from "../../ui/Modal";
import SubstitutionForm from "./SubstitutionForm";
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

function ReportTable({
  reportData,
  energyTags = ["KWH DEL MP", "KWH REC MP", "KWH DEL MR", "KWH REC MR"],
  tipoMedicion,
  //reportPageNumber,
}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState(1);
  const [rowsToEdit, setRowsToEdit] = useState([]);
  const [isEditableRow, setIsEditableRow] = useState(false);
  const [editableRowKey, setEditableRowKey] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [modifiedRows, setModifiedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { isUpdating, updateMeasures } = useUpdateMeasures(
    pageNumber,
    reportData
  );

  console.log(modifiedRows);

  console.log("Report data at report table: ", reportData);

  // Extrae los datos de energia de la base de datos, con la paginacion adecuada
  const { isLoading: isLoadingMeasures, data: measures } = useQuery({
    queryKey: ["measures", pageNumber, reportData],
    queryFn: () => getMeasures(reportData, pageNumber),
    keepPreviousData: true,
  });

  const measuresArray = measures?.data || [];
  const totalPages = measures?.totalPages || 1;
  console.log(reportData);
  console.log(measuresArray);

  const handleShowModal = () => {
    setShowModal((show) => !show);
  };

  const handleModifiedRows = () => {
    const modifiedRowsList = rowsToEdit.map((item) => item.key);
    setModifiedRows(modifiedRowsList);
  };

  const handleIsEditableRow = (isEditable, rowKey, buttonValue) => {
    if (buttonValue === "Cancelar") {
      const editableRows = rowsToEdit.filter((item) => item.key !== rowKey);
      setRowsToEdit(editableRows);
    }
    setIsEditableRow(isEditable);
    setEditableRowKey(rowKey);

    const modifiedRowsList = rowsToEdit.map((item) => item.key);
    setModifiedRows(modifiedRowsList);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (measures?.totalPages || 1)) {
      setPageNumber(newPage);
      setInputValue(newPage);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputSubmit = () => {
    const newPage = parseInt(inputValue, 10);
    if (!isNaN(newPage)) {
      handlePageChange(newPage);
    } else {
      setInputValue(pageNumber);
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

      console.log("Updated rowsToEdit:", updatedRows);
      return updatedRows;
    });
  }, []);

  if (isLoadingMeasures) return <Spinner />;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      measuresArray?.map((measure) => ({
        Fecha: measure.fecha,
        EAG_MP: measure.EAG_MP,
        EAC_MP: measure.EAC_MP,
        EAG_MR: measure.EAG_MR,
        EAC_MR: measure.EAC_MR,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Measures");
    XLSX.writeFile(workbook, "Measures.xlsx");
  };

  const onUpdateMeasures = () => {
    if (rowsToEdit?.length > 0) {
      console.log("Rows to edit on onUpdateMeasures : ", rowsToEdit);
      updateMeasures(rowsToEdit);
    } else {
      console.log("hello");
    }
    setRowsToEdit([]);
    setIsEditableRow(false);
    setEditableRowKey(null);
    setModifiedRows([]);
  };

  return (
    <>
      <Table role="table">
        {rowsToEdit?.length > 0 ? (
          <Button
            onClick={() => {
              //onUpdateMeasures();
              setShowModal(true);
            }}
            tooltip="Guardar cambios"
          >
            GUARDAR CAMBIOS
          </Button>
        ) : null}
        <PaginationWrapper
          handleInputChange={handleInputChange}
          handlePageChange={handlePageChange}
          handleInputSubmit={handleInputSubmit}
          pageNumber={pageNumber}
          totalPages={totalPages}
          inputValue={inputValue}
        />
        <TableHeader role="row">
          <div>FECHA</div>
          {energyTags?.map((energyTag) => (
            <div key={energyTag}>{energyTag}</div>
          ))}
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
            rowKey={measuresArray.indexOf(measure)}
            reportData={reportData}
            //onInsertRow={handleInsertRow}
            handleRowChange={handleRowChange}
            handleIsEditableRow={handleIsEditableRow}
            handleModifiedRows={handleModifiedRows}
            isEditableRow={
              editableRowKey == measuresArray.indexOf(measure)
                ? isEditableRow
                : false
            }
            tipoMedicion={tipoMedicion}
            modifiedRows={modifiedRows}
            activeRow={editableRowKey}
          />
        ))}
        <PaginationWrapper
          handleInputChange={handleInputChange}
          handlePageChange={handlePageChange}
          handleInputSubmit={handleInputSubmit}
          pageNumber={pageNumber}
          totalPages={totalPages}
          inputValue={inputValue}
        />
      </Table>
      {showModal && (
        <Modal onClose={handleShowModal}>
          <Heading as="h2">
            Validación, cálculo y sustitución de mediciones
          </Heading>
          <SubstitutionForm
            idPuntoMedicion={reportData?.puntoMedicion}
            onUpdateMeasures={onUpdateMeasures}
            rowsToEdit={rowsToEdit}
            handleShowModal = {handleShowModal}
          ></SubstitutionForm>
        </Modal>
      )}
    </>
  );
}

export default ReportTable;
