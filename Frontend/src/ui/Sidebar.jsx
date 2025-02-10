import styled from "styled-components";
import Logo from "./Logo";
import MainNav from "./MainNav";

const StyledSidebar = styled.aside`
  background-color: var(--color-grey-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;

  @media (max-width: 1200px) and (min-width: 768px) {
    width: 18rem;
    align-items: center;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    width: 6rem;
    padding: 0;
    margin: 0;
    align-items: center;
    box-shadow: 3px 2px 2px  rgba(0, 0, 0, 0.2);
  }
`;

function Sidebar() {
  return (
    <StyledSidebar>
      <Logo image="../../CND-LOGO.png" height={"5rem"} navBar={true} />
      <MainNav />
    </StyledSidebar>
  );
}

export default Sidebar;
