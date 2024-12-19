import styled from "styled-components";

const Select = styled.select`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid
    ${(props) =>
      props.type === "white"
        ? "var(--color-grey-100)"
        : "var(--color-grey-300)"};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  overflow: auto;
  cursor: pointer;

  /* Add smooth transitions */
  transition: all 0.3s ease-in-out;

  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hover Animation */
  &:hover {
    border-color: rgba(6, 78, 59, 0.6);
    transform: scale(1.005); /* Slight zoom */
  }

  /* Focus Animation */
  &:focus {
    outline: none;
    border-color: var(--color-brand-950);
    box-shadow: 0 0 10px rgba(6, 78, 59, 0.4);
  }

  /* Disabled State */
  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }


  /* Add responsive styles */
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.6rem 1rem;
  }
`;



export default Select;
