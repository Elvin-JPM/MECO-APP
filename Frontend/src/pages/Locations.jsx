import Map from "../features/locations/Map";
import styled from "styled-components";
import { useState } from "react";
import Input from "../ui/Input";
import Tag from "../ui/Tag";

const StyledLocations = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  border-radius: 0.7rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--color-grey-400);
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 0.8rem;
`;

function Locations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("P. Medición");

  const handleTagClick = (e, value) => {
    setActiveTag(value);
  };

  return (
    <StyledLocations>
      <SearchContainer>
        <SearchRow>
          <label>Buscar: </label>
          <Input
            type="text"
            placeholder="ej: agua caliente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchRow>

        <TagsContainer>
          <Tag
            active={activeTag === "P. Medición"}
            onClick={handleTagClick}
            value="P. Medición"
          >
            P. Medición
          </Tag>
          <Tag
            active={activeTag === "Plantas"}
            onClick={handleTagClick}
            value="Plantas"
          >
            Plantas
          </Tag>
          <Tag
            active={activeTag === "Subestaciones"}
            onClick={handleTagClick}
            value="Subestaciones"
          >
            Subestaciones
          </Tag>
        </TagsContainer>
      </SearchContainer>
      <Map searchTerm={searchTerm} activeTag={activeTag} />
    </StyledLocations>
  );
}

export default Locations;
