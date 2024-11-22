import styled from "styled-components";
import Button from "../../ui/Button";

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 0.2fr 1fr 1fr 1fr 1fr 1fr 0.2fr;
  column-gap: 2.4rem;
  align-items: center;
  padding: 1.4rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

// const Img = styled.img`
//   display: block;
//   width: 6.4rem;
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

function MeterRow({ meter }) {
  const {id, id_punto, nombre_planta, ip, nombre_punto, subestacion, serie } =
    meter;
  return (
    <TableRow role="row">
      <div></div>
      <Column>{nombre_planta}</Column>
      <Column>{ip}</Column>
      <Column>{id_punto}</Column>
      <Column>{subestacion}</Column>
      <Column>{serie}</Column>
      <Button variation={"secondary"} size={"small"}>
        Edit
      </Button>
    </TableRow>
  );
}

export default MeterRow;
