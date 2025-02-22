import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

  /* Border with dual colors */
  /*   border: 0.4rem solid #FF9D3D; */
  border-top: 0.3rem solid orangered;
  border-right: 0.2rem solid orangered;

  /* Rotate the border */
  animation: ${rotate} 1s linear infinite;
`;
const InnerCircle = styled.div`
  width: 4rem;
  height: 4rem;
  background-color: #eb8317;
  border-radius: 50%;
`;

const Spinner = () => {
  return (
    <OuterCircle>
      <InnerCircle />
    </OuterCircle>
  );
};
export default Spinner;
