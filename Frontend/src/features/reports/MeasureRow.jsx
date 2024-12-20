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
  border-radius: ${(props) =>
    props.contentEditable ||
    (Array.isArray(props.modifiedRows) &&
      props.modifiedRows.includes(props.rowKey))
      ? "8px"
      : 0};
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
    kwh_del_mp,
    kwh_rec_mp,
    kwh_del_mr,
    kwh_rec_mr,
    kwh_del_int_mp,
    kwh_rec_int_mp,
    kwh_del_int_mr,
    kwh_rec_int_mr,
    kvarh_del_mp,
    kvarh_rec_mp,
    kvarh_del_mr,
    kvarh_rec_mr,
    kvarh_del_int_mp,
    kvarh_rec_int_mp,
    kvarh_del_int_mr,
    kvarh_rec_int_mr,
  } = measure;

  let fechaRef = useRef(null);
  let energiaDelMpRef = useRef(null);
  let energiaRecMpRef = useRef(null);
  let energiaDelMrRef = useRef(null);
  let energiaRecMrRef = useRef(null);

  // Collect values from each ref
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
      energia_del_mp: energiaDelMpRef.current?.innerText,
      energia_rec_mp: energiaRecMpRef.current?.innerText,
      energia_del_mr: energiaDelMrRef.current?.innerText,
      energia_rec_mr: energiaRecMrRef.current?.innerText,
      key: rowKey,
      idPrincipal: reportData.medidorPrincipal,
      idRespaldo: reportData.medidorRespaldo,
      tipoMedicion,
    };

    console.log("Updated Values:", updatedValues);

    // Check if any value has changed and trigger the update function
    if (
      updatedValues.fecha !== fecha ||
      updatedValues.energia_del_mp !== kwh_del_mp ||
      updatedValues.energia_rec_mp !== kwh_rec_mp ||
      updatedValues.energia_del_mr !== kwh_del_mr ||
      updatedValues.energia_rec_mr !== kwh_rec_mr
    ) {
      handleRowChange(updatedValues);
    }
  };

  const allRows = [{ fecha }, ...additionalRows];

  const handleEditRow = (buttonValue) => {
    if (buttonValue === "Cancelar") {
      const mapping = {
        energiaActivaIntervalo: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(kwh_del_int_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(kwh_rec_int_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(kwh_del_int_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(kwh_rec_int_mr),
        },
        energiaActivaAcumulada: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(kwh_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(kwh_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(kwh_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(kwh_rec_mr),
        },
        energiaReactivaAcumulada: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(kvarh_del_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(kvarh_rec_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(kvarh_del_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(kvarh_rec_mr),
        },
        default: {
          energiaDelMpRef: Intl.NumberFormat("en-US").format(kvarh_del_int_mp),
          energiaRecMpRef: Intl.NumberFormat("en-US").format(kvarh_rec_int_mp),
          energiaDelMrRef: Intl.NumberFormat("en-US").format(kvarh_del_int_mr),
          energiaRecMrRef: Intl.NumberFormat("en-US").format(kvarh_rec_int_mr),
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
      alert("A row with this date already exists.");
      return;
    }
    if (nextFecha && newFecha >= nextFecha) {
      alert("The new row's date must be less than the next row's date.");
      return;
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
  }

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

  // Submit row data to the database
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
          {fecha}
        </Column>
        <Column
          ref={energiaDelMpRef}
          contentEditable={isEditableRow}
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
          onInput={handleEditableDivInput}
        >
          {tipoMedicion === "energiaActivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kwh_del_mp)
            : tipoMedicion === "energiaActivaIntervalo"
            ? new Intl.NumberFormat("en-US").format(kwh_del_int_mp)
            : tipoMedicion === "energiaReactivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kvarh_del_mp)
            : new Intl.NumberFormat("en-US").format(kvarh_del_int_mp)}
        </Column>
        <Column
          ref={energiaRecMpRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
        >
          {tipoMedicion === "energiaActivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kwh_rec_mp)
            : tipoMedicion === "energiaActivaIntervalo"
            ? new Intl.NumberFormat("en-US").format(kwh_rec_int_mp)
            : tipoMedicion === "energiaReactivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kvarh_rec_mp)
            : new Intl.NumberFormat("en-US").format(kvarh_rec_int_mp)}
        </Column>
        <Column
          ref={energiaDelMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
        >
          {tipoMedicion === "energiaActivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kwh_del_mr)
            : tipoMedicion === "energiaActivaIntervalo"
            ? new Intl.NumberFormat("en-US").format(kwh_del_int_mr)
            : tipoMedicion === "energiaReactivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kvarh_del_mr)
            : new Intl.NumberFormat("en-US").format(kvarh_del_int_mr)}
        </Column>
        <Column
          ref={energiaRecMrRef}
          contentEditable={isEditableRow}
          onInput={handleEditableDivInput}
          modifiedRows={modifiedRows}
          activeRow={activeRow}
          rowKey={rowKey}
        >
          {tipoMedicion === "energiaActivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kwh_rec_mr)
            : tipoMedicion === "energiaActivaIntervalo"
            ? new Intl.NumberFormat("en-US").format(kwh_rec_int_mr)
            : tipoMedicion === "energiaReactivaAcumulada"
            ? new Intl.NumberFormat("en-US").format(kvarh_rec_mr)
            : new Intl.NumberFormat("en-US").format(kvarh_rec_int_mr)}
        </Column>
        <Column>
          <ButtonArray>
            <Button
              onClick={() => handleAddRow(fecha, -1)}
              variation="secondary"
              size="small"
              disabled={!canAddRow(fecha, -1)}
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
              value={row.kwh_rec_mr}
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
              disabled={!canAddRow(row.fecha, index)}
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
