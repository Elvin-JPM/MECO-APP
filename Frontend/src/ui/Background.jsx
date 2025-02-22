import { useDarkMode } from "../context/DarkModeContext";
import styled from "styled-components";

const StyledBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${({ isDarkMode }) =>
    isDarkMode
      ? "url('/dark-subestacion.jpeg')"
      : "url('/light-subestacion.jpeg')"};
  background-position: center;
  background-size: cover;
  background-clip: padding-box;

  filter: blur(5px);
  z-index: -1;
`;

function Background() {
  const { isDarkMode } = useDarkMode();
  return <StyledBackground isDarkMode={isDarkMode}></StyledBackground>;
}

export default Background;
