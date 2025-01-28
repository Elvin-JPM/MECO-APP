import styled, { css } from "styled-components";

const Form = styled.form`
  ${(props) =>
    props.type !== "modal" &&
    css`
      padding: 2.4rem 4rem;

      /* Box */
      background-color: rgba(255, 255, 255, 0.6);
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
      background-color: rgba(244, 246, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px solid var(--color-grey-300);
      border-radius: var(--border-radius-lg);
      --box-shadow: 2px 2px var(--color-grey-200);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 28%;
      height: 70%;
      gap: 1rem;

    `}
  overflow: hidden;
  font-size: 1.4rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(8px);
`;

export default Form;
