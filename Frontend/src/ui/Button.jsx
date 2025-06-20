import styled, { css } from "styled-components";

const sizes = {
  small: css`
    font-size: 1.4rem;
    padding: 0.4rem 0.6rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    @media (max-width: 1200px) {
      font-size: 1.3rem;
    }
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  `,
  medium: css`
    font-size: 1.6rem;
    padding: 1.2rem 1.6rem;
    font-weight: 600;
    white-space: nowrap;
    @media (max-width: 1200px) {
      font-size: 1.3rem;
    }
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  `,
  large: css`
    font-size: 1.8rem;

    padding: 1.2rem 2.4rem;
    font-weight: 500;
    white-space: nowrap;
    @media (max-width: 1200px) {
      font-size: 1.3rem;
    }
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  `,
};

const IconColors = {
  basic: css`
    & > svg {
      color: var(--color-grey-500);
    }
  `,
  check: css`
    & > svg {
      color: var(--color-brand-600);
    }
  `,
  cancel: css`
    & > svg {
      color: var(--color-red-600);
    }
  `,
};

const variations = {
  primary: css`
    color: var(--color-grey-50);
    background-color: var(--color-grey-800);
  `,
  secondary: css`
    color: var(--color-grey-600);
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    &:hover {
      background-color: var(--color-grey-50);
    }
  `,
  danger: css`
    color: var(--color-grey-700);
    background-color: var(--color-red-400);
    font-weight: 600;
    font-size: 1.8rem;

    &:hover {
      background-color: var(--color-red-300);
    }
  `,

  check: css`
    color: var(--color-green-300);
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-300);
    width: 3rem;
    height: 3rem;
    border-radius: 50%;

    & > svg {
      font-size: 2.5rem;
      color: var(--color-brand-500);
    }

    @media (max-width: 1200px) {
      width: 2.5rem;
      height: 2.5rem;
      & > svg {
        font-size: 2.3rem;
      }
    }

    @media (max-width: 900px) {
      width: 2.3rem;
      height: 2.3rem;
      & > svg {
        font-size: 2.2rem;
      }
    }
  `,
};

const Button = styled.button.attrs((props) => ({
  title: props.tooltip,
}))`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-400);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease; // Consolidated transition
  position: relative;

  ${(props) => sizes[props.size]}
  ${(props) => variations[props.variation]}
  ${(props) => IconColors[props.color]}

  /* Tooltip styles */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-grey-800);
    color: white; // Fixed color contrast
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease;
  }

  &:hover {
    transform: scale(0.99); // More subtle scaling
    translate: 0 1px; // Slight upward movement
    box-shadow: var(--shadow-sm); // Optional: reduce shadow on hover
  }

  &:active {
    transform: scale(0.96); // Pressed state
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-500); // Better for accessibility
  }
`;

Button.defaultProps = {
  variation: "primary",
  size: "medium",
  iconColor: "basic",
};

export default Button;
