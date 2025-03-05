import styled from "styled-components";
import DashboardTag from "../../ui/DashboardTag";
import Spinner from "../../ui/Spinner";

const StyledRegisters = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 1.5rem;
  margin-top: 3rem;
  color: black;

  & div:nth-child(odd) {
    background-color: var(--color-institucional-celeste);
  }

  & div:nth-child(even) {
    background-color: var(--color-red-500);
  }
`;

function DashboardRegistros({ countMP, countMR }) {
  console.log(countMP, countMR);
  return (
    <StyledRegisters>
      <DashboardTag>
        {countMP.regTotales ? countMP.regTotales : <Spinner />}
        <span>Registros obtenidos MP</span>
      </DashboardTag>
      <DashboardTag>
        {countMP.regCero} <span>Registros en cero MP</span>
      </DashboardTag>
      <DashboardTag>
        {countMR.regTotales} <span>Registros obtenidos MR</span>
      </DashboardTag>
      <DashboardTag>
        {countMR.regCero} <span>Registros en cero MR</span>
      </DashboardTag>
    </StyledRegisters>
  );
}

export default DashboardRegistros;
