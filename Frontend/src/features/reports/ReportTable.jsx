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
import ConfirmationModal from "../../ui/ConfirmationModal";
import useCreateSubstitutionReport from "./useCreateSubstitutionReport";
import PropTypes from "prop-types";

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [reportInformation, setReportInformation] = useState(null);
  const { isCreating, createSubstitutionReport } =
    useCreateSubstitutionReport();
  const { isUpdating, updateMeasures } = useUpdateMeasures(
    pageNumber,
    reportData
  );
  const [showToast, setShowToast] = useState({ type: null, message: null });
  const [rowsForReport, setRowsForReport] = useState([]);

  const handleReportInformation = (info) => {
    setReportInformation(info);
  };

  const handleShowConfirmationModal = () => {
    setShowConfirmationModal((show) => !show);
  };

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

  // function getMinMaxDatesWithOffset(objects) {
  //   if (!objects || objects.length === 0) {
  //     return { minDate: null, maxDate: null };
  //   }

  //   let minDate = new Date(8640000000000000);
  //   let maxDate = new Date(-8640000000000000);

  //   for (const obj of objects) {
  //     if (typeof obj.fecha === "string") {
  //       const parts = obj.fecha.split(/[- :]/);
  //       if (parts.length >= 3) {
  //         const year = parts[2];
  //         const month = parts[1];
  //         const day = parts[0];
  //         const time = parts.slice(3).join(":");
  //         const isoDateString = `${year}-${month}-${day}T${time}`;
  //         const parsedDate = new Date(isoDateString);

  //         if (!isNaN(parsedDate)) {
  //           minDate = parsedDate < minDate ? parsedDate : minDate;
  //           maxDate = parsedDate > maxDate ? parsedDate : maxDate;
  //         } else {
  //           console.error("Invalid date after conversion:", obj.fecha);
  //         }
  //       } else {
  //         console.error("Invalid date format:", obj.fecha);
  //       }
  //     } else if (obj.fecha instanceof Date) {
  //       minDate = obj.fecha < minDate ? obj.fecha : minDate;
  //       maxDate = obj.fecha > maxDate ? obj.fecha : maxDate;
  //     } else {
  //       console.error("Invalid fecha type", obj.fecha);
  //     }
  //   }

  //   // Apply 15-minute offset.
  //   if (minDate && maxDate) {
  //     const minDateWithOffset = new Date(minDate.getTime() - 15 * 60 * 1000); // Subtract 15 minutes.
  //     const maxDateWithOffset = new Date(maxDate.getTime() + 15 * 60 * 1000); // Add 15 minutes.

  //     return { minDate: minDateWithOffset, maxDate: maxDateWithOffset };
  //   }

  //   return { minDate: null, maxDate: null }; // Return null if minDate or maxDate is null.
  // }

  const transformStringToDate = (stringDate) => {
    if (!stringDate) return null;

    // If it's already in ISO format
    if (stringDate.includes("T") && stringDate.endsWith("Z")) {
      const date = new Date(stringDate);
      return isNaN(date.getTime()) ? null : date;
    }

    // Handle 'DD-MM-YYYY HH:mm' format
    if (typeof stringDate === "string") {
      const parts = stringDate.split(/[- :]/);
      if (parts.length >= 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const time = parts.length > 3 ? parts.slice(3).join(":") : "00:00";
        const isoDateString = `${year}-${month}-${day}T${time}`;
        const parsedDate = new Date(isoDateString);

        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date after conversion:", stringDate);
          return null;
        }
        return parsedDate;
      }
    }

    console.error("Unrecognized date format:", stringDate);
    return null;
  };

  const handleShowModal = () => {
    console.log("Rows to edit before processing: ", rowsToEdit);

    // Ensure we have valid rows to edit
    if (!rowsToEdit || rowsToEdit.length === 0) {
      toast.error("No hay filas seleccionadas para editar");
      return;
    }

    // Get min and max dates from edited rows
    const editedDates = rowsToEdit
      .map((row) => transformStringToDate(row.fecha))
      .filter(Boolean);
    if (editedDates.length === 0) {
      toast.error("No se pudieron determinar las fechas de los datos");
      return;
    }

    // Sort edited dates to find the range
    editedDates.sort((a, b) => a - b);
    const minEditedDate = editedDates[0];
    const maxEditedDate = editedDates[editedDates.length - 1];

    // Create a deep copy of all measures data to avoid mutation
    const allMeasuresCopy = JSON.parse(JSON.stringify(allMeasures?.data || []));

    // Convert all measures to Date objects and keep original format
    const allMeasuresWithDates = allMeasuresCopy
      .map((measure) => {
        const measureDate = transformStringToDate(measure.fecha);
        return {
          ...measure,
          fecha: measureDate,
          originalFecha: measure.fecha, // Keep original string format
        };
      })
      .filter((measure) => measure.fecha); // Filter out invalid dates

    // Sort all measures by date
    allMeasuresWithDates.sort((a, b) => a.fecha - b.fecha);

    // Find indices of min and max edited dates in the full dataset
    const minIndex = allMeasuresWithDates.findIndex(
      (row) => row.fecha.getTime() === minEditedDate.getTime()
    );
    const maxIndex = allMeasuresWithDates.findIndex(
      (row) => row.fecha.getTime() === maxEditedDate.getTime()
    );

    // Calculate extended range indices (one before and one after)
    const startIndex = Math.max(0, minIndex - 1);
    const endIndex = Math.min(allMeasuresWithDates.length - 1, maxIndex + 1);

    // Get the extended range of rows
    const filteredRows = allMeasuresWithDates.slice(startIndex, endIndex + 1);

    console.log("Filtered rows: ", filteredRows);

    // Identify rows that haven't been edited
    const notEditedRows = filteredRows.filter((row) => {
      return !rowsToEdit.some((editedRow) => {
        const editedDate = transformStringToDate(editedRow.fecha);
        return editedDate && editedDate.getTime() === row.fecha.getTime();
      });
    });

    // Format unedited rows to match edited row structure
    const notEditedRowsFormatted = notEditedRows.map((row) => {
      // Convert the date back to the original format (DD-MM-YYYY HH:mm)
      let formattedDate;
      if (row.originalFecha.includes("T")) {
        // Handle ISO format dates
        const date = new Date(row.originalFecha);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;
      } else {
        formattedDate = row.originalFecha;
      }

      return {
        ...row,
        fecha: formattedDate, // Use the properly formatted date string
        energia_del_mp_new: row.energia_del_mp?.toString() || "0.0000",
        energia_del_mr_new: row.energia_del_mr?.toString() || "0.0000",
        energia_rec_mp_new: row.energia_rec_mp?.toString() || "0.0000",
        energia_rec_mr_new: row.energia_rec_mr?.toString() || "0.0000",
        filaValidadaCompleta: false,
        idPrincipal: reportData.medidorPrincipal,
        idRespaldo: reportData.medidorRespaldo,
        key: null,
        tipoMedicion: reportData.tipoMedida,
      };
    });

    // Combine edited and unedited rows
    const combinedRows = [...rowsToEdit, ...notEditedRowsFormatted];

    // Sort by date to ensure proper ordering
    combinedRows.sort((a, b) => {
      const dateA = transformStringToDate(a.fecha);
      const dateB = transformStringToDate(b.fecha);
      return dateA - dateB;
    });

    console.log("Final rows for PDF report:", combinedRows);
    setRowsForReport(combinedRows);
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
              size="medium"
              variation="secondary"
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
            handleReportInformation={handleReportInformation}
            handleShowConfirmationModal={handleShowConfirmationModal}
          ></SubstitutionForm>
        </Modal>
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={() => {
            console.log("Report information: ", reportInformation.entries());
            createSubstitutionReport(reportInformation);
            onUpdateMeasures(reportInformation.get("nombreReporte"));
            setShowConfirmationModal(false);
            setShowModal(false);
          }}
          confirmationText="¿Deseas guardar el reporte?"
          isLoading={isCreating}
          
        />
      )}
    </>
  );
}
ReportTable.propTypes = {
  reportData: PropTypes.shape({
    medidorPrincipal: PropTypes.any,
    medidorRespaldo: PropTypes.any,
    tipoMedida: PropTypes.any,
    puntoMedicion: PropTypes.any,
  }).isRequired,
  energyTags: PropTypes.array,
  tipoMedicion: PropTypes.any,
};

export default ReportTable;
