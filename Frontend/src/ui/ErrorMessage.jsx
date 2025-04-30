import styled from "styled-components";
import PropTypes from "prop-types";

const StyledErrorMessage = styled.div`
  color: var(--color-red-700);
  background-color: var(--color-red-100);
  padding: 1rem;
  border-radius: var(--border-radius-sm);
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 500;
`;

function ErrorMessage({ message }) {
  return <StyledErrorMessage>{message}</StyledErrorMessage>;
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;
