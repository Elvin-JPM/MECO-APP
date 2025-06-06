import styled from "styled-components";
import { useRef, useState, useEffect } from "react";
import Button from "../../ui/Button";
import "jspdf-autotable";
import { ImCancelCircle } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { LuUndo } from "react-icons/lu";
import { IoCheckbox } from "react-icons/io5";
import ButtonArray from "../../ui/ButtonArray";
import { formatDate } from "../../utils/dateFunctions";
import { useUser } from "../authentication/UserProvider";
import "../../styles/loading.css";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import Modal from "../../ui/Modal";
import Heading from "../../ui/Heading";
import { useQuery } from "@tanstack/react-query";
import { getReport } from "../../services/getRequests";
import Spinner from "../../ui/Spinner";
import CreatePdfReport from "./CreatePdfReport";
import EditSubstitutionForm from "./EditSubstitutionForm";

// Styled components
const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 0.4fr;
  column-gap: 2.4rem;
  align-items: center;
  padding: 1.4rem 2.4rem;
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const Column = styled.div.attrs((props) => ({
  contentEditable: props.contentEditable,
}))`
  font-family: "Sono";
  font-weight: 500;
  background-color: ${({ contentEditable, modifiedrows, rowkey, activerow }) =>
    contentEditable
      ? "var(--color-grey-50)"
      : Array.isArray(modifiedrows) &&
        modifiedrows.includes(rowkey) &&
        rowkey !== activerow
      ? "var(--color-grey-100)"
      : "transparent"};
  padding: ${({ contentEditable, modifiedrows, rowkey }) =>
    contentEditable ||
    (Array.isArray(modifiedrows) && modifiedrows.includes(rowkey))
      ? "0.6rem"
      : 0};
  border: ${({ contentEditable, modifiedrows, rowkey }) =>
    contentEditable ||
    (Array.isArray(modifiedrows) && modifiedrows.includes(rowkey))
      ? "1px dashed var(--color-grey-300)"
      : 0};
  border-radius: 8px;
  box-shadow: ${({ contentEditable }) =>
    contentEditable ? "1px 1px 3px 1px var(--color-grey-300)" : "none"};
  cursor: ${({ contentEditable }) => (contentEditable ? "text" : "default")};
  color: ${({ contentEditable }) =>
    contentEditable ? "var(--color-brand-700)" : "inherit"};
  transition: background-color 0.3s ease, box-shadow 0.3s ease,
    padding 0.3s ease;
  caret-color: var(--color-institucional-amarillo);
  &:focus {
    outline: none;
  }
`;

// Inline styles for different statuses
const viStyle = {
  padding: "5px 3px",
  backgroundColor: "var(--color-red-300)",
  color: "var(--color-red-900)",
  fontStyle: "italic",
  border: "1px solid var(--color-red-400)",
  textAlign: "center",
};

const vsStyle = {
  padding: "0.4rem 0.3rem",
  backgroundColor: "var(--color-brand-400)",
  color: "var(--color-brand-950)",
};

const formatEnergy = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);

