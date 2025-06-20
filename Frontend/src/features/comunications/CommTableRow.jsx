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
import EmptyDataSet from "../../ui/EmptyDataSet";
import ConfirmationModal from "../../ui/ConfirmationModal";

import { getTimeDifference } from "../../utils/dateFunctions";

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 1.5fr 1fr 1fr 1fr 1fr 1fr 0.35fr;
  column-gap: 2.4rem;
  align-items: center;
  padding: 1.4rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const Column = styled.div`
  font-family: "Sono";
  font-weight: 500;
  --color: var(--color-green-700);
`;

const CommStatusColor = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-style: bold;
  background-color: ${(props) =>
    props.status === 1 ? "var(--color-brand-500)" : "var(--color-red-500)"};
`;

function CommTableRow({ meterCommStatusRow }) {
  const { userData } = useUser();
  const {
    description,
    tipo,
    ip,
    estadoCom,
    fechaUltimoIntentoCom,
    fechaPrimerIntentoIncorrecto,
  } = meterCommStatusRow;

  const tiempoSinComunicacion = getTimeDifference(
    fechaUltimoIntentoCom,
    fechaPrimerIntentoIncorrecto
  );

  console.log("Fecha ultimo intento: ", fechaUltimoIntentoCom);
  console.log(
    "Fehca primer intento incorrecto: ",
    fechaPrimerIntentoIncorrecto
  );
  console.log("Diferencia de tiempo: ", tiempoSinComunicacion);

  console.log("Substitution Report Row Data:", meterCommStatusRow);

  return (
    <>
      <TableRow role="row">
        <Column></Column>
        <Column>{description}</Column>
        <Column>{tipo}</Column>
        <Column>{ip}</Column>
        <Column>
          <CommStatusColor status={estadoCom}>
            {estadoCom === 1 ? "Conectado" : "Desconectado"}
          </CommStatusColor>
        </Column>
        <Column>{formatDate(fechaUltimoIntentoCom)}</Column>
        <Column>{tiempoSinComunicacion}</Column>
      </TableRow>
    </>
  );
}

CommTableRow.propTypes = {
  meterCommStatusRow: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string.isRequired,
    tipo: PropTypes.string,
    ip: PropTypes.string,
    estadoCom: PropTypes.number,
    fechaUltimoIntentoCom: PropTypes.string,
    fechaPrimerIntentoIncorrecto: PropTypes.string,
  }).isRequired,
};

export default CommTableRow;
