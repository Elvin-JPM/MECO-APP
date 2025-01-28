import styled, { css } from "styled-components";

const sizes = {
  small: css`
    font-size: 1.4rem;
    padding: 0.4rem 0.6rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.6rem;
    padding: 1.2rem 1.6rem;
    font-weight: 600;
  `,
  large: css`
    font-size: 1.8rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
  `,
};

const variations = {
  primary: css`
    //color: var(--color-brand-50);
    background-color: var(--color-institucional-celeste);
  `,

  secondary: css`
    //color: var(--color-grey-600);
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);

    &:hover {
      background-color: var(--color-grey-50);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-institucional-rojo);

    &:hover {
      background-color: var(--color-institucional-rojo);
    }
  `,
};

const Button = styled.button.attrs((props) => ({
  title: props.tooltip, // Adds the tooltip text as a `title` attribute (optional)
}))`
  color: var(--color-grey-700);
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: relative; // Required for positioning the tooltip
  ${(props) => sizes[props.size]}
  ${(props) => variations[props.variation]}

  /* Tooltip styles */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px); /* Position the tooltip above the button */
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-grey-800);
    color: var(--color-grey-800);
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  &:hover {
    opacity: 0.8;
    //transform: translateX(-1%) translateY(-2px); /* Slight upward animation */
  }
`;

Button.defaultProps = {
  variation: "primary",
  size: "medium",
};

export default Button;
