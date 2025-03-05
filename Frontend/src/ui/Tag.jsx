import styled from "styled-components";

const StyledTag = styled.div`
  background-color: ${(props) =>
    props.active ? "var(--color-brand-500)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.active ? "var(--color-grey-0)" : "var(--color-grey-800)"};
  padding: 0.4rem 0.8rem;
  border-radius: 4rem;
  scale: ${(props) => (props.active ? "1.08" : "1")};
  /* transform: ${(props) => (props.active ? "skewX(-1deg)" : "none")}; */
  border: 1px solid var(--color-grey-500);

  &:hover {
    opacity: 0.9;
    cursor: pointer;
    scale: 1.02;
  }
`;
function Tag({ active, children, onClick, value }) {
  return (
    <StyledTag active={active} onClick={(e) => onClick(e, value)} role="button">
      {children}
    </StyledTag>
  );
}
export default Tag;
