import styled from "styled-components";
import { css } from "styled-components";

const StyledFormRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24rem 1fr 1.2fr;
  gap: 2.4rem;

  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }

  ${(props) =>
    props.type === "login" &&
    css`
      display: flex;
      flex-direction: column;
      justify-content: left;
      align-items: left;
      gap: 0.2rem;
      width: 100%;
      &:not(:last-child) {
        border-bottom: none;
      }
    `}
`;

const Label = styled.label`
  font-weight: 500;
  ${(props) =>
    props.type === "login" &&
    css`
      width: 80%;
      color: var(--color-grey-0)
    `}
`;

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`;

function FormRow({ label, error, type, children }) {
  console.log(type);
  return (
    <StyledFormRow type={type}>
      {label && (
        <Label type={type && "login"} htmlFor={children.props.id}>
          {" "}
          {label}{" "}
        </Label>
      )}
      {children}
      {error && <Error>{error}</Error>}
    </StyledFormRow>
  );
}

export default FormRow;
