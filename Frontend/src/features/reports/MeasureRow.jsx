import styled from "styled-components";
import { useRef, useState } from "react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import ButtonArray from "../../ui/ButtonArray";
import { formatDate } from "../../utils/dateFunctions";
import { formatDateInput } from "../../utils/dateFunctions";
import toast from "react-hot-toast";
import { IoWarning } from "react-icons/io5";

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
      : Array.isArray(props.modifiedRows) &&
        props.modifiedRows.includes(props.rowKey) &&
        props.rowKey !== props.activeRow
      ? "var(--color-red-100)"
      : "transparent"};
  padding: ${(props) =>
    props.contentEditable ||
    (Array.isArray(props.modifiedRows) &&
      props.modifiedRows.includes(props.rowKey))
      ? "0.6rem"
      : 0};
  border-radius: 8px;
  /* border-radius: ${(props) =>
    props.contentEditable ||
    (Array.isArray(props.modifiedRows) &&
      props.modifiedRows.includes(props.rowKey))
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

function MeasureRow({
  measure,
  onInsertRow,
  handleRowChange,
  reportData,
  handleIsEditableRow,
  isEditableRow,
  tipoMedicion,
  rowKey,
  modifiedRows,
  activeRow,
}) {
  //const [isEditable, setIsEditable] = useState(false);
  const [additionalRows, setAdditionalRows] = useState([]);
  const [editableInputs, setEditableInputs] = useState({});
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

  let fechaRef = useRef(null);
  let energiaDelMpRef = useRef(null);
  let energiaRecMpRef = useRef(null);
  let energiaDelMrRef = useRef(null);
  let energiaRecMrRef = useRef(null);

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
      key: rowKey,
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

      // Optionally handle fechaRef specifically if needed
      // if (fechaRef?.current) {
      //   fechaRef.current.innerText = "Updated Date Value"; // Customize this as necessary
      // }
    }

    // Toggle edit mode
    handleIsEditableRow(!isEditableRow, rowKey, buttonValue);
  };

  // Calculate a new date 15 minutes ahead
  function calculateNewFecha(oldFecha) {
    const oldDate = new Date(oldFecha);
    oldDate.setMinutes(oldDate.getMinutes() + 15); // Add 15 minutes
    return oldDate;
  }

  // Funcion para agregar una nueva fila al hacer click en el boton "+"
  function handleAddRow(currentFecha, currentIndex) {
    const allRows = [{ fecha }, ...additionalRows];
    const nextFecha =
      currentIndex + 1 < allRows.length
        ? new Date(allRows[currentIndex + 1].fecha)
        : null;

    const newFecha = calculateNewFecha(currentFecha);

    // Validate the new date
    const existingDates = allRows.map((row) => new Date(row.fecha).getTime());
    if (existingDates.includes(newFecha.getTime())) {
      console.log("A row with this date already exists.");
      //return;
    }
    if (nextFecha && newFecha >= nextFecha) {
      console.log("The new row's date must be less than the next row's date.");
      //return;
    }

    // Insert the new row in the appropriate position
    setAdditionalRows([
      ...additionalRows.slice(0, currentIndex + 1),
      {
        fecha: newFecha,
        kwh_del_mp: "",
        kwh_rec_mp: "",
        kwh_del_mr: "",
        kwh_rec_mr: "",
      },
      ...additionalRows.slice(currentIndex + 1),
    ]);

    console.log(additionalRows);
  }

  // habilita o deshabilita el boton para agreagar una nueva fila, basandose en las fechas
  function canAddRow(currentFecha, currentIndex) {
    const allRows = [{ fecha }, ...additionalRows];
    const nextFecha =
      currentIndex + 1 < allRows.length
        ? new Date(allRows[currentIndex + 1].fecha)
        : null;

    const newFecha = calculateNewFecha(currentFecha);

    // Check if newFecha exists in the rows
    const existingDates = allRows.map((row) => new Date(row.fecha).getTime());
    if (existingDates.includes(newFecha.getTime())) return false;

    // Ensure newFecha is within the gap (if any)
    if (nextFecha && newFecha >= nextFecha) return false;

    return true;
  }

  // Handle changes to editable fields
  function handleInputChange(index, field, value) {
    const updatedRows = [...additionalRows];
    updatedRows[index][field] = value;
    setAdditionalRows(updatedRows);
  }

  //Submit row data to the database
  function handleSubmitRow(index) {
    const rowToSubmit = additionalRows[index];
    onInsertRow(rowToSubmit); // Pass row data to parent for database insertion
    setAdditionalRows(additionalRows.filter((_, i) => i !== index));
  }

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
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
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
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
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
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
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
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
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
          <ButtonArray>
            <Button
              onClick={() => handleAddRow(fecha, -1)}
              variation="secondary"
              size="small"
              //disabled={!canAddRow(fecha, -1)}
              tooltip="Agregar fila"
            >
              <FaPlus />
            </Button>
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
          </ButtonArray>
        </Column>
      </TableRow>

      {/* Render additional editable rows */}
      {additionalRows.map((row, index) => (
        <TableRow role="row" key={index}>
          <Column>
            <Input
              type="datetime-local"
              //value={formatDate(row.fecha)}
              defaultValue={formatDateInput(row.fecha)}
              onChange={(e) =>
                handleInputChange(index, "fecha", e.target.value)
              }
            />
          </Column>
          <Column>
            <Input
              type="number"
              value={row.kwh_del_mp}
              onChange={(e) =>
                handleInputChange(index, "kwh_del_mp", e.target.value)
              }
            />
          </Column>
          <Column>
            <Input
              type="number"
              value={row.kwh_rec_mp}
              onChange={(e) =>
                handleInputChange(index, "kwh_rec_mp", e.target.value)
              }
            />
          </Column>
          <Column>
            <Input
              type="number"
              value={row.kwh_del_mr}
              onChange={(e) =>
                handleInputChange(index, "kwh_del_mr", e.target.value)
              }
            />
          </Column>
          <Column>
            <Input
              type="number"
              value={row.kwh_rec_mr}
              onChange={(e) =>
                handleInputChange(index, "kwh_rec_mr", e.target.value)
              }
            />
          </Column>
          <Column>
            <Button
              onClick={() => handleAddRow(row.fecha, index)}
              variation="secondary"
              size="small"
              //disabled={!canAddRow(row.fecha, index)}
            >
              <FaPlus />
            </Button>
          </Column>
        </TableRow>
      ))}
    </>
  );
}

export default MeasureRow;
