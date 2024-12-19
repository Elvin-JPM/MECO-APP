import styled from "styled-components";
import Button from "./Button";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

const StyledPaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  gap: 0.5rem;
`;
const PageInput = styled.input`
  width: 4rem;
  text-align: center;
  padding: 0.5rem;
  font-size: 1.4rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

function PaginationWrapper({
  handlePageChange,
  handleInputChange,
  handleInputSubmit,
  pageNumber,
  totalPages,
  inputValue,
}) {
  return (
    <StyledPaginationWrapper>
      {/* Left Arrow */}
      <Button
        onClick={() => handlePageChange(pageNumber - 1)}
        disabled={pageNumber <= 1}
        tooltip="Anterior"
      >
        <GrFormPrevious />
      </Button>
      {/* Page Input */}
      <PageInput
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputSubmit} // Validate input on blur
        onKeyDown={(e) => {
          if (e.key === "Enter") handleInputSubmit(); // Validate input on Enter key
        }}
      />
      <span>/ {totalPages}</span>
      {/* Right Arrow */}
      <Button
        onClick={() => handlePageChange(pageNumber + 1)}
        disabled={pageNumber >= totalPages}
        tooltip="Siguiente"
      >
        <MdOutlineNavigateNext />
      </Button>
    </StyledPaginationWrapper>
  );
}

export default PaginationWrapper;
