import styled from "styled-components";
import ActaCard from "./ActaCard";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.4rem;
  padding: 2.4rem;
  width: 100%;
`;

// Dummy data for testing
export const dummyActas = [
  {
    id: "1",
    name: "T531_2123_101M1",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 3,
  },
  {
    id: "2",
    name: "T531_2123_101M2",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 2,
  },
  {
    id: "3",
    name: "T531_2123_102M1",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 1,
  },
  {
    id: "4",
    name: "T531_2123_102M2",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 4,
  },
  {
    id: "5",
    name: "T531_2123_103M1",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 2,
  },
  {
    id: "6",
    name: "T531_2123_103M2",
    planta: "Azunosa",
    subestacion: "Villanueva",
    voltaje: "34.5KV",
    pdfCount: 3,
  },
];

function ActasGrid() {
  return (
    <Grid>
      {dummyActas.map((acta) => (
        <ActaCard key={acta.id} acta={acta} />
      ))}
    </Grid>
  );
}

export default ActasGrid;
