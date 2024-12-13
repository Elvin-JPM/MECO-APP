import styled from "styled-components";
import { useRef, useState } from "react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import ButtonArray from "../../ui/ButtonArray";

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
    props.contentEditable ? "var(--color-brand-50)" : "transparent"};
  padding: ${(props) => (props.contentEditable ? "0.6rem" : 0)};
  border-radius: ${(props) => (props.contentEditable ? "8px" : 0)};
  /* border: ${(props) =>
    props.contentEditable ? "2px dotted var(--color-brand-400)" : "none"}; */
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
  rowNum,
  handleRowChange,
  reportData,
}) {
  const [isEditable, setIsEditable] = useState(false);
  const [additionalRows, setAdditionalRows] = useState([]);
  const { fecha, kwh_del_mp, kwh_rec_mp, kwh_del_mr, kwh_rec_mr } = measure;
  const { fechaOrig, kwh_del_mp_orig, kwh_rec_mp_orig, kwh_del_mr_orig, kwh_rec_mr_orig } = measure;

  let fechaRef = useRef(null);
  let kwhDelMpRef = useRef(null);
  let kwhRecMpRef = useRef(null);
  let kwhDelMrRef = useRef(null);
  let kwhRecMrRef = useRef(null);

  // Collect values from each ref
  const handleEditableDivInput = () => {
    // Collect values from each ref
    const updatedValues = {
      fecha: fechaRef.current?.innerText,
      kwh_del_mp: kwhDelMpRef.current?.innerText,
      kwh_rec_mp: kwhRecMpRef.current?.innerText,
      kwh_del_mr: kwhDelMrRef.current?.innerText,
      kwh_rec_mr: kwhRecMrRef.current?.innerText,
      key: rowNum,
      idPrincipal: reportData.medidorPrincipal,
      idRespaldo: reportData.medidorRespaldo,
    };

    console.log("Updated Values:", updatedValues);
    if (
      updatedValues.fecha !== fecha ||
      updatedValues.kwh_del_mp !== kwh_del_mp ||
      updatedValues.kwh_rec_mp !== kwh_rec_mp ||
      updatedValues.kwh_del_mr !== kwh_del_mr ||
      updatedValues.kwh_rec_mr !== kwh_rec_mr
    ) {
      handleRowChange(updatedValues);
    }
  };

  const [editableInputs, setEditableInputs] = useState({});

  const allRows = [{ fecha }, ...additionalRows];

  // Helper function to format date as "DD-MM-YYYY HH:mm"
  function formatDate(date) {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  }

  function formatDateInput(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  const handleEditRow = () => {
    if (isEditable === true) {
      kwhDelMpRef = kwh_del_mp;
      kwhRecMpRef = kwh_rec_mp;
      kwhDelMrRef = kwh_del_mr;
      kwhRecMrRef = kwh_rec_mr;
    }
    setIsEditable((editable) => {
      return !editable;
    });
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
          ref={kwhDelMpRef}
          contentEditable={isEditable}
          onInput={handleEditableDivInput}
        >
          {isEditable
            ? new Intl.NumberFormat("en-US").format(kwh_del_mp)
            : new Intl.NumberFormat("en-US").format(kwh_del_mp_orig)}
        </Column>
        <Column
          ref={kwhRecMpRef}
          contentEditable={isEditable}
          onInput={handleEditableDivInput}
        >
          {new Intl.NumberFormat("en-US").format(kwh_rec_mp)}
        </Column>
        <Column
          ref={kwhDelMrRef}
          contentEditable={isEditable}
          onInput={handleEditableDivInput}
        >
          {new Intl.NumberFormat("en-US").format(kwh_del_mr)}
        </Column>
        <Column
          ref={kwhRecMrRef}
          contentEditable={isEditable}
          onInput={handleEditableDivInput}
        >
          {new Intl.NumberFormat("en-US").format(kwh_rec_mr)}
        </Column>
        <Column>
          <ButtonArray>
            <Button
              onClick={() => handleAddRow(fecha, -1)}
              variation="secondary"
              size="small"
              disabled={!canAddRow(fecha, -1)}
            >
              <FaPlus />
            </Button>
            <Button
              onClick={handleEditRow}
              variation="secondary"
              size="small"
              // disabled={!canAddRow(fecha, -1)}
            >
              {isEditable ? "Cancel" : <MdEdit />}
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
