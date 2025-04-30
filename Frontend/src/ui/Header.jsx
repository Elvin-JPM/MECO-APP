import styled from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: var(--color-grey-0);
  opacity: 0.95;
  backdrop-filter: blur(10px);
  padding: 1.2rem 4.8rem;
  margin: 1rem 1rem 0rem 1rem;
  border-bottom: 1px solid var(--color-grey-600);
  border-radius: 10px;
  box-shadow: 1px 1px 10px 1px var(--color-grey-500);


  @media (max-width: 1200px) and (min-width: 820px) {
    font-size: 1rem;
    white-space: nowrap;
  }
  @media (max-width: 820px) and (min-width: 480px) {
    font-size: 0.8rem;
  }
  @media (max-width: 500px) {
    font-size: 1rem;
    justify-content: space-between;
    align-items: center;
  }
`;

function Header({ children }) {
  return <StyledHeader>{children}</StyledHeader>;
}

export default Header;
