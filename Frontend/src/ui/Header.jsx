import styled from "styled-components";
import { useUser } from "../features/authentication/UserProvider";

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 1.2rem 4.8rem;
  --border-bottom: 1px solid var(--color-grey-100);
  backdrop-filter: blur(10px);
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

function Header({ children })
{
  const { userData, loading } = useUser();
  return <StyledHeader>{children}</StyledHeader>;
}

export default Header;
