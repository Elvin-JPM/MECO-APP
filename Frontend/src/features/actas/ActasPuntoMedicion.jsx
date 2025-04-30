import styled from "styled-components";
import { useParams } from "react-router-dom";
import { dummyActas } from "./ActasGrid";

const Container = styled.div`
  padding: 2.4rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2.4rem;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: var(--color-grey-100);
  margin-bottom: 2.4rem;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-grey-100);
  color: var(--color-grey-400);
  font-size: 1.8rem;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2.4rem;
  background-color: var(--color-grey-50);
  padding: 2.4rem;
  border-radius: var(--border-radius-md);
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Label = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const Value = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

function ActasPuntoMedicion() {
  const { id } = useParams();
  const acta = dummyActas.find((acta) => acta.id === id);

  if (!acta) {
    return <Container>Acta no encontrada</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>{acta.name}</Title>
      </Header>
      <ImageContainer>
        {acta.image ? (
          <Image src={acta.image} alt={acta.name} />
        ) : (
          <DefaultImage>
            <span>No hay imagen disponible</span>
          </DefaultImage>
        )}
      </ImageContainer>
      <Details>
        <DetailItem>
          <Label>Planta</Label>
          <Value>{acta.planta}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Subestación</Label>
          <Value>{acta.subestacion}</Value>
        </DetailItem>
        <DetailItem>
          <Label>Voltaje</Label>
          <Value>{acta.voltaje}</Value>
        </DetailItem>
      </Details>
    </Container>
  );
}

export default ActasPuntoMedicion;
