import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

const Spinner = styled.div`
  margin: 4.8rem auto;

  width: ${(props) => {
    if (props.size === "small") return "2.4rem";
    if (props.size === "large") return "9.6rem";
    return "6.4rem"; // Default to medium
  }};
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
        farthest-side,
        ${(props) => props.color || "var(--color-brand-600)"} 94%,
        #0000
      )
      top/10px 10px no-repeat,
    conic-gradient(
      #0000 30%,
      ${(props) => props.color || "var(--color-brand-600)"}
    );
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 10px), #000 0);
  animation: ${rotate} 1.5s infinite linear;
`;

export default Spinner;
