import styled from "styled-components";

const TableRow = styled.tr`
  display: grid;
  grid-template-columns: 130px 80px repeat(77, minmax(100px, 1fr)); // Match the header layout
  background-color: var(--color-grey-0);
`;

const RowCell = styled.td`
  padding: 1.5rem 2.4rem;
  font-family: "Sono";
  font-weight: 500;
  color: var(--color-grey-700);
  white-space: nowrap;
  border-bottom: 1px solid var(--color-grey-100);
  

  // Make the first column sticky
  &:nth-child(1) {
    position: sticky;
    left: 0;
    z-index: 1; // Ensure the column stays above the scrolling content
    background-color: var(--color-grey-50); // Match the row background
    font-weight: 700;
  }

  // Make the second column sticky
  &:nth-child(2) {
    position: sticky;
    font-weight: 700;
    left: 130px; // Offset by the width of the first column
    z-index: 1; // Ensure the column stays above the scrolling content
    background-color: var(--color-grey-50); // Match the row background
    border-right: 1px solid var(--color-grey-200); // Add a border to separate sticky columns
  }
`;

function DemandRow({ demand_hour }) {
  return (
    <TableRow>
      <RowCell>{demand_hour[0]}</RowCell>
      <RowCell>{demand_hour[1]}</RowCell>
      {demand_hour?.slice(2).map((row, index) => (
        <RowCell key={index}>{row}</RowCell>
      ))}
    </TableRow>
  );
}

export default DemandRow;
