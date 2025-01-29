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
  border-bottom: 1px solid var(--color-grey-50);
  backdrop-filter: blur(10px);
`;

function Header({ children })
{
  const { userData, loading } = useUser();
  return <StyledHeader>{children}</StyledHeader>;
}

export default Header;
