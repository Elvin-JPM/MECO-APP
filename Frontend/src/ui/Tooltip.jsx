import styled, { css } from "styled-components";


const Tooltip = styled.div`
  position: absolute;
  top: 0;
  background: ${({ bgColor }) =>
    bgColor || "linear-gradient(45deg, #6a11cb, #2575fc)"};
  color: white;
  padding: ${({ padding }) => padding || "8px 12px"};
  border-radius: 6px;
  font-size: ${({ fontSize }) => fontSize || "14px"};
  font-weight: 600;
  white-space: nowrap;
  z-index: 10000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  /* This ensures it ignores the parent's opacity */
  will-change: opacity;
  backdrop-filter: none;

  /* Arrow (pointer) */
  &::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }

  /* Position logic */
  ${({ position }) => {
    switch (position) {
      case "top":
        return css`
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          &::after {
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${({ bgColor }) =>
              bgColor ? "#EB3349" : "#2575fc"};
          }
        `;
      case "bottom":
        return css`
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          &::after {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${({ bgColor }) =>
              bgColor ? "#EB3349" : "#2575fc"};
          }
        `;
      case "left":
        return css`
          top: 50%;
          right: calc(100% + 12px);
          transform: translateY(-50%) translateX(10px);
          &::after {
            top: 50%;
            left: 100%;
            transform: translateY(-50%);
            border-left-color: ${({ bgColor }) =>
              bgColor ? "#EB3349" : "#2575fc"};
          }
        `;
      case "right":
        return css`
          top: 50%;
          left: calc(100% + 12px);
          transform: translateY(-50%) translateX(-10px);
          &::after {
            top: 50%;
            right: 100%;
            transform: translateY(-50%);
            border-right-color: ${({ bgColor }) =>
              bgColor ? "#EB3349" : "#2575fc"};
          }
        `;
      default:
        return css`
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          &::after {
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${({ bgColor }) =>
              bgColor ? "#EB3349" : "#2575fc"};
          }
        `;
    }
  }}

  /* Visibility logic */
  ${({ isVisible }) =>
    isVisible &&
    css`
      opacity: 1;
      visibility: visible;
      transform: ${({ position }) => {
        switch (position) {
          case "top":
            return "translateX(-50%) translateY(0)";
          case "bottom":
            return "translateX(-50%) translateY(0)";
          case "left":
            return "translateY(-50%) translateX(0)";
          case "right":
            return "translateY(-50%) translateX(0)";
          default:
            return "translateX(-50%) translateY(0)";
        }
      }};
    `}

  ${({ sidebar }) =>
    sidebar &&
    css`
      @media (min-width: 769px) {
        display: none;
      }
    `}
`;

export default Tooltip;
