import styled, { keyframes } from "styled-components";
import Heading from "./Heading";
import { IoCloseSharp } from "react-icons/io5";
import IconButton from "./IconButton";
import MainNav from "./MainNav";

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const StyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 25rem;
  height: 100%;
  background: radial-gradient(
    var(--color-grey-100) 10%,
    var(--color-grey-400) 90%
  );
  opacity: 0.95;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 6000;

  animation: ${slideIn} 0.3s ease-out;
`;

const CloseButton = styled.div`
  width: 4rem;
  height: 4rem;
  position: absolute;
  top: 2rem;
  right: 2rem;
`;

function Menu({ CloseMenu }) {
  return (
    <StyledMenu>
      <CloseButton onClick={CloseMenu}>
        <IconButton>
          <IoCloseSharp />
        </IconButton>
      </CloseButton>
      <Heading>App Medición Comercial</Heading>
      <MainNav />
    </StyledMenu>
  );
}

export default Menu;
