import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  padding: ${(props) =>
    props.$size === "small" ? "2.4rem 3rem" : "3.2rem 4rem"};
  transition: all 0.5s;
  height: ${(props) => (props.$size === "small" ? "auto" : "95vh")};
  max-height: ${(props) => (props.$size === "small" ? "80vh" : "none")};
  width: ${(props) => (props.$size === "small" ? "auto" : "auto")};
  max-width: ${(props) => (props.$size === "small" ? "40rem" : "none")};
  overflow: auto;
  z-index: 2000;
  box-shadow: 0 2rem 3rem rgba(0, 0, 0, 0.2);

  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  z-index: 1;
  transition: all 0.5s;
`;

const Button = styled.button`
  background: none;
  border: none;
  padding: 0.4rem;
  border-radius: var(--border-radius-sm);
  transform: translateX(0.8rem);
  transition: all 0.2s;
  position: absolute;
  top: 1.2rem;
  right: 1.9rem;

  &:hover {
    background-color: var(--color-grey-100);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-500);
  }
`;

function Modal({ onClose, children, size = "large" }) {
  return (
    <Overlay>
      <StyledModal $size={size}>
        <Button onClick={onClose}>
          <HiXMark />
        </Button>
        <div>{children}</div>
      </StyledModal>
    </Overlay>
  );
}

export default Modal;
