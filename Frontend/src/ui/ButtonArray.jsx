import styled from "styled-components";

const ButtonArray = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 0.6rem;
  width: 2rem;
  height: 3rem;

  @media (max-width: 810px) {
    gap: 0.1rem;
  }
`;

export default ButtonArray;
