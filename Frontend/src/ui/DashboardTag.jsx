import styled from "styled-components";

const DashboardTag = styled.div`
  height: 6rem;
  width: 18rem;
  border: 1px solid var(--color-grey-400);
  box-shadow: 1px 1px 6px var(--color-grey-700);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;

  & span {
    font-weight: 300;
    font-size: 1.4rem;
  }
`;

export default DashboardTag;
