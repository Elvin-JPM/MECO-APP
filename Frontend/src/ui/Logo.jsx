import styled from "styled-components";

const StyledLogo = styled.div`
  text-align: center;
`;

const Img = styled.img`
  height: ${(props) => props.height || "9.6rem"};
  width: auto;

  @media (min-width: 1200px) {
    height: 8rem;
  }
  @media (max-width: 1200px) and (min-width: 768px) {
    height: 8rem;
  }
  @media (max-width: 768px) and (min-width: 480px) {
    height: ${(props) => (props.navBar ? "3rem" : "6rem")};
    width: ${(props) => (props.navBar ? "5rem" : "100%")};
  }
  @media (max-width: 480px) and (min-width: 320px) {
    height: 5rem;
  }
`;

function Logo({ image, height, navBar }) {
  return (
    <StyledLogo>
      {image ? (
        <Img src={image} alt="Logo" height={height} navBar={navBar} />
      ) : (
        <Img src="/electric-meter.png" alt="Logo" height={height} />
      )}
    </StyledLogo>
  );
}

export default Logo;
