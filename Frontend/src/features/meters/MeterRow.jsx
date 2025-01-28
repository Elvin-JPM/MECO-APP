import styled from "styled-components";
import { useState } from "react";
import Button from "../../ui/Button";
import CreateMeterForm from "./CreateMeterForm";
import { MdEdit } from "react-icons/md";
import Modal from "../../ui/Modal";
import { FaPlus } from "react-icons/fa6";
import ButtonArray from "../../ui/ButtonArray";
import AddMeter from "./AddMeter";
import { useUser } from "../authentication/UserProvider";

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 1fr 1fr 1fr 1fr 1fr 0.35fr;
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

// const Meter = styled.div`
//   font-size: 1.6rem;
//   font-weight: 600;
//   color: var(--color-grey-600);
// `;

const Column = styled.div`
  font-family: "Sono";
  font-weight: 500;
  --color: var(--color-green-700);
`;

function MeterRow({ meter }) {
  const [showForm, setShowForm] = useState(false);
  const { userData } = useUser();
  const {
    id,
    id_punto,
    nombre_planta,
    ip,
    nombre_punto,
    subestacion,
    serie,
    foto,
  } = meter;

  function handleShowForm() {
    setShowForm((show) => !show);
  }

  return (
    <>
      <TableRow role="row">
        <Img
          src={foto ? `data:image/jpeg;base64,${foto}` : "../../ION_8650.jpg"}
        ></Img>
        <Column>{nombre_planta}</Column>
        <Column>{ip}</Column>
        <Column>{id_punto}</Column>
        <Column>{subestacion}</Column>
        <Column>{serie}</Column>
        {userData?.departmentId === 18 ? (
          <ButtonArray>
            <Button onClick={handleShowForm} variation="secondary" size="small">
              <MdEdit />
            </Button>
            <AddMeter />
          </ButtonArray>
        ) : (
          ""
        )}
      </TableRow>

      {showForm && (
        <Modal onClose={handleShowForm}>
          <CreateMeterForm
            handleShowForm={handleShowForm}
            meterId={id}
            nombrePlanta={nombre_planta}
          />
        </Modal>
      )}
    </>
  );
}

export default MeterRow;
