import styled from "styled-components";
import DashboardTag from "../../ui/DashboardTag";

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


function DashboardEnergia({ powerMP, powerMR }) {
  const formatter = new Intl.NumberFormat("en-US");
  return (
    <StyledRegisters>
      <DashboardTag>
        {formatter.format(powerMP.del)} <span>kwh enviados MP</span>
      </DashboardTag>
      <DashboardTag>
        {formatter.format(powerMP.rec)} <span>kwh recibidos MP</span>
      </DashboardTag>
      <DashboardTag>
        {formatter.format(powerMR.del)} <span>kwh enviados MR</span>
      </DashboardTag>
      <DashboardTag>
        {formatter.format(powerMR.rec)} <span>kwh recibidos MR</span>
      </DashboardTag>
    </StyledRegisters>
  );
}

export default DashboardEnergia;
