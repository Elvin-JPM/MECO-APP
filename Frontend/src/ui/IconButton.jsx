import styled from "styled-components";

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => {
    switch (size) {
      case "sm":
        return "3rem"; // Small size
      case "lg":
        return "5rem"; // Large size
      default:
        return "4rem"; // Medium size (default)
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case "sm":
        return "3rem"; // Small size
      case "lg":
        return "5rem"; // Large size
      default:
        return "4rem"; // Medium size (default)
    }
  }};
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    var(--color-grey-100),
    var(--color-grey-200)
  ); /* Gradient background */
  color: var(--color-grey-900); /* Light text color for contrast */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  outline: none;

  /* Hover effect */
  &:hover {
    background: linear-gradient(
      135deg,
      var(--color-grey-200),
      var(--color-grey-300)
    );
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px); /* Slight lift on hover */
  }

  /* Active effect */
  &:active {
    transform: scale(0.95);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    outline-color: none;
    border-color: none;
  }

  /* Ripple effect */
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.4),
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  /* Icon styling */
  & > svg {
    font-size: ${({ size }) => {
      switch (size) {
        case "sm":
          return "1.5rem"; // Small size
        case "lg":
          return "2.5rem"; // Large size
        default:
          return "2rem"; // Medium size (default)
      }
    }};
    transition: transform 0.3s ease;
  }

  /* Icon animation on hover */
  &:hover > svg {
    transform: scale(1.1); /* Slightly enlarge the icon */
  }

  /* Focus effect (for accessibility) */
  &:focus {
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5); /* Custom focus ring */
    outline: none;
    border: none;
  }
`;

export default IconButton;
