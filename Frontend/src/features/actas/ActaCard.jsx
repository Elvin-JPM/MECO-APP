import styled from "styled-components";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { HiDocumentText } from "react-icons/hi";

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.6rem;
  border: 1px solid var(--color-grey-600);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-institucional-celeste);
  }
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
  text-align: center;
  margin-bottom: 0.8rem;
`;

const PdfContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 1.6rem;
`;

const PdfIcon = styled(HiDocumentText)`
  font-size: 4.8rem;
  color: var(--color-grey-600);
`;

const PdfCount = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-700);
  font-weight: 500;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
`;

const DetailRow = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-700);
  display: flex;
  gap: 0.8rem;

  & span {
    font-weight: 600;
    color: var(--color-grey-800);
  }
`;

function ActaCard({ acta }) {
  const { id, name, planta, subestacion, voltaje, pdfCount = 0 } = acta;

  return (
    <Card to={`/actas/${id}`}>
      <Title>{name}</Title>
      <PdfContainer>
        <PdfIcon />
        <PdfCount>{pdfCount} documentos disponibles</PdfCount>
      </PdfContainer>
      <Details>
        <DetailRow>
          <span>Planta:</span> {planta}
        </DetailRow>
        <DetailRow>
          <span>Subestación:</span> {subestacion}
        </DetailRow>
        <DetailRow>
          <span>Voltaje:</span> {voltaje}
        </DetailRow>
      </Details>
    </Card>
  );
}

ActaCard.propTypes = {
  acta: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    planta: PropTypes.string.isRequired,
    subestacion: PropTypes.string.isRequired,
    voltaje: PropTypes.string.isRequired,
    pdfCount: PropTypes.number,
  }).isRequired,
};

export default ActaCard;
