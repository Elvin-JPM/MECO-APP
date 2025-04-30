import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
    border-top-color: var(--color-institucional-rojo);
    border-right-color: transparent;
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
  25% {
    transform: rotate(90deg);
    border-top-color: var(--color-institucional-rojo);
    border-right-color: var(--color-institucional-rojo);
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
  50% {
    transform: rotate(180deg);
    border-top-color: var(--color-institucional-rojo);
    border-right-color: var(--color-institucional-rojo);
    border-bottom-color: var(--color-institucional-rojo);
    border-left-color: transparent;
  }
  75% {
    transform: rotate(270deg);
    border-top-color: var(--color-institucional-rojo);
    border-right-color: var(--color-institucional-rojo);
    border-bottom-color: var(--color-institucional-rojo);
    border-left-color: var(--color-institucional-rojo);
  }
  100% {
    transform: rotate(360deg);
    border-top-color: var(--color-institucional-amarillo);
    border-right-color: transparent;
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
`;

const OuterCircle = styled.div`
  width: 5rem;
  height: 5rem;
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 0.6rem solid transparent;
  animation: ${rotate} 2s linear infinite;
`;

const InnerCircle = styled.div`
  width: 3.8rem;
  height: 3.8rem;
  background-color: transparent;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Spinner = () => {
  return (
    <OuterCircle>
      <InnerCircle />
    </OuterCircle>
  );
};

export default Spinner;
