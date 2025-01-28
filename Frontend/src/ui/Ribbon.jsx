import styled from "styled-components";

const Ribbon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2000;
  height: 2.5vh;
  width: 100%;
  background: linear-gradient(
    to right,
    var(--color-institucional-celeste) 0%,
    var(--color-institucional-celeste) 33.33333%,
    var(--color-institucional-amarillo) 33.33333%,
    var(--color-institucional-amarillo) 66.66666%,
    var(--color-institucional-rojo) 66.66666%,
    var(--color-institucional-rojo) 100%
  );
`;

export default Ribbon;
