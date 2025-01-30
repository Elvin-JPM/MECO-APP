import styled from "styled-components";
import { useRef, useState } from "react";
import Button from "../../ui/Button";

import { MdEdit } from "react-icons/md";
import { IoCheckbox } from "react-icons/io5";
import ButtonArray from "../../ui/ButtonArray";
import { formatDate } from "../../utils/dateFunctions";
import { useUser } from "../authentication/UserProvider";
import "../../styles/loading.css";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 0.3fr;
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
  background-color: ${(props) =>
    props.contentEditable
      ? "var(--color-brand-50)"
      : Array.isArray(props.modifiedrows) &&
        props.modifiedrows.includes(props.rowkey) &&
        props.rowkey !== props.activerow
      ? "var(--color-red-100)"
      : "transparent"};
  padding: ${(props) =>
    props.contentEditable ||
    (Array.isArray(props.modifiedrows) &&
      props.modifiedrows.includes(props.rowkey))
      ? "0.6rem"
      : 0};
  border-radius: 8px;
  /* border-radius: ${(props) =>
    props.contentEditable ||
    (Array.isArray(props.modifiedrows) &&
      props.modifiedrows.includes(props.rowkey))
      ? "8px"
      : "8px"}; */
  box-shadow: ${(props) =>
    props.contentEditable ? "0 0 3px 1px var(--color-brand-700)" : "none"};
  cursor: ${(props) => (props.contentEditable ? "text" : "default")};
  color: ${(props) =>
    props.contentEditable ? "var(--color-brand-900)" : "inherit"};
  transition: background-color 0.3s ease, box-shadow 0.3s ease,
    padding 0.3s ease;

  &:focus {
    outline-color: var(--color-brand-700);
  }
