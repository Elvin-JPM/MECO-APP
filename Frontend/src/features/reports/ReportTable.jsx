import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import { getMeasures } from "../../services/getRequests";
import ButtonArray from "../../ui/ButtonArray";
import MeasureRow from "./MeasureRow";
import { useState, useEffect } from "react";
import PaginationWrapper from "../../ui/PaginationWrapper";
import { useCallback } from "react";
import useUpdateMeasures from "./useUpdateMeasures";
import Modal from "../../ui/Modal";
import SubstitutionForm from "./SubstitutionForm";
import Heading from "../../ui/Heading";
import toast from "react-hot-toast";
import TableSkeleton from "../../ui/TableSkeleton";
import { useRef } from "react";
import useAllMeasuresStyling from "./useXlsxStyling";

export const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
  @media (max-width: 1200px) and (min-width: 768px) {
    font-size: 1.2rem;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    font-size: 1rem;
  }
`;


export const TableHeader = styled.header`
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
  @media (max-width: 1200px) and (min-width: 768px) {
    font-size: 1.2rem;
    column-gap: 0.5rem;
    letter-spacing: 0.2px;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    font-size: 1.1rem;
    column-gap: 0.5rem;
    letter-spacing: 0.1px;
  }

`;

function ReportTable({

  reportData,
  energyTags = ["KWH DEL MP", "KWH REC MP", "KWH DEL MR", "KWH REC MR"],
  tipoMedicion,
}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState(1);
  const [rowsToEdit, setRowsToEdit] = useState([]);
  const [isEditableRow, setIsEditableRow] = useState(false);
  const [editableRowKey, setEditableRowKey] = useState(null);
  //const [activeRow, setActiveRow] = useState(null);
  const [modifiedRows, setModifiedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { isUpdating, updateMeasures } = useUpdateMeasures(
    pageNumber,
    reportData
  );
  const [showToast, setShowToast] = useState({ type: null, message: null });

  const { allMeasuresMutation } = useAllMeasuresStyling(reportData, energyTags);
  //const [isDownloadReady, setIsDownloadReady] = useState(false);
  //const [currentPage, setCurrentPage] = useState(1);
  const totalPagesRef = useRef(null);
  const pageNumberRef = useRef(1);

  console.log(modifiedRows);

  console.log("Report data at report table: ", reportData);

  // Extrae los datos de energia de la base de datos, con la paginacion adecuada
  const { isLoading: isLoadingMeasures, data: measures } = useQuery({
    queryKey: ["measures", pageNumber, reportData],
    queryFn: () => getMeasures(reportData, pageNumber),
    keepPreviousData: true,
  });

  console.log("Measures: ", measures?.data);

  if (measures?.totalPages && totalPagesRef.current === null) {
    totalPagesRef.current = measures.totalPages;
  }

  const measuresArray = measures?.data || [];
  const totalPages = measures?.totalPages || totalPagesRef.current || 0;

  const exportToExcel = async () => {
    // Use toast.promise to handle loading, success, and error states
    await toast.promise(
      allMeasuresMutation.mutateAsync(), // Use mutateAsync for promise-based handling
      {
        loading: "Extrayendo datos...", // Loading state message
        success: "¡Datos descargados correctamente!", // Success state message
        error: "Extracción de datos fallida.", // Error state message
      }
    );
  };

  const handleShowModal = () => {
    setShowModal((show) => !show);
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
      // rowsToEdit sera este valor retornado por el handleRowChange
      return updatedRows;
    });
  }, []);

  useEffect(() => {
    if (showToast.type && showToast.message) {
      if (showToast.type === "success") {
        toast.success(showToast.message, {
          style: {
            border: "1px solid #713200",
            padding: "16px",
            color: "#713200",
          },
          iconTheme: {
            primary: "#713200",
            secondary: "#FFFAEE",
          },
        });
      } else if (showToast.type === "error") {
        toast.error(showToast.message);
      }
      // Reset the toast state
      setShowToast({ type: null, message: null });
    }
  }, [showToast]);

  const handleDeleteRow = (rowKey) => {
    console.log("handleDeleteRow called for rowKey:", rowKey);
    setRowsToEdit((prevRows) => {
      const updatedRows = prevRows.filter((item) => item.key !== rowKey);
      console.log("Rows to edit after deleting: ", updatedRows);

      if (updatedRows.length === prevRows.length) {
        setShowToast({ type: "error", message: "No se pudo eliminar la fila" });
      } else {
        setShowToast({
          type: "success",
          message: "Validación de fila cancelada",
        });
      }
      return updatedRows; // Return the updated state
    });
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
      {isLoadingMeasures ? (
        <TableSkeleton
          energyTags={energyTags}
          totalPages={totalPagesRef.current}
          pageNumber={pageNumberRef.current}
        />
      ) : (
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
              <Button
                disabled={allMeasuresMutation.isLoading}
                onClick={exportToExcel}
                tooltip="Descargar perfil"
              >
                <FaDownload />
              </Button>
            </ButtonArray>
          </TableHeader>
          {measuresArray?.map((measure) => (
            <MeasureRow
              handleRowChange={handleRowChange}
              handleIsEditableRow={handleIsEditableRow}
              handleDeleteRow={handleDeleteRow}
              //handleModifiedRows={handleModifiedRows}
              measure={measure}
              reportData={reportData}
              tipoMedicion={tipoMedicion}
              modifiedrows={modifiedRows}
              activerow={editableRowKey}
              key={measuresArray.indexOf(measure)}
              rowkey={measuresArray.indexOf(measure)}
              isEditableRow={
                editableRowKey == measuresArray.indexOf(measure)
                  ? isEditableRow
                  : false
              }
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
      )}
      {showModal && (
        <Modal onClose={handleShowModal}>
          <Heading as="h2">
            Validación, cálculo y sustitución de mediciones
          </Heading>
          <SubstitutionForm
            idPuntoMedicion={reportData?.puntoMedicion}
            onUpdateMeasures={onUpdateMeasures}
            rowsToEdit={rowsToEdit}
            handleShowModal={handleShowModal}
          ></SubstitutionForm>
        </Modal>
      )}
    </>
  );
}

export default ReportTable;
