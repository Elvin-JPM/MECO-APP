import styled, { css } from "styled-components";

const Form = styled.form`
  ${(props) =>
    props.type !== "modal" &&
    css`
      padding: 2.4rem 4rem;

      /* Box */
      background-color: var(--color-grey-0);
      border: 1px solid var(--color-grey-100);
      border-radius: var(--border-radius-md);
    `}

  ${(props) =>
    props.type === "modal" &&
    css`
      width: 80rem;
    `}
    
  ${(props) =>
    props.type === "login" &&
    css`
      padding: 2.4rem 4rem;

      /* Box */
      /* background: linear-gradient(
        to top right,
        var(--color-grey-0),
        var(--color-grey-400)
      ); */
      background-color: transparent;
      border: 1px solid var(--color-grey-200);
      border-radius: var(--border-radius-lg);
      box-shadow: 2px 2px 1px 1px var(--color-grey-500);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 25%;
      height: 60%;
      gap: 1rem;
    `}
  overflow: hidden;
  font-size: 1.4rem;
  margin-bottom: 2rem;
`;

export default Form;
