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
import { formatDate } from "../../utils/dateFunctions";

export const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;

  @media (max-width: 1200px) {
    font-size: 1.2rem;
  }
  @media (max-width: 810px) {
    font-size: 1rem;
    overflow-x: scroll;
  }

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

export const TableHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 0.4fr;
  column-gap: 2.4rem;
  align-items: center;

  background-color: var(--color-grey-100);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
  padding: 1.6rem 2.4rem;
`;

export const ColumnHeader = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1200px) {
    font-size: 1.1rem;
    column-gap: 0.5rem;
    letter-spacing: 0.2px;
  }
  @media (max-width: 810px) {
    font-size: 1rem;
    column-gap: 0.5rem;
    letter-spacing: 0.1px;
  }
  @media (max-width: 500px) {
    max-width: 50rem; /* Adjust based on your layout */
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
  const [modifiedRows, setModifiedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { isUpdating, updateMeasures } = useUpdateMeasures(
    pageNumber,
    reportData
  );
  const [showToast, setShowToast] = useState({ type: null, message: null });
  const [rowsForReport, setRowsForReport] = useState([]);

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

  //---------------------------------- QUERIES ------------------------------------

  // Este custom hook trae los datos del periodo seleccionado, sin paginacion
  const { allMeasuresMutation } = useAllMeasuresStyling(reportData, energyTags);

  // Extrae los datos de energia de la base de datos, con la paginacion adecuada
  const { isLoading: isLoadingMeasures, data: measures } = useQuery({
    queryKey: ["measures", pageNumber, reportData],
    queryFn: () => getMeasures(reportData, pageNumber),
    keepPreviousData: true,
  });

  const { isLoading: isLoadingAllMeasures, data: allMeasures } = useQuery({
    queryKey: ["measures", reportData],
    queryFn: () => getMeasures(reportData, -1),
    keepPreviousData: true,
  });

  const totalPagesRef = useRef(null);
  const pageNumberRef = useRef(1);

  console.log(modifiedRows);

  console.log("Report data at report table: ", reportData);

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

  function getMinMaxDatesWithOffset(objects) {
    if (!objects || objects.length === 0) {
      return { minDate: null, maxDate: null };
    }

    let minDate = new Date(8640000000000000);
    let maxDate = new Date(-8640000000000000);

    for (const obj of objects) {
      if (typeof obj.fecha === "string") {
        const parts = obj.fecha.split(/[- :]/);
        if (parts.length >= 3) {
          const year = parts[2];
          const month = parts[1];
          const day = parts[0];
          const time = parts.slice(3).join(":");
          const isoDateString = `${year}-${month}-${day}T${time}`;
          const parsedDate = new Date(isoDateString);

          if (!isNaN(parsedDate)) {
            minDate = parsedDate < minDate ? parsedDate : minDate;
            maxDate = parsedDate > maxDate ? parsedDate : maxDate;
          } else {
            console.error("Invalid date after conversion:", obj.fecha);
          }
        } else {
          console.error("Invalid date format:", obj.fecha);
        }
      } else if (obj.fecha instanceof Date) {
        minDate = obj.fecha < minDate ? obj.fecha : minDate;
        maxDate = obj.fecha > maxDate ? obj.fecha : maxDate;
      } else {
        console.error("Invalid fecha type", obj.fecha);
      }
    }

    // Apply 15-minute offset.
    if (minDate && maxDate) {
      const minDateWithOffset = new Date(minDate.getTime() - 15 * 60 * 1000); // Subtract 15 minutes.
      const maxDateWithOffset = new Date(maxDate.getTime() + 15 * 60 * 1000); // Add 15 minutes.

      return { minDate: minDateWithOffset, maxDate: maxDateWithOffset };
    }

    return { minDate: null, maxDate: null }; // Return null if minDate or maxDate is null.
  }

  const transformStringToDate = (stringDate) => {
    if (typeof stringDate === "string") {
      const parts = stringDate.split(/[- :]/);
      if (parts.length >= 3) {
        const year = parts[2];
        const month = parts[1];
        const day = parts[0];
        const time = parts.slice(3).join(":");
        const isoDateString = `${year}-${month}-${day}T${time}`;
        const parsedDate = new Date(isoDateString);
        return parsedDate;
      } else {
        console.error("Invalid date format:", stringDate);
        return null;
      }
    }
  };

  const handleShowModal = () => {
    console.log("xxxxxxxxxxxxx: ", rowsToEdit);
    const { minDate, maxDate } = getMinMaxDatesWithOffset(rowsToEdit);
    console.log("Fechas minimas y maximas: ", minDate, " and ", maxDate);
    console.log("All meter measures: ", allMeasures?.data);
    const newRows = allMeasures?.data.map((measure) => {
      measure.fecha = new Date(measure.fecha);
      return measure;
    });
    console.log(newRows);
    const filteredRows = newRows?.filter((row) => {
      return row.fecha >= minDate && row.fecha <= maxDate;
    });
    console.log("Filtered rows: ", filteredRows);

    const notEditedRows = filteredRows.filter((row) => {
      for (const editedRow of rowsToEdit) {
        if (
          transformStringToDate(editedRow.fecha).getTime() ===
          row.fecha.getTime()
        ) {
          return false;
        }
      }
      return true;
    });

    const notEditedRowsFormatted = notEditedRows.map((row) => {
      row.fecha = formatDate(row.fecha);
      row.energia_del_mp_new = row.energia_del_mp;
      row.energia_del_mr_new = row.energia_del_mr;
      row.energia_rec_mp_new = row.energia_rec_mp;
      row.energia_rec_mr_new = row.energia_rec_mr;
      row.filaValidadaCompleta = false;
      row.idPrincipal = reportData.medidorPrincipal;
      row.idRespaldo = reportData.medidorRespaldo;
      row.key = null;
      row.tipoMedicion = reportData.tipoMedida;
      const {
        rv_del_mp,
        rv_del_mr,
        rv_rec_mp,
        rv_rec_mr,
        or_del_mp,
        or_del_mr,
        or_rec_mp,
        or_rec_mr,
        ...newRow
      } = row;

      return newRow;
    });

    console.log("Filas no editadas formateadas: ", notEditedRowsFormatted);

    console.log("Filas que no han sido editadas: ", notEditedRows);
    console.log(reportData);
    setRowsForReport([...rowsToEdit, ...notEditedRowsFormatted]);
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
    // Se hara todo el procedimiento que esta dentro de la funcion para realiza asignarle el valor a la variable RowsToEdit
    setRowsToEdit((prevRows) => {
      // Si la clave (key) del elemento "newRow" existe en el arreglo "prevRows" entonces existingRowIndex almacenara el indice
      // en el cual esta almacenado. Si la clave del elemento no existe, entonce findIndex retorna -1
      const existingRowIndex = prevRows.findIndex(
        (row) => row.key === newRow.key
      );

      let updatedRows;
      // En caso de que el elemento exista...
      if (existingRowIndex !== -1) {
        // Se compara si el elemento existente es diferente al valor de newRow
        const isDifferent =
          JSON.stringify(prevRows[existingRowIndex]) !== JSON.stringify(newRow);
        // Si son diferentes entonces se actualiza el elemento existente con los valores de newRow
        // Sino, se deja como estaba
        if (isDifferent) {
          updatedRows = [...prevRows];
          updatedRows[existingRowIndex] = newRow;
        } else {
          updatedRows = prevRows;
        }
      } else {
        // En el caso de que el elemento no exista en "prevRows" entonces se adjunta
        updatedRows = [...prevRows, newRow];
      }

      console.log("Updated rowsToEdit:", updatedRows);
      // rowsToEdit sera este valor retornado por el handleRowChange
      return updatedRows;
    });
  }, []);

  // Esta funcion borra una fila de las filas a modificar, no borra filas del reporte o de la base de datos
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

  const onUpdateMeasures = (nombreReporte) => {
    if (rowsToEdit?.length > 0) {
      rowsToEdit.push(nombreReporte);
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
                handleShowModal();
              }}
              tooltip="Guardar cambios"
            >
              IR A FORMULARIO DE VALIDACION
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
              <ColumnHeader key={energyTag}>{energyTag}</ColumnHeader>
            ))}
            <ButtonArray>
              <Button
                disabled={allMeasuresMutation.isLoading}
                onClick={exportToExcel}
                tooltip="Descargar perfil"
                size="medium"
                variation="primary"
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
              rowkey={`${measuresArray.indexOf(measure)}_${pageNumber}`}
              isEditableRow={
                editableRowKey ==
                `${measuresArray.indexOf(measure)}_${pageNumber}`
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
            rowsToEdit={rowsForReport}
            handleShowModal={handleShowModal}
          ></SubstitutionForm>
        </Modal>
      )}
    </>
  );
}

export default ReportTable;
