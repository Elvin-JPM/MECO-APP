import styled from "styled-components";

const StyledHeader = styled.header`
  background-color: var(--color-grey-0);
  padding: 1.2rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);
`;

// const StyledHeader = styled.header`
//   background-color: var(--color-grey-0);
//   padding: 1.6rem 2.4rem;
//   //position: fixed;
//   top: 0;
//   left: 0;
//   //width: 100%;
//   height: var(--header-height); /* Define header height, e.g., 6rem */
//   border-bottom: 1px solid var(--color-grey-100);
//   z-index: 1000; /* Ensure it appears above other elements */
// `;

function Header() {
  return <StyledHeader>Header</StyledHeader>;
}

export default Header;
