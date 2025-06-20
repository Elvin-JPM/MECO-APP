import styled from "styled-components";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "../../ui/Button";
import { MdEdit } from "react-icons/md";
import Modal from "../../ui/Modal";
import { FaPlus } from "react-icons/fa6";
import ButtonArray from "../../ui/ButtonArray";
import { useUser } from "../authentication/UserProvider";
import { formatDate } from "../../utils/dateFunctions";
import { HiDocumentText } from "react-icons/hi";
import { BiSolidFilePdf } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import CreatePdfReport from "../reports/CreatePdfReport";
import useApproveReport from "./useApproveReport";
import EmptyDataSet from "../../ui/EmptyDataSet";
import ConfirmationModal from "../../ui/ConfirmationModal";
import useDeleteReport from "./useDeleteReport";

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 1fr 1.3fr 1fr 1fr 1fr 0.35fr;
  column-gap: 2.4rem;
  align-items: center;
  padding: 1.4rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const Img = styled.img`
  display: block;
  width: 3rem;
  aspect-ratio: 3/2;
  object-fit: cover;
  object-position: center;
  transform: scale(1.5) translateX(-7px);
`;

const Column = styled.div`
  font-family: "Sono";
  font-weight: 500;
  --color: var(--color-green-700);
`;

const PdfIcon = styled(BiSolidFilePdf)`
  font-size: 4.6rem;
  color: ${(props) => props.$color || "var(--color-grey-600)"};
`;

function SubstitutionReportRow({
  reportRow,
  iconColor = "var(--color-grey-600)",
  tipo,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showPdfReport, setShowPdfReport] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [approve, setApprove] = useState(false);
  const [deleteReport, setDeleteReport] = useState(false);
  const { isApproving, approveReport } = useApproveReport();
  const { isDeleting, deleteReport: deleteReportMutation } = useDeleteReport();
  const { userData } = useUser();
  const {
    nombreReporte,
    nombreCentral,
    fechaCreacion,
    fechaActualizacion,
    validadoPor,
  } = reportRow;

  console.log("Substitution Report Row Data:", reportRow);
  function handleShowPdf() {
    setShowPdfReport((show) => !show);
  }

  // Se ejecuta cuando se aprueba el reporte
  useEffect(() => {
    if (approve) {
      // Logic to handle report approval
      console.log("Report approved:", reportRow);
      approveReport(reportRow.id);
      setApprove(false); // Reset approval state
    }
  }, [approve, approveReport, reportRow]);

  // Se ejecuta cuando se elimina el reporte
  useEffect(() => {
    if (deleteReport) {
      // Logic to handle report deletion
      console.log("Report deleted:", reportRow);
      deleteReportMutation(reportRow.id);
      setDeleteReport(false); // Reset deletion state
    }
  }, [deleteReport, deleteReportMutation, reportRow]);

  return (
    <>
      <TableRow role="row">
        {/* <Img
          src={foto ? `data:image/jpeg;base64,${foto}` : "../../ION_8650.jpg"}
        ></Img> */}
        <PdfIcon $color={iconColor} />
        <Column>{nombreReporte}</Column>
        <Column>{nombreCentral}</Column>
        <Column>{formatDate(fechaCreacion)}</Column>
        <Column>
          {fechaActualizacion ? formatDate(fechaActualizacion) : "No editado"}
        </Column>
        <Column>{validadoPor}</Column>
        {userData?.departmentId === 18 ? (
          <ButtonArray>
            <Button onClick={handleShowPdf} variation="primary" size="medium">
              <FaEye />
            </Button>
          </ButtonArray>
        ) : (
          ""
        )}
      </TableRow>
      {showPdfReport && (
        <Modal
          title="Reporte de Sustitución"
          onClose={handleShowPdf}
          show={showPdfReport}
        >
          <h2>{nombreReporte}</h2>
          <p>Central: {nombreCentral}</p>
          <p>Fecha de creación: {formatDate(fechaCreacion)}</p>
          <p>
            Fecha de actualización:{" "}
            {fechaActualizacion ? formatDate(fechaActualizacion) : "No editado"}
          </p>
          <p>Validado por: {validadoPor}</p>
          {reportRow.filas_editadas !== null &&
            (userData.username === "CPADILLA" ||
              userData.username === "EPOSADAS") &&
            (tipo === "unchecked" ? (
              <>
                <ButtonArray>
                  <Button
                    variation="primary"
                    size="medium"
                    onClick={() => setShowConfirmationModal(true)}
                  >
                    Aprobar Reporte
                  </Button>
                  <Button
                    variation="danger"
                    size="medium"
                    onClick={() => setShowDeleteConfirmationModal(true)}
                  >
                    Borrar Reporte
                  </Button>
                </ButtonArray>
              </>
            ) : (
              <Button
                variation="danger"
                size="medium"
                onClick={() => setShowDeleteConfirmationModal(true)}
              >
                Borrar Reporte
              </Button>
            ))}
          {reportRow.filas_editadas === null ? (
            <EmptyDataSet>
              No hay datos para mostrar en el reporte.
            </EmptyDataSet>
          ) : (
            <CreatePdfReport
              formData={reportRow}
              rowsToEdit={reportRow.filas_editadas || []}
              getPdfFile={() => {}}
            />
          )}
        </Modal>
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={() => {
            setApprove(true);
            setShowConfirmationModal(false);
            setShowPdfReport(false);
          }}
          confirmationText="¿Estás seguro de que deseas aprobar este reporte?"
        />
      )}
      {showDeleteConfirmationModal && (
        <ConfirmationModal
          onClose={() => setShowDeleteConfirmationModal(false)}
          onConfirm={() => {
            // Logic to delete the report
            setDeleteReport(true);
            console.log("Report deleted:", reportRow);
            setShowDeleteConfirmationModal(false);
            setShowPdfReport(false);
            
          }}
          confirmText="Borrar Reporte"
          confirmationType="delete"
          confirmationText="¿Estás seguro de que deseas eliminar este reporte?"
        />
      )}
    </>
  );
}
SubstitutionReportRow.propTypes = {
  reportRow: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombreReporte: PropTypes.string,
    nombreCentral: PropTypes.string,
    fechaCreacion: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    fechaActualizacion: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    validadoPor: PropTypes.string,
    filas_editadas: PropTypes.any,
  }).isRequired,
};

export default SubstitutionReportRow;
