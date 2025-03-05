import styled from "styled-components";
import { css } from "styled-components";

const Input = styled.input`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  /* border-left: 4px solid var(--color-grey-400); */

  &:focus {
    caret-color: var(--color-institucional-amarillo);
    outline-color: var(--color-institucional-celeste);
  }

  ${(props) =>
    props.inputuse === "login" &&
    css`
      width: 80%;
      background-color: var(--color-grey-200);
      //backdrop-filter: blur(10px);
      height: 4.5rem;
      border: 1px solid var(--color-grey-400);
    `}
`;

export default Input;
