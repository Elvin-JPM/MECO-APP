import styled from "styled-components";

const StyledLogo = styled.div`
  text-align: center;
`;

const Img = styled.img`
  height: ${(props) => props.height || "9.6rem"};
  width: auto;
`;

function Logo({ image, height }) {
  return (
    <StyledLogo>
      {image ? (
        <Img src={image} alt="Logo" height={height} />
      ) : (
        <Img src="/electric-meter.png" alt="Logo" height={height} />
      )}
    </StyledLogo>
  );
}

export default Logo;