`;

// Estilo de los valores que han sido insertados por el sistema, pero que aun no han sido editados por el usuario
const viStyle = {
  padding: "5px 3px",
  backgroundColor: "var(--color-red-50)",
  color: "var(--color-red-600)",
  fontStyle: "italic",
};

// Estilo de los valores que han sido insertados por el sistema, pero que aun no han sido editados por el usuario
const vsStyle = {
  padding: "4px 1px",
  backgroundColor: "var(--color-green-100)",
  color: "var(--color-green-700)",
};

export default function MeasureRow({
  handleRowChange,
  handleIsEditableRow,
  measure,
  reportData,
  isEditableRow,
  tipoMedicion,
  rowkey,
  modifiedrows,
  activerow,
}) {
  const { userData } = useUser();
  // Referencias a los inputs
  const fechaRef = useRef(null);
  const energiaDelMpRef = useRef(null);
  const energiaRecMpRef = useRef(null);
  const energiaDelMrRef = useRef(null);
  const energiaRecMrRef = useRef(null);

  if (!measure) {
    return (
      <TableRow role="row" className="loading-row">
        <div className="loading-cell"></div>
        <div className="loading-cell"></div>
        <div className="loading-cell"></div>
        <div className="loading-cell"></div>
        <div className="loading-cell"></div>
      </TableRow>
    );
  }

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
  } = measure;

  // Funcion para actualizar los valores que van cambiando en los inputs cuando son editables
  // La actualizacion se realiza mediante useRef a cada valor de energia
  const handleEditableDivInput = (e) => {
    // Check if the event is triggered from a contentEditable element
    if (e && e.target && e.target.isContentEditable) {
      const currentText = e.target.innerText;

      // Filter out non-numeric characters
      const numericText = currentText.replace(/[^0-9.]/g, ""); // Allows numbers and decimals

      // Update the content if it doesn't match the sanitized input
      if (currentText !== numericText) {
        e.target.innerText = numericText;

        // Reset the caret position to the end of the content
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(e.target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    // Collect values from each ref
    const updatedValues = {
      fecha: fechaRef.current?.innerText,
      energia_del_mp_new: energiaDelMpRef.current?.innerText, // Se convierte a numero para
      energia_rec_mp_new: energiaRecMpRef.current?.innerText, // poder compararlos con los
      energia_del_mr_new: energiaDelMrRef.current?.innerText, // valores originales en el backend
      energia_rec_mr_new: energiaRecMrRef.current?.innerText,
      key: rowkey,
      idPrincipal: reportData.medidorPrincipal,
      idRespaldo: reportData.medidorRespaldo,
      tipoMedicion,
      energia_del_mp: Number(energia_del_mp).toFixed(4), // Se usan con cuatro cifras decimales
      energia_rec_mp: Number(energia_rec_mp).toFixed(4), // Ya que en los inputs tambien estan fijados asi
      energia_del_mr: Number(energia_del_mr).toFixed(4),
      energia_rec_mr: Number(energia_rec_mr).toFixed(4),
    };

    console.log("Updated Values:", updatedValues);

    // Check if any value has changed and trigger the update function
    if (
      updatedValues.fecha !== fecha ||
      updatedValues.energia_del_mp !== energia_del_mp ||
      updatedValues.energia_rec_mp !== energia_rec_mp ||
      updatedValues.energia_del_mr !== energia_del_mr ||
      updatedValues.energia_rec_mr !== energia_rec_mr
    ) {
      handleRowChange(updatedValues);
    }
    // if (e.target.value === "validar") {
    //   toast.success("Fila validada correctamente");
    // }
    console.log("e.target.value: ", e.target);
  };

  //const allRows = [{ fecha }, ...additionalRows];

  // Se activa al hacer click en el botton editar fila
  const handleEditRow = (buttonValue) => {
    if (buttonValue === "Cancelar") {
      const mapping = {
        energiaActivaIntervalo: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(energia_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(energia_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
        },
        energiaActivaAcumulada: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(energia_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(energia_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
        },
        energiaReactivaAcumulada: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(energia_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(energia_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
        },
        default: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(energia_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(energia_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(energia_del_mr),
        },
      };

      const refs = {
        fechaRef, // Include this in case you need it
        energiaDelMpRef,
        energiaRecMpRef,
        energiaDelMrRef,
        energiaRecMrRef,
      };

      const selectedMapping = mapping[tipoMedicion] || mapping.default;

      Object.entries(selectedMapping).forEach(([refKey, value]) => {
        const ref = refs[refKey];
        if (ref?.current) {
          ref.current.innerText = value;
        }
      });
    }

    // Toggle edit mode
    handleIsEditableRow(!isEditableRow, rowkey, buttonValue);
  };

  return (
    <>
      {/* Original row */}
      <TableRow role="row">
        <Column ref={fechaRef} onInput={handleEditableDivInput}>
          {formatDate(fecha)}
        </Column>
        <Column
          ref={energiaDelMpRef}
          contentEditable={isEditableRow}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          onInput={handleEditableDivInput}
          style={
            or_del_mp === "VS" ? vsStyle : or_del_mp === "VI" ? viStyle : {}
          }
        >
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(energia_del_mp)}
        </Column>
        <Column
          ref={energiaRecMpRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={
            or_rec_mp === "VS" ? vsStyle : or_rec_mp === "VI" ? viStyle : {}
          }
        >
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(energia_rec_mp)}
        </Column>
        <Column
          ref={energiaDelMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={
            or_del_mr === "VS" ? vsStyle : or_del_mr === "VI" ? viStyle : {}
          }
        >
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(energia_del_mr)}
        </Column>
        <Column
          ref={energiaRecMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedrows={modifiedrows}
          activerow={activerow}
          rowkey={rowkey}
          style={
            or_rec_mr === "VS" ? vsStyle : or_rec_mr === "VI" ? viStyle : {}
          }
        >
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }).format(energia_rec_mr)}
        </Column>
        <Column>
          {userData.departmentId === 18 ? (
            <ButtonArray>
              <Button
                onClick={() => {
                  handleEditRow(isEditableRow ? "Cancelar" : "Editar");
                }}
                variation="secondary"
                size="small"
                tooltip={!isEditableRow ? "Editar" : "Cancelar"}
                // disabled={!canAddRow(fecha, -1)}
              >
                {isEditableRow ? "Cancel" : <MdEdit />}
              </Button>
              {or_del_mp === "VI" ||
              or_rec_mp === "VI" ||
              or_del_mr === "VI" ||
              or_rec_mr === "VI" ? (
                <Button
                  variation="check"
                  size="small"
                  tooltip="Validar fila"
                  onClick={handleEditableDivInput}
                  value="validar"
                >
                  <IoCheckbox />
                </Button>
              ) : (
                ""
              )}
            </ButtonArray>
          ) : (
            ""
          )}
        </Column>
      </TableRow>
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
