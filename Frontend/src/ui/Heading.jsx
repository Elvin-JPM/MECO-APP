import styled, { css, keyframes } from "styled-components";

// const test = css`
//   text-align: center;
//   ${10 > 5 && "background-color: yellow;"}
// `;

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
  /* color: var(--color-brand-900); */
  text-align: center;
  background: linear-gradient(
    45deg,
    var(--color-grey-500),
    var(--color-grey-700),
    var(--color-grey-800)
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
`;

function Heading({ children }) {
  return (
    <div>
      <StyledHeading>{children}</StyledHeading>
    </div>
  );
}

export default Heading;
