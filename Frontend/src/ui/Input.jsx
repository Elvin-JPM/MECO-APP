import styled from "styled-components";
import { css } from "styled-components";

const Input = styled.input`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;

  ${(props) =>
    props.inputuse === "login" &&
    css`
      width: 80%;
    `}
`;

export default Input;
