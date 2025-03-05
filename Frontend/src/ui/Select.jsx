import styled from "styled-components";

const Select = styled.select`
  font-size: 1.4rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-grey-400);
  /* border-left: 4px solid var(--color-grey-400); */
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-100);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  overflow: auto;
  cursor: pointer;
  accent-color: var(--color-institucional-celeste);

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
    outline-color: var(--color-institucional-celeste);
    border-color: var(--color-institucional-celeste);
    transform: scale(1.005); /* Slight zoom */
  }

  /* Focus Animation */
  &:focus {
    outline: none;
    border-color: var(--color-institucional-celeste);
    box-shadow: 0 0 10px rgba(6, 78, 59, 0.4);
  }

  /* Disabled State */
  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }

  /* Add responsive styles */
  @media (min-width: 1200px) {
    min-width: 38rem;
  }

  @media (max-width: 1200px) {
    min-width: 23.5rem;
    font-size: 1.1rem;
    padding: 0.7rem 1.1rem;
  }

  @media (max-width: 768px) {
    min-width: 10rem;
    font-size: 1rem;
    padding: 0.7rem 0.9rem;
  }

  @media (max-width: 500px) {
    min-width: 25rem;
    height: 3.5rem;
    font-size: 1.1rem;
    padding: 0.6rem 0.8rem;
  }
`;

export default Select;
