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

      @media (max-width: 1200px) {
        padding: 1.5rem 1.5rem;
      }
      @media (max-width: 768px) {
        justify-content: center;
        align-items: center;
        width: 100%;
      }
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

      @media (min-width: 1200px) {
        width: 42rem;
        height: 55rem;
        justify-content: center;
      }
      @media (max-width: 1200px) and (min-width: 768px) {
        width: 38rem;
        height: 50rem;
        justify-content: center;
      }

      @media (max-width: 768px) and (min-width: 480px) {
        width: 36rem;
        height: 50rem;
        justify-content: center;
        gap: 0.5rem;
      }
      @media (max-width: 480px) and (min-width: 320px) {
        width: 34rem;
        height: 46rem;
        justify-content: center;
        gap: 0.3rem;
      }
    `}
  overflow: hidden;
  font-size: 1.4rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(8px);

`;

export default Form;
