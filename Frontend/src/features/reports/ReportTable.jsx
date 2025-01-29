import styled from "styled-components";
import { useMutation, useQuery } from "@tanstack/react-query";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { FaDownload } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { getMeasures } from "../../services/getRequests";
import ButtonArray from "../../ui/ButtonArray";
import MeasureRow from "./MeasureRow";
import { useState } from "react";
import PaginationWrapper from "../../ui/PaginationWrapper";
import { useCallback } from "react";
import useUpdateMeasures from "./useUpdateMeasures";
import Modal from "../../ui/Modal";
import SubstitutionForm from "./SubstitutionForm";
import Heading from "../../ui/Heading";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/dateFunctions";
import TableSkeleton from "../../ui/TableSkeleton";
import { useRef } from "react";
import ExcelJS from "exceljs";

export const Table = styled.div`
  border: 1px solid var(--color-grey-200);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: 7px;
  overflow: hidden;
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
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Esta funcion extrae todos los datos que se van a descargar en el archivo de Excel
  const allMeasuresMutation = useMutation({
    mutationFn: () => getMeasures(reportData, -1),
    onSuccess: async (data) => {
      console.log("All inside the onSuccess callback: ", data?.data);

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Measures");

      // Load an image from the public folder
      const imageBuffer = await fetch("/CND-LOGO.png").then((res) =>
        res.arrayBuffer()
      );

      // Add the image to the workbook
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });

      // Position the image in the worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left corner
        br: { col: 2, row: 3 }, // Bottom-right corner (spans first two columns and three rows)
        ext: {
          width: 120,
          height: 60,
        }, // Size of the image
      });

      // Merge cells from A1 to B3
      worksheet.mergeCells("A1:B3");
      // Merge cells from C1 to E3
      worksheet.mergeCells("C1:E1");
      worksheet.mergeCells("C2:E2");
      worksheet.mergeCells("C3:E3");

      // Define columns
      worksheet.columns = [
        { header: "FECHA", key: "fecha", width: 15 },
        { header: energyTags[0], key: "eag_mp", width: 18 },
        { header: energyTags[1], key: "eac_mp", width: 18 },
        { header: energyTags[2], key: "eag_mr", width: 18 },
        { header: energyTags[3], key: "eac_mr", width: 18 },
      ];

      // Add headers to the 4th row
      const headerRow = worksheet.getRow(4);
      worksheet.columns.forEach((column, index) => {
        headerRow.getCell(index + 1).value = column.header;
      });

      // Add rows starting from the 5th row
      data?.data.forEach((measure, rowIndex) => {
        const row = worksheet.getRow(rowIndex + 5); // Start from the 5th row
        row.getCell(1).value = formatDate(measure.fecha);
        row.getCell(2).value = measure.energia_del_mp;
        row.getCell(3).value = measure.energia_rec_mp;
        row.getCell(4).value = measure.energia_del_mr;
        row.getCell(5).value = measure.energia_rec_mr;
      });

      // Apply styles to the header row (4th row)
      headerRow.font = { bold: true, size: 12 }; // Bold header row
      headerRow.height = 25;
      headerRow.alignment = {
        vertical: "center",
        horizontal: "center",
      };
      headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (cell.value) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "5fd0df" },
          };
        }
      });
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Ensure merged cells are empty
      worksheet.getCell("A1").value = "";
      worksheet.getCell("C1").value = "";

      worksheet.getCell("C1").value = `${reportData?.nombrePuntoMedicion}`;
      worksheet.getCell("C2").value = `Fecha inicial: ${formatDate(
        reportData?.fechaInicial
      )}`;
      worksheet.getCell("C3").value = `Fecha final: ${formatDate(
        reportData?.fechaFinal
      )}`;

      worksheet.getCell("C1").font = {
        size: 13,
        bold: true,
        color: { argb: "f29100" },
      };
      worksheet.getCell("C2").font = { size: 9 };
      worksheet.getCell("C3").font = { size: 9 };

      worksheet.getCell("C1").alignment = {
        vertical: "center",
        horizontal: "center",
      };
      worksheet.getCell("C2").alignment = {
        vertical: "center",
        horizontal: "center",
      };
      worksheet.getCell("C3").alignment = {
        vertical: "center",
        horizontal: "center",
      };

      // Generate buffer and create a downloadable link
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Measures.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
  });

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

  console.log(reportData);
  console.log("Datos extraidos: ", measuresArray);

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
