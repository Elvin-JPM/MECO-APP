import styled from "styled-components";
import { useState } from "react";
import Button from "../../ui/Button";
import { MdEdit } from "react-icons/md";
import Modal from "../../ui/Modal";
import { FaPlus } from "react-icons/fa6";
import ButtonArray from "../../ui/ButtonArray";
//import AddMeter from "./AddMeter";

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

// const Img = styled.img`
//   display: block;
//   width: 3rem;
//   aspect-ratio: 3/2;
//   object-fit: cover;
//   object-position: center;
//   transform: scale(1.5) translateX(-7px);
// `;

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

function MeasureRow({ measure }) {
  const [showForm, setShowForm] = useState(false);
  const { fecha, EAG_MP, EAC_MP, EAG_MR, EAC_MR } = measure;

  function handleShowForm() {
    setShowForm((show) => !show);
  }
  //   console.log(eag_mp);

  return (
    <>
      <TableRow role="row">
        <Column>{fecha}</Column>
        <Column>{EAG_MP}</Column>
        <Column>{EAC_MP}</Column>
        <Column>{EAG_MR}</Column>
        <Column>{EAC_MR}</Column>
        {/* <ButtonArray>
          <Button onClick={handleShowForm} variation="secondary" size="small">
            <MdEdit />
          </Button>
        </ButtonArray> */}
      </TableRow>

      {/* {showForm && (
        <Modal onClose={handleShowForm}>
          <CreateMeterForm
            handleShowForm={handleShowForm}
            meterId={id}
            nombrePlanta={nombre_planta}
          />
        </Modal>
      )} */}
    </>
  );
}

export default MeasureRow;