export default function MeasureRow({
  handleRowChange,
  handleIsEditableRow,
  handleDeleteRow,
  measure,
  reportData,
  isEditableRow,
  tipoMedicion,
  rowkey,
  modifiedrows,
  activerow,
}) {
  const [validating, setValidating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false);
  const [fetchReportPDF, setFetchReportPDF] = useState(false);
  const { userData } = useUser();

  // Consolidated refs
  const refs = {
    fechaRef: useRef(null),
    energiaDelMpRef: useRef(null),
    energiaRecMpRef: useRef(null),
    energiaDelMrRef: useRef(null),
    energiaRecMrRef: useRef(null),
  };

  const {
    fecha,
    or_del_mp,
    energia_del_mp,
    or_rec_mp,
    energia_rec_mp,
    or_del_mr,
    energia_del_mr,
    or_rec_mr,
    energia_rec_mr,
  } = measure || {};

  const reportName =
    measure?.rv_del_mp ||
    measure?.rv_rec_mp ||
    measure?.rv_del_mr ||
    measure?.rv_rec_mr ||
    null;

  console.log("Report Name: ", reportName);

  const { isLoading: isLoadingReport, data: retrievedPdfData } = useQuery({
    queryKey: ["retrievedPdfData", reportName],
    queryFn: () => getReport(reportName),
    enabled: !!reportName,
  });

  // useEffect(() => {
  //   if (reportPDF?.data[0]?.validacion_pdf) {
  //     const pdfData = atob(reportPDF.data[0].validacion_pdf);
  //     const byteArray = new Uint8Array(
  //       Array.from(pdfData, (char) => char.charCodeAt(0))
  //     );
  //     const blob = new Blob([byteArray], { type: "application/pdf" });
  //     const url = URL.createObjectURL(blob);
  //     // Store URL in ref and state
  //     setFetchReportPDF(false);
  //     setPdfUrl(url);
  //   }
  // }, [reportPDF]);

  // const [pdfUrl, setPdfUrl] = useState(null);

  // Helper to decide style based on status and validating
  const getStyle = (status) =>
    status === "VS"
      ? vsStyle
      : status === "VI" && !validating
      ? viStyle
      : validating;

  // Sanitizes contentEditable input and collects updated values
  const handleEditableDivInput = (e) => {
    if (e.target.isContentEditable) {
      const sanitized = e.target.innerText.replace(/[^0-9.]/g, "");
      if (e.target.innerText !== sanitized) {
        e.target.innerText = sanitized;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(e.target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    const updatedValues = {
      fecha: refs.fechaRef.current?.innerText,
      energia_del_mp_new: refs.energiaDelMpRef.current?.innerText,
      energia_rec_mp_new: refs.energiaRecMpRef.current?.innerText,
      energia_del_mr_new: refs.energiaDelMrRef.current?.innerText,
      energia_rec_mr_new: refs.energiaRecMrRef.current?.innerText,
      key: rowkey,
      idPrincipal: reportData.medidorPrincipal,
      idRespaldo: reportData.medidorRespaldo,
      tipoMedicion,
      energia_del_mp: Number(energia_del_mp).toFixed(4),
      energia_rec_mp: Number(energia_rec_mp).toFixed(4),
      energia_del_mr: Number(energia_del_mr).toFixed(4),
      energia_rec_mr: Number(energia_rec_mr).toFixed(4),
      filaValidadaCompleta: e.currentTarget.value === "Validar",
    };
    console.log("Updated Values:", updatedValues);
    if (
      updatedValues.fecha !== fecha ||
      updatedValues.energia_del_mp_new !== energia_del_mp ||
      updatedValues.energia_rec_mp_new !== energia_rec_mp ||
      updatedValues.energia_del_mr_new !== energia_del_mr ||
      updatedValues.energia_rec_mr_new !== energia_rec_mr
    ) {
      handleRowChange(updatedValues);
    }
    if (e.currentTarget.value === "Validar") {
      setValidating({
        backgroundColor: "var(--color-grey-50)",
        color: "var(--color-brand-900)",
        fontStyle: "italic",
        border: "1px dashed var(--color-grey-200)",
        padding: "0.6rem",
        boxShadow: "1px 1px 3px 1px var(--color-grey-300)",
        transition:
          "background-color 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease",
      });
      toast.success("Fila validada correctamente");
    }
    if (e.currentTarget.value === "Cancelar") {
      handleDeleteRow(rowkey);
      setValidating(null);
    }
  };

  // Handles toggling edit mode and resetting values if cancelled
  const handleEditRow = (buttonValue) => {
    if (buttonValue === "Cancelar") {
      const mapping = {
        energiaActivaIntervalo: {
          energiaDelMpRef: formatEnergy(energia_del_mp),
          energiaRecMpRef: formatEnergy(energia_rec_mp),
          energiaDelMrRef: formatEnergy(energia_del_mr),
          energiaRecMrRef: formatEnergy(energia_rec_mr),
        },
        energiaActivaAcumulada: {
          energiaDelMpRef: formatEnergy(energia_del_mp),
          energiaRecMpRef: formatEnergy(energia_rec_mp),
          energiaDelMrRef: formatEnergy(energia_del_mr),
          energiaRecMrRef: formatEnergy(energia_rec_mr),
        },
        energiaReactivaAcumulada: {
          energiaDelMpRef: formatEnergy(energia_del_mp),
          energiaRecMpRef: formatEnergy(energia_rec_mp),
          energiaDelMrRef: formatEnergy(energia_del_mr),
          energiaRecMrRef: formatEnergy(energia_rec_mr),
        },
        default: {
          energiaDelMpRef: formatEnergy(energia_del_mp),
          energiaRecMpRef: formatEnergy(energia_rec_mp),
          energiaDelMrRef: formatEnergy(energia_del_mr),
          energiaRecMrRef: formatEnergy(energia_rec_mr),
        },
      };
      const selectedMapping = mapping[tipoMedicion] || mapping.default;
      Object.entries(selectedMapping).forEach(([refKey, value]) => {
        if (refs[refKey]?.current) {
          refs[refKey].current.innerText = value;
        }
      });
    }
    handleIsEditableRow(!isEditableRow, rowkey, buttonValue);
  };

  const handleOpenReport = () => {
    // if (!reportPDF?.data[0]?.validacion_pdf) {
    //   toast.error("El informe aún se está cargando. Por favor, espera.");
    //   return;
    // }
    // const pdfData = atob(reportPDF.data[0].validacion_pdf);
    // const byteArray = new Uint8Array(
    //   Array.from(pdfData, (char) => char.charCodeAt(0))
    // );
    // const blob = new Blob([byteArray], { type: "application/pdf" });
    // window.open(URL.createObjectURL(blob), "_blank");
    console.log("Report pdf to check: ", retrievedPdfData);
    setShowReportModal(true);
  };

  if (!measure) {
    return (
      <TableRow role="row" className="loading-row">
        {Array(30)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="loading-cell"></div>
          ))}
      </TableRow>
    );
  }

  return (
    <>
      <TableRow role="row">
        <Column ref={refs.fechaRef} onInput={handleEditableDivInput}>
          {formatDate(fecha)}
        </Column>
        <Column
          ref={refs.energiaDelMpRef}
          contentEditable={isEditableRow}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          onInput={handleEditableDivInput}
          style={getStyle(or_del_mp, validating)}
        >
          {formatEnergy(energia_del_mp)}
        </Column>
        <Column
          ref={refs.energiaRecMpRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={getStyle(or_rec_mp, validating)}
        >
          {formatEnergy(energia_rec_mp)}
        </Column>
        <Column
          ref={refs.energiaDelMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={getStyle(or_del_mr, validating)}
        >
          {formatEnergy(energia_del_mr)}
        </Column>
        <Column
          ref={refs.energiaRecMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={getStyle(or_rec_mr, validating)}
        >
          {formatEnergy(energia_rec_mr)}
        </Column>
        <Column>
          {userData.departmentId === 18 && (
            <ButtonArray>
              <Button
                onClick={() =>
                  handleEditRow(isEditableRow ? "Cancelar" : "Editar")
                }
                variation="check"
                size="small"
                color={!isEditableRow ? "basic" : "cancel"}
                tooltip={!isEditableRow ? "Editar" : "Cancelar"}
              >
                {isEditableRow ? <ImCancelCircle /> : <MdEdit />}
              </Button>
              {(or_del_mp === "VI" ||
                or_rec_mp === "VI" ||
                or_del_mr === "VI" ||
                or_rec_mr === "VI") && (
                <Button
                  variation="check"
                  size="small"
                  color={validating ? "cancel" : "check"}
                  tooltip={validating ? "Revertir validación" : "Validar fila"}
                  onClick={handleEditableDivInput}
                  value={validating ? "Cancelar" : "Validar"}
                >
                  {validating ? <LuUndo /> : <IoCheckbox />}
                </Button>
              )}
              {(or_del_mp === "VS" ||
                or_rec_mp === "VS" ||
                or_del_mr === "VS" ||
                or_rec_mr === "VS") && (
                <Button
                  variation="check"
                  size="small"
                  color="basic"
                  tooltip="Ver reporte"
                  onClick={handleOpenReport}
                >
                  <FaEye />
                </Button>
              )}
            </ButtonArray>
          )}
        </Column>
      </TableRow>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <Heading as="h2">Reporte de Validación y Sustitución</Heading>
        </Modal>
      )}
      {showReportModal && (
        <Modal onClose={() => setShowReportModal(false)}>
          {isLoadingReport ? (
            <Spinner />
          ) : (
            <>
              <Heading as="h2">Reporte de Validación y Sustitución</Heading>
              {userData?.departmentId === 18 && (
                <Button
                  variation="primary"
                  size="medium"
                  onClick={() => setShowEditFormModal(true)}
                >
                  Editar Reporte
                </Button>
              )}
              <CreatePdfReport
                formData={retrievedPdfData[0]}
                rowsToEdit={retrievedPdfData[0].filas_editadas}
              />
            </>
          )}
        </Modal>
      )}
      {showEditFormModal && (
        <Modal onClose={() => setShowEditFormModal(false)}>
          {isLoadingReport ? (
            <Spinner />
          ) : (
            <>
              <Heading as="h2">Formulario de edición de reporte</Heading>
              <EditSubstitutionForm
                retrievedPdfData={retrievedPdfData[0]}
                handleShowModal={setShowEditFormModal}
              />
            </>
          )}
        </Modal>
      )}
    </>
  );
}

MeasureRow.propTypes = {
  measure: PropTypes.object,
  onInsertRow: PropTypes.func,
  handleRowChange: PropTypes.func,
  reportData: PropTypes.object,
  handleIsEditableRow: PropTypes.func,
  isEditableRow: PropTypes.bool,
  tipoMedicion: PropTypes.string,
  rowkey: PropTypes.number,
  modifiedrows: PropTypes.array,
  activerow: PropTypes.string,
  isLoading: PropTypes.bool,
};
