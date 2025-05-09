import styled, { css, keyframes } from "styled-components";

const animatedText = keyframes`
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
`;

const StyledHeading = styled.h1`
  text-align: left;
  background: linear-gradient(
    30deg,
    var(--color-grey-500),
    var(--color-grey-700),
    var(--color-grey-900)
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: ${animatedText} 5s ease infinite;
  ${(props) =>
    props.as === "h1" &&
    css`
      font-size: 3rem;
      font-weight: 600;
    `}

  ${(props) =>
    props.as === "h2" &&
    css`
      font-size: 2rem;
      font-weight: 600;
    `}

  ${(props) =>
    props.as === "h3" &&
    css`
      font-size: 2rem;
      font-weight: 500;
    `}

  @media (min-width: 1200px) {
    font-size: 2.5rem;
  }
  @media (max-width: 1200px) {
    font-size: 2rem;
  }
  @media (max-width: 500px) {
    & > span {
      display: none;
    }
  }
`;

function Heading({ children }) {
  return <StyledHeading>{children}</StyledHeading>;
}

export default Heading;
